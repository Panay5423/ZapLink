
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require('path');


const app = express();


app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const apiRoutes = require('./routes');
app.use('/api', apiRoutes);


app.get("/", (req, res) => {
  res.send("Hello from App.js");
});

module.exports = app;  
