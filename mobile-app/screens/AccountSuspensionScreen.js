import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  StatusBar,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { Colors, Shadows, Spacing, FontSize, BorderRadius } from '../theme/index';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../services/apiService';

const SUSPENSION_REASONS = {
  FRAUDULENT_BILL: {
    id: 'FRAUDULENT_BILL',
    title: 'Fraudulent Bill Upload',
    description: 'A bill submitted by your account was flagged for potential fraud or misuse.',
    icon: 'file-document-alert',
    color: Colors.error,
  },
  REFERRAL_ABUSE: {
    id: 'REFERRAL_ABUSE',
    title: 'Referral Program Abuse',
    description: 'Your account was flagged for misuse or manipulation of the referral program.',
    icon: 'account-group-outline',
    color: Colors.warning,
  },
  SPAM_ACTIVITY: {
    id: 'SPAM_ACTIVITY',
    title: 'Spam Activity Detected',
    description: 'Unusual or spam-like activity was detected on your account.',
    icon: 'alert-circle-outline',
    color: Colors.warning,
  },
  POLICY_VIOLATION: {
    id: 'POLICY_VIOLATION',
    title: 'Terms of Service Violation',
    description: 'Your account activity has violated HealthPass terms of service.',
    icon: 'shield-alert',
    color: Colors.error,
  },
  PAYMENT_DEFAULT: {
    id: 'PAYMENT_DEFAULT',
    title: 'Payment Default',
    description: 'There are unpaid dues or payment defaults associated with your account.',
    icon: 'credit-card-off',
    color: Colors.error,
  },
};

const AccountSuspensionScreen = ({ route, navigation }) => {
  const { reason, details, suspensionDate, isTemporary } = route.params || {};
  const { user, logout } = useContext(AuthContext);
  
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const suspensionInfo = SUSPENSION_REASONS[reason] || {
    id: reason || 'UNKNOWN',
    title: 'Account Suspended',
    description: details || 'Your account has been temporarily suspended. Please contact support for more information.',
    icon: 'alert-circle',
    color: Colors.error,
  };

  useEffect(() => {
    if (isTemporary) {
      const timer = setTimeout(() => {
        Alert.alert(
          'Suspension Period Ended',
          'Your temporary suspension period has ended. Please review our terms of service.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isTemporary]);

  const handleContactSupport = () => {
    const phoneNumber = '+919876543210';
    const message = `Hello, I need assistance with my suspended HealthPass account (User ID: ${user?._id || 'N/A'}). Reason: ${suspensionInfo.title}`;
    const encodedMessage = encodeURIComponent(message);
    
    Alert.alert(
      'Contact Support',
      'How would you like to contact our support team?',
      [
        { text: 'Call Support', onPress: () => Linking.openURL(`tel:${phoneNumber}`) },
        { text: 'Email Support', onPress: () => Linking.openURL(`mailto:support@healthpass.app?subject=Account Suspension Query&body=${encodedMessage}`) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleChatWithSupport = () => {
    navigation.navigate('Chat', { hospitalId: 'support', hospital: { name: 'HealthPass Support' } });
  };

  const handleSubmitDispute = async () => {
    if (!disputeReason.trim()) {
      Alert.alert('Required', 'Please provide a reason for your dispute');
      return;
    }

    setSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      await apiClient.post('/account/dispute', {
        userId: user?._id,
        suspensionReason: reason,
        disputeReason,
        additionalInfo,
      });
      setSubmitted(true);
      Alert.alert(
        'Dispute Submitted',
        'Your dispute has been submitted successfully. Our team will review it and get back to you within 24-48 hours.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.log('Error submitting dispute:', error);
      Alert.alert('Error', 'Failed to submit dispute. Please try again or contact support directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? Your dispute will still be processed.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: () => logout() },
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.warningBanner}>
          <View style={[styles.warningIcon, { backgroundColor: suspensionInfo.color + '20' }]}>
            <MaterialCommunityIcons 
              name={suspensionInfo.icon} 
              size={48} 
              color={suspensionInfo.color} 
            />
          </View>
          <Text style={styles.warningTitle}>Account Suspended</Text>
          <Text style={styles.warningSubtitle}>
            {isTemporary ? 'Temporarily' : 'Permanently'} suspended due to:
          </Text>
          <View style={styles.reasonBox}>
            <Text style={styles.reasonTitle}>{suspensionInfo.title}</Text>
            <Text style={styles.reasonDesc}>{suspensionInfo.description}</Text>
          </View>
        </View>

        <View style={styles.restrictedSection}>
          <Text style={styles.sectionTitle}>Restricted Services</Text>
          <Text style={styles.sectionSubtitle}>
            The following services are currently unavailable on your account:
          </Text>
          
          <View style={styles.restrictionList}>
            <View style={styles.restrictionItem}>
              <MaterialCommunityIcons name="close-circle" size={20} color={Colors.error} />
              <Text style={styles.restrictionText}>Booking appointments</Text>
            </View>
            <View style={styles.restrictionItem}>
              <MaterialCommunityIcons name="close-circle" size={20} color={Colors.error} />
              <Text style={styles.restrictionText}>Uploading medical bills</Text>
            </View>
            <View style={styles.restrictionItem}>
              <MaterialCommunityIcons name="close-circle" size={20} color={Colors.error} />
              <Text style={styles.restrictionText}>Wallet transactions</Text>
            </View>
            <View style={styles.restrictionItem}>
              <MaterialCommunityIcons name="close-circle" size={20} color={Colors.error} />
              <Text style={styles.restrictionText}>Referral program access</Text>
            </View>
            <View style={styles.restrictionItem}>
              <MaterialCommunityIcons name="close-circle" size={20} color={Colors.error} />
              <Text style={styles.restrictionText}>Insurance claims</Text>
            </View>
          </View>

          <View style={styles.availableSection}>
            <Text style={styles.availableTitle}>Available Services</Text>
            <View style={styles.restrictionItem}>
              <MaterialCommunityIcons name="check-circle" size={20} color={Colors.success} />
              <Text style={styles.restrictionText}>View dashboard and profile</Text>
            </View>
            <View style={styles.restrictionItem}>
              <MaterialCommunityIcons name="check-circle" size={20} color={Colors.success} />
              <Text style={styles.restrictionText}>Chat with support</Text>
            </View>
            <View style={styles.restrictionItem}>
              <MaterialCommunityIcons name="check-circle" size={20} color={Colors.success} />
              <Text style={styles.restrictionText}>Submit dispute</Text>
            </View>
          </View>
        </View>

        <View style={styles.timelineSection}>
          <Text style={styles.sectionTitle}>Suspension Details</Text>
          <View style={styles.timeline}>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: Colors.error }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Suspension Initiated</Text>
                <Text style={styles.timelineDate}>{formatDate(suspensionDate)}</Text>
              </View>
            </View>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: Colors.warning }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Review Period</Text>
                <Text style={styles.timelineDate}>24-48 hours for initial review</Text>
              </View>
            </View>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: Colors.gray300 }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Resolution</Text>
                <Text style={styles.timelineDate}>You will be notified via email/SMS</Text>
              </View>
            </View>
          </View>
        </View>

        {!submitted && (
          <View style={styles.disputeSection}>
            <Text style={styles.sectionTitle}>Dispute This Decision</Text>
            <Text style={styles.sectionSubtitle}>
              If you believe this suspension was made in error, you can submit a dispute.
            </Text>
            
            <TouchableOpacity 
              style={styles.disputeBtn}
              onPress={() => setShowDisputeForm(!showDisputeForm)}
            >
              <MaterialCommunityIcons name="file-document-edit" size={20} color={Colors.primary} />
              <Text style={styles.disputeBtnText}>
                {showDisputeForm ? 'Cancel Dispute' : 'Submit Dispute'}
              </Text>
              <MaterialCommunityIcons 
                name={showDisputeForm ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color={Colors.primary} 
              />
            </TouchableOpacity>

            {showDisputeForm && (
              <View style={styles.disputeForm}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Reason for Dispute *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={disputeReason}
                    onChangeText={setDisputeReason}
                    placeholder="Briefly explain why you believe this is an error..."
                    placeholderTextColor={Colors.gray400}
                    multiline
                    numberOfLines={4}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Additional Information (Optional)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={additionalInfo}
                    onChangeText={setAdditionalInfo}
                    placeholder="Any supporting documents or information..."
                    placeholderTextColor={Colors.gray400}
                    multiline
                    numberOfLines={3}
                  />
                </View>
                <TouchableOpacity
                  style={[styles.submitDisputeBtn, submitting && styles.submitDisputeBtnDisabled]}
                  onPress={handleSubmitDispute}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="send" size={18} color="#fff" />
                      <Text style={styles.submitDisputeBtnText}>Submit Dispute</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {submitted && (
          <View style={styles.submittedBanner}>
            <MaterialCommunityIcons name="check-circle" size={32} color={Colors.success} />
            <Text style={styles.submittedTitle}>Dispute Submitted</Text>
            <Text style={styles.submittedSubtitle}>
              We will review your dispute and contact you within 24-48 hours.
            </Text>
          </View>
        )}

        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Need Help?</Text>
          <Text style={styles.sectionSubtitle}>
            Our support team is here to assist you with any questions.
          </Text>
          
          <View style={styles.contactButtons}>
            <TouchableOpacity style={styles.contactBtn} onPress={handleChatWithSupport}>
              <View style={[styles.contactIcon, { backgroundColor: Colors.primaryLight }]}>
                <MaterialCommunityIcons name="chat" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.contactBtnText}>Chat Support</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.contactBtn} onPress={handleContactSupport}>
              <View style={[styles.contactIcon, { backgroundColor: Colors.successLight }]}>
                <MaterialCommunityIcons name="phone" size={24} color={Colors.success} />
              </View>
              <Text style={styles.contactBtnText}>Call Support</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Logout from this device</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFB' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  
  warningBanner: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    marginBottom: 20,
    ...Shadows.sm,
  },
  warningIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.error,
    marginBottom: 8,
  },
  warningSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  reasonBox: {
    backgroundColor: Colors.errorLight,
    padding: 16,
    borderRadius: 16,
    width: '100%',
  },
  reasonTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.error,
    marginBottom: 4,
  },
  reasonDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  
  restrictedSection: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    ...Shadows.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  restrictionList: { gap: 12 },
  restrictionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  restrictionText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  availableSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  availableTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.success,
    marginBottom: 12,
  },
  
  timelineSection: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    ...Shadows.sm,
  },
  timeline: { marginTop: 16 },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: 12,
  },
  timelineContent: { flex: 1 },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  timelineDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  
  disputeSection: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    ...Shadows.sm,
  },
  disputeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primaryLight,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  disputeBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
    flex: 1,
  },
  disputeForm: { marginTop: 20 },
  inputGroup: { marginBottom: 16 },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: Colors.gray50,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#111827',
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitDisputeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
  },
  submitDisputeBtnDisabled: { opacity: 0.7 },
  submitDisputeBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  
  submittedBanner: {
    alignItems: 'center',
    backgroundColor: Colors.successLight,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  submittedTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.success,
    marginTop: 12,
  },
  submittedSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  
  contactSection: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    ...Shadows.sm,
  },
  contactButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  contactBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.gray50,
    padding: 20,
    borderRadius: 16,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  
  logoutBtn: {
    alignItems: 'center',
    padding: 16,
    marginTop: 8,
  },
  logoutBtnText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});

export default AccountSuspensionScreen;
