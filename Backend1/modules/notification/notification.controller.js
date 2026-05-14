const FollowRequest = require('../follow/follow.model');
const NotificationModel = require('./notification.model');

exports.GetNotification = async (req, res) => {
    try {
        const userid = req.user.id;

        // Fetch pending follow requests for the current user
        const pendingRequest = await FollowRequest.find({
            to: userid,
            status: "pending"
        }).populate("from", "username profilePicture");

        // Fetch activity notifications (latest 20)
        const activityNotifications = await NotificationModel.find({
            recipient: userid
        })
        .populate("sender", "username profilePicture")
        .sort({ createdAt: -1 })
        .limit(20);

        res.json({
            count: pendingRequest.length + activityNotifications.length,
            Notification: pendingRequest, // keeping legacy name for follow requests
            ActivityNotifications: activityNotifications
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
