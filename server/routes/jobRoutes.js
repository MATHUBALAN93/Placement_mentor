import express from 'express';
import {
    analyzeJobDescriptionAndMatch,
    getMyMatches,
    getMatchDetail
} from '../controllers/jobController.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/analyze', authenticateUser, analyzeJobDescriptionAndMatch);
router.get('/matches', authenticateUser, getMyMatches);
router.get('/matches/:id', authenticateUser, getMatchDetail);

export default router;
