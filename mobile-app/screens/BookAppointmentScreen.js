import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '../theme/index';
import Avatar from '../components/Avatar';
import apiClient from '../services/apiService';
import PrimaryButton from '../components/PrimaryButton';

const { width } = Dimensions.get('window');

const BookAppointmentScreen = ({ route, navigation }) => {
  const { doctor } = route.params;
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const slots = doctor.availableSlots || [
    "10:00 AM",
    "11:00 AM",
    "11:30 AM",
    "02:00 PM",
    "03:30 PM",
    "04:00 PM",
    "05:00 PM"
  ];

  // Simple next 7 days for the date selector
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      full: d.toISOString().split('T')[0],
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.getDate(),
    };
  });

  const handleBooking = async () => {
    if (!selectedTime) {
      Alert.alert("Selection Required", "Please select a preferred time slot.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post("/appointments/book", {
        doctorId: doctor._id,
        date: selectedDate,
        time: selectedTime
      });

      if (res.data.success) {
        Alert.alert(
          "Success!", 
          `Your appointment with ${doctor.name} has been confirmed.`,
          [{ text: "View Appointments", onPress: () => navigation.navigate("Appointments") }]
        );
      }
    } catch (e) {
      console.log('Booking Error:', e.message);
      Alert.alert("Booking Failed", "We couldn't schedule your appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Slot</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* Doctor Summary Card */}
        <View style={styles.doctorCard}>
          <Avatar name={doctor.name} size={64} />
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{doctor.name}</Text>
            <Text style={styles.doctorSpec}>{doctor.specialization || 'General Physician'}</Text>
            <View style={styles.metaRow}>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={styles.ratingText}>{doctor.rating || '4.8'}</Text>
              </View>
              <Text style={styles.expText}>{doctor.experience || '8'}+ yrs experience</Text>
            </View>
          </View>
        </View>

        {/* Date Selector */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Select Date</Text>
            <Text style={styles.monthText}>Current Month</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateList}>
            {dates.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.dateCard,
                  selectedDate === item.full && styles.selectedDateCard
                ]}
                onPress={() => setSelectedDate(item.full)}
              >
                <Text style={[styles.dayText, selectedDate === item.full && styles.selectedDateText]}>{item.day}</Text>
                <Text style={[styles.dateText, selectedDate === item.full && styles.selectedDateText]}>{item.date}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Time Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Slots</Text>
          <View style={styles.slotsGrid}>
            {slots.map((s, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.slotBtn,
                  selectedTime === s && styles.selectedSlotBtn
                ]}
                onPress={() => setSelectedTime(s)}
              >
                <Text style={[styles.slotText, selectedTime === s && styles.selectedSlotText]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Consultation Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="currency-inr" size={20} color={Colors.primary} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.infoLabel}>Consultation Fee</Text>
              <Text style={styles.infoValue}>₹{doctor.fee || '500'}</Text>
            </View>
          </View>
          <View style={[styles.infoRow, { marginTop: 16 }]}>
            <MaterialCommunityIcons name="clock-outline" size={20} color={Colors.primary} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.infoLabel}>Duration</Text>
              <Text style={styles.infoValue}>30 mins (approx.)</Text>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <PrimaryButton 
          title={loading ? "Proceeding..." : "Confirm Booking"}
          onPress={handleBooking}
          loading={loading}
        />
        <Text style={styles.footerNote}>By booking, you agree to our Terms of Service</Text>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  backBtn: { padding: 5 },
  scroll: { paddingBottom: 40 },
  doctorCard: {
    flexDirection: 'row',
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 12,
    borderBottomColor: '#F8F9FB',
  },
  doctorInfo: { flex: 1, marginLeft: 20 },
  doctorName: { fontSize: 20, fontWeight: '800', color: '#111827' },
  doctorSpec: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 12 },
  ratingBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4
  },
  ratingText: { fontSize: 12, fontWeight: '700', color: '#D97706' },
  expText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  section: { padding: 24, paddingBottom: 0 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  monthText: { fontSize: 13, color: Colors.primary, fontWeight: '700' },
  dateList: { gap: 12, paddingRight: 24 },
  dateCard: {
    width: 64,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginRight: 10,
  },
  selectedDateCard: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    ...Shadows.primary,
  },
  dayText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  dateText: { fontSize: 18, fontWeight: '800', color: '#111827', marginTop: 4 },
  selectedDateText: { color: '#fff' },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 16 },
  slotBtn: {
    width: (width - 72) / 3,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  selectedSlotBtn: {
    backgroundColor: '#FEF2F2',
    borderColor: Colors.primary,
  },
  slotText: { fontSize: 14, fontWeight: '700', color: '#4B5563' },
  selectedSlotText: { color: Colors.primary },
  infoCard: {
    margin: 24,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoLabel: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  infoValue: { fontSize: 16, color: '#1E293B', fontWeight: '800', marginTop: 2 },
  footer: { 
    padding: 24, 
    backgroundColor: '#fff', 
    borderTopWidth: 1, 
    borderTopColor: '#F3F4F6' 
  },
  footerNote: { 
    textAlign: 'center', 
    fontSize: 12, 
    color: '#9CA3AF', 
    marginTop: 16 
  },
});

export default BookAppointmentScreen;