export interface Permission {
  id: string;
  name: string;
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  permissions?: Permission[];
}

export interface Badge {
  id: string;
  name: string;
  description?: string;
  icon_url?: string;
  created_at?: string;
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
  ban_reason?: string;
  created_at: string;
  updated_at: string;
  roles?: Role[];
  badges?: Badge[];
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

// Auth & Form Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface UpdateProfileData {
  username?: string;
  email?: string;
  bio?: string;
  avatar?: File | null;
}

export interface CreatePostData {
  title: string;
  body: string;
  category_id: string;
  tags: string[];
}

export interface UpdatePostData {
  title?: string;
  body?: string;
  category_id?: string;
  tags?: string[];
}

export interface CreateCommentData {
  post_id: string;
  body: string;
  parent_id?: string | null;
}

export interface UpdateCommentData {
  body: string;
}

// History Types
export interface EditHistory {
  id: string;
  edited_at: string;
  created_at: string;
  edited_by: string;
  editor?: {
    username: string;
    avatar_url?: string;
  };
  changes: string;
  reason?: string;
  old_content?: string;
  new_content?: string;
  title_before?: string;
  title_after?: string;
  body_before?: string;
  body_after?: string;
  body?: string;
}

// Notification Types
export interface Notification {
  id: string;
  type: string;
  data: string;
  read_at: string | null;
  created_at: string;
  actor?: User;
  post?: Post;
  comment?: Comment;
}

// Admin Form Types
export interface RoleFormValues {
  id?: string;
  name: string;
  permissions?: string[];
}

export interface CategoryFormValues {
  id?: string;
  name: string;
  slug?: string;
  description?: string;
  parent_id?: string | null;
}

// Bookmark Type
export interface Bookmark {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
  post?: Post;
}
