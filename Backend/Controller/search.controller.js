    const userModel = require('../Models/user.model')
    exports.search_fun = async (req, res) => {

        try {
                const query = req.query.q
            console.log ("query",query);
            if (!query) {
                return res.status(400).json({
                    message: "No query provided"
                })
            }
            const result = await userModel.find(
                {
                   username: { $regex: `^${query}`, $options: "i" }
                }
            ).select("username profilePicture _id")
            console.log("search result",result);

            res.json(result);

        }
        catch (err) {
            console.log(err);
            res.status(500).json({ message: "server error" })
        }
    };