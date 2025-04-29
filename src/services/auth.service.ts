import { post, get } from './api';
import { User, ApiResponse } from '../types';

interface LoginResponse {
  user: User;
  token: string;
  requiresVerification?: boolean;
}

interface RegisterResponse {
  user: User;
  token: string;
  verificationToken?: string;
}

// Login user
export const login = async (email: string, password: string): Promise<ApiResponse<LoginResponse>> => {
  try {
    return await post<LoginResponse>('/auth/login', { email, password });
  } catch (error: any) {
    // Check if the error is due to email verification requirement
    if (error.response?.data?.data?.requiresVerification) {
      return {
        success: false,
        message: error.response.data.message || 'Email verification required',
        data: { requiresVerification: true } as LoginResponse
      };
    }
    throw error;
  }
};

// Register user
export const register = async (userData: Partial<User>): Promise<ApiResponse<RegisterResponse>> => {
  return await post<RegisterResponse>('/auth/register', userData);
};

// Verify email
export const verifyEmail = async (email: string, token: string): Promise<ApiResponse<any>> => {
  return await post('/auth/verify-email', { email, token });
};

// Resend verification email
export const resendVerification = async (email: string): Promise<ApiResponse<any>> => {
  return await post('/auth/resend-verification', { email });
};

// Get current user profile
export const getCurrentUser = async (): Promise<ApiResponse<{ user: User }>> => {
  try {
    const response = await get<{ user: User }>('/auth/me');
    return response;
  } catch (error: any) {
    console.error('Error getting current user:', error);
    return {
      success: false,
      message: error.message || 'Failed to get user profile',
      data: undefined
    };
  }
};

// Set auth token and user in local storage
export const setAuth = (token: string, user: User): void => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

// Remove auth token and user from local storage
export const removeAuth = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Get auth token from local storage
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Get user from local storage
export const getUser = (): User | null => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Check if user is admin
export const isAdmin = (): boolean => {
  const user = getUser();
  return user ? user.role === 'admin' : false;
};
