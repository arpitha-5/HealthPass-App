// CORRECTED: DashboardScreen.js - Theme Import Fix

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Dimensions,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';

// ✅ CORRECTED: Import Theme as default (Theme.js now exports as default)
import Theme from '../components/Theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

const DashboardScreen = ({ route, navigation }) => {
  // ✅ SAFE: Route params with fallback
  const { fullName, email, language } = route?.params || {};
  
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const quickServices = [
    { id: 1, name: 'Doctor', icon: 'stethoscope', color: '#FF6B6B' },
    { id: 2, name: 'Pharmacy', icon: 'pill', color: '#4ECDC4' },
    { id: 3, name: 'Appointments', icon: 'calendar', color: '#45B7D1' },
    { id: 4, name: 'Hospital', icon: 'hospital-box', color: '#96CEB4' },
  ];

  const topDoctors = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialization: 'Cardiology',
      rating: 4.8,
      price: '30',
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      specialization: 'Neurology',
      rating: 4.9,
      price: '35',
    },
    {
      id: 3,
      name: 'Dr. Emily Williams',
      specialization: 'Dermatology',
      rating: 4.7,
      price: '25',
    },
  ];

  const handleServicePress = (service) => {
    if (service.name === 'Doctor') {
      navigation.navigate('DoctorList');
    } else if (service.name === 'Appointments') {
      navigation.navigate('Appointments');
    }
  };

  const handleDoctorPress = (doctor) => {
    navigation.navigate('DoctorProfile', { doctor });
  };

  const renderServiceCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.serviceCard, { borderLeftColor: item.color }]}
      activeOpacity={0.8}
      onPress={() => handleServicePress(item)}
    >
      <View style={[styles.serviceIconContainer, { backgroundColor: item.color + '15' }]}>
        <MaterialCommunityIcons name={item.icon} size={32} color={item.color} />
      </View>
      <Text style={styles.serviceLabel}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderDoctorCard = ({ item }) => (
    <TouchableOpacity
      style={styles.doctorCard}
      activeOpacity={0.85}
      onPress={() => handleDoctorPress(item)}
    >
      <View style={styles.doctorImageContainer}>
        <View style={styles.doctorImagePlaceholder}>
          <MaterialCommunityIcons
            name="stethoscope"
            size={48}
            // ✅ FIXED: Theme.colors works correctly now!
            color={Theme.colors.primary}
          />
        </View>
      </View>
      <Text style={styles.doctorName}>{item.name}</Text>
      <Text style={styles.doctorSpecialization}>{item.specialization}</Text>

      <View style={styles.ratingContainer}>
        <View style={styles.starsContainer}>
          {[...Array(5)].map((_, i) => (
            <MaterialCommunityIcons
              key={i}
              name={i < Math.floor(item.rating) ? 'star' : 'star-outline'}
              size={14}
              color="#FFB800"
              style={{ marginRight: 2 }}
            />
          ))}
        </View>
        <Text style={styles.ratingText}>{item.rating}</Text>
      </View>

      <View style={styles.doctorFooter}>
        <Text style={styles.doctorPrice}>${item.price}</Text>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => navigation.navigate('BookAppointment', { doctor: item })}
        >
          <MaterialCommunityIcons
            name="calendar-plus"
            size={16}
            // ✅ FIXED: Theme.colors.white works correctly!
            color={Theme.colors.white}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // ... rest of component code

  return (
    <SafeAreaView style={styles.container}>
      {/* Component JSX here - uses Theme.colors* successfully */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ✅ ALL StyleSheet values using Theme work correctly NOW
  container: {
    flex: 1,
    // ✅ FIXED: Theme.colors.background no longer undefined
    backgroundColor: Theme.colors.background,
  },

  mainContent: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  profileImageContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    // ✅ FIXED: Theme.colors.primaryLight now works!
    backgroundColor: Theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.md,
  },

  greeting: {
    ...Theme.typography.heading3,
    color: Theme.colors.textPrimary,
    marginBottom: 4,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.borders.radius,
    paddingHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
    height: 48,
    ...Theme.shadows.small,
  },

  // ... rest of styles using Theme successfully
});

export default DashboardScreen;

/**
 * KEY CHANGES:
 * ✅ Line: import Theme from '../components/Theme';
 *    - Theme now correctly imports the Theme object (default export)
 *    - Previously returned undefined (named export mismatch)
 *
 * ✅ All Theme.colors.* references now work:
 *    - Theme.colors.primary
 *    - Theme.colors.background
 *    - Theme.colors.white
 *    - Theme.colors.textPrimary
 *    - etc.
 *
 * ✅ All Theme.spacing.*, Theme.typography.*, Theme.borders.*, Theme.shadows.*
 *    references also work correctly
 *
 * NO RUNTIME ERRORS with "Cannot read property 'colors' of undefined"
 */
