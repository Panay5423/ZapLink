const express = require("express");
const chatRoutes = express.Router();
const chatController = require("../Controller/chat.controller");
const chatSearchController = require("../Controller/chat-search.controller");
const authMiddleware = require("../Auth/req.user");

// Search followers to chat with
chatRoutes.get("/search/:query", authMiddleware, chatSearchController.searchUser);

// Send a new message
chatRoutes.post("/send", authMiddleware, chatController.sendMessage);

// Get message history with a specific user
chatRoutes.get("/messages/:receiverId", authMiddleware, chatController.getMessages);

// Get the user's active chat list
chatRoutes.get("/list", authMiddleware, chatController.getChats);

// Mark a chat as read
chatRoutes.patch("/read/:chatId", authMiddleware, chatController.markAsRead);

module.exports = chatRoutes;
