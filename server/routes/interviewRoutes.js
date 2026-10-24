import express from 'express';
import {
    startMockInterview,
    submitInterviewAnswer,
    getInterviewHistory,
    getInterviewDetail
} from '../controllers/interviewController.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/start', authenticateUser, startMockInterview);
router.get('/history', authenticateUser, getInterviewHistory);
router.post('/:id/answer', authenticateUser, submitInterviewAnswer);
router.get('/:id', authenticateUser, getInterviewDetail);

export default router;
