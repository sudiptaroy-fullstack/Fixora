import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8081/api'
});

export const registerUser = (payload) => API.post('/auth/register', payload);
export const sendOtp = (phone, role) => API.post(`/auth/send-otp?phone=${phone}&role=${role}`);
export const verifyOtp = (phone, otp) => API.post(`/auth/verify-otp?phone=${phone}&otp=${otp}`);

export const getAiRecommendation = (problemDescription) => API.post('/ai/recommend', { problemDescription });
export const getServicePackages = () => API.get('/catalog/packages');

export const createServiceRequest = (payload) => API.post('/requests', payload);
export const getCustomerRequests = (phone) => API.get(`/requests/customer/${phone}`);
export const getProviderRequests = (phone) => API.get(`/requests/provider/${phone}`);
export const getAllRequests = () => API.get('/requests');
export const respondToRequest = (id, action) => API.put(`/requests/${id}/respond?action=${action}`);

export const getUserProfile = (phone, role = 'CUSTOMER') => API.get(`/users/profile/${phone}?role=${role}`);
export const updateUserProfile = (phone, payload) => API.put(`/users/profile/${phone}`, payload);
export const getAllMarketplaceProviders = () => API.get('/users/providers');
export const withdrawWallet = (phone, amount) => API.post(`/users/wallet/${phone}/withdraw?amount=${amount}`);

export const getAllReviews = () => API.get('/reviews');
export const addReview = (payload) => API.post('/reviews', payload);
export const getAdminStats = () => API.get('/admin/stats');

export default API;