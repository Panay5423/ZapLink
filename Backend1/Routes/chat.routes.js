const express = require("express");
const chatRoutes = express.Router();
const chatController = require("../Controller/chat.controller");
const chatSearchController = require("../Controller/chat-search.controller");
const authMiddleware = require("../Auth/req.user");
const multer = require('multer');

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

// Search followers to chat with
chatRoutes.get("/search", authMiddleware, chatSearchController.searchUser);

// Send a new text message
chatRoutes.post("/send", authMiddleware, chatController.sendMessage);

// Send an image message
chatRoutes.post("/upload-image", authMiddleware, upload.single('image'), chatController.sendImageMessage);

// Get message history with a specific user
chatRoutes.get("/messages/:receiverId", authMiddleware, chatController.getMessages);

// Get the user's active chat list
chatRoutes.get("/list", authMiddleware, chatController.getChats);

// Mark a chat as read
chatRoutes.patch("/read/:chatId", authMiddleware, chatController.markAsRead);

// Delete a message
chatRoutes.delete("/messages/:messageId", authMiddleware, chatController.deleteMessage);

module.exports = chatRoutes;
