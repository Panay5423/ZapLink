
const PostModel = require('../Models/post.model');
const CommentModel = require('../Models/comment.model');
const LikeModels = require('../Models/like.model');
const jwt = require("jsonwebtoken");
const multer = require('multer');

exports.NewPost = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({
        message:
          'image not found'
      })
    }
    const newData = new PostModel({
      Caption: req.body.Caption,
      PostImage: `/uploads/${req.file.filename}`,
    Song: {
    title: req.body.SongTitle || "",
    artist: req.body.SongArtist || "",
    url: req.body.SongUrl || "",
  },
      Posted_by: req.body.Posted_by
    });
    console.log(newData);
    await newData.save();

    res.status(200).send({ message: 'Post saved successfully!' });

  } catch (error) {
    res.status(500).send({ message: 'Error saving data', error });
    console.log(error)
  }
};
exports.getUserPosts = async (req, res) => {
try {
  const userId = req.user.id;

  const posts = await PostModel.find({ Posted_by: userId, IsDeleted: false })
    .populate('Posted_by', 'username email') 
    .sort({ Date: -1 });                      

  console.log(posts, "hello");               

  res.status(200).send(posts);

} catch (err) {
  console.error(err);
  res.status(500).send({ message: 'Internal server error' });
}
};


exports.likes = async (req, res) => {
  try {
    const newData = new LikeModels(req.body);

    console.log(newData);

    await newData.save();

    res.status(200).send({ message: 'Post saved successfully!' });

  } catch (error) {
    res.status(500).send({ message: 'Error saving data', error });
    console.log(error)
  }
};

exports.NewComment = async (req, res) => {
  try {
    const newData = new CommentModel(req.body);

    console.log(newData);

    await newData.save();

    res.status(200).send({ message: 'Post saved successfully!' });

  } catch (error) {
    res.status(500).send({ message: 'Error saving data', error });
    console.log(error)
  }
};


