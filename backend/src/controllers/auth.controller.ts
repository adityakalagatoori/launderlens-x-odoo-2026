import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateTokens } from '../utils/jwt';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { Twilio } from 'twilio';

const prisma = new PrismaClient();
const twilioClient = new Twilio(
  process.env.TWILIO_ACCOUNT_SID || 'ACxxx',
  process.env.TWILIO_AUTH_TOKEN || 'authxxx'
);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const requestMagicLink = async (req: Request, res: Response) => {
  const { email } = req.body;
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

  try {
    await prisma.user.upsert({
      where: { email },
      update: { magicToken: token, magicExpires: expires },
      create: { email, magicToken: token, magicExpires: expires }
    });

    const magicUrl = `${process.env.FRONTEND_URL}/auth/verify?token=${token}`;
    
    await transporter.sendMail({
      from: '"Traveloop" <no-reply@traveloop.com>',
      to: email,
      subject: 'Your Traveloop Magic Link',
      html: `<p>Click <a href="${magicUrl}">here</a> to login to Traveloop. Expries in 15 minutes.</p>`
    });

    res.status(200).json({ message: 'Magic link sent to your email.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send magic link' });
  }
};

export const verifyMagicLink = async (req: Request, res: Response) => {
  const { token } = req.query;

  try {
    const user = await prisma.user.findFirst({
      where: {
        magicToken: String(token),
        magicExpires: { gt: new Date() }
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const { accessToken, refreshToken } = generateTokens(user.id);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { magicToken: null, magicExpires: null, refreshToken }
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({ accessToken, user: { id: user.id, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
};

export const requestOTP = async (req: Request, res: Response) => {
  const { phone } = req.body;

  try {
    await twilioClient.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID!)
      .verifications.create({ to: phone, channel: 'sms' });

    res.status(200).json({ message: 'OTP sent to your phone.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  const { phone, code } = req.body;

  try {
    const verification = await twilioClient.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID!)
      .verificationChecks.create({ to: phone, code });

    if (verification.status !== 'approved') {
      return res.status(401).json({ error: 'Invalid OTP' });
    }

    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await prisma.user.create({ data: { phone } });
    }

    const { accessToken, refreshToken } = generateTokens(user.id);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({ accessToken, user: { id: user.id, phone: user.phone } });
  } catch (error) {
    res.status(500).json({ error: 'OTP verification failed' });
  }
};
