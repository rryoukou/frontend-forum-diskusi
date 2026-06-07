import api from './api';
import type { Tag } from '../types/index';

const tagService = {
  getTags: async (): Promise<Tag[]> => {
    const response = await api.get('/tags');
    return response.data;
  }
};

export default tagService;
