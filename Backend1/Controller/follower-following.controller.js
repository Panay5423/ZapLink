const userModel = require('../Models/user.model');
const FollowRequest = require('../Models/FollowRequest')
const SendNotification = require('../WebSoket/notification.socket')

exports.followUser = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user.id;
        console.log("taget user",req.params.id)
        console.log("current userid",req.user.id)

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



        const pendingRequest = await FollowRequest.findOne({
            from: currentUser._id,
            to: targetUser._id,
            status: "pending",
        });

        if (pendingRequest) {
            return res.status(200).json({
                followStatus: "REQUESTED",
            });
        }

        if (targetUser.IsPrivate === true) {

            console.log("send notification fucntion call ho gya ")
            SendNotification(targetUserId, "you have have folllow request from this", currentUserId)
            FollowRequest.create({
                from: currentUser._id,
                to: targetUser._id,
                status: "pending",
            });


            return res.status(200).json({
                followStatus: "REQUESTED",
            });

        }
        const alreadyFollowing = currentUser.following.includes(targetUserId);


        if (alreadyFollowing) {


            currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
            targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId);

            await currentUser.save();
            await targetUser.save();

            return res.status(200).json({ message: "Unfollowed successfully", condition: alreadyFollowing });
        } else {

            currentUser.following.push(targetUserId);
            targetUser.followers.push(currentUserId);

            await currentUser.save();
            await targetUser.save();


            return res.status(200).json({ message: "Followed successfully" });
        }

    } catch (error) {
        console.error("Follow Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
