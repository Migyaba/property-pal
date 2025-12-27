/**
 * Configuration de l'API Axios avec interceptors JWT
 * Gère automatiquement les tokens d'authentification et le refresh
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// URL de base de l'API Django
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Création de l'instance Axios
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types pour les tokens
interface TokenResponse {
  access: string;
  refresh: string;
}

// Stockage des tokens
const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const getAccessToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const getRefreshToken = (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY);

export const setTokens = (tokens: TokenResponse): void => {
  localStorage.setItem(TOKEN_KEY, tokens.access);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
};

export const clearTokens = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem('user');
};

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Variable pour éviter les appels multiples de refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null): void => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// Intercepteur pour gérer les erreurs 401 et rafraîchir le token
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Si erreur 401 et pas déjà une tentative de retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Si un refresh est déjà en cours, attendre qu'il se termine
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve: (token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(api(originalRequest));
          }, reject });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post<{ access: string }>(
          `${API_BASE_URL}/accounts/token/refresh/`,
          { refresh: refreshToken }
        );

        const newAccessToken = response.data.access;
        localStorage.setItem(TOKEN_KEY, newAccessToken);
        
        processQueue(null, newAccessToken);
        
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
