import mongoose from 'mongoose';

const notificationSchema = mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['application', 'evaluation', 'status', 'system'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'refModel'
  },
  refModel: {
    type: String,
    enum: ['Application', 'Job', 'User']
  },
  isRead: {
    type: Boolean,
    default: false
  },
  url: String,
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;