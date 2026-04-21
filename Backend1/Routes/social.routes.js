const express = require("express");
const socialRoutes = express.Router();
const authMiddleware = require('../Auth/req.user');
const follow_following = require('../Controller/follower-following.controller');
const SendNotification = require('../Controller/notification.controller')

socialRoutes.post('/follow/:id', authMiddleware, follow_following.followUser);
socialRoutes.post('/unfollow/:id', authMiddleware, follow_following.unfollowUser);

socialRoutes.post('/follow/accept/:requestId', authMiddleware, follow_following.acceptFollowRequest);
socialRoutes.post('/follow/reject/:requestId', authMiddleware, follow_following.rejectFollowRequest);

socialRoutes.get('/notification', authMiddleware, SendNotification.GetNotification)



module.exports = socialRoutes;