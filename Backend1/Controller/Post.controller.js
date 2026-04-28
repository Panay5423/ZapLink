
const PostModel = require('../Models/post.model');
const CommentModel = require('../Models/comment.model');
const LikeModels = require('../Models/like.model');
const jwt = require("jsonwebtoken");
const multer = require('multer');

exports.NewPost = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({
        message: 'image not found'
      })
    }
    
    const userId = req.user ? (req.user.id || req.user._id) : (res.user && (res.user.id || res.user._id));

    const newData = new PostModel({
      Caption: req.body.Caption,
      PostImage: `/uploads/${req.file.filename}`,
      song: {
        title: req.body.SongTitle || "",
        artist: req.body.SongArtist || "",
        url: req.body.SongUrl || "",
      },
      Posted_by: userId
    });
    console.log("New Post:", newData);
    await newData.save();

    res.status(200).send({ message: 'Post saved successfully!' });

  } catch (error) {
    res.status(500).send({ message: 'Error saving data', error });
    console.log(error)
  }
};

exports.getHomeFeed = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : (res.user && (res.user.id || res.user._id));

    // Fetch user to get their following list
    const User = require('../Models/user.model');
    const currentUser = await User.findById(userId);

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get posts from self + users we follow
    const usersToFetchPostsFrom = [...currentUser.following, userId];

    const posts = await PostModel.find({ 
      Posted_by: { $in: usersToFetchPostsFrom },
      IsDeleted: false 
    })
    .populate('Posted_by', 'username email profilePicture')
    .sort({ Date: -1 });

    res.status(200).send(posts);
  } catch (error) {
    console.error("Error fetching home feed:", error);
    res.status(500).json({ message: "Internal server error" });
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


