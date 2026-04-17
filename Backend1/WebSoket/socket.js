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
            console.log("OnlineUser", OnlineUser)
            socket.emit("reply", "Message received..........");


        })
        socket.on("disconnect", () => {
            console.log("Client disconnected");
            for (let userId of OnlineUser.keys()) {
                if (OnlineUser.get(userId) === socket.id) {
                    OnlineUser.delete(userId);
                    console.log("mapping removed for", userId)
                    console.log("Available sockets:............", Object.keys(OnlineUser));

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


