const express = require("express");
const userRoutes = express.Router();
const UserCntroller = require('../Controller/user.controller');
const multer = require('multer');
const authMiddleware = require('../Auth/req.user');
const passwordcntroller = require('../Controller/password.reset')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });
userRoutes.post('/register', UserCntroller.RegisterUser);
userRoutes.post('/verify', UserCntroller.verifyUserMail);
userRoutes.post('/login', UserCntroller.loginUser)
userRoutes.patch('/customize', authMiddleware, upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
]), UserCntroller.customize
);

userRoutes.post('/resetpassword', passwordcntroller.send_reset_mail)
userRoutes.post('/resetpasswordData', passwordcntroller.reset_pass)
userRoutes.get('/verify', authMiddleware, UserCntroller.verifyToken)
module.exports = userRoutes;
