import express from 'express';
import {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    changePassword
} from '../controllers/authController.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.route('/profile')
    .get(authenticateUser, getUserProfile)
    .put(authenticateUser, updateUserProfile);
router.put('/change-password', authenticateUser, changePassword);

export default router;
