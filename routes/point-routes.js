import { Router } from "express";
import point from "../controllers/point-controller.js"; 

const router = new Router();

router.get('/api/points', point.getPoints)
router.get('/api/point/:id/:time', point.getPointDataDay)
router.get('/api/point/:time', point.getDataPerTime)

export { router as pointRoutes };