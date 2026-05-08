const ChatModel = require("./chat.model");
const ChatListModel = require("./chat-listmodel");
const { GetIo, OnlineUser } = require("../../WebSoket/socket");

exports.sendMessage = async (req, res) => {
    try {
        const { receiverId, text } = req.body;
        // Using both req.user and res.user in case of middleware setting variations
        const senderId = req.user ? (req.user.id || req.user._id) : (res.user && (res.user.id || res.user._id));

        if (!receiverId || !text) {
            return res.status(400).json({ message: "Receiver ID and text are required" });
        }

        // Create new message
        const newMessage = new ChatModel({
            from: senderId,
            to: receiverId,
            text: text
        });
        await newMessage.save();

        // Check if chat list exists between these two users
        let chatList = await ChatListModel.findOne({
            members: { $all: [senderId, receiverId] },
            isGroup: false
        });

        if (!chatList) {
            // Create new chat list
            chatList = new ChatListModel({
                members: [senderId, receiverId],
                lastMessage: text,
                lastMessageSender: senderId,
                unreadCount: 1, // Start with 1 unread message
                isGroup: false
            });
        } else {
            // Update existing chat list
            chatList.lastMessage = text;
            chatList.lastMessageSender = senderId;
            chatList.unreadCount += 1; // Increment unread count
        }
        await chatList.save();

        // Emit real-time message via socket.io if user is online
        try {
            const io = GetIo();
            const receiverSocketId = OnlineUser.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("new_message", newMessage);
            }
        } catch (socketErr) {
            console.error("Socket emission error:", socketErr);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error in sendMessage:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.sendImageMessage = async (req, res) => {
    try {
        const { receiverId } = req.body;
        const senderId = req.user ? (req.user.id || req.user._id) : (res.user && (res.user.id || res.user._id));

        if (!receiverId || !req.file) {
            return res.status(400).json({ message: "Receiver ID and image are required" });
        }

        const imageUrl = `uploads/${req.file.filename}`;

        const newMessage = new ChatModel({
            from: senderId,
            to: receiverId,
            imageUrl: imageUrl,
            isRead: false
        });

        await newMessage.save();

        // Check if chatList exists, if not create one
        let chatList = await ChatListModel.findOne({
            members: { $all: [senderId, receiverId] }
        });

        if (!chatList) {
            chatList = new ChatListModel({
                members: [senderId, receiverId],
                lastMessage: "📷 Image",
                lastMessageTime: new Date(),
                unreadCount: 1,
                lastMessageSender: senderId
            });
        } else {
            chatList.lastMessage = "📷 Image";
            chatList.lastMessageTime = new Date();
            chatList.lastMessageSender = senderId;
            chatList.unreadCount += 1;
        }

        await chatList.save();

        // Emit via socket
        try {
            const { GetIo, OnlineUser } = require("../../WebSoket/socket");
            const io = GetIo();
            const receiverSocketId = OnlineUser.get(receiverId);

            if (receiverSocketId) {
                io.to(receiverSocketId).emit("new_message", newMessage);
            }
        } catch (socketErr) {
            console.error("Socket emission error:", socketErr);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error in sendImageMessage:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const { receiverId } = req.params;
        const senderId = req.user ? (req.user.id || req.user._id) : (res.user && (res.user.id || res.user._id));

        if (!receiverId) {
            return res.status(400).json({ message: "Receiver ID is required" });
        }

        const messages = await ChatModel.find({
            $or: [
                { from: senderId, to: receiverId },
                { from: receiverId, to: senderId }
            ]
        }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error in getMessages:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getChats = async (req, res) => {
    try {
        const userId = req.user ? (req.user.id || req.user._id) : (res.user && (res.user.id || res.user._id));

        const chats = await ChatListModel.find({
            members: { $in: [userId] }
        })
            .populate("members", "username profilePicture")
            .sort({ updatedAt: -1 });

        res.status(200).json(chats);
    } catch (error) {
        console.error("Error in getChats:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user ? (req.user.id || req.user._id) : (res.user && (res.user.id || res.user._id));

        const chatList = await ChatListModel.findById(chatId);

        if (!chatList) {
            return res.status(404).json({ message: "Chat not found" });
        }

        // If the current user is NOT the last message sender, reset unread count
        if (chatList.lastMessageSender && chatList.lastMessageSender.toString() !== userId.toString()) {
            chatList.unreadCount = 0;
            await chatList.save();
        }

        // Also mark all individual messages in this chat sent to current user as read
        const otherMemberId = chatList.members.find(m => m.toString() !== userId.toString());
        if (otherMemberId) {
            await ChatModel.updateMany(
                { from: otherMemberId, to: userId, isRead: { $ne: true } },
                { $set: { isRead: true } }
            );

            // Notify the sender that their messages were read
            try {
                const { GetIo, OnlineUser } = require("../../WebSoket/socket");
                const io = GetIo();
                const senderSocketId = OnlineUser.get(otherMemberId.toString());

                if (senderSocketId) {
                    io.to(senderSocketId).emit("messages_read", { readerId: userId.toString() });
                }
            } catch (socketErr) {
                console.error("Socket emission error on read receipt:", socketErr);
            }
        }

        res.status(200).json({ message: "Chat marked as read", chatList });
    } catch (error) {
        console.error("Error in markAsRead:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user ? (req.user.id || req.user._id) : (res.user && (res.user.id || res.user._id));

        const message = await ChatModel.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        // Only the sender can delete their message
        if (message.from.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You can only delete your own messages" });
        }

        const receiverId = message.to.toString();
        await ChatModel.findByIdAndDelete(messageId);

        // Emit real-time deletion via socket.io
        try {
            const io = GetIo();
            const receiverSocketId = OnlineUser.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("message_deleted", { messageId, receiverId });
            }
        } catch (socketErr) {
            console.error("Socket emission error on delete:", socketErr);
        }

        res.status(200).json({ message: "Message deleted successfully", messageId });
    } catch (error) {
        console.error("Error in deleteMessage:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
