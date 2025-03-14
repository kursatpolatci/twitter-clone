import express from 'express';

import { verifyToken } from '../middleware/verifyToken.js';
import {
  commentOnPost,
  createPost,
  deleteComment,
  deletePost,
  getAllPosts,
  getFollowingPosts,
  getLikedPosts,
  getUserPosts,
  likeUnlikePost,
} from '../controllers/post.controller.js';

const router = express.Router();

router.get('/all', verifyToken, getAllPosts);
router.get('/following', verifyToken, getFollowingPosts);
router.get('/likes/:id', verifyToken, getLikedPosts);
router.get('/user/:username', verifyToken, getUserPosts);
router.post('/create', verifyToken, createPost);
router.post('/like/:id', verifyToken, likeUnlikePost);
router.post('/comment/:id', verifyToken, commentOnPost);
router.delete('/delete/:id', verifyToken, deletePost);
router.delete('/delete/:id/:commentId', verifyToken, deleteComment);

export default router;
