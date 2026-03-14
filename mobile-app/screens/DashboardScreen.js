// HealthPass Dashboard Screen - Updated 2026-03-10
import React, { useState, useEffect, useCallback, useContext, memo, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadows } from '../theme/index';
import Card from '../components/Card';
import SectionTitle from '../components/SectionTitle';
import BottomTabBar from '../components/BottomTabBar';
import Avatar from '../components/Avatar';
import apiClient from '../services/apiService';
import hospitalService from '../services/hospitalService';
import HospitalCard from '../components/HospitalCard';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const PRIMARY = Colors.primary;
const TEXT = Colors.textPrimary;
const SUBTEXT = Colors.textSecondary;
const BG = Colors.background;

// ─── Sub-Components ───────────────────────────────────────────────────────────

const ServiceWidget = memo(({ icon, name, color = PRIMARY, onPress }) => (
  <TouchableOpacity style={styles.serviceItem} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.serviceIcon}>
      <MaterialCommunityIcons name={icon} size={28} color={color} />
    </View>
    <Text style={styles.serviceText}>{name}</Text>
  </TouchableOpacity>
));

const MembershipMiniCard = memo(({ user, onAction }) => (
  <TouchableOpacity activeOpacity={0.9} onPress={onAction}>
    <LinearGradient colors={[PRIMARY, '#B71C1C']} style={styles.memberCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <View style={styles.memberHeader}>
        <View>
          <Text style={styles.memberPlan}>{user.currentSubscription?.plan?.name || "GOLD MEMBER"}</Text>
          <Text style={styles.walletVal}>₹{user.walletBalance?.toLocaleString() || '0'}</Text>
          <Text style={styles.walletLabel}>Health Credits Available</Text>
        </View>
        <TouchableOpacity style={styles.topupBtn} onPress={onAction}>
          <Text style={styles.topupText}>View Benefits</Text>
          <Feather name="arrow-right" size={14} color={PRIMARY} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  </TouchableOpacity>
));

// ─── Main Screen ─────────────────────────────────────────────────────────────

const DashboardScreen = ({ route, navigation }) => {
  const { user: contextUser } = useContext(AuthContext);
  const fullName = contextUser?.fullName || contextUser?.name || "User";
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("home");

  // Nearby Hospitals State
  const [hospitals, setHospitals] = useState([]);
  const [location, setLocation] = useState(null);
  const [hospitalsLoading, setHospitalsLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);

  const loadDashboard = useCallback(async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);

      const res = await apiClient.get("/user/dashboard");
      if (res.data.success) {
        setDashboard(res.data.dashboard);
      }
    } catch (err) {
      console.log("Dashboard fetch failed", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchHospitals = useCallback(async () => {
    try {
      setHospitalsLoading(true);
      setLocationError(null);

      const loc = await hospitalService.getUserLocation();
      setLocation(loc);

      const nearby = await hospitalService.fetchNearbyHospitals(loc.latitude, loc.longitude);
      setHospitals(nearby);
    } catch (err) {
      console.log("Failed to fetch nearby hospitals:", err);
      setLocationError(err.message);
      // Fallback hospitals if API fails or permission denied
      setHospitals([
        { id: '1', name: 'City Heart Hospital', vicinity: 'Central Area', rating: 4.8, distance: '1.2', isOpen: true },
        { id: '2', name: 'Apollo Clinic', vicinity: 'East Wing', rating: 4.5, distance: '2.5', isOpen: false }
      ]);
    } finally {
      setHospitalsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
    fetchHospitals();
  }, [loadDashboard, fetchHospitals]);

  const handleTabPress = (tab) => {
    setActiveTab(tab);
    if (tab === "profile") navigation.navigate("Profile");
    if (tab === "appointments") navigation.navigate("Appointments");
  };

  const greeting = useMemo(() => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning';
    if (hr < 18) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  if (loading && !refreshing) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={styles.loaderText}>Syncing records...</Text>
      </View>
    );
  }

  const user = dashboard?.user || {};
  const appointment = dashboard?.appointment || {};

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Avatar
            name={fullName}
            image={contextUser?.avatar || contextUser?.profilePicture}
            size={48}
            onPress={() => navigation.navigate('Profile')}
          />
          <View style={{ marginLeft: Spacing.md }}>
            <Text style={styles.greetingPre}>{greeting},</Text>
            <Text style={styles.userName}>{fullName.split(" ")[0]} 👋</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Feather name="bell" size={24} color={TEXT} />
          <View style={styles.badge} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              loadDashboard(true);
              fetchHospitals();
            }}
            tintColor={PRIMARY}
          />
        }
      >
        {/* ── Search Bar ── */}
        <View style={styles.searchSection}>
          <TouchableOpacity
            style={styles.searchBar}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('DoctorList')}
          >
            <Ionicons name="search" size={20} color={SUBTEXT} />
            <Text style={styles.searchText}>Search doctors, medicines, tests...</Text>
            <Feather name="mic" size={18} color={PRIMARY} />
          </TouchableOpacity>
        </View>

        {/* ── AI Symptom Checker Banner ── */}
        <View style={styles.aiBannerSection}>
          <Card style={styles.aiCard}>
            <View style={styles.aiRow}>
              <View style={styles.aiIconBox}>
                <MaterialCommunityIcons name="robot" size={32} color={PRIMARY} />
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={styles.aiTitle}>AI Symptom Checker</Text>
                <Text style={styles.aiSub}>Not feeling well? Talk to our AI health assistant now.</Text>
                <TouchableOpacity
                  style={styles.aiBtn}
                  onPress={() => navigation.navigate('AISymptomChecker')}
                >
                  <Text style={styles.aiBtnText}>Start Consultation</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        </View>

        {/* ── Membership Section ── */}
        <View style={styles.section}>
          <MembershipMiniCard
            user={user}
            onAction={() => navigation.navigate('Membership')}
          />
        </View>

        {/* ── Quick Services Section ── */}
        <View style={styles.section}>
          <SectionTitle title="Smart Services" />
          <View style={styles.servicesGrid}>
            <ServiceWidget icon="stethoscope" name="Consult" onPress={() => navigation.navigate('DoctorList')} />
            <ServiceWidget icon="pill" name="Pharmacy" onPress={() => navigation.navigate('Pharmacy')} />
            <ServiceWidget icon="microscope" name="Lab Tests" onPress={() => navigation.navigate('LabTests')} />
            <ServiceWidget icon="hospital-marker" name="Nearby" onPress={() => navigation.navigate('HospitalMap')} />
            <ServiceWidget icon="folder-heart" name="Vault" onPress={() => navigation.navigate('HealthRecords')} />
            <ServiceWidget icon="shield-star" name="Plans" onPress={() => navigation.navigate('Plans')} />
          </View>
        </View>

        {/* ── Upcoming Appointment Card ── */}
        {appointment.doctor && (
          <View style={styles.section}>
            <SectionTitle title="Upcoming Schedule" actionLabel="Details" onAction={() => navigation.navigate('Appointments')} />
            <Card style={styles.apptCard}>
              <View style={styles.apptDetails}>
                <View style={styles.apptIconBox}>
                  <MaterialCommunityIcons name="calendar-clock" size={28} color={PRIMARY} />
                </View>
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <Text style={styles.apptDoctor}>{appointment.doctor}</Text>
                  <Text style={styles.apptHospital}>{appointment.hospital}</Text>
                  <View style={styles.apptMeta}>
                    <Feather name="clock" size={14} color={SUBTEXT} />
                    <Text style={styles.apptTime}>{appointment.time}</Text>
                  </View>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* ── Nearby Hospitals Section ── */}
        <View style={styles.section}>
          <SectionTitle
            title="Nearby Hospitals"
            actionLabel="View Map"
            onAction={() => navigation.navigate('HospitalMap')}
          />
          {locationError && !hospitals.length ? (
            <View style={styles.errorBox}>
              <MaterialCommunityIcons name="map-marker-off" size={24} color={SUBTEXT} />
              <Text style={styles.errorText}>Enable location to find hospitals near you.</Text>
              <TouchableOpacity onPress={fetchHospitals} style={styles.retryBtn}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              horizontal
              data={hospitals}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <HospitalCard
                  hospital={item}
                  onPress={() => navigation.navigate('HospitalMap', { hospital: item })}
                />
              )}
              contentContainerStyle={{ paddingVertical: 10 }}
              ListEmptyComponent={
                hospitalsLoading ? (
                  <View style={styles.cardLoader}>
                    <ActivityIndicator size="small" color={PRIMARY} />
                  </View>
                ) : null
              }
            />
          )}
        </View>

        {/* ── Nearby Hospitals & Specialists (Horizontal) ── */}
        <View style={[styles.section, { marginBottom: 120 }]}>
          <SectionTitle
            title="Top Specialists"
            actionLabel="View All"
            onAction={() => navigation.navigate('DoctorList')}
          />
          <FlatList
            horizontal
            data={dashboard?.doctors || []}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.doctorMiniCard}
                onPress={() => navigation.navigate('DoctorProfile', { doctor: item })}
              >
                <Avatar name={item.name} image={item.avatar || item.profilePicture} size={60} />
                <Text style={styles.doctorName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.doctorSpec}>{item.specialization || 'Specialist'}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item, i) => (item.id || i).toString()}
          />
        </View>

      </ScrollView>

      {/* ── Floating Action Button ── */}
      <TouchableOpacity
        style={styles.floatingBtn}
        onPress={() => navigation.navigate('DoctorList')}
      >
        <MaterialCommunityIcons name="stethoscope" size={28} color="#fff" />
      </TouchableOpacity>

      <BottomTabBar activeTab={activeTab} onTabPress={handleTabPress} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 12, color: SUBTEXT, fontSize: 13, fontWeight: '500' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  greetingPre: { fontSize: 13, color: SUBTEXT, fontWeight: '500' },
  userName: { fontSize: 20, fontWeight: '800', color: TEXT },
  headerBtn: {
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center', alignItems: 'center',
  },
  badge: {
    position: 'absolute', top: 12, right: 12,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: PRIMARY,
    borderWidth: 2, borderColor: '#fff',
  },

  scroll: { paddingBottom: 40 },

  searchSection: { paddingHorizontal: 20, marginTop: 10 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 56,
  },
  searchText: { flex: 1, marginLeft: 12, fontSize: 14, color: SUBTEXT, fontWeight: '500' },

  aiBannerSection: { paddingHorizontal: 20, marginTop: 25 },
  aiCard: { padding: 20, backgroundColor: '#FFF5F5', borderWidth: 1, borderColor: '#FEE2E2' },
  aiRow: { flexDirection: 'row', alignItems: 'center' },
  aiIconBox: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    elevation: 2, shadowOpacity: 0.1,
  },
  aiTitle: { fontSize: 18, fontWeight: '800', color: TEXT },
  aiSub: { fontSize: 13, color: SUBTEXT, marginTop: 4, lineHeight: 18 },
  aiBtn: {
    marginTop: 15, alignSelf: 'flex-start',
    backgroundColor: PRIMARY,
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 10,
  },
  aiBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },

  section: { marginTop: 30, paddingHorizontal: 20 },
  memberCard: { borderRadius: 24, padding: 24, elevation: 8, shadowOpacity: 0.2 },
  memberHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  memberPlan: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  walletVal: { color: '#fff', fontSize: 32, fontWeight: '800', marginTop: 5 },
  walletLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  topupBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 6
  },
  topupText: { color: PRIMARY, fontSize: 12, fontWeight: '800' },

  servicesGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    marginTop: 15, gap: 12,
    justifyContent: 'space-between',
  },
  serviceItem: {
    width: (width - 64) / 3,
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  serviceIcon: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 10,
  },
  serviceText: { fontSize: 13, fontWeight: '700', color: TEXT },

  apptCard: { padding: 16, marginTop: 15, borderRadius: 20 },
  apptDetails: { flexDirection: 'row', alignItems: 'center' },
  apptIconBox: {
    width: 60, height: 60, borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center', alignItems: 'center',
  },
  apptDoctor: { fontSize: 17, fontWeight: '800', color: TEXT },
  apptHospital: { fontSize: 13, color: SUBTEXT, marginTop: 2 },
  apptMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  apptTime: { fontSize: 13, color: PRIMARY, fontWeight: '700' },

  doctorMiniCard: {
    width: 140, backgroundColor: '#fff',
    borderRadius: 24, padding: 15,
    marginRight: 15, marginTop: 15,
    alignItems: 'center',
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  doctorName: { fontSize: 15, fontWeight: '800', color: TEXT, marginTop: 12 },
  doctorSpec: { fontSize: 12, color: SUBTEXT, marginTop: 4 },

  floatingBtn: {
    position: 'absolute', bottom: 90, right: 20,
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: PRIMARY,
    justifyContent: 'center', alignItems: 'center',
    elevation: 8, shadowOpacity: 0.3,
  },

  errorBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  errorText: {
    color: SUBTEXT,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: PRIMARY,
  },
  retryText: {
    color: PRIMARY,
    fontSize: 13,
    fontWeight: '700',
  },
  cardLoader: {
    width: width - 40,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DashboardScreen;