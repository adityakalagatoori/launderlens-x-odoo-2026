import { Router } from 'express';
import { 
  requestMagicLink, 
  verifyMagicLink, 
  requestOTP, 
  verifyOTP 
} from '../controllers/auth.controller';

const router = Router();

// Magic Link
router.post('/magic-link', requestMagicLink);
router.get('/magic-link/verify', verifyMagicLink);

// OTP
router.post('/otp/request', requestOTP);
router.post('/otp/verify', verifyOTP);

// OAuth (Placeholders for Passport implementation)
// router.get('/google', passport.authenticate('google'));
// router.get('/google/callback', passport.authenticate('google'), ...);

export default router;
