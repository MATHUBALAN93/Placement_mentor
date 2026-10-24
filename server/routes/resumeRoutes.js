import express from 'express';
import multer from 'multer';
import os from 'os';
import {
    uploadAndAnalyzeResume,
    getUserResumes,
    getResumeDetail
} from '../controllers/resumeController.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Configure local OS-dependent safe folder for file uploads
const upload = multer({
    dest: os.tmpdir(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB file size limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF format resumes are allowed'), false);
        }
    }
});

router.post('/upload', authenticateUser, upload.single('resume'), uploadAndAnalyzeResume);
router.get('/', authenticateUser, getUserResumes);
router.get('/:id', authenticateUser, getResumeDetail);

export default router;
