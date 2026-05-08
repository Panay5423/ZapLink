const StoryModel = require('./story.model');
const UserModel = require('../user/user.model');

exports.addStory = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Image not found" });
        }

        const userId = req.user.id;
        const newStory = new StoryModel({
            user: userId,
            mediaPath: `/uploads/${req.file.filename}`
        });

        await newStory.save();
        res.status(200).json({ message: "Story uploaded successfully", story: newStory });
    } catch (error) {
        console.error("Add Story Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getStoriesFeed = async (req, res) => {
    try {
        const userId = req.user.id;
        const currentUser = await UserModel.findById(userId);

        if (!currentUser) return res.status(404).json({ message: "User not found" });

        // Get stories from users they follow + their own stories
        const targetUsers = [...currentUser.following, userId];

        // Fetch all active stories for these users (Mongoose TTL handles expiry automatically, but just in case, we could filter by date. TTL is enough though)
        // We will fetch all stories for targetUsers, sort by date ascending so oldest is shown first in the story viewer
        const stories = await StoryModel.find({ user: { $in: targetUsers } })
            .populate('user', 'username profilePicture firstName lastName')
            .sort({ createdAt: 1 });

        // Group stories by user
        const groupedStories = {};
        stories.forEach(story => {
            const uId = story.user._id.toString();
            if (!groupedStories[uId]) {
                groupedStories[uId] = {
                    user: story.user,
                    stories: []
                };
            }
            groupedStories[uId].stories.push({
                _id: story._id,
                mediaPath: story.mediaPath,
                createdAt: story.createdAt
            });
        });

        // Convert the grouped object back to an array
        const result = Object.values(groupedStories);

        // Optional: Sort so current user's stories are first, then others
        result.sort((a, b) => {
            if (a.user._id.toString() === userId) return -1;
            if (b.user._id.toString() === userId) return 1;
            return 0;
        });

        res.status(200).json(result);
    } catch (error) {
        console.error("Get Stories Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
