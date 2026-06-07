import api from './api';
import type { Comment } from '../types/index';

const commentService = {
  getCommentsByPostId: async (postId: string): Promise<Comment[]> => {
    const response = await api.get('/comments', { params: { post_id: postId } });
    return response.data.data || response.data; // Handle paginated response
  },

  createComment: async (commentData: any): Promise<Comment> => {
    const response = await api.post('/comments', commentData);
    return response.data.data || response.data; // Handle wrapped response
  },

  updateComment: async (id: string, commentData: any): Promise<Comment> => {
    const response = await api.put(`/comments/${id}`, commentData);
    return response.data;
  },

  acceptComment: async (id: string): Promise<any> => {
    const response = await api.post(`/comments/${id}/accept`);
    return response.data;
  },

  deleteComment: async (id: string, reason?: string): Promise<void> => {
    await api.delete(`/comments/${id}`, { params: { reason } });
  },

  getCommentHistory: async (id: string): Promise<any[]> => {
    const response = await api.get(`/comments/${id}/history`);
    return response.data;
  }
};

export default commentService;
