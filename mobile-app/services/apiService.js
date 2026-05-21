import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { API_BASE_URL } from '../utils/apiBaseUrl';

const getStoredToken = async () => {
  if (Platform.OS === 'web') {
    return localStorage.getItem('token');
  }

  return SecureStore.getItemAsync('token');
};

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add token to all requests
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await getStoredToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      if (Platform.OS === 'web') {
        localStorage.removeItem('token');
      } else {
        await SecureStore.deleteItemAsync('token');
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Authentication API calls
 */
export const authAPI = {
  loginWithPhone: async ({ phoneNumber, name, email }) => {
    try {
      const response = await apiClient.post('/auth/login', {
        phoneNumber,
        name,
        email,
      });

      return response.data;
    } catch (error) {
      console.error('Phone login error:', error.message);
      throw error;
    }
  },

  sendOtp: async (mobile, isSignup = false) => {
    // Force 10 digits to match backend expectation
    const cleanMobile = mobile.replace(/[^\d]/g, '').slice(-10);
    try {
      const response = await apiClient.post('/auth/send-otp', {
        mobile: cleanMobile,
        isSignup,
      });
      return response.data;
    } catch (error) {
      console.error('Send OTP error:', error.message);
      throw error;
    }
  },

  verifyOtp: async (mobile, otp) => {
    // Force 10 digits to match backend expectation
    const cleanMobile = mobile.replace(/[^\d]/g, '').slice(-10);
    try {
      const response = await apiClient.post('/auth/verify-otp', {
        mobile: cleanMobile,
        otp,
      });
      return response.data;
    } catch (error) {
      console.error('Verify OTP error:', error.message);
      throw error;
    }
  },

  logout: async () => {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem('token');
      } else {
        await SecureStore.deleteItemAsync('token');
      }
    } catch (error) {
      console.error('Logout error:', error.message);
    }
  },

  isAuthenticated: async () => {
    try {
      const token = await getStoredToken();
      return !!token;
    } catch (error) {
      return false;
    }
  },
};

/**
 * User Profile API calls
 */
export const userAPI = {
  // Get user profile
  getProfile: async () => {
    try {
      console.log('👤 Fetching user profile...');
      const response = await apiClient.get('/account/profile');
      console.log('✅ Profile fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching profile:', error.message);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      console.log('📝 Updating user profile...');
      const response = await apiClient.patch('/account/profile', profileData);
      console.log('✅ Profile updated successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error updating profile:', error.message);
      throw error;
    }
  },

  // Add family member
  addFamilyMember: async (memberData) => {
    try {
      console.log('👥 Adding family member...');
      const response = await apiClient.post('/account/family', memberData);
      console.log('✅ Family member added successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error adding family member:', error.message);
      throw error;
    }
  },

  // Get family members
  getFamilyMembers: async () => {
    try {
      console.log('👨‍👩‍👧‍👦 Fetching family members...');
      const response = await apiClient.get('/account/family');
      console.log('✅ Family members fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching family members:', error.message);
      throw error;
    }
  },

  // Delete family member
  deleteFamilyMember: async (id) => {
    try {
      console.log(`🗑️ Deleting family member ${id}...`);
      const response = await apiClient.delete(`/account/family/${id}`);
      console.log('✅ Family member deleted successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting family member:', error.message);
      throw error;
    }
  },
};

/**
 * Plans API calls
 */
export const planAPI = {
  // Get all plans
  getPlans: async () => {
    try {
      console.log('💰 Fetching plans...');
      const response = await apiClient.get('/plans');
      console.log('✅ Plans fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching plans:', error.message);
      throw error;
    }
  },

  // Get plan details
  getPlanDetails: async (planId) => {
    try {
      console.log(`💰 Fetching plan details for ${planId}...`);
      const response = await apiClient.get(`/plans/${planId}`);
      console.log('✅ Plan details fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching plan details:', error.message);
      throw error;
    }
  },
};

/**
 * Subscription API calls
 */
export const subscriptionAPI = {
  // Create subscription
  subscribe: async (subscriptionData) => {
    try {
      console.log('📋 Creating subscription...');
      const response = await apiClient.post('/subscriptions', subscriptionData);
      console.log('✅ Subscription created successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error creating subscription:', error.message);
      throw error;
    }
  },

  // Get user subscriptions
  getSubscriptions: async () => {
    try {
      console.log('📋 Fetching subscriptions...');
      const response = await apiClient.get('/subscriptions/active');
      console.log('✅ Subscriptions fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching subscriptions:', error.message);
      throw error;
    }
  },

  // Cancel subscription
  cancelSubscription: async (subscriptionId) => {
    try {
      console.log('❌ Canceling subscription...');
      const response = await apiClient.post('/subscriptions/cancel');
      console.log('✅ Subscription canceled successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error canceling subscription:', error.message);
      throw error;
    }
  },
};

/**
 * Payment API calls
 */
export const paymentAPI = {
  // Create payment order
  createOrder: async (orderData) => {
    try {
      console.log('💳 Creating payment order...');
      const response = await apiClient.post('/payment/create-order', orderData);
      console.log('✅ Payment order created successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error creating payment order:', error.message);
      throw error;
    }
  },

  // Verify payment
  verifyPayment: async (paymentData) => {
    try {
      console.log('✅ Verifying payment...');
      const response = await apiClient.post('/payments/confirm', paymentData);
      console.log('✅ Payment verified successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error verifying payment:', error.message);
      throw error;
    }
  },

  // Get payment history
  getPaymentHistory: async () => {
    try {
      console.log('💰 Fetching payment history...');
      const response = await apiClient.get('/payments/history');
      console.log('✅ Payment history fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching payment history:', error.message);
      throw error;
    }
  },
};

export default apiClient;
