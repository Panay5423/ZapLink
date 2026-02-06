
const { userSoket } = require('./socket')

function SendNotification(targetUserId, message) {
    const socket = userSoket[targetUserId];
    console.log("notifcation vala function chal gya ")
    console.log("tagertet",targetUserId)
        console.log("socket",socket)

    if (!socket) {
        console.log("user is ofline")
        return;
    }

    if (socket.readyState === 1) {
        socket.send(
            JSON.stringify({
                type: "NOTIFICATION",
                message: message,
                to: targetUserId
            })
        )
    }

}
module.exports = SendNotification;