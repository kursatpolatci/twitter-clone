import bcryptjs from "bcryptjs";
import { v2 as cloudinary } from "cloudinary"

import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

export const getUserProfile = async (req, res) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }
        res.status(200).json({
            success: true,
            message: "User found successfully",
            user: {
                ...user._doc,
                password: undefined
            }
        })
    } catch (error) {
        console.log(`Error in getUserProfile controller: ${error.message}`)
        res.status(400).json({ success: false, message: error.message })
    }
}

export const getSuggestedUsers = async (req, res) => {
    try {
        const userId = req.userId;

        const usersFollowedByMe = await User.findById(userId).select("following");

        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: userId }
                }
            },
            {
                $sample: {
                    size: 10
                }
            }
        ])

        const filteredUsers = users.filter((user) => !usersFollowedByMe.following?.includes(user._id))
        const suggestedUsers = filteredUsers.slice(0, 4);

        res.status(200).json({ 
            success: true,
            message: "Suggested Users were found successfully",
            users: suggestedUsers.map(user => (
                {   
                    ...user,
                    password: undefined
                }
            ))
         })
    } catch (error) {
        console.log(`Error in getSuggestedUsers controller: ${error.message}`)
        res.status(400).json({ success: false, message: error.message })
    }
}

export const followUnfollowUser = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const userToModify = await User.findById(id)
        const currentUser = await User.findById(userId)

        if (id === userId.toString()) {
            return res.status(400).json({success: false, message: "You can't follow/unfollow yourself"})
        }

        if (!userToModify || !currentUser) {
            return res.status(400).json({success: false, message: "User not found"})
        }

        const isFollowing = currentUser.following.includes(id)
        if (isFollowing) {
            await User.findByIdAndUpdate(id, { $pull: {followers: userId}})
            await User.findByIdAndUpdate(userId, { $pull: {following: id}})

            res.status(200).json({success: true, message: "User unfollowed successfully"})
        } else {
            await User.findByIdAndUpdate(id, {$push: {followers: userId}})
            await User.findByIdAndUpdate(userId, {$push: {following: id}})

            const notification = new Notification({
                from: userId,
                to: userToModify._id,
                type: "follow"
            })

            await notification.save();

            res.status(200).json({success: true, message: "User followed successfully", notification: notification})
        }
    } catch (error) {
        console.log(`Error in followUnfollowUser controller: ${error.message}`)
        res.status(400).json({ success: false, message: error.message })
    }
}

export const updateUser = async (req, res) => {
    try {
        const userId = req.userId;

        const { fullName, email, username, currentPassword, newPassword, bio, link } = req.body;
        let { coverImg, profileImg } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({success: false, message: "User not found"})
        }

        if ((!newPassword && currentPassword) || (newPassword && !currentPassword)) {
            return res.status(400).json({success: false, message: "Please provide both current password and new password"})
        }

        if (currentPassword && newPassword) {
            const isMatch = await bcryptjs.compare(currentPassword, user.password)
            if (!isMatch) {
                return res.status(400).json({success: false, message: "Invalid password"})
            }
            if (newPassword.length < 6) {
                return res.status(400).json({success: false, message: "Password must be at least 6 characters long"})
            }
            const salt = await bcryptjs.genSalt(10);
            user.password = await bcryptjs.hash(newPassword, salt);
        }

        if (profileImg) {
            if (user.profileImg) {
                // https://res.cloudinary.com/dyfqon1v6/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png  => example
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0])
            }
            const uploadedResponse = await cloudinary.uploader.upload(profileImg);
            profileImg = uploadedResponse.secure_url;
        }
        if (coverImg) {
            if (user.coverImg) {
                // https://res.cloudinary.com/dyfqon1v6/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png  => example
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0])
            }
            const uploadResponse = await cloudinary.uploader.upload(coverImg);
            coverImg = uploadResponse.secure_url;
        }
        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;
        await user.save();
        res.status(200).json({
            success: true,
            message: "User profile updated successfully",
            user: {
                ...user._doc,
                password: undefined
            }
        })
    } catch (error) {
        console.log(`Error in updateUser controller: ${error.message}`)
        res.status(400).json({ success: false, message: error.message })
    }
}