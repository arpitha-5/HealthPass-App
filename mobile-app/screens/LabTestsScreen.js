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
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Shadows, Spacing, FontSize, FontWeight, BorderRadius } from '../theme/index';
import Card from '../components/Card';
import SectionTitle from '../components/SectionTitle';

const LabTestsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [tests, setTests] = useState([]);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    setLoading(true);
    // Real-world: const res = await apiClient.get('/tests');
    setTimeout(() => {
      setTests([
        { id: '1', name: 'Full Body Checkup', price: 1499, originalPrice: 2499, tests: 60, prep: 'Fasting 10-12 hrs', time: '24 hrs', home: true },
        { id: '2', name: 'Diabetes Screening', price: 499, originalPrice: 799, tests: 4, prep: 'Fasting 8-10 hrs', time: '12 hrs', home: true },
        { id: '3', name: 'Vitamin Profile', price: 999, originalPrice: 1599, tests: 2, prep: 'No prep required', time: '48 hrs', home: true },
        { id: '4', name: 'CBC (Hemogram)', price: 299, originalPrice: 399, tests: 1, prep: 'No prep required', time: '6 hrs', home: true },
      ]);
      setLoading(false);
    }, 1000);
  };

  const renderTest = ({ item }) => (
    <Card style={styles.tCard}>
       <View style={styles.tHeader}>
          <View style={{ flex: 1 }}>
             <Text style={styles.tName}>{item.name}</Text>
             <Text style={styles.tCount}>{item.tests} Parameters Included</Text>
             <View style={styles.tBadges}>
                <View style={[styles.tBadge, { backgroundColor: '#F0FDF4' }]}>
                   <MaterialCommunityIcons name="home-analytics" size={14} color="#15803D" />
                   <Text style={[styles.tBadgeText, { color: '#15803D' }]}>Home Collection</Text>
                </View>
                <View style={[styles.tBadge, { backgroundColor: '#EFF6FF' }]}>
                   <Feather name="clock" size={12} color="#1D4ED8" />
                   <Text style={[styles.tBadgeText, { color: '#1D4ED8' }]}>Reports in {item.time}</Text>
                </View>
             </View>
          </View>
          <View style={styles.tPriceBox}>
             <Text style={styles.tOldPrice}>₹{item.originalPrice}</Text>
             <Text style={styles.tPrice}>₹{item.price}</Text>
          </View>
       </View>
       <View style={styles.tDivider} />
       <View style={styles.tFooter}>
          <View style={styles.tPrep}>
             <Feather name="info" size={14} color="#6B7280" />
             <Text style={styles.tPrepText}>Prep: {item.prep}</Text>
          </View>
          <TouchableOpacity 
            style={styles.bookBtn} 
            onPress={() => navigation.navigate('Checkout', { 
              type: 'lab',
              items: [{ name: item.name, price: item.price }]
            })}
          >
             <Text style={styles.bookBtnText}>Book Now</Text>
          </TouchableOpacity>
       </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Diagnostics & Lab Tests</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Banner */}
        <View style={styles.promoBanner}>
           <LinearGradient colors={['#FEE2E2', '#fff']} style={styles.promoBg}>
              <View style={{ flex: 1 }}>
                 <Text style={styles.promoTitle}>NABL Certified Labs</Text>
                 <Text style={styles.promoSub}>Get accurate results from trusted partners with free home sample collection.</Text>
                 <View style={styles.certifiedBadges}>
                    <MaterialCommunityIcons name="certificate" size={24} color={Colors.primary} />
                    <MaterialCommunityIcons name="medal" size={24} color={Colors.primary} />
                 </View>
              </View>
           </LinearGradient>
        </View>

        <View style={styles.section}>
          <SectionTitle title="Health Packages" actionLabel="All Packages" />
          {loading ? (
             <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={tests}
              renderItem={renderTest}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FB' },
  header: { 
    flexDirection: 'row', alignItems: 'center', 
    justifyContent: 'space-between', padding: 20,
    backgroundColor: '#fff', 
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  headerPlaceholder: { width: 44 },
  
  scroll: { paddingBottom: 60 },
  promoBanner: { padding: 20 },
  promoBg: { 
    borderRadius: 20, padding: 20, 
    borderWidth: 1, borderColor: '#FEE2E2',
    ...Shadows.xs,
  },
  promoTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  promoSub: { fontSize: 13, color: '#475569', marginTop: 4, lineHeight: 18 },
  certifiedBadges: { flexDirection: 'row', gap: 10, marginTop: 15 },

  section: { paddingHorizontal: 20 },
  tCard: { padding: 16, marginBottom: 15, borderRadius: 20 },
  tHeader: { flexDirection: 'row' },
  tName: { fontSize: 17, fontWeight: '800', color: '#111827' },
  tCount: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  tBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  tBadge: { 
    flexDirection: 'row', alignItems: 'center', gap: 4, 
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
  },
  tBadgeText: { fontSize: 11, fontWeight: '700' },
  tPriceBox: { alignItems: 'flex-end' },
  tOldPrice: { fontSize: 12, color: '#94A3B8', textDecorationLine: 'line-through' },
  tPrice: { fontSize: 20, fontWeight: '800', color: '#111827', marginTop: 2 },
  
  tDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 15 },
  tFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tPrep: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  tPrepText: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  bookBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10,
  },
  bookBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
});

export default LabTestsScreen;
