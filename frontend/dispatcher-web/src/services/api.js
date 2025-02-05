import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
    },
});

// Interceptor do dodawania tokenu do każdego żądania
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // Zmień headers tylko dla endpointów innych niż /token
        if (!config.url.endsWith('/token')) {
            config.headers['Content-Type'] = 'application/json';
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor do obsługi błędów autoryzacji
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Funkcje API dla autoryzacji
export const login = async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await api.post('/token', formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });
    return response.data;
};

// Funkcje API dla zespołów
export const getTeams = async () => {
    const response = await api.get('/api/teams');
    return response.data;
};

export const createTeam = async (teamData) => {
    const response = await api.post('/api/teams', teamData);
    return response.data;
};

export const updateTeam = async (teamId, teamData) => {
    const response = await api.put(`/api/teams/${teamId}`, teamData);
    return response.data;
};

export const deleteTeam = async (teamId) => {
    const response = await api.delete(`/api/teams/${teamId}`);
    return response.data;
};

// Funkcje API dla zgłoszeń
export const deleteDispatch = async (dispatchId) => {
    const response = await api.delete(`/api/dispatches/${dispatchId}`);
    return response.data;
};

export const getDispatches = async () => {
    const response = await api.get('/api/dispatches');
    return response.data;
};

export const createDispatch = async (dispatchData) => {
    const response = await api.post('/api/dispatches', dispatchData);
    return response.data;
};

export const getDispatch = async (dispatchId) => {
    const response = await api.get(`/api/dispatches/${dispatchId}`);
    return response.data;
};

export const getMedicalForm = async (dispatchId) => {
    const response = await api.get(`/api/dispatches/${dispatchId}/medical-form`);
    return response.data;
};

export default api;