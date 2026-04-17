require("dotenv").config();
const connectDB = require('./config/db')
const app = require("./app");
const http = require('http');
const socket = require("./WebSoket/socket")


const server = http.createServer(app);



connectDB().then(() => {
  const PORT = 3000;
  socket.setupSocket(server)
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

})
