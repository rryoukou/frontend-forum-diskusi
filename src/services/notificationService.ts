import api from './api';

const notificationService = {
  getNotifications: async (page: number = 1): Promise<any> => {
    const response = await api.get('/notifications', { params: { page } });
    return response.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await api.get('/notifications/unread-count');
    return response.data.unread_count;
  },

  markAsRead: async (id: string): Promise<any> => {
    const response = await api.post(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<any> => {
    const response = await api.post('/notifications/read-all');
    return response.data;
  },

  deleteNotification: async (id: string): Promise<any> => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  }
};

export default notificationService;
