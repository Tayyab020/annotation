import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { API_BASE_URL, REQUEST_CONFIG, STORAGE_KEYS, ERROR_MESSAGES } from '../config/api';
import type { ApiResponse } from '../types';
import toast from 'react-hot-toast';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: REQUEST_CONFIG.DEFAULT_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle common errors
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => {
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  private handleApiError(error: AxiosError) {
    const status = error.response?.status;
    
    if (status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      window.location.href = '/login';
      toast.error(ERROR_MESSAGES.UNAUTHORIZED);
    } else if (status === 403) {
      toast.error('Access forbidden');
    } else if (status && status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (!error.response) {
      toast.error(ERROR_MESSAGES.NETWORK_ERROR);
    }
  }

  // Generic HTTP methods
  async get<T = any>(url: string, config = {}): Promise<ApiResponse<T>> {
    const response = await this.api.get(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config = {}): Promise<ApiResponse<T>> {
    const response = await this.api.post(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config = {}): Promise<ApiResponse<T>> {
    const response = await this.api.put(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config = {}): Promise<ApiResponse<T>> {
    const response = await this.api.delete(url, config);
    return response.data;
  }

  // File upload method
  async uploadFile<T = any>(
    url: string, 
    formData: FormData, 
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: REQUEST_CONFIG.UPLOAD_TIMEOUT,
      onUploadProgress: (progressEvent: { loaded: number; total?: number }) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    };

    const response = await this.api.post(url, formData, config);
    return response.data;
  }

  // AI requests with extended timeout
  async aiRequest<T = any>(url: string, data: any): Promise<ApiResponse<T>> {
    const config = {
      timeout: REQUEST_CONFIG.AI_TIMEOUT,
    };
    const response = await this.api.post(url, data, config);
    return response.data;
  }

  // Get the axios instance for direct use if needed
  getAxiosInstance(): AxiosInstance {
    return this.api;
  }

  // Update auth token
  setAuthToken(token: string) {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  // Clear auth token
  clearAuthToken() {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }
}

// Create singleton instance
export const apiService = new ApiService();
export default apiService;