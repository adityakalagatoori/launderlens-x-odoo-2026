import nodemailer from 'nodemailer';

// Configure transporter — uses env vars, falls back to Ethereal (test) SMTP
let transporter: nodemailer.Transporter | null = null;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    // Production: use real SMTP credentials from .env
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Development fallback: Ethereal free test SMTP (no real emails sent)
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    console.log('📧 [Email] Using Ethereal test account:', testAccount.user);
    console.log('📧 [Email] View sent emails at: https://ethereal.email/messages');
  }

  return transporter;
}

export async function sendVerificationEmail(to: string, name: string, verifyUrl: string): Promise<void> {
  const t = await getTransporter();

  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"/></head>
  <body style="margin:0;padding:0;background:#f0fdfe;font-family:'Segoe UI',sans-serif;">
    <div style="max-width:600px;margin:40px auto;background:white;border-radius:24px;overflow:hidden;box-shadow:0 4px 40px rgba(99,213,223,0.15);">
      <div style="background:linear-gradient(135deg,#63D5DF,#52C4CE);padding:40px 40px 30px;text-align:center;">
        <div style="width:56px;height:56px;background:rgba(255,255,255,0.2);border-radius:16px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
          <span style="color:white;font-size:28px;font-weight:900;">T</span>
        </div>
        <h1 style="color:white;margin:0;font-size:28px;font-weight:800;letter-spacing:-0.5px;">Traveloop</h1>
        <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Your world. Your journey.</p>
      </div>
      <div style="padding:40px;">
        <h2 style="color:#1a1a2e;font-size:22px;margin:0 0 12px;">Welcome aboard, ${name}! 🌍</h2>
        <p style="color:#64748b;line-height:1.7;margin:0 0 32px;">
          You're one step away from exploring the world with Traveloop. Click the button below to verify your email address and activate your account.
        </p>
        <div style="text-align:center;margin-bottom:32px;">
          <a href="${verifyUrl}" style="display:inline-block;background:linear-gradient(135deg,#63D5DF,#52C4CE);color:white;text-decoration:none;padding:16px 40px;border-radius:50px;font-weight:700;font-size:16px;box-shadow:0 8px 24px rgba(99,213,223,0.4);">
            ✈️ Verify My Email
          </a>
        </div>
        <div style="background:#f8fafc;border-radius:16px;padding:20px;margin-bottom:24px;">
          <p style="color:#94a3b8;font-size:12px;margin:0 0 8px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Or copy this link:</p>
          <a href="${verifyUrl}" style="color:#63D5DF;font-size:13px;word-break:break-all;">${verifyUrl}</a>
        </div>
        <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">
          This link expires in 24 hours. If you didn't create a Traveloop account, you can safely ignore this email.
        </p>
      </div>
      <div style="background:#f8fafc;padding:24px;text-align:center;border-top:1px solid #e2e8f0;">
        <p style="color:#94a3b8;font-size:12px;margin:0;">© 2026 Traveloop · Built with ❤️ for explorers</p>
      </div>
    </div>
  </body>
  </html>
  `;

  const info = await t.sendMail({
    from: `"Traveloop ✈️" <${process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@traveloop.com'}>`,
    to,
    subject: '✈️ Verify your Traveloop account',
    html,
    text: `Welcome to Traveloop, ${name}!\n\nVerify your email here: ${verifyUrl}\n\nThis link expires in 24 hours.`,
  });

  // For Ethereal — log the preview URL
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log('📧 [Email] Preview URL (Ethereal):', previewUrl);
  }
}

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const t = await getTransporter();
  await t.sendMail({
    from: `"Traveloop ✈️" <${process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@traveloop.com'}>`,
    to,
    subject: '🌍 Welcome to Traveloop — Start Exploring!',
    text: `Hi ${name}! Your account is now active. Start planning your next adventure at http://localhost:3000/dashboard`,
    html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px;"><h2>Welcome to Traveloop, ${name}! 🌍</h2><p>Your account has been verified. Start your adventure now!</p><a href="http://localhost:3000/dashboard" style="display:inline-block;background:#63D5DF;color:white;padding:12px 28px;border-radius:999px;text-decoration:none;font-weight:700;">Go to Dashboard →</a></div>`,
  });
}
