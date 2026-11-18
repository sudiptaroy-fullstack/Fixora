import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:8081/api',
    headers: {
        'Content-Type': 'application/json',
    }
});

// 1. Auth Endpoints
export const sendOtp = (phoneNumber) => API.post(`/auth/send-otp?phoneNumber=${phoneNumber}`);
export const verifyOtp = (phoneNumber, otp) => API.post(`/auth/verify-otp?phoneNumber=${phoneNumber}&otp=${otp}`);

// 2. Service Request & AI Endpoints
export const createServiceRequest = (requestData) => API.post('/requests/create', requestData);
export const getAllRequests = () => API.get('/requests/list');
export const getCustomerRequests = (phone) => API.get(`/requests/customer/${phone}`);
export const updateRequestStatus = (id, status) => API.put(`/requests/${id}/status?status=${status}`);
export const getAiRecommendation = (problemDescription) => API.post('/requests/ai-recommend', { problemDescription });
export const getAdminStats = () => API.get('/requests/admin/stats');

// 3. Service Provider Endpoints
export const getAllProviders = () => API.get('/providers/list');

// 4. Payment Endpoints
export const createPaymentOrder = (orderData) => API.post('/payment/create-order', orderData);
export const verifyPaymentOrder = (paymentData) => API.post('/payment/verify', paymentData);

export default API;