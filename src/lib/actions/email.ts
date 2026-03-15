import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendVerificationEmail(
  email: string,
  code: string,
  type: 'email_verification' | 'password_reset'
) {
  const isReset = type === 'password_reset';

  await transporter.sendMail({
    from: `"Spendly" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: isReset ? 'Reset your Spendly password' : 'Verify your Spendly account',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 32px; background: #12141D; border-radius: 12px;">
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:32px;">
          <div style="width:20px;height:20px;background:#2dd4bf;border-radius:4px;"></div>
          <span style="color:white;font-weight:bold;letter-spacing:0.3em;font-size:14px;">SPENDLY</span>
        </div>
        <h2 style="color:white;margin-bottom:8px;">${isReset ? 'Reset your password' : 'Verify your email'}</h2>
        <p style="color:#8B95B3;">Your 6-digit verification code is:</p>
        <div style="font-size:40px;font-weight:bold;letter-spacing:0.5em;color:#2dd4bf;padding:16px 0;">
          ${code}
        </div>
        <p style="color:#8B95B3;font-size:13px;">
          This code expires in ${isReset ? '10' : '15'} minutes. Never share it with anyone.
        </p>
      </div>
    `,
  });
}