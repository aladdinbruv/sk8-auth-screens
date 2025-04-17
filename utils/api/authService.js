import { API_BASE_URL, AUTH_ENDPOINTS } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const ACCESS_TOKEN_KEY = 'sk8_access_token';
const REFRESH_TOKEN_KEY = 'sk8_refresh_token';

export const authService = {
  // Register new user
  register: async (userData) => {
    try {
      console.log(`Sending registration request to: ${API_BASE_URL}${AUTH_ENDPOINTS.register}`);
      
      const response = await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.register}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const responseData = await response.json();
      
      // Log the complete response for debugging
      console.log('Registration response:', {
        status: response.status,
        data: responseData
      });
      
      return responseData;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  // Login user
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.login}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      
      // If login successful, store tokens
      if (data.success && data.data?.tokens) {
        await AsyncStorage.setItem(ACCESS_TOKEN_KEY, data.data.tokens.accessToken);
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, data.data.tokens.refreshToken);
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  // Logout user
  logout: async () => {
    try {
      const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      
      const response = await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.logout}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });
      
      // Clear stored tokens regardless of response
      await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
      
      return await response.json();
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear tokens on error
      await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
      throw error;
    }
  },
  
  // Refresh access token
  refreshToken: async () => {
    try {
      const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.refreshToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });
      
      const data = await response.json();
      
      if (data.success && data.data?.tokens) {
        await AsyncStorage.setItem(ACCESS_TOKEN_KEY, data.data.tokens.accessToken);
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, data.data.tokens.refreshToken);
      }
      
      return data;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  },
  
  // Get the current access token
  getAccessToken: async () => {
    return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  },
  
  // Check if user is logged in
  isAuthenticated: async () => {
    const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    return !!token;
  },
  
  // Reset password request
  requestPasswordReset: async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.resetPasswordRequest}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      return await response.json();
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  },
  
  // Reset password with token
  resetPassword: async (token, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.resetPassword}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });
      return await response.json();
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  },
  
  // Get user profile
  getProfile: async () => {
    try {
      const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
      if (!token) {
        throw new Error('No access token available');
      }
      
      const response = await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.profile}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      return await response.json();
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },
  
  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
      if (!token) {
        throw new Error('No access token available');
      }
      
      const response = await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.profile}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },
  
  // Get OAuth URL for social login
  getOAuthUrl: (provider) => {
    if (provider === 'google') {
      return `${API_BASE_URL}${AUTH_ENDPOINTS.googleAuth}`;
    } else if (provider === 'facebook') {
      return `${API_BASE_URL}${AUTH_ENDPOINTS.facebookAuth}`;
    } else if (provider === 'twitter') {
      return `${API_BASE_URL}${AUTH_ENDPOINTS.twitterAuth}`;
    }
    throw new Error('Invalid OAuth provider');
  }
};