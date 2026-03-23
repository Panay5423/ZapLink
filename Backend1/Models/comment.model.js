const mongoose = require('mongoose');

const CommentDataSchema = new mongoose.Schema({

    comment: {
        type: String,
        require: true,
    },
    Post_Id: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'Post'
    },
    CommentBy: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'User'
    }
})

module.exports = mongoose.model("Comment", CommentDataSchema);
