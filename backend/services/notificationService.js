import Notification from '../models/notificationModel.js';

export const createNotification = async (data) => {
  try {
    const notification = new Notification({
      recipient: data.recipientId,
      type: data.type,
      title: data.title,
      message: data.message,
      relatedId: data.relatedId,
      refModel: data.refModel,
      url: data.url,
      isRead: false
    });
    
    await notification.save();
    return notification;
  } catch (error) {
  }
};

export const notifyMultipleUsers = async (recipientIds, notificationData) => {
  try {
    const notifications = [];
    
    for (const recipientId of recipientIds) {
      notifications.push({
        recipient: recipientId,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        relatedId: notificationData.relatedId,
        refModel: notificationData.refModel,
        url: notificationData.url,
        isRead: false
      });
    }
    
    const result = await Notification.insertMany(notifications);
    return result;
  } catch (error) {
    console.error('Toplu bildirim oluşturma hatası:', error);
    throw error;
  }
};
