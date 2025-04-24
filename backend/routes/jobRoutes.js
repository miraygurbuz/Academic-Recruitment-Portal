import express from 'express';
import { 
  getAllJobs,
  getJobById,
  getJobsByDepartment,
  getActiveJobs,
  createJob,
  updateJob,
  updateJobStatus,
  deleteJob,
  getActiveJobCount,
  getJobJuryMembers,
  assignJuryMembers,
  clearJuryMembers
} from '../controllers/jobController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllJobs);
router.get('/active', getActiveJobs);
router.route('/active/count').get(getActiveJobCount);
router.get('/:id', getJobById);
router.get('/department/:departmentId', getJobsByDepartment);
router.post('/', protect, admin, createJob);
router.put('/:id', protect, admin, updateJob);
router.patch('/:id/status', protect, admin, updateJobStatus);
router.delete('/:id', protect, admin, deleteJob);
router.delete('/:id/jurymembers', protect, admin, clearJuryMembers);
router.route('/:id/jurymembers').get(protect, admin, getJobJuryMembers).put(protect, admin, assignJuryMembers);

export default router;