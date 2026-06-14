import api from './api';

const moderationService = {
  getReports: async (status: string = 'pending'): Promise<any> => {
    const response = await api.get('/moderation/reports', { params: { status } });
    return response.data;
  },

  resolveReport: async (reportId: string, status: 'resolved' | 'dismissed'): Promise<any> => {
    const response = await api.post(`/moderation/reports/${reportId}/resolve`, { status });
    return response.data;
  },

  banUser: async (userId: string, reason: string, notes?: string): Promise<any> => {
    const response = await api.post('/moderation/ban', { user_id: userId, reason, notes });
    return response.data;
  },

  unbanUser: async (userId: string, reason: string): Promise<any> => {
    const response = await api.post('/moderation/unban', { user_id: userId, reason });
    return response.data;
  },

  warnUser: async (userId: string, reason: string, notes?: string): Promise<any> => {
    const response = await api.post('/moderation/warn', { user_id: userId, reason, notes });
    return response.data;
  },

  getLogs: async (): Promise<any> => {
    const response = await api.get('/moderation/logs');
    return response.data;
  }
};

export default moderationService;
