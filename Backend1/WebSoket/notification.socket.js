

const { GetIo, OnlineUser } = require('./socket')

function SendNotification(targetUserId, message, currentUserId) {
    const io = GetIo();;
    const socket = OnlineUser.get(targetUserId)
    console.log("socket", socket)
    if (!socket) {
        console.log("user is offline")
        return;

    }
    console.log("user is online")
    io.to(socket).emit(
        "Notification", {
        message: message,
        from: currentUserId
    }

    )
    console.log("notification sent")

}
module.exports = SendNotification;