import api from './api';
import type { Category } from '../types/index';

const categoryService = {
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data;
  },

  createCategory: async (data: { name: string; slug: string; description?: string; parent_id?: string }): Promise<Category> => {
    const response = await api.post('/admin/categories', data);
    return response.data;
  },

  updateCategory: async (id: string, data: { name?: string; slug?: string; description?: string; parent_id?: string }): Promise<Category> => {
    const response = await api.put(`/admin/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/admin/categories/${id}`);
  }
};

export default categoryService;
