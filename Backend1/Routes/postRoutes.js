const express = require("express");
const PostRoutes = express.Router();
const multer = require('multer');
const authMiddleware = require('../Auth/req.user'); 




const postController = require('../Controller/Post.controller'); 

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

PostRoutes.get('/my-posts', authMiddleware, postController.getUserPosts);
PostRoutes.post('/new', upload.single('PostImage'), postController.NewPost);

module.exports = PostRoutes;
