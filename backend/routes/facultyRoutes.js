import express from 'express';
import { 
  getAllFaculties,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  getFacultiesByAcademicField,
} from '../controllers/facultyController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllFaculties);
router.get('/:id', getFacultyById);
router.get('/academic-fields/:academicFieldId/faculties', protect, admin, getFacultiesByAcademicField);
router.post('/', protect, admin, createFaculty);
router.put('/:id', protect, admin, updateFaculty);
router.delete('/:id', protect, admin, deleteFaculty);

export default router;