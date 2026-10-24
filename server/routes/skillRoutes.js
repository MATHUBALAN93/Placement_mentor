import express from 'express';
import { getAllSkills, getMySkills, getSkillDetail } from '../controllers/skillController.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getAllSkills);
router.get('/my', authenticateUser, getMySkills);
router.get('/:id', authenticateUser, getSkillDetail);

export default router;
