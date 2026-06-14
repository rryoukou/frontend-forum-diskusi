import api from './api';
import type { User, UpdateProfileData } from '../types/index';

interface AdminStats {
  totalUsers: number;
  adminUsers: number;
  moderatorUsers: number;
  reportCount: number;
}

interface AdminUsersResponse {
  data: User[];
  total: number;
}

const userService = {
  getAdminUsers: async (): Promise<AdminUsersResponse> => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  getAdminStats: async (): Promise<AdminStats> => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  updateUserRoles: async (userId: string, roles: string[]): Promise<User> => {
    const response = await api.post(`/admin/users/${userId}/roles`, { roles });
    return response.data;
  },

  getProfile: async (username: string): Promise<User> => {
    const response = await api.get(`/profiles/${username}`);
    return response.data;
  },

  updateProfile: async (profileData: UpdateProfileData): Promise<User> => {
    // If profileData contains a file, use FormData
    if (profileData.avatar instanceof File) {
      const formData = new FormData();
      formData.append('bio', profileData.bio || '');
      formData.append('avatar', profileData.avatar);
      // Workaround for Laravel's issues with PUT/PATCH and multipart/form-data
      formData.append('_method', 'PUT');
      
      // Delete the Content-Type so axios doesn't send 'application/json'
      // and the browser can set the correct 'multipart/form-data; boundary=...' automatically
      const response = await api.post('/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        transformRequest: [(data, headers) => {
          // Remove Content-Type so browser sets it with the correct boundary
          if (headers) {
            delete headers['Content-Type'];
          }
          return data;
        }],
      });
      return response.data;
    }

    const response = await api.put('/profile', profileData);
    return response.data;
  },

  getLeaderboard: async (): Promise<User[]> => {
    const response = await api.get('/leaderboard');
    return response.data;
  },

  getFollowers: async (username: string): Promise<User[]> => {
    const response = await api.get(`/profiles/${username}/followers`);
    return response.data.data || response.data;
  },

  getFollowing: async (username: string): Promise<User[]> => {
    const response = await api.get(`/profiles/${username}/following`);
    return response.data.data || response.data;
  },

  toggleFollow: async (userId: string): Promise<{ message: string }> => {
    const response = await api.post('/follow', { user_id: userId });
    return response.data;
  }
};

export default userService;
