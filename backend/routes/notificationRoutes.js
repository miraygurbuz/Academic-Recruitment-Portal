import express from 'express';
import { 
  getMyNotifications, 
  markAsRead, 
  markAllAsRead,
  getUnreadCount
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getMyNotifications);
router.put('/:id/read', protect, markAsRead);
router.put('/read-all', protect, markAllAsRead);
router.get('/unread-count', protect, getUnreadCount);

export default router;