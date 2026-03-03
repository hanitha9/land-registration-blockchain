const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const notificationController = require('../controllers/notificationController');

// Notification routes
router.get('/', protect, notificationController.getUserNotifications);
router.put('/:notificationId/read', protect, notificationController.markAsRead);
router.put('/read-all', protect, notificationController.markAllAsRead);
router.delete('/:notificationId', protect, notificationController.deleteNotification);
router.get('/unread-count', protect, notificationController.getUnreadCount);

module.exports = router;