import axios from 'axios'; 

import type { 
    AxiosInstance, 
    AxiosResponse, 
    AxiosError,
} from 'axios'; 

const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:3000/funis', 
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response: AxiosResponse) => response, 
  (error: AxiosError) => {
    console.error('Erro na API:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
