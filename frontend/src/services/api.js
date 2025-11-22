import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (username, password) =>
        api.post('/auth/login', { username, password }),
};

// Admin API
export const adminAPI = {
    createUser: (userData) =>
        api.post('/admin/users', userData),
    getUsers: () =>
        api.get('/admin/users'),
    getPendingDeposits: () =>
        api.get('/admin/deposits/pending'),
    approveDeposit: (depositId) =>
        api.post(`/admin/deposits/${depositId}/approve`),
    rejectDeposit: (depositId) =>
        api.post(`/admin/deposits/${depositId}/reject`),
    getAllDeposits: () =>
        api.get('/admin/deposits'),
};

// User API
export const userAPI = {
    getProfile: () =>
        api.get('/user/profile'),
    submitDeposit: (depositData) =>
        api.post('/user/deposit', depositData),
    getCurrentDeposit: () =>
        api.get('/user/deposit/current'),
    getBalance: () =>
        api.get('/user/balance'),
    withdraw: (withdrawType) =>
        api.post('/user/withdraw', { withdraw_type: withdrawType }),
    getTransactions: () =>
        api.get('/user/transactions'),
};

export default api;
