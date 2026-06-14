import api from './api';

const bookmarkService = {
  getMyBookmarks: async (page: number = 1): Promise<any> => {
    const response = await api.get('/bookmarks', { params: { page } });
    return response.data;
  }
};

export default bookmarkService;
