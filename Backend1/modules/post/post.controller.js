const PostModel = require('./post.model');
const CommentModel = require('./comment.model');
const LikeModels = require('./like.model');
const NotificationModel = require('../notification/notification.model');
const SendNotification = require('../../WebSoket/notification.socket');
const jwt = require("jsonwebtoken");
const multer = require('multer');

exports.NewPost = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({ message: 'image not found' });
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
    console.log(error);
  }
};

const attachPostDetails = async (posts, currentUserId) => {
  return await Promise.all(posts.map(async (post) => {
    const postObj = post.toObject ? post.toObject() : post;
    const likesCount = await LikeModels.countDocuments({ Post_Id: post._id });
    const commentsCount = await CommentModel.countDocuments({ Post_Id: post._id });
    const hasLiked = currentUserId ? await LikeModels.exists({ Post_Id: post._id, likes_by: currentUserId }) : false;
    
    return {
      ...postObj,
      likesCount,
      commentsCount,
      hasLiked: !!hasLiked
    };
  }));
};

exports.getHomeFeed = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : (res.user && (res.user.id || res.user._id));

    const User = require('../user/user.model');
    const currentUser = await User.findById(userId);

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const usersToFetchPostsFrom = [...currentUser.following, userId];

    const posts = await PostModel.find({ 
      Posted_by: { $in: usersToFetchPostsFrom },
      IsDeleted: false 
    })
    .populate('Posted_by', 'username email profilePicture')
    .sort({ Date: -1 });

    const postsWithDetails = await attachPostDetails(posts, userId);
    res.status(200).send(postsWithDetails);
  } catch (error) {
    console.error("Error fetching home feed:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getUserPosts = async (req, res) => {
  try {
    const userId = req.user.id;

    const posts = await PostModel.find({ Posted_by: userId, IsDeleted: false })
      .populate('Posted_by', 'username email profilePicture')
      .sort({ Date: -1 });

    const postsWithDetails = await attachPostDetails(posts, userId);
    res.status(200).send(postsWithDetails);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Internal server error' });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : (res.user && (res.user.id || res.user._id));
    const postId = req.params.postId;

    if (!postId) return res.status(400).json({ message: "Post ID is required" });

    const existingLike = await LikeModels.findOne({ Post_Id: postId, likes_by: userId });

    if (existingLike) {
      // Unlike
      await LikeModels.deleteOne({ _id: existingLike._id });
      return res.status(200).json({ message: "Post unliked", hasLiked: false });
    } else {
      // Like
      const newLike = new LikeModels({ Post_Id: postId, likes_by: userId });
      await newLike.save();

      // Trigger Notification
      const post = await PostModel.findById(postId).populate('Posted_by', 'username');
      if (post && post.Posted_by._id.toString() !== userId.toString()) {
        const User = require('../user/user.model');
        const liker = await User.findById(userId);
        
        const notifMsg = `${liker.username} liked your post.`;
        
        const notification = new NotificationModel({
          recipient: post.Posted_by._id,
          sender: userId,
          type: 'LIKE',
          message: notifMsg,
          post: postId
        });
        await notification.save();
        
        SendNotification(post.Posted_by._id.toString(), notifMsg, userId);
      }

      return res.status(200).json({ message: "Post liked", hasLiked: true });
    }
  } catch (error) {
    console.error("Toggle Like Error:", error);
    res.status(500).json({ message: 'Error toggling like', error });
  }
};

exports.addComment = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : (res.user && (res.user.id || res.user._id));
    const postId = req.params.postId;
    const { comment } = req.body;

    if (!postId) return res.status(400).json({ message: "Post ID is required" });
    if (!comment || comment.trim() === "") return res.status(400).json({ message: "Comment is required" });

    const newComment = new CommentModel({
      comment: comment.trim(),
      Post_Id: postId,
      CommentBy: userId
    });

    await newComment.save();
    
    // Populate the user who commented to return immediately
    const populatedComment = await CommentModel.findById(newComment._id).populate('CommentBy', 'username profilePicture');

    // Trigger Notification
    const post = await PostModel.findById(postId);
    if (post && post.Posted_by.toString() !== userId.toString()) {
      const notifMsg = `${populatedComment.CommentBy.username} commented: "${comment.trim().substring(0, 20)}${comment.length > 20 ? '...' : ''}"`;
      
      const notification = new NotificationModel({
        recipient: post.Posted_by,
        sender: userId,
        type: 'COMMENT',
        message: notifMsg,
        post: postId
      });
      await notification.save();
      
      SendNotification(post.Posted_by.toString(), notifMsg, userId);
    }

    res.status(200).json({ message: 'Comment added successfully!', comment: populatedComment });
  } catch (error) {
    console.error("Add Comment Error:", error);
    res.status(500).json({ message: 'Error saving comment', error });
  }
};

exports.getComments = async (req, res) => {
  try {
    const postId = req.params.postId;
    if (!postId) return res.status(400).json({ message: "Post ID is required" });

    const comments = await CommentModel.find({ Post_Id: postId })
      .populate('CommentBy', 'username profilePicture')
      .sort({ _id: -1 });

    res.status(200).json(comments);
  } catch (error) {
    console.error("Get Comments Error:", error);
    res.status(500).json({ message: 'Error fetching comments', error });
  }
};
