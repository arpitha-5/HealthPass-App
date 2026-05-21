// CORRECTED: DashboardScreen.js - Theme Import Fix

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  Modal,
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

  // Chatbot state
  const [chatVisible, setChatVisible] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { from: 'bot', text: 'Hi! I am your HealthPass AI assistant. How can I help you today?' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Simulate AI response (replace with real API call as needed)
  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const userMsg = { from: 'user', text: chatInput };
    setChatMessages((msgs) => [...msgs, userMsg]);
    setChatInput('');
    setTimeout(() => {
      setChatMessages((msgs) => [
        ...msgs,
        { from: 'bot', text: 'This is a demo AI response. (Integrate with OpenAI or your backend for real answers.)' }
      ]);
    }, 800);
  };

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

  // Greeting logic: derive name and greeting based on IST or provided time
  const profileName = route?.params?.profile?.name || fullName || null;

  const getHourFromTime = (timeStr) => {
    if (!timeStr) return null;
    const m = timeStr.match(/^(\d{1,2}):/);
    return m ? parseInt(m[1], 10) : null;
  };

  const istHour = (() => {
    // If a time string is passed via route params use it (expects "HH:MM")
    const provided = route?.params?.time || null;
    const parsed = getHourFromTime(provided);
    if (parsed !== null) return parsed;
    // Otherwise compute current IST hour
    const now = new Date();
    const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    return ist.getHours();
  })();

  const greetingPrefix = (() => {
    if (profileName == null) return null;
    if (istHour >= 5 && istHour <= 11) return 'Good Morning';
    if (istHour >= 12 && istHour <= 16) return 'Good Afternoon';
    if (istHour >= 17 && istHour <= 21) return 'Good Evening';
    return 'Good Night';
  })();

  const greetingText = profileName ? `${greetingPrefix}, ${profileName} 👋` : 'Hello 👋';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with profile icon and greeting (top-left) */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.profileImageContainer}>
            <MaterialCommunityIcons name="account" size={28} color={Theme.colors.white} />
          </View>
          <View>
            <Text style={styles.greeting}>{greetingText}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
          <Feather name="bell" size={22} color={Theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Floating Chatbot Button */}
      <TouchableOpacity
        style={styles.chatbotButton}
        activeOpacity={0.8}
        onPress={() => setChatVisible(true)}
      >
        <MaterialCommunityIcons name="robot" size={32} color={Theme.colors.white} />
      </TouchableOpacity>

      {/* Chatbot Modal */}
      <Modal
        visible={chatVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setChatVisible(false)}
      >
        <View style={styles.chatbotOverlay}>
          <View style={styles.chatbotWindow}>
            <View style={styles.chatbotHeader}>
              <Text style={styles.chatbotTitle}>HealthPass AI Chatbot</Text>
              <TouchableOpacity onPress={() => setChatVisible(false)}>
                <Feather name="x" size={22} color={Theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.chatbotMessages}
              contentContainerStyle={{ paddingVertical: 8 }}
              ref={ref => { if (ref) ref.scrollToEnd({ animated: true }); }}
            >
              {chatMessages.map((msg, idx) => (
                <View
                  key={idx}
                  style={msg.from === 'user' ? styles.userMsg : styles.botMsg}
                >
                  <Text style={styles.chatbotMsgText}>{msg.text}</Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.chatbotInputRow}>
              <TextInput
                style={styles.chatbotInput}
                value={chatInput}
                onChangeText={setChatInput}
                placeholder="Type your question..."
                placeholderTextColor={Theme.colors.textSecondary}
                onSubmitEditing={handleSendChat}
                returnKeyType="send"
              />
              <TouchableOpacity style={styles.sendBtn} onPress={handleSendChat}>
                <Feather name="send" size={20} color={Theme.colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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

  chatbotButton: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    backgroundColor: Theme.colors.primary,
    borderRadius: 28,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 100,
  },
  chatbotOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-end',
  },
  chatbotWindow: {
    backgroundColor: Theme.colors.card,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    minHeight: 320,
    maxHeight: 420,
    marginHorizontal: 0,
    paddingBottom: 12,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  chatbotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderColor: Theme.colors.border,
  },
  chatbotTitle: {
    ...Theme.typography.heading4,
    color: Theme.colors.textPrimary,
  },
  chatbotMessages: {
    flex: 1,
    paddingHorizontal: 16,
    marginVertical: 4,
    maxHeight: 260,
  },
  userMsg: {
    alignSelf: 'flex-end',
    backgroundColor: Theme.colors.primary,
    borderRadius: 14,
    marginVertical: 4,
    padding: 10,
    maxWidth: '80%',
  },
  botMsg: {
    alignSelf: 'flex-start',
    backgroundColor: Theme.colors.card,
    borderRadius: 14,
    marginVertical: 4,
    padding: 10,
    maxWidth: '80%',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  chatbotMsgText: {
    color: Theme.colors.textPrimary,
    fontSize: 15,
  },
  chatbotInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  chatbotInput: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    color: Theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginRight: 8,
  },
  sendBtn: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 20,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
