const express = require("express");
const router = express.Router();
const chatController = require("./chat.controller");
const chatSearchController = require("./chat-search.controller");
const authMiddleware = require("../../common/middlewares/auth.middleware");
const upload = require("../../common/middlewares/upload.middleware");

// Search followers to chat with
router.get("/search", authMiddleware, chatSearchController.searchUser);

// Send a new text message
router.post("/send", authMiddleware, chatController.sendMessage);

// Send an image message
router.post("/upload-image", authMiddleware, upload.single('image'), chatController.sendImageMessage);

// Get message history with a specific user
router.get("/messages/:receiverId", authMiddleware, chatController.getMessages);

// Get the user's active chat list
router.get("/list", authMiddleware, chatController.getChats);

// Mark a chat as read
router.patch("/read/:chatId", authMiddleware, chatController.markAsRead);

// Delete a message
router.delete("/messages/:messageId", authMiddleware, chatController.deleteMessage);

module.exports = router;
