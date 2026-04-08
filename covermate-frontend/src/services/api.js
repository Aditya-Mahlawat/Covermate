import axios from 'axios';

// ─── Create Axios Instance ───
// All API calls go through this instance so headers and
// token refresh are handled automatically.
const DEFAULT_API_URL = 'http://localhost:8001';
const rawApiUrl = import.meta.env.VITE_API_URL || DEFAULT_API_URL;

export const API_URL = rawApiUrl.replace(/\/+$/, '');

export function buildApiUrl(path = '') {
    if (!path) return API_URL;
    if (/^https?:\/\//i.test(path)) return path;
    return `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor ───
// Before every request, attach the access token if available.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ─── Response Interceptor ───
// If a request fails with 401, try to refresh the token automatically.
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Only try to refresh once (prevent infinite loop)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                try {
                    const res = await axios.post(buildApiUrl('/auth/refresh'), {
                        refresh_token: refreshToken,
                    });

                    const { access_token, refresh_token: newRefresh } = res.data;
                    localStorage.setItem('access_token', access_token);
                    localStorage.setItem('refresh_token', newRefresh);

                    // Retry the original request with the new token
                    originalRequest.headers.Authorization = `Bearer ${access_token}`;
                    return api(originalRequest);
                } catch {
                    // Refresh failed — clear tokens and redirect to login
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/login';
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;
