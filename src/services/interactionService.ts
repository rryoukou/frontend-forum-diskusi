import api from './api';

const interactionService = {
  vote: async (targetId: string, targetType: 'post' | 'comment', voteType: 'upvote' | 'downvote') => {
    const response = await api.post('/vote', {
      target_id: targetId,
      target_type: targetType,
      vote_type: voteType
    });
    return response.data;
  },

  toggleLike: async (targetId: string, targetType: 'post' | 'comment') => {
    const response = await api.post('/like', {
      target_id: targetId,
      target_type: targetType
    });
    return response.data;
  },

  toggleBookmark: async (postId: string) => {
    const response = await api.post('/bookmarks', {
      post_id: postId
    });
    return response.data;
  }
};

export default interactionService;
