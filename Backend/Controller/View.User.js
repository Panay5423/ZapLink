const userModel = require('../Models/user.model');
const postModel = require('../Models/post.model');

exports.view_user = async (req, res) => {
    try {
        const profileUserId = req.params.id;
        const viewerId = req.user.id;

        if (!profileUserId) {
            return res.status(400).json({ message: "No user ID provided" });
        }

        const profileUser = await userModel.findById(profileUserId)
            .select("IsPrivate username profilePicture _id BannerPicture followers following bio");

        if (!profileUser) {
            return res.status(404).json({ message: "User not found" });
        }


        const isFollowing = profileUser.followers.includes(viewerId);


        const posts = await postModel.find({ Posted_by: profileUserId, IsDeleted: false });
        console.log("account kesa hai ? ", profileUser.IsPrivate);
        console.log("kya follow kar raha hai ? ", isFollowing);


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
            isFollowing: isFollowing,
            message: "This account is private"
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "server error" });
    }
};
