import express from 'express';
import {
    getCodingHint,
    getConceptExplanation,
    getSolutionAnalysis,
    getRecommendations,
    getLearningPlanSchedule
} from '../controllers/aiController.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/hint', authenticateUser, getCodingHint);
router.post('/explain', authenticateUser, getConceptExplanation);
router.post('/analyze-solution', authenticateUser, getSolutionAnalysis);
router.get('/recommend', authenticateUser, getRecommendations);
router.post('/learning-plan', authenticateUser, getLearningPlanSchedule);

export default router;
