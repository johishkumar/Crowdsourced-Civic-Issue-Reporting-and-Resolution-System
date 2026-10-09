const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

/**
 * Send a password reset email
 * @param {string} to - recipient email
 * @param {string} resetUrl - reset password URL
 */
const sendPasswordResetEmail = async (to, resetUrl) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Auth System" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
    to,
    subject: 'Password Reset Request',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background: #f9f5f0; margin: 0; padding: 0; }
            .container { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
            .header { background: #1a1a2e; padding: 32px; text-align: center; }
            .header h1 { color: #fff; margin: 0; font-size: 24px; letter-spacing: 1px; }
            .body { padding: 40px 32px; }
            .body p { color: #444; line-height: 1.7; font-size: 15px; }
            .btn { display: inline-block; background: #1a1a2e; color: #fff !important; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; margin: 24px 0; }
            .footer { background: #f5f5f5; padding: 16px 32px; text-align: center; color: #888; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset</h1>
            </div>
            <div class="body">
              <p>Hi there,</p>
              <p>You requested a password reset. Click the button below to set a new password. This link expires in <strong>30 minutes</strong>.</p>
              <a href="${resetUrl}" class="btn">Reset Password</a>
              <p>If you didn't request this, please ignore this email. Your password won't change.</p>
              <p>— The Auth System Team</p>
            </div>
            <div class="footer">
              <p>If the button doesn't work, copy this link:<br>${resetUrl}</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendPasswordResetEmail };
