import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000/';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});


api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;


        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Мітимо запит, щоб не зациклитись

            const refreshToken = localStorage.getItem('refresh_token');

            if (refreshToken) {
                try {

                    const response = await axios.post(`${BASE_URL}auth/token/refresh/`, {
                        refresh: refreshToken
                    });

                    if (response.status === 201 || response.status === 200) {

                        const newAccessToken = response.data.access;
                        localStorage.setItem('access_token', newAccessToken);


                        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                        return api(originalRequest);
                    }
                } catch (refreshError) {
                    console.error("Refresh token expired", refreshError);

                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/login';
                }
            } else {

                localStorage.removeItem('access_token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;