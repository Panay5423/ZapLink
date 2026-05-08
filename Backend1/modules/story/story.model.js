const mongoose = require("mongoose");

const StorySchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    mediaPath: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now,
        expires: 86400 // TTL index: 86400 seconds = 24 hours
    }
});

module.exports = mongoose.model("Story", StorySchema);
