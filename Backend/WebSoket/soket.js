const WebSocket = require("ws");

module.exports = function setupSocket(server) {
    const wss = new WebSocket.Server({ server })

    wss.on("connection", (ws) => {
        console.log('websoket client connected')


        ws.send('WebSOket connected ');


        ws.on('message', (msg) => {
            console.log("message from client ", msg.toString())

            ws.send("message aagya hia aapka")

        })

        ws.on('close', () => {
            console.log("client dissconeted")
        })

    })
}
