import express from "express";

import { followUnfollowUser, getSearchedUsers, getSuggestedUsers, getUserProfile, updateUser } from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/profile/:username", verifyToken, getUserProfile)
router.get("/suggested", verifyToken, getSuggestedUsers)
router.get("/search", verifyToken, getSearchedUsers)
router.post("/follow/:id", verifyToken, followUnfollowUser)
router.post("/update", verifyToken, updateUser)

export default router;