const express = require('express');
const router = express.Router();
const followController = require('./follow.controller');
const authMiddleware = require('../../common/middlewares/auth.middleware');

router.post('/:id', authMiddleware, followController.followUser);
router.delete('/:id', authMiddleware, followController.unfollowUser);
router.post('/accept/:requestId', authMiddleware, followController.acceptFollowRequest);
router.post('/reject/:requestId', authMiddleware, followController.rejectFollowRequest);

router.get('/followers', authMiddleware, followController.getFollowers);
router.post('/remove-follower/:id', authMiddleware, followController.removeFollower);
router.post('/block/:id', authMiddleware, followController.blockUser);

module.exports = router;
