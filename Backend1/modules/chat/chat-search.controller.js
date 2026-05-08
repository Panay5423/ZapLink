const chatlistmodel = require("./chat-listmodel");
const userModel = require("../user/user.model");

exports.searchUser = async (req, res) => {
    try {
        const query = req.query.query;
        const currentUserId = req.user ? (req.user.id || req.user._id) : (res.user && (res.user.id || res.user._id));

        if (!currentUserId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!query) {
            return res.status(400).json({ message: "Query is required" });
        }

        const currentUser = await userModel
            .findById(currentUserId)
            .select("followers following");

        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const connections = [...new Set([...currentUser.followers, ...currentUser.following])];

        const usersFollowers = await userModel.find({
            _id: { $in: connections },
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
                chatId: chat ? chat._id : null,
                chatDetails: chat ? chat : null
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