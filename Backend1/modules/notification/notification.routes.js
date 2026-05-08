const express = require('express');
const router = express.Router();
const notificationController = require('./notification.controller');
const authMiddleware = require('../../common/middlewares/auth.middleware');

router.get('/', authMiddleware, notificationController.GetNotification);

module.exports = router;
