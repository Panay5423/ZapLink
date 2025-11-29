const userModel = require('../Models/user.model')
const postModel = require('../Models/post.model')

exports.following_follwer = async (req, res) => {

    // try {

    //     const _id = req.params.id;
    //     const viwerId = req.user.id;

    //     console.log("query", _id);
    //     if (!_id) {
    //         return res.status(400).json({
    //             message: "unable to follw/unfollw user"
    //         })
    //     }
    //     if (!viwerId) {
    //         return res.status(400).json({
    //             message: "something went wrong"
    //         })
    //     }
    //     const follwer_id = await userModel.findOne(viwerId )
    //         .select(" followers ");
    //     const following_id = await userModel.findOne({ _id })
    //         .select(" following ");

    //     if (!follwer_id || !following_id) {
    //         return res.status(404).json({
    //             message: "user not found"
    //         })
    //     }
    //     console.log("follwer_id", follwer_id);
    //     console.log("following_id", following_id);
    //     return res.json(
    //         {
    //             message: "chal rha hai ab dekhte hai",
    //         });

    // }
    // catch (err) {
    //     console.log(err);
    //     res.status(500).json({ message: "server error" })
    // }
    
        try {
    
            const _id = req.params.id;
            const viwerId = req.user.id;
    
            console.log("query", _id);
            if (!_id) {
                return res.status(400).json({
                    message: "No query provided"
                })
            }
            if (!viwerId) {
                return res.status(400).json({
                    message: "something went wrong"
                })
            }
            const result = await userModel.findOne({ _id })
                .select("IsPrivate username profilePicture _id BannerPicture followers following bio");
    
            const followers = result.followers || [];
    
            const isFollower = followers.includes(viwerId);
    
    
            console.log("result", result);
            console.log(result.IsPrivate);
    
            if (result.IsPrivate == true) {
    
                const Sizeof_followers = result.followers || [];
                const sizeOf_Follwing = result.following || [];
                const posts = await postModel.find({ Posted_by: _id, IsDeleted: false })
                const number_of_posts = posts.length;
    
                return res.json(
                    {
                        Uername: result.username,
                        profilePicture: result.profilePicture,
                        _id: result._id,
                        BannerPicture: result.BannerPicture,
                        follwer: Sizeof_followers.length,
                        follwings: sizeOf_Follwing.length,
                        bio: result.bio,
                        posts: number_of_posts.length,
                        message: "This account is private"
                    });
            }
            if (result.IsPrivate == false) {
                const posts = await postModel.find({ Posted_by: _id, IsDeleted: false })
    
                return res.json(
                    {
                        Uername: result.username,
                        profilePicture: result.profilePicture,
                        _id: result._id,
                        BannerPicture: result.BannerPicture,
                        follwer: result.followers,
                        follwings: result.following,
                        bio: result.bio,
                        posts: posts
    
                    });
            }
            if (result.IsPrivate == true && isFollower) {
                const posts = await postModel.find({ Posted_by: _id, IsDeleted: false })
                const number_of_posts = posts.length;
    
                console.log(res)
                return res.json(
                    {
                        Uername: result.username,
                        profilePicture: result.profilePicture,
                        _id: result._id,
                        BannerPicture: result.BannerPicture,
                        follwer: result.followers,
                        follwings: result.following,
                        bio: result.bio,
                        posts: number_of_posts.length
    
                    });
            }
    
        }
        catch (err) {
            console.log(err);
            res.status(500).json({ message: "server error" })
        }
};