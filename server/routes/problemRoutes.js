import express from 'express';
import { getAllProblems, getProblemDetail, logProblemAttempt } from '../controllers/problemController.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateUser, getAllProblems);
router.get('/:id', authenticateUser, getProblemDetail);
router.post('/attempts', authenticateUser, logProblemAttempt); // Maps /api/attempts under generic logic or /api/problems/attempts. Let's make it match /api/attempts or problem endpoint. Actually the spec in Section 41 lists: `POST/GET /api/attempts`. So we can mount attempts logic on auth / attempts endpoints. We will link it in server.js.

export default router;
