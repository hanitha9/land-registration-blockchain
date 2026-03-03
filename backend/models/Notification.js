const mongoose = require('mongoose');
const crypto = require('crypto');

// Generate unique Notification ID
const generateNotificationId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `NOTIF_${timestamp}${random}`;
};

const notificationSchema = new mongoose.Schema({
  notificationId: {
    type: String,
    unique: true,
    default: generateNotificationId
  },
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error'],
    default: 'info'
  },
  
  isRead: {
    type: Boolean,
    default: false
  },
  
  relatedEntity: {
    type: String, // 'land', 'loan', 'transfer', etc.
    required: false
  },
  
  entityId: {
    type: String, // ID of the related entity
    required: false
  },
  
  actionUrl: String, // URL to navigate to when clicked
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', notificationSchema);