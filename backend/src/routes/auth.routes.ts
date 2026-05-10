import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { sendVerificationEmail, sendWelcomeEmail } from '../lib/email';
import crypto from 'crypto';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import session from 'express-session';

const router = Router();

// ── GOOGLE OAUTH SETUP ──
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`,
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) return done(new Error('No email from Google'));

      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name: profile.displayName,
            googleId: profile.id,
            avatar: profile.photos?.[0]?.value,
            isEmailVerified: true, // Google accounts are pre-verified
          }
        });
      } else if (!user.googleId) {
        user = await prisma.user.update({ where: { id: user.id }, data: { googleId: profile.id, isEmailVerified: true } });
      }
      return done(null, user);
    } catch (err) { return done(err); }
  }));

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    const user = await prisma.user.findUnique({ where: { id } }).catch(err => done(err, null));
    done(null, user);
  });
}

// GET /google - Start Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// GET /google/callback
router.get('/google/callback', (req: any, res: any, next: any) => {
  passport.authenticate('google', { session: false }, async (err: any, user: any) => {
    if (err || !user) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_failed`);
    }
    const jwt = require('jsonwebtoken');
    const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'traveloop-secret-key', { expiresIn: '24h' });
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${accessToken}&name=${encodeURIComponent(user.name || '')}&email=${encodeURIComponent(user.email || '')}&id=${user.id}`);
  })(req, res, next);
});

// POST /register - Create a real account
router.post('/register', async (req: any, res: any, next: any) => {
  try {
    const { email, phone, name, password } = req.body;
    if (!email && !phone) {
      return res.status(400).json({ success: false, message: 'Email or phone is required' });
    }

    // Check existing
    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return res.status(409).json({ success: false, message: 'Email already registered' });
    }
    if (phone) {
      const existing = await prisma.user.findUnique({ where: { phone } });
      if (existing) return res.status(409).json({ success: false, message: 'Phone already registered' });
    }

    const passwordHash = password ? crypto.createHash('sha256').update(password).digest('hex') : undefined;
    const verificationToken = email ? crypto.randomBytes(32).toString('hex') : undefined;

    const user = await prisma.user.create({
      data: {
        email,
        phone,
        name,
        passwordHash,
        isEmailVerified: email ? false : true,
        verificationToken
      }
    });

    if (email && verificationToken) {
      const verifyUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/verify-email?token=${verificationToken}`;

      // Send real email (async — don't block response)
      sendVerificationEmail(email, name || 'Traveler', verifyUrl).catch(err => {
        console.error('[Email] Failed to send verification email:', err.message);
      });

      return res.status(201).json({
        success: true,
        message: `We've sent a verification link to ${email}. Please check your inbox (and spam folder) to activate your account.`,
      });
    }

    // Phone-only users — auto login
    const jwt = require('jsonwebtoken');
    const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'traveloop-secret-key', { expiresIn: '24h' });
    const refreshToken = crypto.randomBytes(40).toString('hex');
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

    res.status(201).json({
      success: true,
      data: { user: { id: user.id, email: user.email, phone: user.phone, name: user.name }, accessToken }
    });
  } catch (error) { next(error); }
});

// GET /verify-email
router.get('/verify-email', async (req: any, res: any, next: any) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).send('Verification token is missing.');

    const user = await prisma.user.findUnique({ where: { verificationToken: String(token) } });
    if (!user) {
      return res.status(400).send('<h2>Invalid or expired verification link.</h2><p><a href="http://localhost:3000/login">Back to Login</a></p>');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true, verificationToken: null }
    });

    // Send welcome email
    if (user.email) {
      sendWelcomeEmail(user.email, user.name || 'Traveler').catch(() => {});
    }

    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?verified=true`);
  } catch (error) { next(error); }
});

// POST /login - Login with email+password
router.post('/login', async (req: any, res: any, next: any) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.passwordHash !== passwordHash) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.email && !user.isEmailVerified) {
      return res.status(401).json({ success: false, message: 'Please verify your email address first. Check your inbox for the verification link.' });
    }

    const jwt = require('jsonwebtoken');
    const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'traveloop-secret-key', { expiresIn: '24h' });
    const refreshToken = crypto.randomBytes(40).toString('hex');

    await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

    res.json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, phone: user.phone, name: user.name, avatar: user.avatar, travelStyle: user.travelStyle, role: user.role },
        accessToken
      }
    });
  } catch (error) { next(error); }
});

// GET /me - Get current user profile
router.get('/me', async (req: any, res: any, next: any) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ success: false, message: 'Not authenticated' });
    const jwt = require('jsonwebtoken');
    const decoded: any = jwt.verify(auth.replace('Bearer ', ''), process.env.JWT_SECRET || 'traveloop-secret-key');
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, phone: true, name: true, avatar: true, bio: true, travelStyle: true, role: true, isEmailVerified: true, preferredRegions: true, tripVibe: true, age: true, gender: true, travelPace: true, dietaryRestrictions: true, activityTags: true, preferredBudget: true }
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
});

// PATCH /me - Update profile
router.patch('/me', async (req: any, res: any, next: any) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ success: false, message: 'Not authenticated' });
    const jwt = require('jsonwebtoken');
    const decoded: any = jwt.verify(auth.replace('Bearer ', ''), process.env.JWT_SECRET || 'traveloop-secret-key');
    const { name, bio, avatar, travelStyle, tripVibe, preferredBudget, preferredRegions, age, gender, travelPace, dietaryRestrictions, activityTags, buddyPrefGender, buddyPrefAgeMin, buddyPrefAgeMax } = req.body;
    const data: any = {};
    if (name) data.name = name;
    if (bio !== undefined) data.bio = bio;
    if (avatar !== undefined) data.avatar = avatar;
    if (travelStyle) data.travelStyle = travelStyle;
    if (tripVibe) data.tripVibe = tripVibe;
    if (preferredBudget) data.preferredBudget = preferredBudget;
    if (preferredRegions) data.preferredRegions = JSON.stringify(preferredRegions);
    if (age) data.age = parseInt(age);
    if (gender) data.gender = gender;
    if (travelPace) data.travelPace = travelPace;
    if (dietaryRestrictions) data.dietaryRestrictions = JSON.stringify(dietaryRestrictions);
    if (activityTags) data.activityTags = JSON.stringify(activityTags);
    if (buddyPrefGender) data.buddyPrefGender = buddyPrefGender;
    if (buddyPrefAgeMin) data.buddyPrefAgeMin = parseInt(buddyPrefAgeMin);
    if (buddyPrefAgeMax) data.buddyPrefAgeMax = parseInt(buddyPrefAgeMax);
    const user = await prisma.user.update({ where: { id: decoded.userId }, data, select: { id: true, email: true, name: true, avatar: true, travelStyle: true } });
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
});

// POST /magic-link - Send magic link login
router.post('/magic-link', async (req: any, res: any, next: any) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ success: false, message: 'No account found with this email' });
    const magicToken = crypto.randomBytes(32).toString('hex');
    const magicExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await prisma.user.update({ where: { id: user.id }, data: { magicToken, magicExpires } });
    const magicUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/magic-verify?token=${magicToken}`;
    console.log(`[Magic Link] ${email}: ${magicUrl}`);
    res.json({ success: true, message: 'Magic link sent! Check your inbox.' });
  } catch (error) { next(error); }
});

// GET /magic-verify - Verify magic token
router.get('/magic-verify', async (req: any, res: any, next: any) => {
  try {
    const { token } = req.query;
    const user = await prisma.user.findUnique({ where: { magicToken: String(token) } });
    if (!user || !user.magicExpires || user.magicExpires < new Date()) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=expired`);
    }
    await prisma.user.update({ where: { id: user.id }, data: { magicToken: null, magicExpires: null, isEmailVerified: true } });
    const jwt = require('jsonwebtoken');
    const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'traveloop-secret-key', { expiresIn: '24h' });
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${accessToken}&name=${encodeURIComponent(user.name || '')}&email=${encodeURIComponent(user.email || '')}&id=${user.id}`);
  } catch (error) { next(error); }
});

// POST /otp/request - Request OTP
router.post('/otp/request', async (req: any, res: any, next: any) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: 'Phone required' });
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) { user = await prisma.user.create({ data: { phone, isEmailVerified: true } }); }
    await prisma.user.update({ where: { id: user.id }, data: { otpCode, otpExpires } });
    console.log(`[OTP] ${phone}: ${otpCode}`);
    res.json({ success: true, message: 'OTP sent (check server console for demo)' });
  } catch (error) { next(error); }
});

// POST /otp/verify
router.post('/otp/verify', async (req: any, res: any, next: any) => {
  try {
    const { phone, code } = req.body;
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user || user.otpCode !== code || !user.otpExpires || user.otpExpires < new Date()) {
      return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
    }
    await prisma.user.update({ where: { id: user.id }, data: { otpCode: null, otpExpires: null } });
    const jwt = require('jsonwebtoken');
    const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'traveloop-secret-key', { expiresIn: '24h' });
    res.json({ success: true, data: { user: { id: user.id, phone: user.phone, name: user.name }, accessToken } });
  } catch (error) { next(error); }
});

export default router;
