const userModel = require("../Models/user.model");
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
      return res.status(200).json({
        success: true, message: "password reset link send ", user: user,
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
  const  hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");


  if (!token || !NewPassword)
    return res.status(400).json({ message: 'Required fields missing' });

  try {

    const getUser = await userModel.findOne({
      resetPasswordToken:  hashedToken,
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
