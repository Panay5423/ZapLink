const express = require("express");
const search_fun = require('../Controller/search.controller');

const projectroutes = express.Router();

projectroutes.post('/search_user', search_fun.search_fun);

module.exports = projectroutes; 
