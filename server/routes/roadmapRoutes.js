import express from 'express';
import { getMyRoadmap, regenerateRoadmap } from '../controllers/roadmapController.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateUser, getMyRoadmap);
router.post('/generate', authenticateUser, regenerateRoadmap);

export default router;
