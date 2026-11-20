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

// 2. Service Request & AI Endpoints (ready for Dashboard next)
export const createServiceRequest = (requestData) => API.post('/requests/create', requestData);
export const getCustomerRequests = (phone) => API.get(`/requests/customer/${phone}`);
export const getAiRecommendation = (problemDescription) => API.post('/requests/ai-recommend', { problemDescription });

export default API;