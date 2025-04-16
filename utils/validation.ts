/**
 * Form validation utilities
 */

// Email validation with regex
export const isEmailValid = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const isPasswordValid = (password: string): boolean => {
  return password.length >= 6;
};

// More detailed password strength checking
export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  if (password.length < 6) {
    return 'weak';
  }
  
  // Check for medium strength (at least one number and one letter)
  const hasNumber = /\d/.test(password);
  const hasLetter = /[a-zA-Z]/.test(password);
  
  if (hasNumber && hasLetter && password.length >= 8) {
    // Check for strong password (has special character, upper and lower case)
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    
    if (hasSpecial && hasUpper && hasLower && password.length >= 8) {
      return 'strong';
    }
    
    return 'medium';
  }
  
  return 'weak';
};

// Validate passwords match
export const doPasswordsMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword && password.length > 0;
};

// Username validation (alphanumeric and underscores only)
export const isUsernameValid = (username: string): boolean => {
  // Usernames should be at least 3 characters, alphanumeric and underscore only
  const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;
  return usernameRegex.test(username);
};

// Name validation (not empty and contains only valid characters)
export const isNameValid = (name: string): boolean => {
  // Name should contain only letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  return name.trim().length > 0 && nameRegex.test(name);
};

// Get validation error messages
export const getValidationError = (
  field: 'email' | 'password' | 'confirmPassword' | 'username' | 'name',
  value: string,
  compareValue?: string
): string => {
  switch (field) {
    case 'email':
      if (!value) return 'Email is required';
      if (!isEmailValid(value)) return 'Please enter a valid email address';
      return '';
      
    case 'password':
      if (!value) return 'Password is required';
      if (value.length < 6) return 'Password must be at least 6 characters';
      return '';
      
    case 'confirmPassword':
      if (!value) return 'Please confirm your password';
      if (compareValue && value !== compareValue) return 'Passwords do not match';
      return '';
      
    case 'username':
      if (!value) return 'Username is required';
      if (value.length < 3) return 'Username must be at least 3 characters';
      if (!/^[a-zA-Z0-9_]{3,}$/.test(value)) return 'Username can only contain letters, numbers, and underscores';
      return '';
      
    case 'name':
      if (!value.trim()) return 'Name is required';
      if (!/^[a-zA-Z\s'-]+$/.test(value)) return 'Name contains invalid characters';
      return '';
      
    default:
      return '';
  }
};

export default {
  isEmailValid,
  isPasswordValid,
  getPasswordStrength,
  doPasswordsMatch,
  isUsernameValid,
  isNameValid,
  getValidationError,
}; 