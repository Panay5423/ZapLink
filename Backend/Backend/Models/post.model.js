const mongoose = require("mongoose");

const PostDataSchema = new mongoose.Schema({
    PostImage: {
        type: String,
        unique: true,
    },
    Posted_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    Date: {
        type: Date,        
        required: true,
        default: Date.now    
    },
    Caption: {
        type: String,
        required: true
    },
    IsDeleted: {
        type: Boolean,
        required: true,
        default: false
    }
});

module.exports = mongoose.model("Post", PostDataSchema);
