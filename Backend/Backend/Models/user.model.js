const mongoose = require("mongoose");

const UserDataSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: false },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    phoneNumber: { type: Number, default: 0 },
    address: { type: String, default: "" },
    code: { type: String, default: "" },
    dob: { type: Date },
    gender: { type: String },
    bio: { type: String, },
    profilePicture: { type: String, default: "default.png" },
    isVerified: { type: Boolean, default: false },
    lastSeen: { type: String },
    createdOn: { type: Date, default: Date.now },
    follwer: { type: String, default: 0 },
    follwings: { type: String, default: 0 },
    prfoilePicture: { type: String, unique: true, },
    BannerPicture: { type: String, unique: true, },
    resetToken:{type:String,unique:true,}
});

module.exports = mongoose.model("User", UserDataSchema);
