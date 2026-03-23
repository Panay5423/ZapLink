const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendResetPasswordMail = async (toEmail, resetLink) => {
  return transporter.sendMail({
    from: `"Password Reset" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Reset Your Password",
    html: `
      <div style="font-family: Segoe UI, Tahoma, sans-serif; background:#f6f8fb; padding:30px;">
        <div style="max-width:520px;margin:auto;background:#fff;border-radius:10px;">
          <div style="background:linear-gradient(90deg,#007bff,#6610f2);padding:18px;text-align:center;">
            <h2 style="color:#fff;margin:0;">🔐 Password Reset Request</h2>
          </div>
          <div style="padding:25px;text-align:center;">
            <p>You requested to reset your password.</p>
            <a href="${resetLink}"
              style="display:inline-block;background:#6610f2;color:#fff;padding:12px 25px;border-radius:6px;text-decoration:none;">
              Reset Password
            </a>
            <p style="font-size:13px;color:#777;margin-top:20px;">
              This link expires in <b>30 minutes</b>.
            </p>
          </div>
        </div>
      </div>
    `,
  });
};
