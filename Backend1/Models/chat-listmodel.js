const mongoose = require("mongoose");

const chatlistmodel = new mongoose.Schema(
    {
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        ],

        lastMessage: {
            type: String,
            default: "",
        },

        lastMessageSender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        unreadCount: {
            type: Number,
            default: 0,
        },

        isGroup: {
            type: Boolean,
            default: false,
        },

        groupName: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("chatlistmodel", chatlistmodel);