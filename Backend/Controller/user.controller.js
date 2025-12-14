const nodemailer = require("nodemailer");
const UserModel = require("../Models/user.model");

const jwt = require("jsonwebtoken");
const { Error } = require("mongoose");
const { errorMonitor } = require("nodemailer/lib/xoauth2");
const userModel = require("../Models/user.model");
const validator = require("validator");



const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


exports.RegisterUser = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, gender, bio, date } = req.body;


    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    const existingUser = await UserModel.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.username === username
          ? "Username already exists"
          : "Email already exists"
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

      return res.status(400).json({
        success: false,
        message: "Email sending failed — invalid email address"
      });
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
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      }
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    });
  }
};



exports.verifyUserMail = async (req, res) => {

  console.log(req.body)
  try {
    const { email, code } = req.body;


    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res.json({ success: true, message: "Email already verified" });
    }

    if (String(code).trim() === String(user.code).trim()) {
      user.isVerified = true;
      user.code = null;
      await user.save();

      return res.json({ success: true, message: "Email verified successfully!" });
    } else {
      return res.json({ success: false, message: "Wrong code" });
    }

  }
  catch (err) {
    console.log(err)
    return res.status(500).json({ success: false, message: "Verification failed" });
  }

};




exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;


    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }


    if (!user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Email not verified" });
    }


    if (password !== user.password) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        bannerPicture: user.BannerPicture,
        bio: user.bio,
        followers: user.follwer,
        following: user.follwings
      },
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

exports.customize = async (req, res) => {
  const userID = req.user.id;
  const user = await userModel.findOne({ _id: userID })

  if (!user) return res.status(404).json({ message: "User not found" });

  if (req.body.bio) user.bio = req.body.bio;
  if (req.body.gender) user.gender = req.body.gender;
  if (req.body.date) user.date = req.body.date;


  if (req.files && req.files['profilePicture']) {
    user.profilePicture = req.files['profilePicture'][0].filename;
  }
  if (req.files && req.files['banner']) {
    user.BannerPicture = req.files['banner'][0].filename;
    console.log(user)
  } await user.save();
  res.json({
    success: true, message: "Profile updated", user: {
      id: user._id, username: user.username, email: user.email,
    },
  });


}
exports.verifyToken = async (req, res) => {
  const userID = req.user.id;
  res.status(200).json({ success: true, message: "Token is valid", userID });
}