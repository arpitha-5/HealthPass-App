import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Share,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
// import * as DocumentPicker from 'expo-document-picker';
import { Colors, Spacing, FontSize, FontWeight, Shadows, BorderRadius } from '../theme/index';
import Card from '../components/Card';
import SectionTitle from '../components/SectionTitle';

const HealthRecordsScreen = ({ navigation }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Initial load: Fetch existing records from backend
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    // Real-world: const res = await apiClient.get('/records');
    // For now, simulating list
    setTimeout(() => {
      setRecords([
        { id: '1', title: 'Blood Test Report', date: '12 Mar 2026', type: 'PDF', category: 'Lab Report' },
        { id: '2', title: 'Chest X-Ray', date: '05 Mar 2026', type: 'JPG', category: 'Diagnostic' },
        { id: '3', title: 'Apt. Prescription', date: '01 Mar 2026', type: 'PDF', category: 'Prescription' },
      ]);
      setLoading(false);
    }, 1000);
  };

  const handlePickDocument = async () => {
    try {
      // Temporarily disabled
      alert('Document picker not available on web yet');
      /*
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUploading(true);
        setTimeout(() => {
          setRecords(prev => [{
            id: Date.now().toString(),
            title: file.name,
            date: 'Just Now',
            type: file.mimeType === 'application/pdf' ? 'PDF' : 'IMG',
            category: 'Uploaded'
          }, ...prev]);
          setUploading(false);
        }, 1500);
      }
      */
    } catch (err) {
      console.log('Pick error:', err);
    }
  };

  const onShare = async (item) => {
     try {
       await Share.share({
         message: `HealthPass Record: ${item.title} (${item.date})`,
       });
     } catch (err) { console.log(err); }
  };

  const renderRecord = ({ item }) => (
    <Card style={styles.rCard}>
      <View style={styles.rRow}>
        <View style={[styles.rIconBox, { backgroundColor: item.type === 'PDF' ? '#FEE2E2' : '#DBEAFE' }]}>
          <MaterialCommunityIcons 
            name={item.type === 'PDF' ? 'file-pdf-box' : 'file-image-outline'} 
            size={24} 
            color={item.type === 'PDF' ? Colors.primary : '#3B82F6'} 
          />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.rTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.rMeta}>{item.category} • {item.date}</Text>
        </View>
        <TouchableOpacity style={styles.rAction} onPress={() => onShare(item)}>
           <Feather name="share-2" size={20} color={Colors.primary} />
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
        <Text style={styles.headerTitle}>Digital Health Vault</Text>
        <TouchableOpacity style={styles.headerMore}>
          <Feather name="shield" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Banner */}
        <LinearGradient colors={[Colors.primary, '#B71C1C']} style={styles.banner}>
           <MaterialCommunityIcons name="shield-lock" size={40} color="#fff" />
           <View style={{ flex: 1, marginLeft: 16 }}>
             <Text style={styles.bannerTitle}>Secure Storage</Text>
             <Text style={styles.bannerSubtitle}>All your medical records are encrypted and stored safely.</Text>
           </View>
        </LinearGradient>

        <View style={styles.section}>
          <SectionTitle title="Stored Records" actionLabel="Filter" />
          
          {loading ? (
            <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={records}
              renderItem={renderRecord}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              ListEmptyComponent={<Text style={styles.empty}>No records uploaded yet.</Text>}
            />
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={handlePickDocument}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Feather name="plus" size={24} color="#fff" />
            <Text style={styles.fabText}>Upload Report</Text>
          </>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// Double-check the styles for text components as well
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FB' },
  header: { 
    flexDirection: 'row', alignItems: 'center', 
    justifyContent: 'space-between', padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  scroll: { paddingBottom: 120 },
  banner: {
    margin: 20, padding: 20, borderRadius: 20,
    flexDirection: 'row', alignItems: 'center',
    ...Shadows.md,
  },
  bannerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  bannerSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },
  section: { paddingHorizontal: 20 },
  rCard: { padding: 16, marginBottom: 12, borderRadius: 18 },
  rRow: { flexDirection: 'row', alignItems: 'center' },
  rIconBox: { 
    width: 48, height: 48, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  rTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  rMeta: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  rAction: { padding: 8 },
  empty: { textAlign: 'center', color: '#6B7280', marginTop: 40 },
  fab: {
    position: 'absolute', bottom: 30, right: 20, left: 20,
    backgroundColor: Colors.primary,
    height: 56, borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    ...Shadows.lg, gap: 10,
  },
  fabText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});

export default HealthRecordsScreen;
