/**
 * Firebase OTP Service
 * Handles phone authentication with Firebase Phone Auth + reCAPTCHA
 * 
 * NOTE: Firebase Auth is currently disabled in favor of MongoDB backend API
 * This service is kept for future Firebase integration
 */

// Firebase imports disabled - using MongoDB backend API instead

/**
 * Send OTP - DEPRECATED: Use authAPI.sendOTP from apiService.js instead
 */
export const sendOTP = async (phoneNumber, recaptchaVerifier) => {
  throw new Error('Firebase OTP is disabled. Use authAPI.sendOTP(phoneNumber) from apiService.js for MongoDB backend');
};

/**
 * Verify OTP code entered by user - DEPRECATED
 * Use authAPI.verifyOTP from apiService.js instead
 */
export const verifyOTP = async (otpCode) => {
  throw new Error('Firebase OTP is disabled. Use authAPI.verifyOTP(phoneNumber, otp) from apiService.js for MongoDB backend');
};

/**
 * Resend OTP to the same phone number - DEPRECATED
 * Use authAPI.sendOTP from apiService.js instead
 */
export const resendOTP = async (phoneNumber, recaptchaVerifier) => {
  throw new Error('Firebase OTP is disabled. Use authAPI.sendOTP(phoneNumber) from apiService.js for MongoDB backend');
};

/**
 * Logout user - DEPRECATED
 * Use authAPI.logout from apiService.js instead
 */
export const logout = async () => {
  throw new Error('Firebase OTP is disabled. Use authAPI.logout() from apiService.js for MongoDB backend');
};

/**
 * Get current authenticated user - DEPRECATED
 * Use authAPI from apiService.js instead
 */
export const getCurrentUser = () => {
  throw new Error('Firebase OTP is disabled. Use apiService.js for MongoDB backend');
};

/**
 * Listen to auth state changes - DEPRECATED
 * Use authAPI from apiService.js instead
 */
export const onAuthStateChange = (callback) => {
  console.warn('Firebase Auth is disabled, returning empty unsubscribe');
  return () => {};
};

export default {
  sendOTP,
  verifyOTP,
  resendOTP,
  logout,
  getCurrentUser,
  onAuthStateChange,
};

