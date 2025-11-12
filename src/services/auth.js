import axios from 'axios';
import { API_BASE_URL } from './api';

const AUTH_TOKEN_KEY = 'ameeba_auth_token';
const AUTH_USER_KEY = 'ameeba_auth_user';

// Auth API endpoints
export const authAPI = {
  signup: async (data) => {
    const response = await axios.post(`${API_BASE_URL}/api/auth/signup`, data);
    return response.data;
  },

  login: async (data) => {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, data);
    return response.data;
  },

  getUserDetails: async (token) => {
    const response = await axios.get(`${API_BASE_URL}/api/auth/getUserDetails`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },
};

// Token management
export const tokenService = {
  getToken: () => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  setToken: (token) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  },

  removeToken: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  },

  isAuthenticated: () => {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  },
};

// User management
export const userService = {
  getUser: () => {
    const userStr = localStorage.getItem(AUTH_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  setUser: (user) => {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  },

  removeUser: () => {
    localStorage.removeItem(AUTH_USER_KEY);
  },
};

export default { authAPI, tokenService, userService };

