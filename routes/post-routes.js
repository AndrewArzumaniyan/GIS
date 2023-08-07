import { Router } from "express";
import post from "../controllers/post-controller.js"; 

const router = new Router();

router.get('/api/posts', post.getPosts)
router.get('/api/posts/:pointId', post.getPostsByPointId)
router.get('/api/posts/:pointId/:time', post.getPostsByPointIdPerTime)

export { router as postRoutes };