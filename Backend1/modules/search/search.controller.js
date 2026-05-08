const userModel = require('../user/user.model');

exports.searchUsers = async (req, res) => {
    try {
        const query = req.query.query;
        if (!query) {
            return res.status(400).json({ message: "No query provided" });
        }
        
        const result = await userModel.find(
            { username: { $regex: `^${query}`, $options: "i" } }
        ).select("username profilePicture _id");

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
