import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { Colors, Shadows, Spacing, FontSize, FontWeight, BorderRadius } from '../theme/index';
import Card from '../components/Card';
import SectionTitle from '../components/SectionTitle';

const { width } = Dimensions.get('window');

const PharmacyScreen = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    setLoading(true);
    // Real-world: const res = await apiClient.get('/medicines');
    // Using demo data
    setTimeout(() => {
      setMedicines([
        { id: '1', name: 'Paracetamol 500mg', brand: 'Crocin', price: 45, type: 'Tablet', strip: '15 Tablets', img: 'pill' },
        { id: '2', name: 'Vitamin C 500mg', brand: 'Limcee', price: 90, type: 'Chewable', strip: '30 Tablets', img: 'pill' },
        { id: '3', name: 'Hand Sanitizer', brand: 'Dettol', price: 50, type: 'Liquid', strip: '50ml', img: 'flask-outline' },
        { id: '4', name: 'Pain Relief Spray', brand: 'Volini', price: 180, type: 'Spray', strip: '60g', img: 'spray' },
      ]);
      setLoading(false);
    }, 1000);
  };

  const addToCart = (item) => {
    setCart(prev => [...prev, item]);
  };

  const renderMedicine = ({ item }) => (
    <Card style={styles.mCard}>
      <View style={styles.mRow}>
        <View style={styles.mIconBg}>
           <MaterialCommunityIcons name={item.img} size={32} color={Colors.primary} />
        </View>
        <View style={{ flex: 1, marginLeft: 15 }}>
          <Text style={styles.mBrand}>{item.brand}</Text>
          <Text style={styles.mName}>{item.name}</Text>
          <Text style={styles.mStrip}>{item.strip} strip</Text>
          <View style={styles.mFooter}>
            <Text style={styles.mPrice}>₹{item.price}</Text>
            <TouchableOpacity 
              style={styles.addBtn}
              onPress={() => addToCart(item)}
            >
               <Feather name="plus" size={16} color={Colors.primary} />
               <Text style={styles.addBtnText}>ADD</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <View style={{ marginLeft: 15 }}>
            <Text style={styles.headerTitle}>Pharmacy Store</Text>
            <Text style={styles.headerSub}>Deliver to: Mumbai, 400001</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.cartBtn} onPress={() => navigation.navigate('Checkout')}>
          <Feather name="shopping-cart" size={22} color="#111827" />
          {cart.length > 0 && <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{cart.length}</Text></View>}
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color="#64748B" />
          <TextInput
            placeholder="Search generic or brand name"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Categories Carousel (Mock) */}
        <View style={styles.categorySection}>
           <FlatList
             data={[
               { name: 'Cold', icon: 'weather-snowy' },
               { name: 'Stomach', icon: 'stomach' },
               { name: 'Skin', icon: 'hands-pray' },
               { name: 'Vitamins', icon: 'bottle-tonic-plus' },
             ]}
             horizontal
             showsHorizontalScrollIndicator={false}
             renderItem={({ item }) => (
               <View style={styles.catItem}>
                 <View style={styles.catIcon}><MaterialCommunityIcons name={item.icon} size={24} color={Colors.primary} /></View>
                 <Text style={styles.catLabel}>{item.name}</Text>
               </View>
             )}
             keyExtractor={item => item.name}
             contentContainerStyle={{ paddingHorizontal: 20 }}
           />
        </View>

        <View style={styles.section}>
          <View style={styles.offerCard}>
             <View style={{ flex: 1 }}>
               <Text style={styles.offerTitle}>Up to 25% OFF</Text>
               <Text style={styles.offerSub}>On all chronic medicines with HealthPass Pro.</Text>
               <TouchableOpacity style={styles.offerBtn}><Text style={styles.offerBtnText}>Subscribe Now</Text></TouchableOpacity>
             </View>
             <MaterialCommunityIcons name="pill" size={60} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', right: -10, bottom: -10 }} />
          </View>

          <SectionTitle title="Popular Products" />
          {loading ? (
             <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={medicines.filter(m => m.name.toLowerCase().includes(search.toLowerCase()))}
              renderItem={renderMedicine}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>

      {/* Checkout Row */}
      {cart.length > 0 && (
         <View style={styles.checkRow}>
            <View>
              <Text style={styles.checkTotal}>₹{cart.reduce((acc, c) => acc + c.price, 0)}</Text>
              <Text style={styles.checkItems}>{cart.length} items added</Text>
            </View>
            <TouchableOpacity 
              style={styles.checkoutBtn} 
              onPress={() => navigation.navigate('Checkout', { 
                type: 'pharmacy',
                items: cart 
              })}
            >
               <Text style={styles.checkoutText}>View Cart</Text>
               <Feather name="chevron-right" size={20} color="#fff" />
            </TouchableOpacity>
         </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 20,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  headerSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  cartBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  cartBadge: {
    position: 'absolute', top: 5, right: 5,
    backgroundColor: Colors.primary, width: 18, height: 18,
    borderRadius: 9, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  cartBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  
  searchContainer: { paddingHorizontal: 20, paddingBottom: 15 },
  searchBar: {
    backgroundColor: '#F1F5F9',
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 15, height: 50, borderRadius: 12,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15 },
  
  scroll: { paddingBottom: 100 },
  categorySection: { marginTop: 15 },
  catItem: { alignItems: 'center', marginRight: 25 },
  catIcon: { 
    width: 60, height: 60, borderRadius: 15,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center', alignItems: 'center',
  },
  catLabel: { fontSize: 12, fontWeight: '700', color: '#475569', marginTop: 8 },

  section: { padding: 20, marginTop: 10 },
  offerCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20, padding: 20, marginBottom: 25,
    overflow: 'hidden',
  },
  offerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  offerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 },
  offerBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 15, paddingVertical: 8,
    borderRadius: 10, alignSelf: 'flex-start', marginTop: 15,
  },
  offerBtnText: { color: '#fff', fontSize: 12, fontWeight: '800' },

  mCard: { padding: 16, marginBottom: 15, borderRadius: 18 },
  mRow: { flexDirection: 'row' },
  mIconBg: {
    width: 70, height: 70, borderRadius: 15,
    backgroundColor: '#F8F9FB', borderWidth: 1, borderColor: '#F1F5F9',
    justifyContent: 'center', alignItems: 'center',
  },
  mBrand: { fontSize: 11, fontWeight: '800', color: Colors.primary, textTransform: 'uppercase' },
  mName: { fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 2 },
  mStrip: { fontSize: 13, color: '#64748B', marginTop: 2 },
  mFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  mPrice: { fontSize: 18, fontWeight: '800', color: '#111827' },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: Colors.primary,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
  },
  addBtnText: { color: Colors.primary, fontWeight: '800', fontSize: 13 },

  checkRow: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', padding: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: '#F1F5F9',
    ...Shadows.lg,
  },
  checkTotal: { fontSize: 22, fontWeight: '800', color: '#111827' },
  checkItems: { fontSize: 12, color: '#64748B', marginTop: 2 },
  checkoutBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 25, paddingVertical: 12, borderRadius: 14,
  },
  checkoutText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});

export default PharmacyScreen;
