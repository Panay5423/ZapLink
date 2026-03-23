const FollowRequest = require('../Models/FollowRequest')

exports.GetNotification = async (req, res) => {

    const userid = req.user.id

    const pendingRequest = await FollowRequest.find({
        to: userid,
        status: "pending"
    }).populate("from", "username profilePicture");

    res.json({
        count: pendingRequest.length,
        Notification: pendingRequest
    })
}