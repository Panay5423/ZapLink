// const WebSocket = require("ws");

// const userSoket = {};
// function setupSocket(server) {


//     //new web socket sonnetion
//     const wss = new WebSocket.Server({ server });
//     console.log(wss)


//     //on connetion
//     wss.on("connection", (ws) => {
//         console.log("WebSocket client connected");

//         //on send
//         ws.send("WebSocket connected");

//         //when forntedn send message
//         ws.on("message", (msg) => {

//             console.log("raw message from client", msg)
//             const data = JSON.parse(msg.toString())
//             console.log("Message from client:", msg.toString());



//             if (data.type === "INIT") {
//                 userSoket[data.userId] = ws;
//                 console.log("mapped", data.userId);
//                 console.log("Available sockets:............", Object.keys(userSoket));
//             }

//             ws.send("Message received successfully");
//         });

//         ws.on("close", () => {
//             console.log("Client disconnected");
//             for (let userId in userSoket) {
//                 if (userSoket[userId] === ws) {
//                     delete userSoket[userId];
//                     console.log("mapping removed for", userId)
//                     console.log("Available sockets:............", Object.keys(userSoket));

//                 }
//             }
//         });
//     });
// };

// module.exports = {
//     setupSocket,
//     userSoket
// }

const { Server } = require("socket.io")
let io;
const OnlineUser = new Map()
function setupSocket(server) {

    io = new Server(server, {
        cors: { origin: "*" }
    });


    io.on("connection", (socket) => {
        console.log("socket connected", socket.id)
        
        socket.on("INIT", (data) => {
            console.log("INIT from frontend", data)
            OnlineUser.set(data.userId, socket.id)
            
            // Broadcast that this user came online to everyone
            io.emit("user_online", { userId: data.userId });
            
            socket.emit("reply", "Message received..........");
        })

        socket.on("get_online_users", () => {
            // Send back an array of currently online user IDs
            socket.emit("online_users_list", Array.from(OnlineUser.keys()));
        });

        // Typing Indicators
        socket.on("typing", (data) => {
            const receiverSocketId = OnlineUser.get(data.receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("typing", { senderId: data.senderId });
            }
        });

        socket.on("stop_typing", (data) => {
            const receiverSocketId = OnlineUser.get(data.receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("stop_typing", { senderId: data.senderId });
            }
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected");
            for (let userId of OnlineUser.keys()) {
                if (OnlineUser.get(userId) === socket.id) {
                    OnlineUser.delete(userId);
                    // Broadcast that this user went offline
                    io.emit("user_offline", { userId: userId });
                    console.log("mapping removed for", userId)
                }
            }
        });
    })

}
function GetIo() {
    if (!io) throw new Error("Socket.IO not initialized");
    return io;
};

module.exports = {

    setupSocket,
    GetIo,
    OnlineUser
}


