const express = require("express");
const router = express.Router();
const authController = require('./auth.controller');
const upload = require('../../common/middlewares/upload.middleware');

router.post('/register', upload.fields([{ name: 'profilePicture', maxCount: 1 }]), authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/verify', authController.verifyUserMail);
router.post('/reset-password-mail', authController.sendResetMail);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
