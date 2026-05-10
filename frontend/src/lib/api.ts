import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000, // 10s timeout - prevents hanging requests
});

// Auto-retry on network error once
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      console.warn('[Traveloop] Request timed out:', err.config?.url);
    }
    return Promise.reject(err);
  }
);

// Attach token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    try {
      const stored = JSON.parse(localStorage.getItem('traveloop-auth') || '{}');
      const token = stored?.state?.accessToken;
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {}
  }
  return config;
});

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data: any) => api.patch('/auth/me', data),
  requestMagicLink: (email: string) => api.post('/auth/magic-link', { email }),
  requestOTP: (phone: string) => api.post('/auth/otp/request', { phone }),
  verifyOTP: (phone: string, code: string) => api.post('/auth/otp/verify', { phone, code }),
};

export const tripsAPI = {
  getTrips: () => api.get('/trips'),
  createTrip: (data: any) => api.post('/trips', data),
  getTrip: (id: string) => api.get(`/trips/${id}`),
  updateTrip: (id: string, data: any) => api.patch(`/trips/${id}`, data),
  deleteTrip: (id: string) => api.delete(`/trips/${id}`),
  // Itinerary
  addStop: (tripId: string, data: any) => api.post(`/trips/${tripId}/stops`, data),
  removeStop: (tripId: string, stopId: string) => api.delete(`/trips/${tripId}/stops/${stopId}`),
  addActivityToStop: (tripId: string, stopId: string, data: any) => api.post(`/trips/${tripId}/stops/${stopId}/activities`, data),
  removeActivityFromStop: (tripId: string, stopId: string, actId: string) => api.delete(`/trips/${tripId}/stops/${stopId}/activities/${actId}`),
  // Budget
  getBudget: (tripId: string) => api.get(`/trips/${tripId}/budget`),
  updateBudget: (tripId: string, data: any) => api.patch(`/trips/${tripId}/budget`, data),
  getExpenses: (tripId: string) => api.get(`/trips/${tripId}/expenses`),
  addExpense: (tripId: string, data: any) => api.post(`/trips/${tripId}/expenses`, data),
  deleteExpense: (tripId: string, expId: string) => api.delete(`/trips/${tripId}/expenses/${expId}`),
  // Packing
  getPackingLists: (tripId: string) => api.get(`/trips/${tripId}/packing`),
  createPackingList: (tripId: string, data: any) => api.post(`/trips/${tripId}/packing`, data),
  addPackingItem: (tripId: string, listId: string, data: any) => api.post(`/trips/${tripId}/packing/${listId}/items`, data),
  togglePackingItem: (tripId: string, listId: string, itemId: string, isPacked: boolean) => api.patch(`/trips/${tripId}/packing/${listId}/items/${itemId}`, { isPacked }),
  deletePackingItem: (tripId: string, listId: string, itemId: string) => api.delete(`/trips/${tripId}/packing/${listId}/items/${itemId}`),
  // Journal
  getJournal: (tripId: string) => api.get(`/trips/${tripId}/journal`),
  addNote: (tripId: string, data: any) => api.post(`/trips/${tripId}/journal`, data),
  deleteNote: (tripId: string, noteId: string) => api.delete(`/trips/${tripId}/journal/${noteId}`),
  // Carbon
  getCarbon: (tripId: string) => api.get(`/trips/${tripId}/carbon`),
  addCarbon: (tripId: string, data: any) => api.post(`/trips/${tripId}/carbon`, data),
  // Album
  getAlbum: (tripId: string) => api.get(`/trips/${tripId}/album`),
  addAlbumPhoto: (tripId: string, data: any) => api.post(`/trips/${tripId}/album`, data),
  deleteAlbumPhoto: (tripId: string, photoId: string) => api.delete(`/trips/${tripId}/album/${photoId}`),
  setAlbumCover: (tripId: string, photoId: string) => api.patch(`/trips/${tripId}/album/${photoId}/cover`),
};

export const citiesAPI = {
  search: (params?: any) => api.get('/cities', { params }),
  getCity: (id: string) => api.get(`/cities/${id}`),
  compare: (ids: string[]) => api.get(`/cities/compare?ids=${ids.join(',')}`),
  getSafety: (id: string) => api.get(`/cities/${id}/safety`),
  getReviews: (id: string) => api.get(`/cities/${id}/reviews`),
  addReview: (id: string, data: any) => api.post(`/cities/${id}/reviews`, data),
};

export const activitiesAPI = {
  search: (params?: any) => api.get('/activities', { params }),
  getActivity: (id: string) => api.get(`/activities/${id}`),
  getDetour: (cityId?: string, budget?: number) => api.get('/activities/detour-roulette', { params: { cityId, budget } }),
};

export const guidesAPI = {
  getAll: () => api.get('/guides'),
  getByCity: (cityId: string) => api.get(`/guides/city/${cityId}`),
  book: (data: any) => api.post('/guides/book', data),
  getBookings: (tripId: string) => api.get(`/guides/bookings/${tripId}`),
  login: (data: any) => api.post('/guides/login', data),
  register: (data: any) => api.post('/guides/register', data),
  getProfile: () => api.get('/guides/me'),
  updateProfile: (data: any) => api.patch('/guides/me', data),
  updateBookingStatus: (bookingId: string, status: string) => api.patch(`/guides/booking/${bookingId}/status`, { status }),
};

export const communityAPI = {
  getPosts: (type?: string) => api.get('/community', { params: { type } }),
  getPost: (id: string) => api.get(`/community/${id}`),
  createPost: (data: any) => api.post('/community', data),
  addComment: (postId: string, body: string) => api.post(`/community/${postId}/comments`, { body }),
  likePost: (postId: string) => api.patch(`/community/${postId}/like`),
  deletePost: (postId: string) => api.delete(`/community/${postId}`),
};

export const wishlistAPI = {
  getWishlist: () => api.get('/wishlist'),
  toggleCity: (cityId: string) => api.post(`/wishlist/city/${cityId}`),
  toggleActivity: (activityId: string) => api.post(`/wishlist/activity/${activityId}`),
  checkCity: (cityId: string) => api.get(`/wishlist/check/${cityId}`),
  removeCity: (cityId: string) => api.delete(`/wishlist/${cityId}`),
};

export const buddyAPI = {
  findMatches: (tripId: string) => api.get(`/buddy/match/${tripId}`),
  getPreferences: () => api.get('/buddy/preferences'),
  updatePreferences: (data: any) => api.patch('/buddy/preferences', data),
};

export const adminAPI = {
  login: (data: any) => api.post('/admin/login', data),
  getStats: (token: string) => api.get('/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
  getUsers: (token: string) => api.get('/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
  getTrips: (token: string) => api.get('/admin/trips', { headers: { Authorization: `Bearer ${token}` } }),
  getExpenses: (token: string) => api.get('/admin/expenses', { headers: { Authorization: `Bearer ${token}` } }),
  getGuides: (token: string) => api.get('/admin/guides', { headers: { Authorization: `Bearer ${token}` } }),
  deleteUser: (token: string, id: string) => api.delete(`/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
};

export default api;
