// services/walletService.js
import apiClient from './apiService';

class WalletService {
  constructor() {
    this.baseUrl = '/wallet';
  }

  // Get wallet balance and transaction history
  async getWallet() {
    try {
      const response = await apiClient.get(this.baseUrl);
      return response.data;
    } catch (error) {
      console.error('Wallet fetch error:', error);
      throw error;
    }
  }

  // Apply wallet credits to a booking/appointment
  async applyWallet({ amount, type, referenceId }) {
    try {
      const response = await apiClient.post(`${this.baseUrl}/apply`, {
        amount,
        type, // 'appointment' | 'labtest' | 'pharmacy' | 'diagnostics'
        referenceId,
      });
      return response.data;
    } catch (error) {
      console.error('Wallet apply error:', error);
      throw error;
    }
  }

  // Check wallet balance before applying
  async checkBalance(requiredAmount) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/balance`);
      const balance = response.data.wallet?.balance || 0;
      return {
        success: true,
        hasEnoughBalance: balance >= requiredAmount,
        currentBalance: balance,
        shortfall: balance < requiredAmount ? requiredAmount - balance : 0,
      };
    } catch (error) {
      console.error('Balance check error:', error);
      throw error;
    }
  }

  // Calculate discount based on plan benefits
  calculateWalletDiscount({ plan, serviceType, amount }) {
    const discounts = {
      appointment: {
        discount: plan.features?.freeVisits > 0 ? Math.min(amount, 0) : 0,
        label: 'Free Visit',
      },
      labtest: {
        discount: Math.round(amount * (plan.medical?.bloodTestsDiscount / 100)),
        percentage: plan.medical?.bloodTestsDiscount || 0,
      },
      diagnostics: {
        discount: Math.round(amount * (plan.medical?.diagnosticsDiscount / 100)),
        percentage: plan.medical?.diagnosticsDiscount || 0,
      },
      pharmacy: {
        discount: Math.round(amount * 0.05), // 5% pharmacy discount
        percentage: 5,
      },
    };

    return discounts[serviceType] || { discount: 0, percentage: 0 };
  }

  // Top up wallet
  async topUpWallet({ amount, paymentMethod = 'card' }) {
    try {
      const response = await apiClient.post(`${this.baseUrl}/topup`, {
        amount,
        paymentMethod,
      });
      return response.data;
    } catch (error) {
      console.error('Wallet topup error:', error);
      throw error;
    }
  }

  // Get transaction history
  async getTransactions({ page = 1, limit = 20 } = {}) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/transactions`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error('Transactions fetch error:', error);
      throw error;
    }
  }

  // Withdraw wallet credits (if allowed)
  async withdrawCredits({ amount, bankDetails }) {
    try {
      const response = await apiClient.post(`${this.baseUrl}/withdraw`, {
        amount,
        bankDetails,
      });
      return response.data;
    } catch (error) {
      console.error('Withdraw error:', error);
      throw error;
    }
  }
}

export default new WalletService();
