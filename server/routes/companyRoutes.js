import express from 'express';
import { getAllCompanies, getCompanyPreparationDetails } from '../controllers/companyController.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateUser, getAllCompanies);
router.get('/:id', authenticateUser, getCompanyPreparationDetails);

export default router;
