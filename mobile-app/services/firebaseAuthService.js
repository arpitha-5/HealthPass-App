/**
 * Firebase Authentication Service - DEPRECATED
 * Firebase Auth is disabled in favor of MongoDB backend API
 * 
 * All methods throw errors instructing to use authAPI from apiService.js
 * This file is kept for backward compatibility only
 */

// No Firebase imports - Firebase is disabled

/**
 * DEPRECATED: Send OTP - Use authAPI.sendOTP from apiService.js
 */
export const sendOTP = async (phoneNumber) => {
  throw new Error('Firebase Auth is disabled. Use authAPI.sendOTP(phoneNumber) from apiService.js');
};

/**
 * DEPRECATED: Verify OTP - Use authAPI.verifyOTP from apiService.js  
 */
export const verifyOTP = async (otpCode) => {
  throw new Error('Firebase Auth is disabled. Use authAPI.verifyOTP(phoneNumber, otp) from apiService.js');
};

/**
 * DEPRECATED: Logout - Use authAPI.logout from apiService.js
 */
export const logout = async () => {
  throw new Error('Firebase Auth is disabled. Use authAPI.logout() from apiService.js');
};

/**
 * DEPRECATED: Get current user - Use from apiService.js
 */
export const getCurrentUser = async () => {
  throw new Error('Firebase Auth is disabled. Use authAPI.getCurrentUser() from apiService.js');
};

/**
 * DEPRECATED: Auth state listener - Use from apiService.js
 */
export const onAuthStateChange = (callback) => {
  console.warn('Firebase Auth is disabled, returning empty unsubscribe');
  return () => {};
};

/**
 * DEPRECATED: Check if authenticated - Use from apiService.js
 */
export const isUserAuthenticated = async () => {
  throw new Error('Firebase Auth is disabled. Use authAPI.isUserAuthenticated() from apiService.js');
};

/**
 * DEPRECATED: Get cached user - Use from apiService.js
 */
export const getCachedUser = async () => {
  throw new Error('Firebase Auth is disabled. Use authAPI.getCachedUser() from apiService.js');
};

export default {
  sendOTP,
  verifyOTP,
  logout,
  getCurrentUser,
  onAuthStateChange,
  isUserAuthenticated,
  getCachedUser,
};

