const UserModel = require("./user.model");

exports.customizeProfile = async (req, res) => {
  const userID = req.user.id;
  const user = await UserModel.findOne({ _id: userID });

  if (!user) return res.status(404).json({ message: "User not found" });

  if (req.body.bio) user.bio = req.body.bio;
  if (req.body.gender) user.gender = req.body.gender;
  if (req.body.date) user.date = req.body.date;

  if (req.files && req.files['profilePicture']) {
    user.profilePicture = req.files['profilePicture'][0].filename;
  }
  if (req.files && req.files['banner']) {
    user.BannerPicture = req.files['banner'][0].filename;
  }
  
  await user.save();
  
  res.json({
    success: true, 
    message: "Profile updated", 
    user: {
      id: user._id, 
      username: user.username, 
      email: user.email,
    },
  });
};

exports.verifyToken = async (req, res) => {
  const userID = req.user.id;
  res.status(200).json({ success: true, message: "Token is valid", userID });
};

exports.getProfile = async (req, res) => {
  try {
    const userID = req.user.id;
    const user = await UserModel.findOne({ _id: userID });
    if (!user) return res.status(404).json({ message: "User not found" });

    const postModel = require('../post/post.model');
    const posts = await postModel.find({ Posted_by: userID, IsDeleted: false }).sort({ Date: -1 });

    const userProfile = {
      username: user.username,
      profilePicture: user.profilePicture,
      _id: user._id,
      BannerPicture: user.BannerPicture,
      followers: user.followers ? user.followers.length : 0,
      followings: user.following ? user.following.length : 0,
      bio: user.bio,
      posts: posts,
      IsPrivate: user.IsPrivate
    };

    res.status(200).json({ success: true, user: userProfile });
  } catch (error) {
    console.error("getProfile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserProfileById = async (req, res) => {
    try {
        const profileUserId = req.params.id;
        const viewerId = req.user.id;

        if (!profileUserId) return res.status(400).json({ message: "No user ID provided" });

        const profileUser = await UserModel.findById(profileUserId)
            .select("IsPrivate username profilePicture _id BannerPicture followers following bio");

        if (!profileUser) return res.status(404).json({ message: "User not found" });

        const isFollowing = profileUser.followers.includes(viewerId);
        let followStatus = "FOLLOW";

        const FollowRequest = require('../follow/follow.model');
        const pendingRequest = await FollowRequest.findOne({
            from: viewerId,
            to: profileUserId,
            status: "pending"
        });

        if (pendingRequest) followStatus = "REQUESTED";

        const postModel = require('../post/post.model');
        const posts = await postModel.find({ Posted_by: profileUserId, IsDeleted: false });

        if (!profileUser.IsPrivate) {
            return res.json({
                username: profileUser.username,
                profilePicture: profileUser.profilePicture,
                _id: profileUser._id,
                BannerPicture: profileUser.BannerPicture,
                followers: profileUser.followers,
                followings: profileUser.following,
                bio: profileUser.bio,
                posts: posts,
                isFollowing: isFollowing
            });
        }

        if (profileUser.IsPrivate && isFollowing) {
            return res.json({
                username: profileUser.username,
                profilePicture: profileUser.profilePicture,
                _id: profileUser._id,
                BannerPicture: profileUser.BannerPicture,
                followers: profileUser.followers,
                followings: profileUser.following,
                bio: profileUser.bio,
                posts: posts,
                isFollowing: isFollowing,
                message: "This account is private and you are following"
            });
        }

        return res.json({
            username: profileUser.username,
            profilePicture: profileUser.profilePicture,
            _id: profileUser._id,
            BannerPicture: profileUser.BannerPicture,
            followers: profileUser.followers.length,
            followings: profileUser.following.length,
            bio: profileUser.bio,
            posts: posts.length,
            followStatus: followStatus,
            message: "This account is private"
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "server error" });
    }
};
