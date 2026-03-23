
const { userSoket } = require('./socket')

function SendNotification(targetUserId, message, currentUserId) {
    console.log(userSoket)
    const socket = userSoket[targetUserId];
    console.log("Sending notification to:", targetUserId);
    console.log("Available sockets:", Object.keys(userSoket));

    if (!socket) {
        console.log("user is ofline")
        return;
    }

    if (socket.readyState === 1) {
        console.log(socket.readyState)
        console.log("notification send ")
        socket.send(
            JSON.stringify({
                type: "NOTIFICATION",
                message: message,
                from: currentUserId
            })
        )
    }

}
module.exports = SendNotification;