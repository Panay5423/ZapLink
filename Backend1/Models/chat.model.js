const mongoose = require("mongoose");

const ChatModel= new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
    },
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model("FollowRequest", followRequestSchema);
