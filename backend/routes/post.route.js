import express from "express";

import { verifyToken } from "../middleware/verifyToken.js";
import { commentOnPost, createPost, deletePost, getAllPosts, getLikedPosts, likeUnlikePost } from "../controllers/post.controller.js";

const router = express.Router();

router.get("/all", verifyToken, getAllPosts)
router.get("/likes/:id", verifyToken, getLikedPosts)
router.post("/create", verifyToken, createPost)
router.post("/like/:id", verifyToken, likeUnlikePost)
router.post("/comment/:id", verifyToken, commentOnPost)
router.delete("/delete/:id", verifyToken, deletePost)

export default router;