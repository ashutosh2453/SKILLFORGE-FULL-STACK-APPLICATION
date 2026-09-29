import { create } from 'zustand';
import { User } from '../types';
import { api } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  theme: 'dark' | 'light';
  login: (identifier: string, password: string) => Promise<void>;
  register: (payload: { email: string; username: string; password: string; full_name?: string }) => Promise<void>;
  demoLogin: (role: 'student' | 'mentor' | 'admin') => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  toggleTheme: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('skillforge_token'),
  isAuthenticated: !!localStorage.getItem('skillforge_token'),
  isLoading: true,
  theme: (localStorage.getItem('skillforge_theme') as 'dark' | 'light') || 'dark',

  login: async (identifier, password) => {
    set({ isLoading: true });
    try {
      const res = await api.login({ identifier, password });
      localStorage.setItem('skillforge_token', res.token);
      set({ user: res.user, token: res.token, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (payload) => {
    set({ isLoading: true });
    try {
      const res = await api.register(payload);
      localStorage.setItem('skillforge_token', res.token);
      set({ user: res.user, token: res.token, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  demoLogin: async (role) => {
    set({ isLoading: true });
    try {
      const res = await api.demoLogin(role);
      localStorage.setItem('skillforge_token', res.token);
      set({ user: res.user, token: res.token, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('skillforge_token');
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  fetchUser: async () => {
    const token = localStorage.getItem('skillforge_token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false, user: null });
      return;
    }

    try {
      const res = await api.getMe();
      set({ user: res.user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      console.warn('Session expired or invalid token');
      localStorage.removeItem('skillforge_token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('skillforge_theme', nextTheme);
    if (nextTheme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
    set({ theme: nextTheme });
  },

  setUser: (user) => set({ user })
}));
