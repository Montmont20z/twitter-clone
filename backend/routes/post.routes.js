import express from 'express';

import { protectRoute } from '../middleware/protectRoute.js';
import { createPost, deletePost, commentOnPost, likeUnlikePost, getAllPost, getLikedPosts, getFollowingPosts, getUserPosts } from '../controllers/post.controller.js';

const router = express.Router();

router.get('/all', protectRoute, getAllPost);
router.get('/following', protectRoute, getFollowingPosts);
router.get('/likes/:id', protectRoute, getLikedPosts);
router.get('/user/:username', protectRoute, getUserPosts);
router.post('/create', protectRoute, createPost);
router.post('/comment/:id', protectRoute, commentOnPost); 
router.put('/like/:id', protectRoute, likeUnlikePost);
router.delete('/delete/:id', protectRoute, deletePost);




export default router;