const userModel = require('../user/user.model');
const FollowRequest = require('./follow.model');
const NotificationModel = require('../notification/notification.model');
const SendNotification = require('../../WebSoket/notification.socket');

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

        const alreadyFollowing = currentUser.following.includes(targetUserId);

        if (alreadyFollowing) {
            currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
            targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId);

            await currentUser.save();
            await targetUser.save();

            return res.status(200).json({ message: "Unfollowed successfully", condition: alreadyFollowing });
        }

        const pendingRequest = await FollowRequest.findOne({
            from: currentUser._id,
            to: targetUser._id,
            status: "pending",
        });

        if (pendingRequest) {
            await FollowRequest.deleteOne({ _id: pendingRequest._id });
            return res.status(200).json({ followStatus: "UNREQUESTED", message: "Request cancelled" });
        }

        if (targetUser.IsPrivate === true) {
            await FollowRequest.create({
                from: currentUser._id,
                to: targetUser._id,
                status: "pending",
            });
            const TargetUserName = await userModel.findById(targetUserId).select("username");
            SendNotification(targetUserId, "you have folllow request from " + TargetUserName.username, currentUserId);

            return res.status(200).json({ followStatus: "REQUESTED" });
        }

        currentUser.following.push(targetUserId);
        targetUser.followers.push(currentUserId);

        await currentUser.save();
        await targetUser.save();

        // Trigger Notification
        const notifMsg = `${currentUser.username} started following you.`;
        const notification = new NotificationModel({
            recipient: targetUser._id,
            sender: currentUserId,
            type: 'FOLLOW',
            message: notifMsg
        });
        await notification.save();
        SendNotification(targetUserId, notifMsg, currentUserId);

        return res.status(200).json({ message: "Followed successfully" });

    } catch (error) {
        console.error("Follow Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.unfollowUser = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user.id;

        if (!targetUserId) return res.status(400).json({ message: "User ID is required" });
        if (targetUserId === currentUserId) return res.status(400).json({ message: "You cannot unfollow yourself" });

        const targetUser = await userModel.findById(targetUserId);
        const currentUser = await userModel.findById(currentUserId);

        if (!targetUser || !currentUser) return res.status(404).json({ message: "User not found" });

        let actionTaken = false;

        const pendingRequest = await FollowRequest.findOne({
            from: currentUser._id,
            to: targetUser._id,
            status: "pending",
        });

        if (pendingRequest) {
            await FollowRequest.deleteOne({ _id: pendingRequest._id });
            actionTaken = true;
        }

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

exports.acceptFollowRequest = async (req, res) => {
    try {
        const requestId = req.params.requestId;
        const currentUserId = req.user.id;

        const request = await FollowRequest.findById(requestId);

        if (!request) return res.status(404).json({ message: "Request not found" });
        if (request.to.toString() !== currentUserId) return res.status(403).json({ message: "Unauthorized to accept this request" });
        if (request.status !== "pending") return res.status(400).json({ message: "Request is no longer pending" });

        const targetUser = await userModel.findById(request.to);
        const requesterUser = await userModel.findById(request.from);

        if (!targetUser || !requesterUser) return res.status(404).json({ message: "User not found" });

        if (!targetUser.followers.includes(request.from)) targetUser.followers.push(request.from);
        if (!requesterUser.following.includes(request.to)) requesterUser.following.push(request.to);

        await targetUser.save();
        await requesterUser.save();

        await FollowRequest.deleteOne({ _id: requestId });

        // Trigger Notification
        const notifMsg = `${targetUser.username} accepted your follow request.`;
        const notification = new NotificationModel({
            recipient: request.from,
            sender: request.to,
            type: 'FOLLOW',
            message: notifMsg
        });
        await notification.save();
        SendNotification(request.from, notifMsg, request.to);

        return res.status(200).json({ message: "Request accepted successfully" });
    } catch (error) {
        console.error("Accept Request Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.rejectFollowRequest = async (req, res) => {
    try {
        const requestId = req.params.requestId;
        const currentUserId = req.user.id;

        const request = await FollowRequest.findById(requestId);

        if (!request) return res.status(404).json({ message: "Request not found" });
        if (request.to.toString() !== currentUserId) return res.status(403).json({ message: "Unauthorized to reject this request" });

        await FollowRequest.deleteOne({ _id: requestId });

        return res.status(200).json({ message: "Request rejected successfully" });
    } catch (error) {
        console.error("Reject Request Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getFollowers = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const currentUser = await userModel.findById(currentUserId)
            .populate('followers', 'username profilePicture firstName lastName email')
            .populate('following', 'username profilePicture firstName lastName email');

        if (!currentUser) return res.status(404).json({ message: "User not found" });

        // Let's just return followers, but also attached if the current user is following them back
        const followersWithMutualStatus = currentUser.followers.map(follower => {
            const followerObj = follower.toObject();
            followerObj.isFollowingBack = currentUser.following.some(f => f._id.toString() === follower._id.toString());
            return followerObj;
        });

        res.status(200).json(followersWithMutualStatus);
    } catch (error) {
        console.error("Get Followers Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.removeFollower = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user.id;

        if (!targetUserId) return res.status(400).json({ message: "User ID is required" });

        const currentUser = await userModel.findById(currentUserId);
        const targetUser = await userModel.findById(targetUserId);

        if (!targetUser || !currentUser) return res.status(404).json({ message: "User not found" });

        // Remove targetUser from currentUser's followers
        currentUser.followers = currentUser.followers.filter(id => id.toString() !== targetUserId);
        // Remove currentUser from targetUser's following
        targetUser.following = targetUser.following.filter(id => id.toString() !== currentUserId);

        await currentUser.save();
        await targetUser.save();

        res.status(200).json({ message: "Follower removed successfully" });
    } catch (error) {
        console.error("Remove Follower Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.blockUser = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user.id;

        if (!targetUserId) return res.status(400).json({ message: "User ID is required" });
        if (targetUserId === currentUserId) return res.status(400).json({ message: "You cannot block yourself" });

        const currentUser = await userModel.findById(currentUserId);
        const targetUser = await userModel.findById(targetUserId);

        if (!targetUser || !currentUser) return res.status(404).json({ message: "User not found" });

        // Remove from each other's follower/following lists
        currentUser.followers = currentUser.followers.filter(id => id.toString() !== targetUserId);
        currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
        
        targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId);
        targetUser.following = targetUser.following.filter(id => id.toString() !== currentUserId);

        // Delete any pending follow requests between them
        await FollowRequest.deleteMany({
            $or: [
                { from: currentUserId, to: targetUserId },
                { from: targetUserId, to: currentUserId }
            ]
        });

        // Add to blocked array
        if (!currentUser.blockedUsers.includes(targetUserId)) {
            currentUser.blockedUsers.push(targetUserId);
        }

        await currentUser.save();
        await targetUser.save();

        res.status(200).json({ message: "User blocked successfully" });
    } catch (error) {
        console.error("Block User Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
