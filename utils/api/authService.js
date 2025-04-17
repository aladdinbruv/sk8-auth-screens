import { API_BASE_URL, AUTH_ENDPOINTS } from './config';

export const authService = {
  login: async (username, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.login}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  register: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.register}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  // Add other auth methods as needed
}; 