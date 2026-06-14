import api from './api';
import type { Notification } from '../types';

interface NotificationResponse {
  data: Notification[];
  current_page?: number;
  last_page?: number;
  total?: number;
}

const notificationService = {
  getNotifications: async (page: number = 1): Promise<NotificationResponse> => {
    const response = await api.get('/notifications', { params: { page } });
    return response.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await api.get('/notifications/unread-count');
    return response.data.unread_count;
  },

  markAsRead: async (id: string): Promise<void> => {
    await api.post(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.post('/notifications/read-all');
  },

  deleteNotification: async (id: string): Promise<void> => {
    await api.delete(`/notifications/${id}`);
  }
};

export default notificationService;
