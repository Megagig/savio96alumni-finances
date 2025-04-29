import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { User, AuthState } from '../types';
import * as authService from '../services/auth.service';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; requiresVerification?: boolean }>;
  register: (userData: Partial<User>) => Promise<{ success: boolean; verificationToken?: string }>;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>(initialState);
  const isInitialMount = useRef(true);

  // Check if user is already logged in
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      checkAuthStatus();
    }
  }, []);

  const checkAuthStatus = async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    
    try {
      const token = authService.getToken();
      const user = authService.getUser();
      
      if (token && user) {
        try {
          // Verify token is valid by getting current user
          console.log('Checking auth status with token');
          const response = await authService.getCurrentUser();
          
          if (response.success) {
            console.log('Auth successful');
            // Update user data with the latest from the server
            const updatedUser = response.data?.user || user;
            
            // Ensure the token is refreshed in localStorage
            authService.setAuth(token, updatedUser);
            
            setState({
              user: updatedUser,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            // Token is invalid, logout but don't redirect yet
            console.warn('Auth check failed:', response.message);
            authService.removeAuth();
            setState({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              error: response.message || 'Authentication failed',
            });
          }
        } catch (error: any) {
          // Handle network errors without immediately logging out
          console.error('Auth check error:', error);
          
          // Keep the user logged in if it's just a network error
          if (error.message && error.message.includes('Network Error')) {
            setState({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            // For other errors, log out
            authService.removeAuth();
            setState({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              error: error.message || 'Authentication failed',
            });
          }
        }
      } else {
        console.log('No token or user found in localStorage');
        setState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (e) {
      // Handle any localStorage access errors
      console.error('Error accessing localStorage:', e);
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Error accessing authentication data',
      });
    }
  };

  const login = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await authService.login(email, password);
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        authService.setAuth(token, user);
        
        setState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        
        return { success: true };
      } else {
        // Check if the error is due to email verification requirement
        const requiresVerification = response.data?.requiresVerification === true;
        
        setState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: response.message || 'Login failed',
        });
        
        return { success: false, requiresVerification };
      }
    } catch (error: any) {
      // Check if the error response indicates email verification is required
      const requiresVerification = error.response?.data?.data?.requiresVerification === true;
      
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.message || 'Login failed',
      });
      
      return { success: false, requiresVerification };
    }
  };

  const register = async (userData: Partial<User>) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await authService.register(userData);
      
      if (response.success && response.data) {
        const { verificationToken } = response.data;
        
        // Don't set auth here since the user needs to verify their email first
        // Instead, we'll store minimal information for the verification process
        localStorage.setItem('pendingVerification', userData.email as string);
        
        setState({
          user: null,  // Don't set the user as authenticated yet
          token: null, // Don't set the token yet
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        
        return { success: true, verificationToken };
      } else {
        setState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: response.message || 'Registration failed',
        });
        
        return { success: false };
      }
    } catch (error: any) {
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.message || 'Registration failed',
      });
      
      return { success: false };
    }
  };

  const logout = () => {
    authService.removeAuth();
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
