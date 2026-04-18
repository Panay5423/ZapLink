const userModel = require('../Models/user.model');
const FollowRequest = require('../Models/FollowRequest');
const SendNotification = require('../WebSoket/notification.socket');


exports.followUser = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user.id;

        if (!targetUserId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        if (targetUserId === currentUserId) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        const targetUser = await userModel.findById(targetUserId);
        const currentUser = await userModel.findById(currentUserId);

        if (!targetUser || !currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // 1. Check if already following. If yes, Unfollow!
        // This MUST be checked first, otherwise unfollowing a private user sends a follow request.
        const alreadyFollowing = currentUser.following.includes(targetUserId);

        if (alreadyFollowing) {
            currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
            targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId);

            await currentUser.save();
            await targetUser.save();

            return res.status(200).json({ message: "Unfollowed successfully", condition: alreadyFollowing });
        }

        // 2. Check if a request is already pending
        const pendingRequest = await FollowRequest.findOne({
            from: currentUser._id,
            to: targetUser._id,
            status: "pending",
        });

        if (pendingRequest) {
            // Cancel request on toggle

            await FollowRequest.deleteOne({ _id: pendingRequest._id });
            return res.status(200).json({ followStatus: "UNREQUESTED", message: "Request cancelled" });
        }

        // 3. If target user is private, send Follow Request instead of direct follow
        if (targetUser.IsPrivate === true) {
            await FollowRequest.create({
                from: currentUser._id,
                to: targetUser._id,
                status: "pending",
            });
            const TargetUserName = await userModel.findById(targetUserId).select("username");
            console.log("request send")

            SendNotification(targetUserId, "you have folllow request from " + TargetUserName.username, currentUserId);

            return res.status(200).json({ followStatus: "REQUESTED" });
        }

        // 4. Target user is public, direct follow
        currentUser.following.push(targetUserId);
        targetUser.followers.push(currentUserId);

        await currentUser.save();
        await targetUser.save();

        return res.status(200).json({ message: "Followed successfully" });

    } catch (error) {
        console.error("Follow Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// This acts strictly to Unfollow or Cancel Request
exports.unfollowUser = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user.id;

        if (!targetUserId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        if (targetUserId === currentUserId) {
            return res.status(400).json({ message: "You cannot unfollow yourself" });
        }

        const targetUser = await userModel.findById(targetUserId);
        const currentUser = await userModel.findById(currentUserId);

        if (!targetUser || !currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        let actionTaken = false;

        // 1. Cancel pending request if it exists
        const pendingRequest = await FollowRequest.findOne({
            from: currentUser._id,
            to: targetUser._id,
            status: "pending",
        });

        if (pendingRequest) {
            await FollowRequest.deleteOne({ _id: pendingRequest._id });
            actionTaken = true;
        }

        // 2. Unfollow if currently following
        const alreadyFollowing = currentUser.following.includes(targetUserId);

        if (alreadyFollowing) {
            currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
            targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId);

            await currentUser.save();
            await targetUser.save();
            actionTaken = true;
        }

        return res.status(200).json({
            message: actionTaken ? "Unfollowed/Cancelled successfully" : "Not following this user",
            condition: alreadyFollowing
        });

    } catch (error) {
        console.error("Unfollow Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};