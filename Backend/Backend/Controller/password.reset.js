const userModel = require("../Models/user.model");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

exports.send_reset_mail = async (req, res) => {

  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email })
    console.log("Reset ke baad mila hua user", user)
    if (!user) {
      return res.status(404).json({ messgae: "user not nahi milaaaaaa found " });
    }
    if (user) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const token = jwt.sign(
        {
          id: user._id,
          email: user.email,
          purpose: 'password_reset'
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      console.log(token)
      const resetLink = ` http://localhost:4200/reset-password/${token}`;

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

  if (!token || !NewPassword)
    return res.status(400).json({ message: 'Required fields missing' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Payload:", payload.id);

    const user = await userModel.findById(payload.id);
    if (!user)
      return res.status(404).json({ message: 'User not found' });

    user.password = NewPassword;
    console.log("Before saving password...");
    await user.save();
    console.log("After saving password...");
    return res.status(200).json({ message: 'Password reset successful' });


  } catch (err) {
    console.log("Error:", err);
    return res.status(400).json({ message: 'Token invalid or expired' });
  }
};
