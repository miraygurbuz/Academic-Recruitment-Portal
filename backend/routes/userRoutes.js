import express from 'express';
const router = express.Router();
import {
    authUser,
    registerUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    getUserCount,
    getUsers,
    updateUserRole,
    getJuryMembersByDepartment
} from '../controllers/userController.js';

import { protect, admin } from '../middleware/authMiddleware.js';

router.post('/', registerUser);
router.get('/', getUsers);
router.put('/:id/role', updateUserRole);
router.post('/auth', authUser);
router.post('/logout', logoutUser);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.route('/count').get(protect, admin, getUserCount);
router.route('/jurymembers/department/:departmentId').get(protect, getJuryMembersByDepartment);

export default router;