import api from './api';
import type { Bookmark } from '../types';

interface BookmarkResponse {
  data: Bookmark[];
  current_page?: number;
  last_page?: number;
  total?: number;
}

const bookmarkService = {
  getMyBookmarks: async (page: number = 1): Promise<BookmarkResponse> => {
    const response = await api.get('/bookmarks', { params: { page } });
    return response.data;
  }
};

export default bookmarkService;
