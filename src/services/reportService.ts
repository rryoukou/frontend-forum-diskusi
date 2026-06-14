import api from './api';

export type ReportType = 'post' | 'comment' | 'user';

const reportService = {
  submitReport: async (targetId: string, targetType: ReportType, reason: string, description?: string) => {
    const response = await api.post('/reports', {
      target_id: targetId,
      target_type: targetType,
      reason,
      description
    });
    return response.data;
  }
};

export default reportService;
