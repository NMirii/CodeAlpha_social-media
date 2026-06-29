import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
  }
  return config;
});

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { username: string; email: string; password: string; password2: string; first_name?: string; last_name?: string }) =>
    api.post('/auth/register/', data),
  login: (data: { username: string; password: string }) =>
    api.post('/auth/login/', data),
  logout: () => api.post('/auth/logout/'),
  me: () => api.get('/auth/me/'),
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const userApi = {
  getProfile: (username: string) => api.get(`/users/${username}/`),
  updateProfile: (username: string, data: FormData) =>
    api.patch(`/users/${username}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  follow: (username: string) => api.post(`/users/${username}/follow/`),
  unfollow: (username: string) => api.delete(`/users/${username}/follow/`),
  getFollowers: (username: string) => api.get(`/users/${username}/followers/`),
  getFollowing: (username: string) => api.get(`/users/${username}/following/`),
  getPosts: (username: string) => api.get(`/users/${username}/posts/`),
  search: (q: string) => api.get(`/users/search/?q=${encodeURIComponent(q)}`),
};

// ─── Posts ────────────────────────────────────────────────────────────────────
export const postApi = {
  getFeed: (page = 1) => api.get(`/feed/?page=${page}`),
  getAll: (page = 1) => api.get(`/posts/?page=${page}`),
  getOne: (id: number) => api.get(`/posts/${id}/`),
  create: (data: FormData) =>
    api.post('/posts/create/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: number, data: { content: string }) => api.patch(`/posts/${id}/`, data),
  delete: (id: number) => api.delete(`/posts/${id}/`),
  like: (id: number) => api.post(`/posts/${id}/like/`),
  unlike: (id: number) => api.delete(`/posts/${id}/like/`),
  getComments: (id: number) => api.get(`/posts/${id}/comments/`),
  addComment: (id: number, content: string, parent?: number) =>
    api.post(`/posts/${id}/comments/`, { content, parent }),
};

// ─── Comments ─────────────────────────────────────────────────────────────────
export const commentApi = {
  delete: (id: number) => api.delete(`/comments/${id}/`),
  like: (id: number) => api.post(`/comments/${id}/like/`),
  unlike: (id: number) => api.delete(`/comments/${id}/like/`),
};
