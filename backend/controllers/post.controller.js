import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import { v2 as cloudinary } from "cloudinary";

export const createPost = async (req, res) => {
    try {
        const { text } = req.body;
        let { img } = req.body;
        const userId = req.user._id.toString();

        const user = await User.findById(userId);
        // data validation
        if(!user) return res.status(404).json({error: "User not found"});
        if(!text && !img) return res.status(400).json({error: "Post must have text or image"});

        if(img){
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }

        const newPost = new Post({
            user: userId,
            text,
            image: img || null,
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        console.log('Error in create Post controller', error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
}

export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post) return res.status(404).json({error: "Post not found"});
        if(post.user.toString() !== req.user._id.toString()) 
            return res.status(404).json({error: "You are not authorize to delete this post"});
        if(post.img){ // delete img from cloud
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }
        await Post.findByIdAndDelete(req.params.id); // delete post from database

        res.status(200).json({message: "Post deleted successfully"});

    } catch (error) {
        console.log('Error in delete Post controller', error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
};

export const commentOnPost = async (req, res) => {
    try {
        const { text } = req.body;
        const postId = req.params.id;
        const userId = req.user._id;
        if(!text) return res.status(400).json({error: "text field is required"});

        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({error: "Post not found"});   
        // push json object (include text, userId) into post's comments array
        const comment = { user: userId, text };
        post.comments.push(comment);
        await post.save();

        res.status(201).json(post);

    } catch (error) {
        console.log('Error in comment On Post controller', error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
};


export const likeUnlikePost = async (req, res) => {
    try {
        // get userId, get postId
        const userId = req.user._id;
        const postId = req.params.id;

        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({error: "Post not found"}); 

        // check if the user liked the post, if no, push userId into the Post's likes array
        // else pull the userId from the Post's likes array
        const isUserLikedPost = post.likes.includes(userId);

        if(!isUserLikedPost){
            //like post
            post.likes.push(userId); // push into post's likes array
            await User.updateOne({_id: userId}, {$push: { likedPosts: postId }}); // push into user's likedPosts array
            await post.save();

            //create notification
            const notification = new Notification({
                from: userId,
                to: post.user,
                type: "like",
            });
            await notification.save();

            res.status(200).json({message: "Post liked successfully"});
        } else {
            // unlike post
            await Post.updateOne({_id: postId}, {$pull: { likes: userId }});
            await User.updateOne({_id: userId }, {$pull: { likedPosts: postId }})


            res.status(200).json({message: "Post unliked successfully"});
        }

    } catch (error) {
        console.log('Error in likeUnlikePost controller', error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
};

export const getAllPost = async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate({
                path: "user",
                select: "-password",
            })
            .populate({
                path: "comments.user",
                select: "-password",
            });

        // if no post
        if(posts.length === 0) return res.status(200).json([]);

        res.status(200).json(posts);
    } catch (error) {
        console.log('Error in getAllPost controller', error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
}

export const getLikedPosts = async (req, res) => {
    try {
        const userId = req.params.id;

        // get all the likes by user
        const user = await User.findById(userId);
        if(!user) return res.status(404).json({error: "User not found"});

        const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
            .populate({
                path: "user",
                select: "-password",
            }).populate({
                path: "comments.user",
                select: "-password",
            });

        res.status(200).json(likedPosts);

    } catch (error) {
        console.log('Error in getLikedPosts controller', error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
};

export const getFollowingPosts = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if(!user) return res.status(404).json({error: "user not found"});
        
        const following = user.following;

        const feedPosts = await Post.find({ user: { $in: following } })
            .sort({ createdAt: -1 })
            .populate({
                path: "user",
                select: "-password",
            })
            .populate({
                path: "comments.user",
                select: "-password",
            });

        res.status(200).json(feedPosts);

    } catch (error) {
        console.log('Error in getFollowingPosts controller', error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
};

export const getUserPosts = async (req, res) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({ username });
        if(!user) return res.status(404).json({error: "user not found"});

        const posts = await Post.find({ user: user._id }).sort({createdAt: -1}).populate({
            path: "user",
            select: "-password",
        }).populate({
            path: "comments.user",
            select: "-password",
        });

        res.status(200).json(posts);
    } catch (error) {
        console.log('Error in getUserPosts controller', error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
};