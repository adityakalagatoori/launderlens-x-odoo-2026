import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authAPI = {
  requestOTP: (phone: string) => api.post('/auth/otp/request', { phone }),
  verifyOTP: (phone: string, code: string) => api.post('/auth/otp/verify', { phone, code }),
  requestMagicLink: (email: string) => api.post('/auth/magic-link', { email }),
};

export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data: any) => api.put('/user/profile', data),
};
