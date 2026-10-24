import express from 'express';
import {
    getMyNotifications,
    markNotificationRead,
    markAllRead
} from '../controllers/notificationController.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/', getMyNotifications);
router.put('/read-all', markAllRead);
router.put('/:id/read', markNotificationRead);

export default router;
