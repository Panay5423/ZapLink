const UserModel = require("../user/user.model");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { sendResetPasswordMail } = require("../../services/mail.service");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.registerUser = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, gender, bio, date } = req.body;

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    const existingUser = await UserModel.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.username === username ? "Username already exists" : "Email already exists"
      });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = new UserModel({
      username,
      firstName,
      lastName,
      email,
      password,
      dob: date || null,
      gender: gender || "",
      code,
      isVerified: false
    });

    if (req.files && req.files['profilePicture']) {
      newUser.profilePicture = req.files['profilePicture'][0].filename;
    }

    await newUser.save();

    try {
      await transporter.sendMail({
        from: `"Verification" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your Verification Code",
        html: `
          <div style="font-family: Arial;">
            <h2>Email Verification</h2>
            <p>Your verification code:</p>
            <h1>${code}</h1>
          </div>
        `
      });
    } catch (err) {
      console.log("Email send failed:", err);
      await UserModel.findByIdAndDelete(newUser._id);
      return res.status(400).json({ success: false, message: "Email sending failed — invalid email address" });
    }

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      success: true,
      message: "User registered! Verification code sent.",
      token,
      user: { id: newUser._id, username: newUser.username, email: newUser.email }
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

exports.verifyUserMail = async (req, res) => {
  try {
    const { verificationCode, verificationemail } = req.body;
    const user = await UserModel.findOne({ email: verificationemail });

    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res.json({ success: true, message: "Email already verified" });
    }

    if (String(verificationCode).trim() === String(user.code).trim()) {
      user.isVerified = true;
      user.code = null;
      await user.save();
      return res.json({ success: true, message: "Email verified successfully!" });
    } else {
      return res.json({ success: false, message: "Wrong code" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Verification failed" });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ success: false, message: "Email not verified" });
    }

    if (password !== user.password) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: { id: user._id, username: user.username },
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ success: false, message: "Login failed", error: error.message });
  }
};

exports.sendResetMail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email })
    if (!user) {
      return res.status(404).json({ messgae: "user not found " });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000;
    await user.save();

    const resetLink = `http://localhost:4200/reset-password/${rawToken}`;
    await sendResetPasswordMail(email, resetLink);

    return res.status(200).json({ success: true, message: "password reset link send ", user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

exports.resetPassword = async (req, res) => {
  const { token, NewPassword } = req.body;
  if (!token || !NewPassword) return res.status(400).json({ message: 'Required fields missing' });

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  try {
    const getUser = await UserModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!getUser) {
      return res.status(404).json({ message: 'User not found' });
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
