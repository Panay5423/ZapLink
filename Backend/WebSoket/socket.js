const WebSocket = require("ws");

const userSoket = {};
function setupSocket(server) {
    const wss = new WebSocket.Server({ server });



    wss.on("connection", (ws) => {
        console.log("WebSocket client connected");

        ws.send("WebSocket connected");

        ws.on("message", (msg) => {
            const data = JSON.parse(msg.toString())
            console.log("Message from client:", msg.toString());

            if (data.type === "INIT") {
                userSoket[data.userId] = ws;
                console.log("mapped", data.userId);


                console.log("UserSoket", userSoket)
            }

            ws.send("Message received successfully");
        });

        ws.on("close", () => {
            console.log("Client disconnected");
            for (let userId in userSoket) {
                if (userSoket[userId] === ws) {
                    delete userSoket[userId];
                    console.log("mapping removed for", userId)
                }
            }
        });
    });
};

module.exports = {
    setupSocket,
    userSoket
}