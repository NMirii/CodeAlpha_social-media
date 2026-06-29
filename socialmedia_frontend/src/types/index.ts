export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  bio: string;
  avatar: string | null;
  website: string;
  location: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
  is_following: boolean;
  date_joined: string;
}

export interface UserMini {
  id: number;
  username: string;
  avatar: string | null;
  first_name: string;
  last_name: string;
}

export interface Comment {
  id: number;
  author: UserMini;
  content: string;
  parent: number | null;
  likes_count: number;
  is_liked: boolean;
  replies: Comment[];
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: number;
  author: UserMini;
  content: string;
  image: string | null;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  comments: Comment[];
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
