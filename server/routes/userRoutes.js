import express from 'express';
import { getStudentDashboardStats, updateStreak } from '../controllers/userController.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', authenticateUser, getStudentDashboardStats);
router.post('/streak/update', authenticateUser, updateStreak);

export default router;
