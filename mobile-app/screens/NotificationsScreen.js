import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { Colors, Shadows, Spacing, FontSize, FontWeight, BorderRadius } from '../theme/index';

const NotificationsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setNotifications([
        { id: '1', title: 'Appointment Confirmed', body: 'Your consultation with Dr. Sharma is confirmed for tomorrow 10:00 AM.', time: '2 mins ago', icon: 'calendar-check', color: '#10B981', read: false },
        { id: '2', title: 'Lab Report Ready', body: 'Your Thyroid Profile report has been uploaded to the Health Vault.', time: '1 hr ago', icon: 'flask-outline', color: '#3B82F6', read: false },
        { id: '3', title: 'Refill Reminder', body: 'Your prescription for Paracetamol is about to finish. Order now from Pharmacy.', time: '5 hrs ago', icon: 'pill', color: Colors.primary, read: true },
        { id: '4', title: 'New Multi-Plan Available', body: 'HealthPass now covers family members in a single subscription. Check it out!', time: 'Yesterday', icon: 'shield-star', color: '#8B5CF6', read: true },
        { id: '5', title: 'Payment Success', body: 'Payment of ₹1,499 for Full Body Checkup was successful.', time: 'Yesterday', icon: 'check-circle', color: '#10B981', read: true },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const renderNotification = ({ item }) => (
    <TouchableOpacity style={[styles.nfCard, !item.read && styles.nfUnread]}>
       <View style={[styles.nfIconBox, { backgroundColor: item.color + '15' }]}>
          <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />
       </View>
       <View style={{ flex: 1, marginLeft: 15 }}>
          <View style={styles.nfHeader}>
             <Text style={styles.nfTitle} numberOfLines={1}>{item.title}</Text>
             {!item.read && <View style={styles.nfDot} />}
          </View>
          <Text style={styles.nfBody}>{item.body}</Text>
          <Text style={styles.nfTime}>{item.time}</Text>
       </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity>
           <Text style={styles.headerMark}>Mark as read</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        {loading ? (
           <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderNotification}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<Text style={styles.empty}>Stay tuned for health updates!</Text>}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { 
    flexDirection: 'row', alignItems: 'center', 
    justifyContent: 'space-between', padding: 20,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  headerMark: { fontSize: 13, color: Colors.primary, fontWeight: '700' },
  
  list: { paddingVertical: 10 },
  nfCard: { 
    flexDirection: 'row', padding: 20, 
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  nfUnread: { backgroundColor: '#FFF5F5' },
  nfIconBox: { 
    width: 48, height: 48, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  nfHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nfTitle: { flex: 1, fontSize: 15, fontWeight: '800', color: '#111827' },
  nfDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  nfBody: { fontSize: 13, color: '#475569', marginTop: 4, lineHeight: 18 },
  nfTime: { fontSize: 11, color: '#94A3B8', marginTop: 8, fontWeight: '600' },
  
  empty: { textAlign: 'center', color: '#64748B', marginTop: 40 },
});

export default NotificationsScreen;
