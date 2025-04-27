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
  updateApplication,
  getJuryJobApplications,
  getApplicationByIdForJury,
  evaluateApplication,
  updateEvaluation,
} from '../controllers/applicationController.js';
import { protect, admin, jury } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import { downloadFile } from '../middleware/downloadMiddleware.js';

const router = express.Router();

router.get('/download', protect, downloadFile);

router.post('/', protect, upload.array('documents', 10), createApplication);
router.put('/:id', protect, upload.array('documents', 10), updateApplication);
router.get('/my', protect, getMyApplications);
router.get('/applications', protect, admin, getAllApplications);
router.get('/:id', protect, getApplicationById);
router.get('/:id/calculate-points', protect, admin, calculateApplicationPoints);
router.get('/:id/check-criteria', protect, admin, checkApplicationCriteria);
router.get('/by-job/:jobId', protect, getJobApplications);
router.get('/pending/count', protect, admin, getPendingApplicationCount);

router.delete('/:id', protect, deleteApplication);
router.get('/jury/job/:jobId', protect, jury, getJuryJobApplications);
router.get('/jury/:applicationId', protect, jury, getApplicationByIdForJury);
router.post('/jury/:applicationId/evaluate', protect, jury, upload.single('evaluationFile'), evaluateApplication);
router.put('/jury/:applicationId/evaluate', protect, jury, upload.single('evaluationFile'), updateEvaluation);

export default router;