// Use your LAN IP address for development (192.168.1.12)
export const API_BASE_URL = "http://192.168.1.12:3000/api/v1";

export const AUTH_ENDPOINTS = {
  login: "/auth/login",
  register: "/auth/register",
  logout: "/auth/logout",
  refreshToken: "/auth/refresh-token",
  profile: "/auth/profile",
  resetPasswordRequest: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
  googleAuth: "/auth/oauth/google",
  facebookAuth: "/auth/oauth/facebook",
  twitterAuth: "/auth/oauth/twitter"
}; 