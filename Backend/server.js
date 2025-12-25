require("dotenv").config();
const connectDB = require('./config/db')
const app = require("./app");
const http = require('http');

const SetUpSoket = require('./WebSoket/socket')

const server = http.createServer(app);

SetUpSoket(server)

connectDB().then(() => {
  const PORT = 3000;
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

})
