import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { Colors, Shadows, Spacing, FontSize, FontWeight, BorderRadius } from '../theme/index';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import PrimaryButton from '../components/PrimaryButton';
import { supportService } from '../services/userServices';
import { MOCK_SUPPORT } from '../data/mockData';

const SupportScreen = ({ navigation }) => {
  const [tickets, setTickets] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketData, setTicketData] = useState({ subject: '', description: '', priority: 'Medium' });
  const [submitting, setSubmitting] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef();

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [ticketsRes, chatRes] = await Promise.all([
        supportService.getTickets(),
        supportService.getChatMessages()
      ]);
      if (ticketsRes.success) setTickets(ticketsRes.tickets || []);
      if (chatRes.success) setMessages(chatRes.messages || []);
    } catch (error) {
      console.log('Error fetching support data:', error);
      setTickets(MOCK_SUPPORT.tickets);
      setMessages(MOCK_SUPPORT.chatMessages);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      message: newMessage,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, userMessage]);
    setNewMessage('');

    setTimeout(() => {
      const autoReply = {
        id: messages.length + 2,
        sender: 'agent',
        message: 'Thank you for your message. An agent will respond shortly. In the meantime, you can check our FAQ section for quick answers.',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, autoReply]);
    }, 1000);
  };

  const handleCreateTicket = async () => {
    if (!ticketData.subject || !ticketData.description) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setSubmitting(true);
    try {
      const res = await supportService.createTicket(ticketData);
      if (res.success) {
        Alert.alert('Success', 'Ticket created successfully', [
          { text: 'OK', onPress: () => setShowTicketModal(false) }
        ]);
        fetchData();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const renderMessage = ({ item, index }) => {
    const isUser = item.sender === 'user';
    const isAgent = item.sender === 'agent';
    const isSystem = item.sender === 'system';

    if (isSystem) {
      return (
        <View style={styles.systemMessage}>
          <Text style={styles.systemMessageText}>{item.message}</Text>
        </View>
      );
    }

    return (
      <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
        {!isUser && (
          <View style={[styles.avatar, { backgroundColor: Colors.primaryLight }]}>
            <MaterialCommunityIcons name="headphones" size={18} color={Colors.primary} />
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.messageBubbleUser : styles.messageBubbleAgent]}>
          <Text style={[styles.messageText, isUser && styles.messageTextUser]}>{item.message}</Text>
          <Text style={[styles.messageTime, isUser && styles.messageTimeUser]}>{item.timestamp}</Text>
        </View>
        {isUser && (
          <View style={[styles.avatar, { backgroundColor: Colors.primary }]}>
            <MaterialCommunityIcons name="account" size={18} color="#fff" />
          </View>
        )}
      </View>
    );
  };

  const renderTicket = ({ item }) => (
    <Card style={styles.ticketCard}>
      <View style={styles.ticketHeader}>
        <Text style={styles.ticketNumber}>{item.ticketNumber}</Text>
        <StatusBadge status={item.status} size="sm" />
      </View>
      <Text style={styles.ticketSubject}>{item.subject}</Text>
      <Text style={styles.ticketDesc} numberOfLines={2}>{item.description}</Text>
      <View style={styles.ticketFooter}>
        <View style={styles.priorityBadge}>
          <MaterialCommunityIcons name="flag" size={12} color={item.priority === 'High' ? Colors.error : item.priority === 'Medium' ? Colors.warning : Colors.info} />
          <Text style={styles.priorityText}>{item.priority}</Text>
        </View>
        <Text style={styles.ticketDate}>
          {new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
        </Text>
      </View>
      {item.status === 'Resolved' && item.resolution && (
        <View style={styles.resolutionBox}>
          <MaterialCommunityIcons name="check-circle" size={16} color={Colors.success} />
          <Text style={styles.resolutionText}>{item.resolution}</Text>
        </View>
      )}
    </Card>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loaderText}>Loading support...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowTicketModal(true)}>
          <Feather name="plus" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'chat' && styles.activeTab]}
          onPress={() => setActiveTab('chat')}
        >
          <MaterialCommunityIcons name="chat" size={18} color={activeTab === 'chat' ? '#fff' : Colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'chat' && styles.activeTabText]}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'tickets' && styles.activeTab]}
          onPress={() => setActiveTab('tickets')}
        >
          <MaterialCommunityIcons name="ticket" size={18} color={activeTab === 'tickets' ? '#fff' : Colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'tickets' && styles.activeTabText]}>My Tickets</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'chat' ? (
        <KeyboardAvoidingView
          style={styles.chatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={100}
        >
          <FlatList
            ref={scrollRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd()}
          />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.messageInput}
              placeholder="Type your message..."
              placeholderTextColor={Colors.textTertiary}
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendBtn, !newMessage.trim() && styles.sendBtnDisabled]}
              onPress={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} tintColor={Colors.primary} />
          }
        >
          <TouchableOpacity style={styles.newTicketBtn} onPress={() => setShowTicketModal(true)}>
            <MaterialCommunityIcons name="plus-circle" size={22} color={Colors.primary} />
            <Text style={styles.newTicketText}>Raise New Ticket</Text>
          </TouchableOpacity>
          {tickets.length > 0 ? (
            tickets.map((item) => renderTicket({ item, key: item._id }))
          ) : (
            <EmptyState
              icon="ticket-outline"
              title="No Tickets"
              subtitle="Your support tickets will appear here"
            />
          )}
        </ScrollView>
      )}

      <Modal
        visible={showTicketModal}
        onClose={() => setShowTicketModal(false)}
        title="Raise Support Ticket"
      >
        <View style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Subject</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter subject"
              value={ticketData.subject}
              onChangeText={(text) => setTicketData({ ...ticketData, subject: text })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Priority</Text>
            <View style={styles.priorityOptions}>
              {['Low', 'Medium', 'High'].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.priorityOption, ticketData.priority === p && styles.priorityOptionActive]}
                  onPress={() => setTicketData({ ...ticketData, priority: p })}
                >
                  <Text style={[styles.priorityOptionText, ticketData.priority === p && styles.priorityOptionTextActive]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Describe your issue"
              multiline
              numberOfLines={4}
              value={ticketData.description}
              onChangeText={(text) => setTicketData({ ...ticketData, description: text })}
            />
          </View>
          <PrimaryButton
            title="Submit Ticket"
            onPress={handleCreateTicket}
            loading={submitting}
            style={{ marginTop: 16 }}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FB' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 10, color: Colors.textSecondary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.divider },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  backBtn: { padding: 5 },
  addBtn: { padding: 5 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 20, marginTop: 16, borderRadius: 12, padding: 4, ...Shadows.sm },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
  activeTab: { backgroundColor: Colors.primary },
  tabText: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary },
  activeTabText: { color: '#fff' },
  chatContainer: { flex: 1 },
  messagesList: { padding: 20, paddingBottom: 100 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 16 },
  messageRowUser: { justifyContent: 'flex-end' },
  avatar: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  messageBubble: { maxWidth: '75%', padding: 12, borderRadius: 16 },
  messageBubbleAgent: { backgroundColor: '#fff', borderBottomLeftRadius: 4, marginLeft: 8 },
  messageBubbleUser: { backgroundColor: Colors.primary, borderBottomRightRadius: 4, marginRight: 8 },
  messageText: { fontSize: 14, color: Colors.textPrimary, lineHeight: 20 },
  messageTextUser: { color: '#fff' },
  messageTime: { fontSize: 10, color: Colors.textTertiary, marginTop: 4, alignSelf: 'flex-end' },
  messageTimeUser: { color: 'rgba(255,255,255,0.7)' },
  systemMessage: { backgroundColor: Colors.gray100, padding: 12, borderRadius: 12, marginBottom: 16, alignItems: 'center' },
  systemMessageText: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center' },
  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: Colors.divider, gap: 12 },
  messageInput: { flex: 1, backgroundColor: Colors.gray50, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { backgroundColor: Colors.gray300 },
  scroll: { padding: 20, paddingBottom: 120 },
  newTicketBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.primary, marginBottom: 20, gap: 10 },
  newTicketText: { color: Colors.primary, fontWeight: '700', fontSize: 15 },
  ticketCard: { marginBottom: 16, padding: 16 },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  ticketNumber: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  ticketSubject: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  ticketDesc: { fontSize: 13, color: Colors.textSecondary, marginTop: 4, lineHeight: 18 },
  ticketFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.divider },
  priorityBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  priorityText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  ticketDate: { fontSize: 11, color: Colors.textTertiary },
  resolutionBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.successLight, padding: 10, borderRadius: 8, marginTop: 12, gap: 8 },
  resolutionText: { flex: 1, fontSize: 12, color: Colors.success },
  modalContent: { padding: 0 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, marginBottom: 8 },
  textInput: { backgroundColor: Colors.gray50, borderRadius: 12, padding: 14, fontSize: 14, borderWidth: 1, borderColor: Colors.border },
  textArea: { height: 100, textAlignVertical: 'top' },
  priorityOptions: { flexDirection: 'row', gap: 10 },
  priorityOption: { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  priorityOptionActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  priorityOptionText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  priorityOptionTextActive: { color: '#fff' },
});

export default SupportScreen;
