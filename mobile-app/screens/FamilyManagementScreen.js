import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { Colors, Shadows, Spacing, FontSize, FontWeight, BorderRadius } from '../theme/index';
import Card from '../components/Card';
import { userAPI } from '../services/apiService';

const FamilyManagementScreen = ({ navigation }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await userAPI.getFamilyMembers();
      if (res.success) {
        setMembers(res.familyMembers || []);
      }
    } catch (err) {
      console.log('Error fetching family:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleDeleteMember = async (id, name) => {
    Alert.alert(
      'Remove Family Member',
      `Are you sure you want to remove ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await userAPI.deleteFamilyMember(id);
              if (res.success) {
                Alert.alert('Success', 'Family member removed successfully');
                fetchMembers();
              }
            } catch (err) {
              Alert.alert('Error', 'Failed to remove family member');
            }
          }
        }
      ]
    );
  };

  const renderMember = ({ item }) => (
    <Card style={styles.memberCard}>
      <View style={styles.memberRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name?.[0]?.toUpperCase() || 'F'}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 15 }}>
          <Text style={styles.memberName}>{item.name}</Text>
          <Text style={styles.memberMeta}>{item.relationship} • {item.age} years</Text>
        </View>
        <TouchableOpacity 
          style={styles.deleteBtn}
          onPress={() => handleDeleteMember(item._id || item.id, item.name)}
        >
           <Feather name="trash-2" size={18} color={Colors.error} />
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
        <Text style={styles.headerTitle}>Family Members</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={{ flex: 1 }}>
        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loaderText}>Loading family...</Text>
          </View>
        ) : (
          <FlatList
            data={members}
            renderItem={renderMember}
            keyExtractor={item => item._id || item.id}
            contentContainerStyle={styles.list}
            ListHeaderComponent={
              <View style={styles.infoBox}>
                 <MaterialCommunityIcons name="information" size={20} color={Colors.info} />
                 <Text style={styles.infoText}>Family members added here will be eligible for cashless appointments under your plan.</Text>
              </View>
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <MaterialCommunityIcons name="account-group-outline" size={60} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>No Family Members Yet</Text>
                <Text style={styles.emptySub}>Add your loved ones to manage their health together.</Text>
              </View>
            }
          />
        )}
      </View>

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('AddFamilyMember', { onComplete: fetchMembers })}
      >
        <Feather name="plus" size={20} color="#fff" />
        <Text style={styles.addButtonText}>Add Family Member</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FB' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  list: { padding: 20, paddingBottom: 100 },
  infoBox: { 
    flexDirection: 'row', backgroundColor: '#EFF6FF', 
    padding: 15, borderRadius: 15, marginBottom: 20, gap: 10 
  },
  infoText: { flex: 1, fontSize: 12, color: '#3B82F6', lineHeight: 18, fontWeight: '500' },
  memberCard: { marginBottom: 15, borderRadius: 18, padding: 12 },
  memberRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { 
    width: 44, height: 44, borderRadius: 22, 
    backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' 
  },
  avatarText: { color: Colors.primary, fontWeight: '800', fontSize: 16 },
  memberName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  memberMeta: { fontSize: 13, color: '#64748B', marginTop: 2 },
  deleteBtn: { padding: 8 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 10, color: '#64748B' },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginTop: 20 },
  emptySub: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 8, paddingHorizontal: 40 },
  addButton: {
    position: 'absolute', bottom: 30, right: 20, left: 20,
    backgroundColor: Colors.primary, height: 56, borderRadius: 28,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, ...Shadows.lg,
  },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});

export default FamilyManagementScreen; 
