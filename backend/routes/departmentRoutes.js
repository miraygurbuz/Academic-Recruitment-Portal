import express from 'express';
import { 
  getAllDepartments,
  getDepartmentById,
  getDepartmentsByFaculty,
  createDepartment,
  updateDepartment,
  deleteDepartment
} from '../controllers/departmentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllDepartments);
router.get('/:id', getDepartmentById);
router.get('/faculty/:facultyId', getDepartmentsByFaculty);
router.post('/', protect, admin, createDepartment);
router.put('/:id', protect, admin, updateDepartment);
router.delete('/:id', protect, admin, deleteDepartment);

export default router;