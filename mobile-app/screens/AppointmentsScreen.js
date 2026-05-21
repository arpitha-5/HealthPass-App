// HealthPass Appointments Screen - Updated 2026-03-10
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '../theme/index';
import Card from '../components/Card';
import apiClient from '../services/apiService';

const AppointmentsScreen = ({ navigation }) => {
  const [activeSegment, setActiveSegment] = useState('upcoming');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppointments = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await apiClient.get('/appointments');
      if (res.data && res.data.success) {
        setAppointments(res.data.appointments || []);
      }
    } catch (error) {
      console.log('Error fetching appointments:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const filteredAppointments = appointments.filter(appt => {
    if (!appt.date) return false;
    const apptDate = new Date(appt.date);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    if (activeSegment === 'upcoming') {
      return apptDate >= now || appt.status === 'Pending' || appt.status === 'Confirmed';
    } else {
      return apptDate < now || appt.status === 'Completed' || appt.status === 'Cancelled';
    }
  });

  const renderAppointment = ({ item }) => {
    const isCompleted = item.status === 'Completed';
    const isPending = item.status === 'Pending';
    
    return (
      <Card style={styles.apptCard}>
        <View style={styles.apptHeader}>
          <View style={styles.doctorInfoRow}>
            <View style={styles.doctorAvatar}>
              <MaterialCommunityIcons name="doctor" size={24} color={Colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.doctorName}>{item.doctor?.name || 'Doctor'}</Text>
              <Text style={styles.specialization}>{item.doctor?.specialization || item.specialization || 'Specialist'}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: isCompleted ? '#DCFCE7' : isPending ? '#FEF3C7' : '#DBEAFE' }]}>
              <Text style={[styles.statusText, { color: isCompleted ? '#166534' : isPending ? '#92400E' : '#1E40AF' }]}>
                {item.status || 'Scheduled'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.apptBody}>
          <View style={styles.detailRow}>
            <Feather name="calendar" size={14} color="#64748B" />
            <Text style={styles.detailText}>{item.date ? new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</Text>
            <View style={styles.verticalDivider} />
            <Feather name="clock" size={14} color="#64748B" />
            <Text style={styles.detailText}>{item.time || 'N/A'}</Text>
          </View>
          
          <View style={[styles.detailRow, { marginTop: 8 }]}>
            <Ionicons name="location-outline" size={14} color="#64748B" />
            <Text style={styles.detailText}>{item.hospital || 'Hospital'}</Text>
          </View>

          <View style={[styles.detailRow, { marginTop: 8 }]}>
             <MaterialCommunityIcons name={item.type === 'Video Call' ? 'video-outline' : 'walk'} size={14} color={Colors.primary} />
             <Text style={[styles.detailText, { color: Colors.primary, fontWeight: '600' }]}>{item.type || 'In-person'}</Text>
          </View>
        </View>

        <View style={styles.apptFooter}>
          {activeSegment === 'upcoming' ? (
            <>
              <TouchableOpacity style={styles.rescheduleBtn}>
                <Text style={styles.rescheduleText}>Reschedule</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.cancelBtn}
                onPress={() => {
                  Alert.alert(
                    'Cancel Appointment',
                    `Are you sure you want to cancel your appointment with ${item.doctor?.name}?`,
                    [
                      { text: 'No', style: 'cancel' },
                      { 
                        text: 'Yes, Cancel', 
                        style: 'destructive',
                        onPress: () => {
                          Alert.alert(
                            'Appointment Cancelled',
                            'Your visit has been restored. You can book again anytime.',
                            [{ text: 'OK' }]
                          );
                        }
                      }
                    ]
                  );
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.actionBtn}>
                <MaterialCommunityIcons name="file-document-outline" size={18} color={Colors.primary} />
                <Text style={styles.actionBtnText}>Prescription</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <MaterialCommunityIcons name="repeat" size={18} color={Colors.primary} />
                <Text style={styles.actionBtnText}>Rebook</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Appointments</Text>
        <TouchableOpacity style={styles.plusBtn} onPress={() => navigation.navigate('DoctorList')}>
          <Feather name="plus" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.segmentContainer}>
         <TouchableOpacity 
           style={[styles.segment, activeSegment === 'upcoming' && styles.activeSegment]}
           onPress={() => setActiveSegment('upcoming')}
         >
           <Text style={[styles.segmentText, activeSegment === 'upcoming' && styles.activeSegmentText]}>Upcoming</Text>
         </TouchableOpacity>
         <TouchableOpacity 
           style={[styles.segment, activeSegment === 'past' && styles.activeSegment]}
           onPress={() => setActiveSegment('past')}
         >
           <Text style={[styles.segmentText, activeSegment === 'past' && styles.activeSegmentText]}>Past</Text>
         </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        {loading && !refreshing ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loaderText}>Loading appointments...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredAppointments}
            renderItem={renderAppointment}
            keyExtractor={item => item._id || item.id}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => fetchAppointments(true)} tintColor={Colors.primary} />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="calendar-blank" size={60} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>No appointments found</Text>
                <Text style={styles.emptySub}>Your {activeSegment} appointments will appear here.</Text>
                <TouchableOpacity 
                  style={styles.bookNowBtn}
                  onPress={() => navigation.navigate('DoctorList')}
                >
                  <Text style={styles.bookNowText}>Book New Appointment</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  backBtn: { padding: 5 },
  plusBtn: { padding: 5 },
  
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeSegment: {
    backgroundColor: Colors.primary,
    ...Shadows.sm,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  activeSegmentText: {
    color: '#fff',
  },
  
  list: { padding: 20 },
  apptCard: {
    marginBottom: 20,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    backgroundColor: '#fff',
    ...Shadows.sm,
  },
  apptHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
  },
  doctorInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  specialization: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  
  apptBody: {
    paddingVertical: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  verticalDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 4,
  },
  
  apptFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 15,
    gap: 12,
  },
  rescheduleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
  },
  rescheduleText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F8F9FB',
    alignItems: 'center',
  },
  cancelText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  actionBtnText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 10, fontSize: 13, color: '#64748B' },
  
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginTop: 20,
  },
  emptySub: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
  bookNowBtn: {
    marginTop: 30,
    backgroundColor: Colors.primary,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 15,
  },
  bookNowText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
});

export default AppointmentsScreen;
