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
    dob: { type: Date, default: null },
    gender: { type: String },
    bio: { type: String, default: "No Bio yet" },
    isVerified: { type: Boolean, default: false },
    lastSeen: { type: String },
    createdOn: { type: Date, default: Date.now },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: []
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: []
    }],

    profilePicture: { type: String, default: "defaultprofile.png" },
    BannerPicture: { type: String, default: "_banner-default.jpg" },
    resetToken: { type: String, },
    IsPrivate: { type: Boolean, default: false }

});

module.exports = mongoose.model("User", UserDataSchema);
