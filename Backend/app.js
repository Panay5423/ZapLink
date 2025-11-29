
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require('path'); 


const app = express();


app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const projectroutes = require("./Routes/projectRoutes")
const userRoutes = require("./Routes/user.route");
const postRoutes = require("./Routes/postRoutes")


app.use('/posts', postRoutes);
app.use('/user', userRoutes);
app.use('/action', projectroutes);


app.get("/", (req, res) => {
  res.send("Hello from App.js");
});

module.exports = app;  
