const express = require("express");
const router = express.Router();
const userController = require('./user.controller');
const upload = require('../../common/middlewares/upload.middleware');
const authMiddleware = require('../../common/middlewares/auth.middleware');

router.get('/me', authMiddleware, userController.getProfile);
router.patch('/me', authMiddleware, upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
]), userController.customizeProfile);
router.get('/verify-token', authMiddleware, userController.verifyToken);
router.get('/:id', authMiddleware, userController.getUserProfileById);

module.exports = router;
