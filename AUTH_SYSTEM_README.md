# Traveloop Authentication System

A production-ready, multi-modal authentication system designed for luxury travel applications.

## Features
- **Magic Email Links**: Passwordless login via secure email delivery (Nodemailer).
- **Mobile OTP**: Two-factor authentication via Twilio Verify SMS.
- **Social OAuth**: Google, Apple, and Facebook integration.
- **Session Management**: Secure JWT access tokens + HTTP-only Refresh Cookies.
- **Rate Limiting**: Redis-backed protection against brute force and spam.
- **Luxury UI**: Glassmorphic design with Framer Motion animations.

## Tech Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Zustand.
- **Backend**: Node.js, Express, Prisma, PostgreSQL, Redis.

## Getting Started

### Backend Setup
1. `cd backend`
2. `npm install`
3. Copy `.env.example` to `.env` and fill in credentials.
4. `npx prisma generate`
5. `npm run dev`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Production Security Best Practices
- **CSRF Protection**: SameSite=Strict cookies.
- **XSS Mitigation**: Content Security Policy (CSP) headers via Helmet.
- **Rate Limiting**: Applied to all sensitive auth endpoints.
- **Validation**: Strict schema validation using Zod on both client and server.
