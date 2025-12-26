const express = require("express");
const search_fun = require('../Controller/search.controller');
const view_user = require('../Controller/View.User');
const authMiddleware = require('../Auth/req.user');
const follower_following = require('../Controller/follower-following.controller');
const SendNotification = require('../Controller/notification.controller')

const projectroutes = express.Router();

projectroutes.get('/search_user', search_fun.search_fun);

projectroutes.get('/view_user/:id', authMiddleware, view_user.view_user);
projectroutes.post('/follower_following/:id', authMiddleware, follower_following.followUser);
projectroutes.get('/notification', authMiddleware, SendNotification.GetNotification)


module.exports = projectroutes; 
