const userModel = require("../Models/user.model");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { sendResetPasswordMail } = require("../services/mail.service")

exports.send_reset_mail = async (req, res) => {

  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email })
    if (!user) {
      return res.status(404).json({ messgae: "user not  found " });
    }
    if (user) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = Date.now() + 30 * 60 * 1000;
      await user.save();
      const resetLink = ` http://localhost:4200/reset-password/${rawToken}`;

      await sendResetPasswordMail(email, resetLink)

      await transporter.sendMail({
        from: `"Password Reset" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Reset Your Password",
        html: `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f6f8fb; padding: 30px;">
    <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
      
      <div style="background: linear-gradient(90deg, #007bff, #6610f2); padding: 18px; text-align: center;">
        <h2 style="color: #ffffff; margin: 0; font-size: 22px;">🔐 Password Reset Request</h2>
      </div>

      <div style="padding: 25px;">
        <p style="font-size: 16px; color: #333; line-height: 1.6; text-align: center;">
          Hi there,<br>
          You recently requested to reset your password. Click the button below to continue.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="display: inline-block; background: linear-gradient(90deg, #007bff, #6610f2); color: #fff; padding: 12px 25px; font-size: 16px; border-radius: 6px; text-decoration: none; font-weight: 600;">
             Reset Password
          </a>
        </div>

        <p style="font-size: 14px; color: #666; line-height: 1.5; text-align: center;">
          If you didn’t request this, you can safely ignore this email.
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">

        <p style="font-size: 13px; color: #999; text-align: center;">
          This link will expire in <strong>1 hour</strong> for security reasons.<br>
          Sent securely by <b>YourApp</b>.
        </p>
      </div>
    </div>
  </div>
`

      });

      return res.status(200).json({
        success: true, message: "User registered! Verification code sent.", user: user,
      });

    }
  }
  catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }

}

exports.reset_pass = async (req, res) => {
  console.log("Reset password request body:", req.body);
  const { token, NewPassword } = req.body;
  const hased_token = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");


  if (!token || !NewPassword)
    return res.status(400).json({ message: 'Required fields missing' });

  try {

    const getUser = await userModel.findOne({
      resetPasswordToken: hased_token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!getUser) {
      console.log(getUser)
      return res.status(404).json({ message: 'User not found', });
    }
    const salt = await bcrypt.genSalt(10);
    getUser.password = await bcrypt.hash(NewPassword, salt);
    getUser.resetPasswordToken = undefined;
    getUser.resetPasswordExpires = undefined;
    getUser.passwordChangedAt = Date.now();


    await getUser.save();

    return res.status(200).json({ message: 'Password reset successful', success: true });


  } catch (err) {
    console.log("Error:", err);
    return res.status(400).json({ message: 'Token invalid or expired' });
  }
};
