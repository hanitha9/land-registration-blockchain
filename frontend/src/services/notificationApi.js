import api from './api';

export const notificationApi = {
  // Get user notifications
  getNotifications: () => api.get('/notifications'),
  
  // Mark notification as read
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  
  // Mark all notifications as read
  markAllAsRead: () => api.put('/notifications/read-all'),
  
  // Delete notification
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),
  
  // Get unread notifications count
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

export default notificationApi;