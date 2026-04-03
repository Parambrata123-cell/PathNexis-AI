import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
    ? 'http://localhost:5000/api' 
    : '/api');
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('pathnexis_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('pathnexis_token');
      localStorage.removeItem('pathnexis_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Resume
export const resumeAPI = {
  analyze: (formData) => api.post('/resume/analyze', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  analyzeText: (data) => api.post('/resume/analyze', data),
  getHistory: () => api.get('/resume/history'),
  getById: (id) => api.get(`/resume/${id}`),
};

// Alumni
export const alumniAPI = {
  getAll: (params) => api.get('/alumni', { params }),
  getById: (id) => api.get(`/alumni/${id}`),
  requestMentorship: (data) => api.post('/alumni/mentorship/request', data),
  getMentorships: () => api.get('/alumni/mentorship/sessions'),
  updateMentorship: (id, data) => api.put(`/alumni/mentorship/${id}`, data),
  connect: (id) => api.post(`/alumni/connect/${id}`),
};

// Referrals
export const referralAPI = {
  getAll: (params) => api.get('/referrals', { params }),
  getById: (id) => api.get(`/referrals/${id}`),
  create: (data) => api.post('/referrals', data),
  apply: (id, data) => api.post(`/referrals/${id}/apply`, data),
  getMyPosted: () => api.get('/referrals/my/posted'),
};

// Roadmap
export const roadmapAPI = {
  generate: (data) => api.post('/roadmap/generate', data),
  getAll: () => api.get('/roadmap'),
  getById: (id) => api.get(`/roadmap/${id}`),
  toggleTopic: (id, phaseIndex, topicIndex) => api.put(`/roadmap/${id}/topic/${phaseIndex}/${topicIndex}/complete`),
};

// Interview
export const interviewAPI = {
  getQuestion: (data) => api.post('/interview/question', data),
  evaluate: (data) => api.post('/interview/evaluate', data),
};

export default api;
