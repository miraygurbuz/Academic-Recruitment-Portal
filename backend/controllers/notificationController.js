import Notification from '../models/notificationModel.js';
import asyncHandler from 'express-async-handler';

// @route   GET /api/notifications
// @access  Private
const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort('-createdAt')
    .limit(20);
  
  res.json(notifications);
});

// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    res.status(404);
    throw new Error('Bildirim bulunamadı');
  }
  
  if (notification.recipient.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Bu bildirimi işleme yetkiniz yok');
  }
  
  notification.isRead = true;
  await notification.save();
  
  res.json({ message: 'Bildirim okundu olarak işaretlendi' });
});

// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true }
  );
  
  res.json({ message: 'Tüm bildirimler okundu olarak işaretlendi' });
});

// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({ 
    recipient: req.user._id,
    isRead: false 
  });
  
  res.json({ count });
});

export { getMyNotifications, markAsRead, markAllAsRead, getUnreadCount };