import api from './api';
import type { Post } from '../types/index';

const postService = {
  getAllPosts: async (params?: any): Promise<Post[]> => {
    const response = await api.get('/posts', { params });
    return response.data.data || response.data; // Handle both paginated and non-paginated
  },

  getTrendingPosts: async (): Promise<Post[]> => {
    const response = await api.get('/posts/trending');
    return response.data;
  },

  getPostById: async (id: string): Promise<Post> => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  createPost: async (postData: any): Promise<Post> => {
    const response = await api.post('/posts', postData);
    return response.data;
  },

  updatePost: async (id: string, postData: any): Promise<Post> => {
    const response = await api.put(`/posts/${id}`, postData);
    return response.data;
  },

  deletePost: async (id: string): Promise<void> => {
    await api.delete(`/posts/${id}`);
  },

  getPostHistory: async (id: string): Promise<any[]> => {
    const response = await api.get(`/posts/${id}/history`);
    return response.data;
  }
};

export default postService;
