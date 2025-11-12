import axios from 'axios';
import { tokenService } from './auth';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add Authorization header
api.interceptors.request.use(
  (config) => {
    const token = tokenService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    const status = error.response?.status;
    
    // Handle 401 Unauthorized - token expired or invalid
    if (status === 401) {
      // Clear token and user data
      tokenService.removeToken();
      // Dispatch custom event to trigger logout in AuthContext
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
    
    return Promise.reject({ message, status });
  }
);

// Project API
export const projectAPI = {
  getProjects: async (includeInactive = false) => {
    const params = includeInactive ? { includeInactive: 'true' } : {};
    const response = await api.get('/api/project/getProjects', { params });
    return response.data;
  },

  getProject: async (id) => {
    const response = await api.get(`/api/project/${id}`);
    return response.data;
  },

  createProject: async (data) => {
    const response = await api.post('/api/project/create', data);
    return response.data;
  },

  updateProject: async (id, data) => {
    const response = await api.put(`/api/project/${id}`, data);
    return response.data;
  },

  deleteProject: async (id) => {
    const response = await api.delete(`/api/project/${id}`);
    return response.data;
  },
};

// Prompt API
export const promptAPI = {
  getPrompts: async (projectId) => {
    const response = await api.get(`/api/projects/${projectId}/prompts`);
    return response.data;
  },

  getPrompt: async (id) => {
    const response = await api.get(`/api/prompt/${id}`);
    return response.data;
  },

  createPrompt: async (projectId, data) => {
    const response = await api.post(`/api/projects/${projectId}/prompt/create`, data);
    return response.data;
  },

  updatePrompt: async (id, data) => {
    const response = await api.put(`/api/prompt/${id}`, data);
    return response.data;
  },

  deletePrompt: async (id) => {
    const response = await api.delete(`/api/prompt/${id}`);
    return response.data;
  },
};

// Prompt Version API
export const promptVersionAPI = {
  getVersions: async (promptId) => {
    const response = await api.get(`/api/prompts/${promptId}/versions`);
    return response.data;
  },

  getActiveVersion: async (promptId) => {
    const response = await api.get(`/api/prompts/${promptId}/active`);
    return response.data;
  },

  getVersion: async (id) => {
    const response = await api.get(`/api/prompt-versions/${id}`);
    return response.data;
  },

  createVersion: async (promptId, data) => {
    const response = await api.post(`/api/prompts/${promptId}/version/create`, data);
    return response.data;
  },

  updateVersion: async (id, data) => {
    const response = await api.put(`/api/prompt-versions/${id}`, data);
    return response.data;
  },

  deleteVersion: async (id) => {
    const response = await api.delete(`/api/prompt-versions/${id}`);
    return response.data;
  },
};

export default api;

