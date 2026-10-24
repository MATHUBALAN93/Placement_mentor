import express from 'express';
import {
    getAdminDashboardStats,
    getAllUsersAdmin,
    createProblemAdmin,
    updateProblemAdmin,
    deleteProblemAdmin
} from '../controllers/adminController.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.use(authenticateUser);
router.use(authorizeRoles('ADMIN'));

router.get('/dashboard', getAdminDashboardStats);
router.get('/users', getAllUsersAdmin);
router.post('/problems', createProblemAdmin);
router.route('/problems/:id')
    .put(updateProblemAdmin)
    .delete(deleteProblemAdmin);

export default router;
