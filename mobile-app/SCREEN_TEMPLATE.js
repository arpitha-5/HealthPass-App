/**
 * HealthPass App - Correct Screen Structure Template
 * 
 * Every screen MUST follow this exact structure to work properly
 * with React Navigation Native Stack and Expo SDK 54+
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons'; // Optional icons

import PrimaryButton from '../components/PrimaryButton';
import Theme from '../components/Theme';

// ✅ 1. DEFINE COMPONENT WITH PROPER PARAMETERS
// Must accept { navigation, route } from React Navigation
const TemplateScreen = ({ navigation, route }) => {
  // ✅ 2. SAFELY EXTRACT ROUTE PARAMETERS
  const params = route?.params || {};

  // ✅ 3. DEFINE STATE
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ 4. USE EFFECTS FOR INITIALIZATION
  useEffect(() => {
    console.log('🎯 TemplateScreen: Component mounted');
    // Initialization logic here
    return () => {
      console.log('🗑️ TemplateScreen: Component unmounted');
    };
  }, []);

  // ✅ 5. DEFINE HANDLERS
  const handleNavigateNext = async () => {
    try {
      setLoading(true);
      // Your logic here
      navigation.navigate('NextScreen', {
        // Pass params to next screen
        previousData: params,
      });
    } catch (err) {
      setError(err.message);
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  // ✅ 6. RENDER JSX
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack}>
            <Feather name="arrow-left" size={24} color={Theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Screen Title</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Main content */}
        <View style={styles.content}>
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Text style={styles.subtitle}>Your content here</Text>
        </View>

        {/* Bottom actions */}
        <View style={styles.footer}>
          <PrimaryButton
            title="Continue"
            onPress={handleNavigateNext}
            loading={loading}
            disabled={loading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ✅ 7. DEFINE STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background || '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  subtitle: {
    fontSize: 16,
    color: Theme.colors.textSecondary || '#666',
    marginBottom: 16,
  },
  errorBox: {
    backgroundColor: '#fee',
    borderColor: '#f00',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#f00',
    fontSize: 14,
  },
  footer: {
    paddingVertical: 16,
    gap: 12,
  },
});

// ✅ 8. ALWAYS EXPORT AS DEFAULT
// This is critical - without it, the import will fail!
export default TemplateScreen;

/**
 * COMMON MISTAKES TO AVOID ❌
 * 
 * ❌ DO NOT use named exports:
 *    export const TemplateScreen = () => { ... }
 *    Should be: const TemplateScreen = () => { ... } then export default TemplateScreen
 * 
 * ❌ DO NOT forget navigation/route parameters:
 *    const TemplateScreen = () => { ... }
 *    Should be: const TemplateScreen = ({ navigation, route }) => { ... }
 * 
 * ❌ DO NOT export different name:
 *    const MyScreen = () => { ... }
 *    export default SomeOtherName;
 * 
 * ❌ DO NOT forget SafeAreaView wrapper
 * 
 * ❌ DO NOT use console.log at module level (outside components)
 * 
 * ❌ DO NOT have circular imports between screens
 */

/**
 * TESTING CHECKLIST ✅
 * 
 * [ ] Component renders without errors
 * [ ] Navigation props available and working
 * [ ] Route parameters accessible
 * [ ] All buttons and handlers work
 * [ ] No console errors or warnings
 * [ ] SafeAreaView properly wraps content
 * [ ] Styles are responsive
 * [ ] Loading states work
 * [ ] Error handling works
 * [ ] Navigation to next screen works
 * [ ] Back button works
 */
