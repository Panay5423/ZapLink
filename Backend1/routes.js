const express = require('express');
const router = express.Router();

const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/user/user.routes');
const followRoutes = require('./modules/follow/follow.routes');
const postRoutes = require('./modules/post/post.routes');
const chatRoutes = require('./modules/chat/chat.routes');
const notificationRoutes = require('./modules/notification/notification.routes');
const searchRoutes = require('./modules/search/search.routes');
const storyRoutes = require('./modules/story/story.routes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/follow', followRoutes);
router.use('/posts', postRoutes);
router.use('/chat', chatRoutes);
router.use('/notifications', notificationRoutes);
router.use('/search', searchRoutes);
router.use('/stories', storyRoutes);

module.exports = router;
