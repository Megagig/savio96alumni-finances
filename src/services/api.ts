import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from '../types';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include credentials for CORS requests
  // Add timeout to prevent hanging requests
  timeout: 30000,
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized error
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Use a more controlled approach instead of directly manipulating window.location
      // This will prevent the "message port closed" console error
      if (window.location.pathname !== '/login') {
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    }
    return Promise.reject(error);
  }
);

// Generic GET request
export const get = async <T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<ApiResponse<T>> = await api.get(url, config);
    return response.data;
  } catch (error: any) {
    console.error(`GET request to ${url} failed:`, error);
    if (error.response) {
      return (
        error.response.data || {
          success: false,
          message: `Request failed with status ${error.response.status}`,
        }
      );
    }
    return {
      success: false,
      message: error.message || 'Network error',
      data: undefined,
    };
  }
};

// Generic POST request
export const post = async <T>(
  url: string,
  data: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<ApiResponse<T>> = await api.post(
      url,
      data,
      config
    );
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return {
      success: false,
      message: error.message || 'Network error',
    };
  }
};

// Generic PUT request
export const put = async <T>(
  url: string,
  data: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<ApiResponse<T>> = await api.put(
      url,
      data,
      config
    );
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return {
      success: false,
      message: error.message || 'Network error',
    };
  }
};

// Generic PATCH request
export const patch = async <T>(
  url: string,
  data: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<ApiResponse<T>> = await api.patch(
      url,
      data,
      config
    );
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return {
      success: false,
      message: error.message || 'Network error',
    };
  }
};

// Generic DELETE request
export const del = async <T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<ApiResponse<T>> = await api.delete(
      url,
      config
    );
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return {
      success: false,
      message: error.message || 'Network error',
    };
  }
};

export default api;
