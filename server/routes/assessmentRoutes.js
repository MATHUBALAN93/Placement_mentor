import express from 'express';
import {
    startAssessment,
    submitAnswer,
    completeAssessment,
    getAssessmentHistory,
    getAssessmentDetail
} from '../controllers/assessmentController.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/start', authenticateUser, startAssessment);
router.get('/history', authenticateUser, getAssessmentHistory);
router.post('/:id/answer', authenticateUser, submitAnswer);
router.post('/:id/complete', authenticateUser, completeAssessment);
router.get('/:id', authenticateUser, getAssessmentDetail);

export default router;
