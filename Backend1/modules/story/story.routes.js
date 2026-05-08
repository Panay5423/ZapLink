const express = require('express');
const router = express.Router();
const storyController = require('./story.controller');
const upload = require('../../common/middlewares/upload.middleware');
const authMiddleware = require('../../common/middlewares/auth.middleware');

router.post('/', authMiddleware, upload.single('storyImage'), storyController.addStory);
router.get('/feed', authMiddleware, storyController.getStoriesFeed);

module.exports = router;
