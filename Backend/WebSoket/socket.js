const WebSocket = require("ws");

module.exports = function setupSocket(server) {
    const wss = new WebSocket.Server({ server });

    wss.on("connection", (ws) => {
        console.log("WebSocket client connected");

        ws.send("WebSocket connected");

        ws.on("message", (msg) => {
            console.log("Message from client:", msg.toString());

            ws.send("Message received successfully");
        });

        ws.on("close", () => {
            console.log("Client disconnected");
        });
    });
};
