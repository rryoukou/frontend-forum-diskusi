export interface Role {
  id: string;
  name: string;
  permissions?: any;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  reputation_points: number;
  level: number;
  is_banned: boolean;
  created_at: string;
  updated_at: string;
  roles?: Role[];
  badges?: any[];
  posts_count?: number;
  followers_count?: number;
  following_count?: number;
  is_following?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  created_at: string;
  children?: Category[];
  posts_count?: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Post {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  body: string;
  status: 'open' | 'closed' | 'deleted';
  view_count: number;
  vote_score: number;
  is_answered: boolean;
  accepted_answer_id: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
  category?: Category;
  tags?: Tag[];
  comments_count?: number;
  likes_count?: number;
  bookmarks_count?: number;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  body: string;
  vote_score: number;
  likes_count?: number;
  is_accepted: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
  children?: Comment[];
  replies?: Comment[]; // For consistency if both are used
}

export interface AuthResponse {
  user: User;
  token: string;
}
