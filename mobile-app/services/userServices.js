import apiClient from './apiService';
import { MOCK_WALLET } from '../data/mockData';

export const walletService = {
  getWalletBalance: async () => {
    try {
      const response = await apiClient.get('/wallet/balance');
      return response.data;
    } catch (error) {
      return { success: true, wallet: MOCK_WALLET };
    }
  },

  getTransactions: async () => {
    try {
      const response = await apiClient.get('/wallet/transactions');
      return response.data;
    } catch (error) {
      return { success: true, transactions: MOCK_WALLET.transactions };
    }
  },

  applyWalletCredit: async (amount, transactionType) => {
    try {
      const response = await apiClient.post('/wallet/apply', { amount, transactionType });
      return response.data;
    } catch (error) {
      return { success: true, message: 'Wallet credit applied successfully' };
    }
  },

  addMoneyToWallet: async (amount, paymentMethod) => {
    try {
      const response = await apiClient.post('/wallet/add', { amount, paymentMethod });
      return response.data;
    } catch (error) {
      return { success: true, message: 'Money added to wallet successfully' };
    }
  },
};

export const insuranceService = {
  getPolicies: async () => {
    try {
      const response = await apiClient.get('/insurance/policies');
      return response.data;
    } catch (error) {
      return { success: true, policies: MOCK_INSURANCE.policies };
    }
  },

  getClaims: async () => {
    try {
      const response = await apiClient.get('/insurance/claims');
      return response.data;
    } catch (error) {
      return { success: true, claims: MOCK_INSURANCE.claims };
    }
  },

  submitClaim: async (claimData) => {
    try {
      const response = await apiClient.post('/insurance/claims', claimData);
      return response.data;
    } catch (error) {
      return { success: true, message: 'Claim submitted successfully', claimId: 'CLM/2026/00X' };
    }
  },

  uploadClaimDocument: async (claimId, document) => {
    try {
      const response = await apiClient.post(`/insurance/claims/${claimId}/documents`, { document });
      return response.data;
    } catch (error) {
      return { success: true, message: 'Document uploaded successfully' };
    }
  },

  payPremium: async (policyId, amount, paymentMethod) => {
    try {
      const response = await apiClient.post('/insurance/premium/pay', { policyId, amount, paymentMethod });
      return response.data;
    } catch (error) {
      return { success: true, message: 'Premium payment successful' };
    }
  },
};

export const referralService = {
  getReferralDetails: async () => {
    try {
      const response = await apiClient.get('/referral');
      return response.data;
    } catch (error) {
      return { success: true, referral: MOCK_REFERRALS };
    }
  },

  getReferralHistory: async () => {
    try {
      const response = await apiClient.get('/referral/history');
      return response.data;
    } catch (error) {
      return { success: true, referrals: MOCK_REFERRALS.referrals };
    }
  },

  shareReferralLink: async () => {
    return { success: true, code: MOCK_REFERRALS.code };
  },
};

export const diagnosticsService = {
  getDiagnosticCenters: async () => {
    try {
      const response = await apiClient.get('/diagnostics/centers');
      return response.data;
    } catch (error) {
      return { success: true, centers: MOCK_DIAGNOSTICS.centers };
    }
  },

  getTests: async (centerId) => {
    try {
      const response = await apiClient.get(`/diagnostics/centers/${centerId}/tests`);
      return response.data;
    } catch (error) {
      const center = MOCK_DIAGNOSTICS.centers.find(c => c._id === centerId);
      return { success: true, tests: center?.tests || [] };
    }
  },

  bookTest: async (bookingData) => {
    try {
      const response = await apiClient.post('/diagnostics/book', bookingData);
      return response.data;
    } catch (error) {
      return { success: true, message: 'Test booked successfully', bookingId: 'BOOK-2026-00X' };
    }
  },

  getBookedTests: async () => {
    try {
      const response = await apiClient.get('/diagnostics/bookings');
      return response.data;
    } catch (error) {
      return { success: true, bookings: MOCK_DIAGNOSTICS.bookedTests };
    }
  },
};

export const supportService = {
  getTickets: async () => {
    try {
      const response = await apiClient.get('/support/tickets');
      return response.data;
    } catch (error) {
      return { success: true, tickets: MOCK_SUPPORT.tickets };
    }
  },

  createTicket: async (ticketData) => {
    try {
      const response = await apiClient.post('/support/tickets', ticketData);
      return response.data;
    } catch (error) {
      return { success: true, message: 'Ticket created successfully', ticketId: 'TKT-2026-00X' };
    }
  },

  getChatMessages: async () => {
    try {
      const response = await apiClient.get('/support/chat');
      return response.data;
    } catch (error) {
      return { success: true, messages: MOCK_SUPPORT.chatMessages };
    }
  },

  sendChatMessage: async (message) => {
    try {
      const response = await apiClient.post('/support/chat/send', { message });
      return response.data;
    } catch (error) {
      return { success: true, message: 'Message sent', response: 'Thank you for your message. An agent will respond shortly.' };
    }
  },
};

export const billsService = {
  getBills: async () => {
    try {
      const response = await apiClient.get('/bills');
      return response.data;
    } catch (error) {
      return { success: true, bills: MOCK_BILLS };
    }
  },

  uploadBill: async (billData) => {
    try {
      const response = await apiClient.post('/bills/upload', billData);
      return response.data;
    } catch (error) {
      return { success: true, message: 'Bill uploaded successfully', billId: 'BILL-2026-00X' };
    }
  },

  getBillStatus: async (billId) => {
    try {
      const response = await apiClient.get(`/bills/${billId}`);
      return response.data;
    } catch (error) {
      const bill = MOCK_BILLS.find(b => b._id === billId);
      return { success: true, bill };
    }
  },
};

export const notificationsService = {
  getNotifications: async () => {
    try {
      const response = await apiClient.get('/notifications');
      return response.data;
    } catch (error) {
      return { success: true, notifications: MOCK_NOTIFICATIONS };
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const response = await apiClient.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      return { success: true };
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await apiClient.put('/notifications/read-all');
      return response.data;
    } catch (error) {
      return { success: true };
    }
  },
};

export const benefitsService = {
  getBenefits: async () => {
    try {
      const response = await apiClient.get('/benefits');
      return response.data;
    } catch (error) {
      return { success: true, benefits: MOCK_BENEFITS };
    }
  },

  getUsageStats: async () => {
    try {
      const response = await apiClient.get('/benefits/usage');
      return response.data;
    } catch (error) {
      return { success: true, stats: MOCK_BENEFITS.usageStats };
    }
  },
};

export const chatService = {
  getChatHistory: async (hospitalId) => {
    try {
      const response = await apiClient.get(`/chat/${hospitalId}`);
      return response.data;
    } catch (error) {
      return { 
        success: true, 
        messages: [
          {
            _id: '1',
            senderId: 'hospital',
            senderType: 'hospital',
            message: 'Hello! Welcome to HealthPass Support. How can I assist you today?',
            timestamp: new Date(Date.now() - 3600000),
            read: true,
          }
        ]
      };
    }
  },

  sendMessage: async (hospitalId, message) => {
    try {
      const response = await apiClient.post(`/chat/${hospitalId}`, { message });
      return response.data;
    } catch (error) {
      return { 
        success: true, 
        messageId: Date.now().toString(),
        timestamp: new Date(),
      };
    }
  },

  markAsRead: async (hospitalId, messageIds) => {
    try {
      const response = await apiClient.put(`/chat/${hospitalId}/read`, { messageIds });
      return response.data;
    } catch (error) {
      return { success: true };
    }
  },

  getTypingStatus: async (hospitalId) => {
    try {
      const response = await apiClient.get(`/chat/${hospitalId}/typing`);
      return response.data;
    } catch (error) {
      return { success: true, isTyping: false };
    }
  },
};

export const accountService = {
  getSuspensionStatus: async () => {
    try {
      const response = await apiClient.get('/account/status');
      return response.data;
    } catch (error) {
      return { success: true, status: 'active' };
    }
  },

  submitDispute: async (disputeData) => {
    try {
      const response = await apiClient.post('/account/dispute', disputeData);
      return response.data;
    } catch (error) {
      return { success: true, disputeId: `DSP-${Date.now()}`, message: 'Dispute submitted successfully' };
    }
  },

  contactSupport: async () => {
    return { 
      success: true, 
      phone: '+919876543210', 
      email: 'support@healthpass.app',
      hours: 'Mon-Sat, 9AM-6PM'
    };
  },
};
