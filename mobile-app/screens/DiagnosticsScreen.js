import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { Colors, Shadows, Spacing, FontSize, FontWeight, BorderRadius } from '../theme/index';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import PrimaryButton from '../components/PrimaryButton';
import { diagnosticsService } from '../services/userServices';
import { MOCK_DIAGNOSTICS } from '../data/mockData';

const DiagnosticsScreen = ({ navigation }) => {
  const [centers, setCenters] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('centers');
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookingFor, setBookingFor] = useState('Self');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [centersRes, bookingsRes] = await Promise.all([
        diagnosticsService.getDiagnosticCenters(),
        diagnosticsService.getBookedTests()
      ]);
      if (centersRes.success) setCenters(centersRes.centers || []);
      if (bookingsRes.success) setBookings(bookingsRes.bookings || []);
    } catch (error) {
      console.log('Error fetching diagnostics data:', error);
      setCenters(MOCK_DIAGNOSTICS.centers);
      setBookings(MOCK_DIAGNOSTICS.bookedTests);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];
  const nextDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return {
      full: d.toISOString().split('T')[0],
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.getDate(),
    };
  });

  const handleBookTest = async () => {
    if (!selectedTest || !selectedDate || !selectedTime) {
      Alert.alert('Selection Required', 'Please select test, date and time slot');
      return;
    }

    setSubmitting(true);
    try {
      const res = await diagnosticsService.bookTest({
        centerId: selectedCenter._id,
        testId: selectedTest._id,
        testName: selectedTest.name,
        centerName: selectedCenter.name,
        date: selectedDate,
        time: selectedTime,
        patientFor: bookingFor,
        amount: selectedTest.discountedPrice,
      });
      if (res.success) {
        Alert.alert('Success', 'Test booked successfully!', [
          { text: 'OK', onPress: () => { setShowBookingModal(false); fetchData(); } }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to book test');
    } finally {
      setSubmitting(false);
    }
  };

  const openBookingModal = (center) => {
    setSelectedCenter(center);
    setSelectedTest(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setShowBookingModal(true);
  };

  const renderCenter = ({ item }) => (
    <Card style={styles.centerCard}>
      <View style={styles.centerHeader}>
        <View style={styles.centerInfo}>
          <Text style={styles.centerName}>{item.name}</Text>
          <Text style={styles.centerAddress}>{item.address}</Text>
          <View style={styles.centerMeta}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
            <Text style={styles.distanceText}>{item.distance}</Text>
            <View style={[styles.openBadge, { backgroundColor: item.isOpen ? Colors.successLight : Colors.gray100 }]}>
              <Text style={[styles.openText, { color: item.isOpen ? Colors.success : Colors.textSecondary }]}>
                {item.isOpen ? 'Open' : 'Closed'}
              </Text>
            </View>
          </View>
        </View>
        {item.discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{item.discount}% OFF</Text>
          </View>
        )}
      </View>

      <View style={styles.testsSection}>
        <Text style={styles.testsTitle}>Popular Tests</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {item.tests.slice(0, 3).map((test) => (
            <TouchableOpacity key={test._id} style={styles.testChip} onPress={() => { setSelectedCenter(item); setSelectedTest(test); setShowBookingModal(true); }}>
              <Text style={styles.testChipName}>{test.name}</Text>
              <View style={styles.testPriceRow}>
                <Text style={styles.testDiscountedPrice}>₹{test.discountedPrice}</Text>
                <Text style={styles.testOriginalPrice}>₹{test.price}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <TouchableOpacity style={styles.viewAllBtn} onPress={() => openBookingModal(item)}>
        <Text style={styles.viewAllText}>Book Test</Text>
        <Feather name="arrow-right" size={16} color={Colors.primary} />
      </TouchableOpacity>
    </Card>
  );

  const renderBooking = ({ item }) => (
    <Card style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Text style={styles.bookingTest}>{item.test}</Text>
        <StatusBadge status={item.status} size="sm" />
      </View>
      <Text style={styles.bookingCenter}>{item.center}</Text>
      <View style={styles.bookingDetails}>
        <View style={styles.bookingDetail}>
          <MaterialCommunityIcons name="calendar" size={14} color={Colors.textSecondary} />
          <Text style={styles.bookingDetailText}>
            {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </Text>
        </View>
        <View style={styles.bookingDetail}>
          <MaterialCommunityIcons name="clock-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.bookingDetailText}>{item.time}</Text>
        </View>
      </View>
      <View style={styles.bookingFooter}>
        <Text style={styles.bookingAmount}>₹{item.amount.toLocaleString()}</Text>
        {item.status === 'Confirmed' && (
          <TouchableOpacity style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loaderText}>Loading diagnostics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Diagnostics</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'centers' && styles.activeTab]}
          onPress={() => setActiveTab('centers')}
        >
          <MaterialCommunityIcons name="hospital-building" size={18} color={activeTab === 'centers' ? '#fff' : Colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'centers' && styles.activeTabText]}>Centers</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'bookings' && styles.activeTab]}
          onPress={() => setActiveTab('bookings')}
        >
          <MaterialCommunityIcons name="clipboard-list" size={18} color={activeTab === 'bookings' ? '#fff' : Colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'bookings' && styles.activeTabText]}>My Bookings</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} tintColor={Colors.primary} />
        }
      >
        {activeTab === 'centers' ? (
          centers.length > 0 ? (
            centers.map((item) => renderCenter({ item, key: item._id }))
          ) : (
            <EmptyState
              icon="microscope"
              title="No Centers Available"
              subtitle="Diagnostic centers will appear here"
            />
          )
        ) : (
          bookings.length > 0 ? (
            bookings.map((item) => renderBooking({ item, key: item._id }))
          ) : (
            <EmptyState
              icon="clipboard-list-outline"
              title="No Bookings"
              subtitle="Your diagnostic test bookings will appear here"
              actionLabel="Book a Test"
              onAction={() => setActiveTab('centers')}
            />
          )
        )}
      </ScrollView>

      <Modal
        visible={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        title={selectedTest ? 'Book Test' : 'Select Test'}
        size="lg"
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {selectedCenter && !selectedTest && (
            <View style={styles.centerSummary}>
              <Text style={styles.centerSummaryName}>{selectedCenter.name}</Text>
              <Text style={styles.centerSummaryAddress}>{selectedCenter.address}</Text>
              {selectedCenter.discount > 0 && (
                <View style={styles.discountBanner}>
                  <MaterialCommunityIcons name="tag" size={16} color={Colors.success} />
                  <Text style={styles.discountBannerText}>{selectedCenter.discount}% off on all tests</Text>
                </View>
              )}
            </View>
          )}

          {selectedTest && (
            <>
              <View style={styles.selectedTestCard}>
                <View>
                  <Text style={styles.selectedTestName}>{selectedTest.name}</Text>
                  <View style={styles.selectedTestPrices}>
                    <Text style={styles.selectedTestDiscounted}>₹{selectedTest.discountedPrice}</Text>
                    <Text style={styles.selectedTestOriginal}>₹{selectedTest.price}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setSelectedTest(null)}>
                  <Feather name="x" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionLabel}>Book For</Text>
              <View style={styles.patientOptions}>
                {['Self', 'Family Member'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.patientOption, bookingFor === option && styles.patientOptionActive]}
                    onPress={() => setBookingFor(option)}
                  >
                    <Text style={[styles.patientOptionText, bookingFor === option && styles.patientOptionTextActive]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionLabel}>Select Date</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
                <View style={styles.dateOptions}>
                  {nextDates.map((item) => (
                    <TouchableOpacity
                      key={item.full}
                      style={[styles.dateOption, selectedDate === item.full && styles.dateOptionActive]}
                      onPress={() => setSelectedDate(item.full)}
                    >
                      <Text style={[styles.dateDay, selectedDate === item.full && styles.dateDayActive]}>{item.day}</Text>
                      <Text style={[styles.dateNum, selectedDate === item.full && styles.dateNumActive]}>{item.date}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <Text style={styles.sectionLabel}>Select Time Slot</Text>
              <View style={styles.timeOptions}>
                {timeSlots.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[styles.timeOption, selectedTime === time && styles.timeOptionActive]}
                    onPress={() => setSelectedTime(time)}
                  >
                    <Text style={[styles.timeOptionText, selectedTime === time && styles.timeOptionTextActive]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.totalSection}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalAmount}>₹{selectedTest.discountedPrice.toLocaleString()}</Text>
              </View>

              <PrimaryButton
                title="Confirm Booking"
                onPress={handleBookTest}
                loading={submitting}
                disabled={!selectedDate || !selectedTime}
                style={{ marginTop: 16 }}
              />
            </>
          )}

          {!selectedTest && selectedCenter && (
            <View style={styles.testsList}>
              {selectedCenter.tests.map((test) => (
                <TouchableOpacity
                  key={test._id}
                  style={styles.testItem}
                  onPress={() => setSelectedTest(test)}
                >
                  <View style={styles.testInfo}>
                    <Text style={styles.testItemName}>{test.name}</Text>
                    <View style={styles.testItemPrices}>
                      <Text style={styles.testItemDiscounted}>₹{test.discountedPrice}</Text>
                      <Text style={styles.testItemOriginal}>₹{test.price}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.bookTestBtn}
                    onPress={() => setSelectedTest(test)}
                  >
                    <Text style={styles.bookTestBtnText}>Book</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FB' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 10, color: Colors.textSecondary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.divider },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  backBtn: { padding: 5 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 20, marginTop: 16, borderRadius: 12, padding: 4, ...Shadows.sm },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
  activeTab: { backgroundColor: Colors.primary },
  tabText: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary },
  activeTabText: { color: '#fff' },
  scroll: { padding: 20, paddingBottom: 120 },
  centerCard: { marginBottom: 16, padding: 16 },
  centerHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  centerInfo: { flex: 1 },
  centerName: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  centerAddress: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  centerMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEB', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, gap: 4 },
  ratingText: { fontSize: 11, fontWeight: '700', color: '#D97706' },
  distanceText: { fontSize: 11, color: Colors.textSecondary },
  openBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  openText: { fontSize: 11, fontWeight: '600' },
  discountBadge: { backgroundColor: Colors.success, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  discountText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  testsSection: { marginTop: 16 },
  testsTitle: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, marginBottom: 10 },
  testChip: { backgroundColor: Colors.gray50, padding: 12, borderRadius: 12, marginRight: 10, minWidth: 120 },
  testChipName: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4 },
  testPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  testDiscountedPrice: { fontSize: 14, fontWeight: '800', color: Colors.primary },
  testOriginalPrice: { fontSize: 11, color: Colors.textSecondary, textDecorationLine: 'line-through' },
  viewAllBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryLight, padding: 12, borderRadius: 12, marginTop: 16, gap: 8 },
  viewAllText: { color: Colors.primary, fontWeight: '700', fontSize: 14 },
  bookingCard: { marginBottom: 12, padding: 16 },
  bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  bookingTest: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, flex: 1 },
  bookingCenter: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  bookingDetails: { flexDirection: 'row', gap: 16, marginTop: 12 },
  bookingDetail: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bookingDetailText: { fontSize: 12, color: Colors.textSecondary },
  bookingFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.divider },
  bookingAmount: { fontSize: 16, fontWeight: '800', color: Colors.primary },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: Colors.error },
  cancelBtnText: { color: Colors.error, fontSize: 12, fontWeight: '600' },
  centerSummary: { backgroundColor: Colors.gray50, padding: 16, borderRadius: 12, marginBottom: 20 },
  centerSummaryName: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  centerSummaryAddress: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  discountBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.successLight, padding: 8, borderRadius: 8, marginTop: 12, gap: 6 },
  discountBannerText: { color: Colors.success, fontSize: 12, fontWeight: '600' },
  selectedTestCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.primaryLight, padding: 16, borderRadius: 12, marginBottom: 20 },
  selectedTestName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  selectedTestPrices: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  selectedTestDiscounted: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  selectedTestOriginal: { fontSize: 13, color: Colors.textSecondary, textDecorationLine: 'line-through' },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12, marginTop: 8 },
  patientOptions: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  patientOption: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  patientOptionActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  patientOptionText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  patientOptionTextActive: { color: '#fff' },
  dateScroll: { marginBottom: 20 },
  dateOptions: { flexDirection: 'row', gap: 10 },
  dateOption: { width: 60, height: 70, borderRadius: 12, backgroundColor: Colors.gray50, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  dateOptionActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dateDay: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  dateDayActive: { color: 'rgba(255,255,255,0.7)' },
  dateNum: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginTop: 4 },
  dateNumActive: { color: '#fff' },
  timeOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  timeOption: { width: '30%', paddingVertical: 12, borderRadius: 10, backgroundColor: Colors.gray50, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  timeOptionActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  timeOptionText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  timeOptionTextActive: { color: '#fff' },
  totalSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.gray50, padding: 16, borderRadius: 12 },
  totalLabel: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  totalAmount: { fontSize: 22, fontWeight: '800', color: Colors.primary },
  testsList: { gap: 12 },
  testItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.gray50, padding: 16, borderRadius: 12 },
  testInfo: { flex: 1 },
  testItemName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  testItemPrices: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  testItemDiscounted: { fontSize: 15, fontWeight: '800', color: Colors.primary },
  testItemOriginal: { fontSize: 12, color: Colors.textSecondary, textDecorationLine: 'line-through' },
  bookTestBtn: { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  bookTestBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});

export default DiagnosticsScreen;
