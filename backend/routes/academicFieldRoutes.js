import express from 'express';
import { 
  getAllAcademicFields, 
  getAcademicFieldById, 
  createAcademicField,
  updateAcademicField,
  deleteAcademicField
} from '../controllers/academicFieldController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllAcademicFields);
router.get('/:id', getAcademicFieldById);
router.post('/', protect, admin, createAcademicField);
router.put('/:id', protect, admin, updateAcademicField);
router.delete('/:id', protect, admin, deleteAcademicField);

export default router;