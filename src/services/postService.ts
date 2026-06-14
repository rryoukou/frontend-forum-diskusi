import api from './api';
import type { Post, CreatePostData, UpdatePostData, EditHistory } from '../types/index';

const postService = {
  getAllPosts: async (params?: Record<string, string | number | undefined>): Promise<Post[]> => {
    // Strip empty/undefined params so backend filters don't trigger on empty strings
    const cleanParams: Record<string, string | number> = {};
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          cleanParams[k] = v;
        }
      });
    }
    const response = await api.get('/posts', { params: Object.keys(cleanParams).length ? cleanParams : undefined });
    return response.data.data || response.data;
  },

  getTrendingPosts: async (): Promise<Post[]> => {
    const response = await api.get('/posts/trending');
    return response.data;
  },

  getPostById: async (id: string): Promise<Post> => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  createPost: async (postData: CreatePostData): Promise<Post> => {
    const response = await api.post('/posts', postData);
    return response.data;
  },

  updatePost: async (id: string, postData: UpdatePostData): Promise<Post> => {
    const response = await api.put(`/posts/${id}`, postData);
    return response.data;
  },

  deletePost: async (id: string, reason?: string): Promise<void> => {
    await api.delete(`/posts/${id}`, { params: { reason } });
  },

  getPostHistory: async (id: string): Promise<EditHistory[]> => {
    const response = await api.get(`/posts/${id}/history`);
    return response.data;
  }
};

export default postService;
