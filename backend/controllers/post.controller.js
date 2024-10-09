import Notification from "../models/notification.model.js"
import Post from "../models/post.model.js"
import User from "../models/user.model.js"

import { v2 as cloudinary } from "cloudinary"

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
        .sort({createdAt: -1})
        .populate({
            path: "user",
            select: "-password"
        })
        .populate({
            path: "comments.user",
            select: "-password"
        })

        res.status(200).json({
            success:true,
            feedPosts: posts
        })
    } catch (error) {
        console.log(`Error in getAllPosts controller: ${error.message}`)
        res.status(400).json({ success: false, message: error.message })
    }
}

export const getFollowingPosts = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({success: false, message: "User not found"})
        }

        const posts = await Post.find({user: {$in: user.following}})
        .sort({createdAt: -1})
        .populate({
            path: "user",
            select: "-password"
        })
        .populate({
            path: "comments.user",
            select: "-password"
        })

        res.status(200).json({
            success: true,
            feedPosts: posts
        })
    } catch (error) {
        console.log(`Error in getFollowingPosts controller: ${error.message}`)
        res.status(400).json({ success: false, message: error.message })
    }
}

export const getLikedPosts = async (req, res) => {
    try {
        const { id: userId } = req.params;
        
        const user = await User.findById(userId)
        if (!user) {
            return res.status(400).json({success: false, message: "User not found"})
        }

        const likedPosts = await Post.find({_id : {$in: user.likedPosts}})
        .sort({createdAt: -1})
        .populate({
            path: "user",
            select: "-password"
        })
        .populate({
            path: "comments.user",
            select: "-password"
        })

        res.status(200).json({
            success: true,
            likedPosts: likedPosts
        })
    } catch (error) {
        console.log(`Error in getLikedPosts controller: ${error.message}`)
        res.status(400).json({ success: false, message: error.message })
    }
}

export const getUserPosts = async (req, res) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({username})
        if (!user) {
            return res.status(404).json({success: false, message: "User not found"})
        }

        const posts = await Post.find({user: user._id})
        .sort({createdAt: -1})
        .populate({
            path: "user",
            select: "-password"
        })
        .populate({
            path: "comments.user",
            select: "-password"
        })

        res.status(200).json({
            success: true,
            posts: posts
        })
    } catch (error) {
        console.log(`Error in getUserPosts controller: ${error.message}`)
        res.status(400).json({ success: false, message: error.message })
    }
}

export const createPost = async (req, res) => {
    try {
        const { text } = req.body;
        let { img } = req.body;
        const userId = req.userId;

        const user = await User.findById(userId)
        if (!user) {
            return res.status(400).json({success: false, message: "User not found"})
        }

        if (!text && !img) {
            return res.status(400).json({success: false, message: "Post must have text or image"})
        }

        if (img) {
            const uploadedResponse = await cloudinary.uploader.upload(img)
            img = uploadedResponse.secure_url;
        }

        const newPost = new Post({
            user: userId,
            text: text,
            img: img
        })

        await newPost.save();

        res.status(201).json({
            success: true,
            message: "Post was created successfully",
            post: newPost
        })
    } catch (error) {
        console.log(`Error in createPost controller: ${error.message}`)
        res.status(400).json({ success: false, message: error.message })
    }
}

export const likeUnlikePost = async (req, res) => {
    try {
        const { id: postId } = req.params
        const userId = req.userId;

        const post = await Post.findById(postId)
        if (!post) {
            return res.status(400).json({success:false, message: "Post not found"})
        }

        const userLikedPost = post.likes.includes(userId)

        if (userLikedPost) {
            await Post.updateOne({_id: postId}, {$pull: {likes: userId}})
            await User.updateOne({_id: userId}, {$pull: {likedPosts: postId}})

            const updatedPost = await Post.findById(postId)
            res.status(200).json({
                success: true,
                message: "Unliked successfully",
                updatedLikes: updatedPost.likes,
            })
        } else {
            await Post.updateOne({_id: postId}, {$push: {likes: userId}})
            await User.updateOne({_id: userId}, {$push: {likedPosts: postId}})

            const notification = new Notification({
                from: userId,
                to: post.user,
                type: "like"
            })

            await notification.save();

            const updatedPost = await Post.findById(postId)
            res.status(200).json({
                success: true,
                message: "Liked successfully",
                updatedLikes: updatedPost.likes,
                notification: notification
            })
        }
    } catch (error) {
        console.log(`Error in likeUnlikePost controller: ${error.message}`)
        res.status(400).json({ success: false, message: error.message })
    }
}

export const commentOnPost = async (req, res) => {
    try {
        const { text } = req.body
        const userId = req.userId
        const { id: postId } = req.params

        if (!text) {
            return res.status(400).json({success:false, message: "Text field is required"})
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(400).json({success:false, message: "Post not found"})
        }

        post.comments.push({
            user: userId,
            text: text
        })

        await post.save()

        res.status(200).json({
            success: true,
            message: "Commented successfully",
            post: post
        })
    } catch (error) {
        console.log(`Error in commentOnPost controller: ${error.message}`)
        res.status(400).json({ success: false, message: error.message })
    }
}

export const deletePost = async (req, res) => {
    try {
        const { id: postId } = req.params;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(400).json({success: false, message: "Post not found"})
        }

        if (post.user.toString() !== req.userId.toString()) {
            return res.status(400).json({success: false, message: "You are not authorized to delete this post"})
        }

        if (post.img) {
            await cloudinary.uploader.destroy(post.img.split("/").pop().split(".")[0])
        }

        await Post.findByIdAndDelete(postId)

        res.status(200).json({
            success: true,
            message: "Post deleted successfully"
        })
    } catch (error) {
        console.log(`Error in deletePost controller: ${error.message}`)
        res.status(400).json({ success: false, message: error.message })
    }
}
