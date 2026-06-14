import api from './api';

export interface ReportTarget {
  user_id: string;
  title?: string;
  body?: string;
  user?: {
    username: string;
    is_banned: boolean;
  };
}

export interface Report {
  id: string;
  target_type: 'post' | 'comment';
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  target?: ReportTarget;
  reporter?: {
    username: string;
  };
}

export interface ModerationLog {
  id: number;
  action_type: string;
  created_at: string;
  reason: string;
  moderator?: {
    username: string;
  };
  target_user?: {
    username: string;
  };
  target_user_id?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page?: number;
  last_page?: number;
  total?: number;
}

interface ModerationActionResponse {
  message: string;
}

const moderationService = {
  getReports: async (status: string = 'pending'): Promise<PaginatedResponse<Report>> => {
    const response = await api.get('/moderation/reports', { params: { status } });
    return response.data;
  },

  resolveReport: async (reportId: string, status: 'resolved' | 'dismissed'): Promise<ModerationActionResponse> => {
    const response = await api.post(`/moderation/reports/${reportId}/resolve`, { status });
    return response.data;
  },

  banUser: async (userId: string, reason: string, notes?: string): Promise<ModerationActionResponse> => {
    const response = await api.post('/moderation/ban', { user_id: userId, reason, notes });
    return response.data;
  },

  unbanUser: async (userId: string, reason: string): Promise<ModerationActionResponse> => {
    const response = await api.post('/moderation/unban', { user_id: userId, reason });
    return response.data;
  },

  warnUser: async (userId: string, reason: string, notes?: string): Promise<ModerationActionResponse> => {
    const response = await api.post('/moderation/warn', { user_id: userId, reason, notes });
    return response.data;
  },

  getLogs: async (): Promise<ModerationLog[]> => {
    const response = await api.get('/moderation/logs');
    // Normalize: handle both paginated { data: [...] } and plain array responses
    const payload = response.data;
    return Array.isArray(payload) ? payload : (payload.data ?? []);
  }
};

export default moderationService;
