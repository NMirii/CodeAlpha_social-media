import { create } from 'zustand';
import { User } from '@/types';
import { authApi } from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: { username: string; email: string; password: string; password2: string }) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,

  login: async (username, password) => {
    set({ isLoading: true });
    try {
      const res = await authApi.login({ username, password });
      const { token, user } = res.data;
      localStorage.setItem('auth_token', token);
      set({ user, token, isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const res = await authApi.register(data);
      const { token, user } = res.data;
      localStorage.setItem('auth_token', token);
      set({ user, token, isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {}
    localStorage.removeItem('auth_token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadUser: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    set({ isLoading: true });
    try {
      const res = await authApi.me();
      set({ user: res.data, token, isAuthenticated: true });
    } catch {
      localStorage.removeItem('auth_token');
    } finally {
      set({ isLoading: false });
    }
  },

  updateUser: (user) => set({ user }),
}));
