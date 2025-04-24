import express from 'express';
import {
    createApplication,
    getMyApplications,
    getAllApplications,
    getApplicationById,
    calculateApplicationPoints,
    checkApplicationCriteria,
    getJobApplications,
    getPendingApplicationCount,
    deleteApplication,
    updateApplication
} from '../controllers/applicationController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createApplication);
router.put('/:id', protect, updateApplication);
router.get('/my', protect, getMyApplications);
router.get('/applications', protect, admin, getAllApplications);
router.get('/:id', protect, getApplicationById);
router.get('/:id/calculate-points', protect, admin, calculateApplicationPoints);
router.get('/:id/check-criteria', protect, admin, checkApplicationCriteria);
router.get('/by-job/:jobId', protect, getJobApplications);
router.get('/pending/count', protect, admin, getPendingApplicationCount);

router.delete('/:id', protect, deleteApplication);

export default router;