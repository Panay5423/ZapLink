
const mongoose=require('mongoose')
const LikesDataSchema = new mongoose.Schema({

    likes_by: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref:'user'
    },
    Post_Id: {
         type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref:'post'
    }
})

module.exports = LikesDataSchema;
module.exports = mongoose.model("likes", LikesDataSchema);
