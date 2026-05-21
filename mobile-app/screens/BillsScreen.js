// screens/BillsScreen.js - Medical Bill Upload & Wallet Credits
import React, { useState, useCallback, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { Colors, Shadows, Spacing } from '../theme/index';
import Card from '../components/Card';

const BILLETYPES = [
  { id: 'DIAGNOSTIC', label: 'Diagnostic/Lab', icon: 'test-tube' },
  { id: 'PHARMACY', label: 'Pharmacy', icon: 'pill' },
  { id: 'CONSULTATION', label: 'Consultation', icon: 'stethoscope' },
  { id: 'HOSPITAL', label: 'Hospital', icon: 'hospital-building' },
];

const BillsScreen = ({ navigation }) => {
  const { token } = useContext(AuthContext);
  const { currentPlan, walletBalance } = useSubscription();

  const [activeTab, setActiveTab] = useState('upload');
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);

  // Upload form state
  const [billType, setBillType] = useState('');
  const [amount, setAmount] = useState('');
  const [providerName, setProviderName] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [description, setDescription] = useState('');

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Image picker error:', error);
    }
  };

  const takePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Needed', 'Camera permission is required');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Camera error:', error);
    }
  };

  const calculateCredit = () => {
    const billAmount = parseFloat(amount) || 0;
    
    const creditPercentages = {
      DIAGNOSTIC: currentPlan?.medical?.diagnosticsDiscount || 15,
      PHARMACY: 5,
      CONSULTATION: 10,
      HOSPITAL: 20,
    };

    const percentage = creditPercentages[billType] || 10;
    return Math.round(billAmount * (percentage / 100));
  };

  const handleSubmit = async () => {
    if (!billType) {
      Alert.alert('Required', 'Please select a bill type');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Required', 'Please enter the bill amount');
      return;
    }
    if (!providerName.trim()) {
      Alert.alert('Required', 'Please enter the provider name');
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const estimatedCredit = calculateCredit();
      
      Alert.alert(
        'Bill Submitted! 🎉',
        `Your bill of ₹${parseFloat(amount).toLocaleString()} has been submitted for review.\n\nEstimated wallet credit: ₹${estimatedCredit}\n\nCredits are usually credited within 24-48 hours after admin approval.`,
        [
          {
            text: 'View Wallet',
            onPress: () => navigation.navigate('Wallet'),
          },
          {
            text: 'Upload Another',
            onPress: () => {
              resetForm();
              setBills(prev => [{
                id: Date.now().toString(),
                billType,
                amount: parseFloat(amount),
                providerName,
                status: 'PENDING',
                estimatedCredit,
                submittedAt: new Date(),
              }, ...prev]);
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit bill. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setBillType('');
    setAmount('');
    setProviderName('');
    setSelectedImage(null);
    setDescription('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
      case 'CREDITED':
        return '#10B981';
      case 'PENDING':
      case 'UNDER_REVIEW':
        return '#F59E0B';
      case 'REJECTED':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const renderBillCard = ({ item }) => (
    <Card style={styles.billCard}>
      <View style={styles.billHeader}>
        <View style={styles.billTypeIcon}>
          <MaterialCommunityIcons
            name={BILLETYPES.find(t => t.id === item.billType)?.icon || 'receipt'}
            size={24}
            color={Colors.primary}
          />
        </View>
        <View style={styles.billInfo}>
          <Text style={styles.billProvider}>{item.providerName}</Text>
          <Text style={styles.billDate}>
            {new Date(item.submittedAt).toLocaleDateString('en-IN')}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>
      
      <View style={styles.billDetails}>
        <View style={styles.billDetailRow}>
          <Text style={styles.billLabel}>Bill Amount</Text>
          <Text style={styles.billAmount}>₹{item.amount.toLocaleString()}</Text>
        </View>
        {item.creditedAmount && (
          <View style={styles.billDetailRow}>
            <Text style={styles.billLabel}>Credited to Wallet</Text>
            <Text style={[styles.billAmount, { color: '#10B981' }]}>
              +₹{item.creditedAmount.toLocaleString()}
            </Text>
          </View>
        )}
        {item.estimatedCredit && !item.creditedAmount && (
          <View style={styles.billDetailRow}>
            <Text style={styles.billLabel}>Estimated Credit</Text>
            <Text style={[styles.billAmount, { color: '#F59E0B' }]}>
              ₹{item.estimatedCredit.toLocaleString()}
            </Text>
          </View>
        )}
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medical Bills</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upload' && styles.tabActive]}
          onPress={() => setActiveTab('upload')}
        >
          <Text style={[styles.tabText, activeTab === 'upload' && styles.tabTextActive]}>
            Upload Bill
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            History ({bills.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'upload' ? (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <MaterialCommunityIcons name="information" size={20} color="#3B82F6" />
            <Text style={styles.infoText}>
              Upload your medical bills to earn wallet credits! Earn up to 50% cashback on approved bills.
            </Text>
          </View>

          {/* Bill Type Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>Bill Type *</Text>
            <View style={styles.typeGrid}>
              {BILLETYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[styles.typeBtn, billType === type.id && styles.typeBtnActive]}
                  onPress={() => setBillType(type.id)}
                >
                  <MaterialCommunityIcons
                    name={type.icon}
                    size={24}
                    color={billType === type.id ? '#fff' : '#666'}
                  />
                  <Text style={[styles.typeLabel, billType === type.id && styles.typeLabelActive]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Amount */}
          <View style={styles.section}>
            <Text style={styles.label}>Bill Amount *</Text>
            <View style={styles.amountInput}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Provider Name */}
          <View style={styles.section}>
            <Text style={styles.label}>Provider/Hospital Name *</Text>
            <TextInput
              style={styles.textInput}
              value={providerName}
              onChangeText={setProviderName}
              placeholder="e.g., Apollo Diagnostics"
              placeholderTextColor="#999"
            />
          </View>

          {/* Description (Optional) */}
          <View style={styles.section}>
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add any notes about this bill..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Image Upload */}
          <View style={styles.section}>
            <Text style={styles.label}>Upload Bill Image (Optional)</Text>
            <View style={styles.imageSection}>
              {selectedImage ? (
                <View style={styles.previewContainer}>
                  <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                  <TouchableOpacity style={styles.removeBtn} onPress={() => setSelectedImage(null)}>
                    <Feather name="x" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.imageButtons}>
                  <TouchableOpacity style={styles.imageBtn} onPress={takePhoto}>
                    <MaterialCommunityIcons name="camera" size={28} color={Colors.primary} />
                    <Text style={styles.imageBtnText}>Take Photo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
                    <MaterialCommunityIcons name="image" size={28} color={Colors.primary} />
                    <Text style={styles.imageBtnText}>Choose File</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Estimated Credit Preview */}
          {amount && billType && (
            <View style={styles.creditPreview}>
              <View style={styles.creditRow}>
                <Text style={styles.creditLabel}>Estimated Wallet Credit</Text>
                <Text style={styles.creditValue}>₹{calculateCredit()}</Text>
              </View>
              <Text style={styles.creditNote}>
                *Credit amount may vary based on final review
              </Text>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons name="upload" size={20} color="#fff" />
                <Text style={styles.submitBtnText}>Submit Bill</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      ) : (
        <FlatList
          data={bills}
          renderItem={renderBillCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="file-document-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No Bills Yet</Text>
              <Text style={styles.emptySubtitle}>
                Upload your first medical bill to start earning wallet credits
              </Text>
              <TouchableOpacity
                style={styles.uploadFirstBtn}
                onPress={() => setActiveTab('upload')}
              >
                <Text style={styles.uploadFirstText}>Upload First Bill</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111' },

  tabs: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: '#666' },
  tabTextActive: { color: '#fff' },

  scroll: { flex: 1, paddingHorizontal: 20 },
  listContent: { padding: 20, paddingBottom: 100 },

  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  infoText: { flex: 1, fontSize: 13, color: '#1E40AF', lineHeight: 18 },

  section: { marginTop: 24 },
  label: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 10 },

  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeBtn: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  typeBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  typeLabel: { fontSize: 13, fontWeight: '600', color: '#666' },
  typeLabelActive: { color: '#fff' },

  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  currencySymbol: { fontSize: 24, fontWeight: '700', color: '#111', marginRight: 8 },
  input: { flex: 1, fontSize: 24, fontWeight: '700', color: '#111' },

  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    fontSize: 15,
    color: '#111',
  },
  textArea: { height: 100, textAlignVertical: 'top', paddingTop: 12 },

  imageSection: { gap: 12 },
  imageButtons: { flexDirection: 'row', gap: 12 },
  imageBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
  },
  imageBtnText: { fontSize: 13, fontWeight: '600', color: '#666' },

  previewContainer: { position: 'relative' },
  previewImage: { width: '100%', height: 200, borderRadius: 12 },
  removeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },

  creditPreview: {
    backgroundColor: '#ECFDF5',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  creditRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  creditLabel: { fontSize: 14, color: '#065F46' },
  creditValue: { fontSize: 24, fontWeight: '800', color: '#065F46' },
  creditNote: { fontSize: 11, color: '#047857', marginTop: 6 },

  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    height: 54,
    borderRadius: 14,
    marginTop: 32,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  billCard: { marginBottom: 12, padding: 16 },
  billHeader: { flexDirection: 'row', alignItems: 'center' },
  billTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  billInfo: { flex: 1, marginLeft: 12 },
  billProvider: { fontSize: 15, fontWeight: '700', color: '#111' },
  billDate: { fontSize: 12, color: '#666', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },

  billDetails: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  billDetailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  billLabel: { fontSize: 13, color: '#666' },
  billAmount: { fontSize: 15, fontWeight: '700', color: '#111' },

  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#111', marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 8 },
  uploadFirstBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  uploadFirstText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});

export default BillsScreen;
