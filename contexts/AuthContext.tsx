import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { authService } from '../utils/api/authService';

// Define types for user
interface User {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  [key: string]: any; // Allow for additional properties
}

// Define the shape of auth context
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (userData: any) => Promise<{ success: boolean; message?: string; errors?: Record<string, string> }>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message?: string }>;
  refreshUser: () => Promise<void>;
}

// Props for AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

// Create auth context with defined type
const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Auth provider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Check if user is authenticated
  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const authenticated = await authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        const profileResponse = await authService.getProfile();
        if (profileResponse.success) {
          setUser(profileResponse.data.user);
        } else {
          // If profile fetch fails, log the user out
          await authService.logout();
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Auth status check error:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      if (response.success) {
        setIsAuthenticated(true);
        setUser(response.data.user);
        return { success: true };
      } else {
        return { 
          success: false, 
          message: response.message || 'Login failed'
        };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.message || 'An error occurred during login'
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const response = await authService.register(userData);
      
      // Log detailed response for debugging
      console.log('Full register response:', response);
      
      // Return more details from the response
      return { 
        success: response.success, 
        message: response.message,
        errors: response.errors || {}
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.message || 'An error occurred during registration'
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear auth state on error
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password request
  const requestPasswordReset = async (email: string) => {
    try {
      const response = await authService.requestPasswordReset(email);
      return { 
        success: response.success, 
        message: response.message 
      };
    } catch (error: any) {
      console.error('Password reset request error:', error);
      return { 
        success: false, 
        message: error.message || 'An error occurred'
      };
    }
  };

  // Auth context value
  const authContextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    requestPasswordReset,
    refreshUser: checkAuthStatus
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};