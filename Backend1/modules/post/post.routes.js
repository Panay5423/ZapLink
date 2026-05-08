const express = require("express");
const router = express.Router();
const postController = require('./post.controller'); 
const upload = require('../../common/middlewares/upload.middleware');
const authMiddleware = require('../../common/middlewares/auth.middleware');

router.get('/my-posts', authMiddleware, postController.getUserPosts);
router.get('/feed', authMiddleware, postController.getHomeFeed);
router.post('/new', authMiddleware, upload.single('PostImage'), postController.NewPost);

router.post('/:postId/like', authMiddleware, postController.toggleLike);
router.post('/:postId/comment', authMiddleware, postController.addComment);
router.get('/:postId/comments', authMiddleware, postController.getComments);

module.exports = router;
