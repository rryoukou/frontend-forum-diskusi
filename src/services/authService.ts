import api from './api';
import type { AuthResponse, User, LoginCredentials, RegisterData } from '../types/index';

const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/login', credentials);
    const { access_token } = response.data;
    
    if (access_token) {
      localStorage.setItem('token', access_token);
      
      // Always fetch fresh user with roles from /me
      try {
        const meResponse = await api.get('/me');
        const freshUser = meResponse.data;
        localStorage.setItem('user', JSON.stringify(freshUser));
        
        return {
          ...response.data,
          user: freshUser
        };
      } catch (error) {
        console.error('Failed to fetch user details after login', error);
        // Fallback to user from login response if /me fails
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      }
    }
    return response.data;
  },

  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/register', userData);
    const { access_token, data } = response.data;
    if (access_token) {
      localStorage.setItem('token', access_token);
      // For register, we might not have roles yet, but let's be consistent
      localStorage.setItem('user', JSON.stringify(data));
    }
    return response.data;
  },

  logout: async () => {
    await api.post('/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: (): User | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  hasRole: (roleName: string): boolean => {
    const user = authService.getCurrentUser();
    if (!user || !user.roles) return false;
    return user.roles.some(role => role.name === roleName);
  },

  isAdmin: (): boolean => {
    return authService.hasRole('admin');
  },

  isModerator: (): boolean => {
    return authService.hasRole('admin') || authService.hasRole('moderator');
  },

  isRegularUser: (): boolean => {
    const user = authService.getCurrentUser();
    if (!user) return false;
    // User is regular if they don't have admin or moderator roles
    return !authService.isAdmin() && !authService.isModerator();
  },

  me: async (): Promise<User> => {
    const response = await api.get('/me');
    return response.data;
  }
};

export default authService;
