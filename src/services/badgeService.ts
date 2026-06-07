import api from './api';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url: string | null;
  requirement_type: string;
  requirement_value: number;
}

export interface ReputationLog {
  id: string;
  points: number;
  action_type: string;
  description: string | null;
  created_at: string;
}

const badgeService = {
  getAllBadges: async (): Promise<Badge[]> => {
    const response = await api.get('/badges');
    return response.data;
  },

  getMyBadges: async (): Promise<Badge[]> => {
    const response = await api.get('/my-badges');
    return response.data;
  },

  getReputationHistory: async (): Promise<ReputationLog[]> => {
    const response = await api.get('/reputation-history');
    return response.data;
  }
};

export default badgeService;
