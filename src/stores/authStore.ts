import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import api from '../lib/axios';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
}

// Initialize the store with values from localStorage
const getInitialState = () => {
  const token = localStorage.getItem('token');
  let user = null;
  let isAdmin = false;

  if (token) {
    try {
      user = jwtDecode<User>(token);
      isAdmin = user?.role === 'admin';
    } catch (error) {
      localStorage.removeItem('token');
    }
  }

  return {
    token,
    user,
    isAuthenticated: !!token && !!user,
    isAdmin
  };
};

export const useAuth = create<AuthState>((set) => ({
  ...getInitialState(),

  login: async (email: string, password: string) => {
    try {
      const { data } = await api.post<{ token: string }>('/api/auth/login', { 
        email, 
        password 
      });
      
      const user = jwtDecode<User>(data.token);
      localStorage.setItem('token', data.token);
      
      set({ 
        token: data.token, 
        user, 
        isAuthenticated: true,
        isAdmin: user.role === 'admin'
      });
    } catch (error) {
      localStorage.removeItem('token');
      set({ token: null, user: null, isAuthenticated: false, isAdmin: false });
      throw new Error('Login failed');
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null, isAuthenticated: false, isAdmin: false });
  },

  register: async (email: string, password: string, name: string) => {
    try {
      const { data } = await api.post<{ token: string }>('/api/auth/register', {
        email,
        password,
        name
      });
      
      const user = jwtDecode<User>(data.token);
      localStorage.setItem('token', data.token);
      
      set({ 
        token: data.token, 
        user, 
        isAuthenticated: true,
        isAdmin: user.role === 'admin'
      });
    } catch (error) {
      localStorage.removeItem('token');
      set({ token: null, user: null, isAuthenticated: false, isAdmin: false });
      throw error;
    }
  }
}));