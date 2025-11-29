    const userModel = require('../Models/user.model')
    exports.search_fun = async (req, res) => {

        try {
            const query = req.body.q
            if (!query) {
                return res.status(400).json({
                    message: "No query provided"
                })
            }
            const result = await userModel.find(
                {
                   username: { $regex: query, $options: "i" }
                }
            ).select("username profilePicture")

            res.json(result);

        }
        catch (err) {
            console.log(err);
            res.status(500).json({ message: "server error" })
        }
    };