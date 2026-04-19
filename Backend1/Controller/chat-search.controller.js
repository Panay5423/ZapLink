const chatlistmodel = require("../Models/chat-listmodel");
const userModel = require("../Models/user.model");

exports.searchUser = async (req, res) => {
    try {
        const query = req.query.query;
        const currentUserId = res.user.id;

        if (!query) {
            return res.status(400).json({ message: "Query is required" });
        }

        const currentUser = await userModel
            .findById(currentUserId)
            .select("followers");

        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const usersFollowers = await userModel.find({
            _id: { $in: currentUser.followers },
            username: { $regex: query, $options: "i" }
        }).select("username profilePicture");

        const result = [];

        for (const user of usersFollowers) {
            const chat = await chatlistmodel.findOne({
                members: { $all: [currentUserId, user._id] },
                isGroup: false
            });

            result.push({
                _id: user._id,
                username: user.username,
                profilePicture: user.profilePicture,
                chatExists: !!chat,
                chatId: chat ? chat._id : null
            });
        }

        return res.status(200).json(result);

    } catch (error) {
        console.error("Search Error:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};