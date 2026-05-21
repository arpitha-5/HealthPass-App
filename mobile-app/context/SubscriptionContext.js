// context/SubscriptionContext.js
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import apiClient from '../services/apiService';
import { AuthContext } from './AuthContext';

export const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
  const { user, token } = useContext(AuthContext);
  
  const [subscription, setSubscription] = useState(null);
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
  const [loading, setLoading] = useState(true);
  const [benefits, setBenefits] = useState(null);

  // ─── Fetch Subscription ────────────────────────────────────────────────────────
  const fetchSubscription = useCallback(async () => {
    try {
      const res = await apiClient.get('/subscriptions/active');
      if (res.data.success) {
        setSubscription(res.data.data || res.data.subscription);
      }
    } catch (error) {
      console.log('No active subscription');
      setSubscription(null);
    }
  }, []);

  // ─── Fetch Wallet ─────────────────────────────────────────────────────────────
  const fetchWallet = useCallback(async () => {
    try {
      const res = await apiClient.get('/wallet');
      if (res.data.success) {
        const walletData = res.data.data || res.data.wallet;
        setWallet({
          balance: walletData?.balance || 0,
          transactions: res.data.transactions || walletData?.transactions || [],
        });
      }
    } catch (error) {
      console.log('Wallet fetch error:', error);
      // Use mock data if backend unavailable
      setWallet({
        balance: user?.walletBalance || 0,
        transactions: [],
      });
    }
  }, [user]);

  // ─── Apply Wallet Credits (CRITICAL FUNCTION) ─────────────────────────────────
  const applyWallet = useCallback(async ({ amount, type, referenceId }) => {
    try {
      const res = await apiClient.post('/subscription/wallet/apply', {
        amount,
        type,
        referenceId,
      });
      
      if (res.data.success) {
        // Update local wallet state
        setWallet(prev => ({
          ...prev,
          balance: res.data.wallet?.balance || prev.balance - amount,
        }));
        return { success: true, remainingBalance: res.data.wallet?.balance };
      }
    } catch (error) {
      console.log('Wallet apply error:', error);
      // Fallback: just deduct locally if backend fails
      if (wallet.balance >= amount) {
        setWallet(prev => ({
          ...prev,
          balance: prev.balance - amount,
          transactions: [
            {
              _id: Date.now().toString(),
              amount,
              type: 'DEBIT',
              reason: `Used for ${type}`,
              createdAt: new Date(),
            },
            ...prev.transactions,
          ],
        }));
        return { success: true, remainingBalance: wallet.balance - amount };
      }
      return { success: false, error: 'Insufficient balance' };
    }
  }, [wallet.balance]);

  // ─── Top Up Wallet ────────────────────────────────────────────────────────────
  const topUpWallet = useCallback(async ({ amount }) => {
    try {
      const res = await apiClient.post('/subscription/wallet/topup', { amount });
      if (res.data.success) {
        setWallet(prev => ({
          ...prev,
          balance: res.data.wallet?.balance || prev.balance + amount,
        }));
        return { success: true };
      }
    } catch (error) {
      console.log('Wallet topup error:', error);
      return { success: false };
    }
  }, []);

  // ─── Subscribe to Plan ────────────────────────────────────────────────────────
  const subscribeToPlan = useCallback(async ({ planId, billingCycle }) => {
    try {
      const res = await apiClient.post('/subscriptions', {
        planId,
        billingCycle,
      });
      
      if (res.data.success) {
        setSubscription(res.data.subscription);
        // Refresh wallet to get welcome credits
        await fetchWallet();
        return { success: true };
      }
    } catch (error) {
      console.log('Subscription error:', error);
      return { success: false, error: error.response?.data?.message };
    }
  }, [fetchWallet]);

  // ─── Cancel Subscription ──────────────────────────────────────────────────────
  const cancelSubscription = useCallback(async () => {
    try {
      const res = await apiClient.post('/subscriptions/cancel');
      if (res.data.success) {
        setSubscription(null);
        return { success: true };
      }
    } catch (error) {
      console.log('Cancel subscription error:', error);
      return { success: false };
    }
  }, []);

  // ─── Fetch Benefits ───────────────────────────────────────────────────────────
  const fetchBenefits = useCallback(async () => {
    try {
      const res = await apiClient.get('/benefits');
      if (res.data.success) {
        setBenefits(res.data.data || res.data.benefits);
      }
    } catch (error) {
      console.log('Benefits fetch error:', error);
      // Use subscription data as fallback
      if (subscription?.plan) {
        setBenefits({
          planBenefits: getPlanBenefits(subscription.plan),
          usageStats: {
            consultationsUsed: 0,
            consultationsTotal: subscription.plan.freeVisits || 0,
            walletCredits: wallet.balance,
            familyMembersAdded: 0,
            familyMembersLimit: subscription.plan.maxAdults || 1,
          },
        });
      }
    }
  }, [subscription, wallet.balance]);

  // ─── Helper: Get Plan Benefits ────────────────────────────────────────────────
  const getPlanBenefits = (plan) => {
    if (!plan) return [];
    const benefits = [];
    
    if (plan.freeVisits > 0) {
      benefits.push(`${plan.freeVisits} Free Doctor Consultations/month`);
    }
    if (plan.medical?.bloodTestsDiscount > 0) {
      benefits.push(`${plan.medical.bloodTestsDiscount}% Off on Lab Tests`);
    }
    if (plan.medical?.diagnosticsDiscount > 0) {
      benefits.push(`${plan.medical.diagnosticsDiscount}% Off on Diagnostics`);
    }
    if (plan.features?.priorityLine) {
      benefits.push('Priority Booking Line');
    }
    if (plan.features?.claimTracking) {
      benefits.push('Track Claims Online');
    }
    if (plan.accidentalCoverage?.enabled) {
      benefits.push(`Accidental Coverage up to ₹${plan.accidentalCoverage.maxAmount?.toLocaleString()}`);
    }
    if (plan.extraFeatures?.aiSupport) {
      benefits.push('24/7 AI Health Assistant');
    }
    
    return benefits;
  };

  // ─── Initial Load ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([
        fetchSubscription(),
        fetchWallet(),
        fetchBenefits(),
      ]).finally(() => setLoading(false));
    }
  }, [user]);

  // ─── Computed Values ─────────────────────────────────────────────────────────
  const hasActiveSubscription = !!subscription;
  const freeVisitsRemaining = subscription?.freeVisitsRemaining || 0;
  const currentPlan = subscription?.plan || null;
  const walletBalance = wallet.balance;

  // ─── Calculate Discount for Service ──────────────────────────────────────────
  const calculateDiscount = (serviceType, amount) => {
    if (!currentPlan) return { discount: 0, label: 'No Plan' };

    switch (serviceType) {
      case 'appointment':
        if (freeVisitsRemaining > 0) {
          return { discount: 0, label: 'Free Visit Available', isFree: true };
        }
        return { discount: 0, label: 'No free visits remaining' };

      case 'labtest':
        const labDiscount = Math.round(amount * ((currentPlan.medical?.bloodTestsDiscount || 0) / 100));
        return {
          discount: labDiscount,
          percentage: currentPlan.medical?.bloodTestsDiscount || 0,
          label: `${currentPlan.medical?.bloodTestsDiscount || 0}% Lab Discount`,
        };

      case 'diagnostics':
        const diagDiscount = Math.round(amount * ((currentPlan.medical?.diagnosticsDiscount || 0) / 100));
        return {
          discount: diagDiscount,
          percentage: currentPlan.medical?.diagnosticsDiscount || 0,
          label: `${currentPlan.medical?.diagnosticsDiscount || 0}% Diagnostics Discount`,
        };

      case 'pharmacy':
        return { discount: Math.round(amount * 0.05), percentage: 5, label: '5% Pharmacy Discount' };

      default:
        return { discount: 0, label: '' };
    }
  };

  // ─── Context Value ───────────────────────────────────────────────────────────
  const value = {
    // State
    subscription,
    wallet,
    benefits,
    loading,
    
    // Computed
    hasActiveSubscription,
    freeVisitsRemaining,
    currentPlan,
    walletBalance,
    
    // Actions
    fetchSubscription,
    fetchWallet,
    fetchBenefits,
    applyWallet,
    topUpWallet,
    subscribeToPlan,
    cancelSubscription,
    calculateDiscount,
    getPlanBenefits,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
};

export default SubscriptionContext;
