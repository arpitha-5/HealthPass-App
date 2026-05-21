import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { Colors, Shadows, Spacing, FontSize, BorderRadius } from '../theme/index';
import { AuthContext } from '../context/AuthContext';

const ChatScreen = ({ route, navigation }) => {
  const { hospital, hospitalId } = route.params || {};
  const { user } = React.useContext(AuthContext);
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef(null);

  const hospitalInfo = hospital || {
    _id: hospitalId,
    name: 'Hospital Support',
    avatar: null,
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockMessages = [
        {
          _id: '1',
          senderId: 'hospital',
          senderType: 'hospital',
          message: `Hello! Welcome to ${hospitalInfo.name || 'HealthPass Support'}. How can I assist you today?`,
          timestamp: new Date(Date.now() - 3600000),
          read: true,
        },
        {
          _id: '2',
          senderId: user?._id || 'user',
          senderType: 'user',
          message: 'Hi, I have a question about my appointment.',
          timestamp: new Date(Date.now() - 1800000),
          read: true,
        },
        {
          _id: '3',
          senderId: 'hospital',
          senderType: 'hospital',
          message: 'Sure, I would be happy to help. What would you like to know?',
          timestamp: new Date(Date.now() - 600000),
          read: true,
        },
      ];
      setMessages(mockMessages);
    } catch (error) {
      console.log('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const newMessage = {
      _id: Date.now().toString(),
      senderId: user?._id || 'user',
      senderType: 'user',
      message: inputText.trim(),
      timestamp: new Date(),
      read: true,
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setSending(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsTyping(true);
      
      setTimeout(() => {
        setIsTyping(false);
        const reply = {
          _id: (Date.now() + 1).toString(),
          senderId: 'hospital',
          senderType: 'hospital',
          message: getAutoReply(inputText.trim()),
          timestamp: new Date(),
          read: false,
        };
        setMessages(prev => [...prev, reply]);
      }, 2000);
    } catch (error) {
      console.log('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const getAutoReply = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('appointment') || lowerMessage.includes('booking')) {
      return 'For appointment-related queries, you can book, reschedule, or cancel appointments from the Appointments section in your dashboard. Would you like me to help you with something specific?';
    }
    if (lowerMessage.includes('bill') || lowerMessage.includes('payment')) {
      return 'You can upload your medical bills in the Bills section to earn wallet credits. Bills are typically reviewed within 3 hours. Is there anything specific about billing I can help with?';
    }
    if (lowerMessage.includes('wallet') || lowerMessage.includes('credit')) {
      return 'Your wallet credits can be used for any service within the app. You can earn credits by uploading bills or referring friends. Would you like to know more about earning credits?';
    }
    if (lowerMessage.includes('family') || lowerMessage.includes('member')) {
      return 'You can add family members from your profile settings. The number of family members you can add depends on your current plan. What would you like to do?';
    }
    if (lowerMessage.includes('insurance') || lowerMessage.includes('claim')) {
      return 'For insurance claims, please visit the Insurance section. You can submit claims and track their status there. Need help with a specific claim?';
    }
    if (lowerMessage.includes('diagnostic') || lowerMessage.includes('test') || lowerMessage.includes('lab')) {
      return 'You can book diagnostic tests from the Diagnostics section. Your plan determines the discount you receive on tests. Would you like to book a test?';
    }
    if (lowerMessage.includes('thank')) {
      return 'You\'re welcome! Is there anything else I can help you with today?';
    }
    if (lowerMessage.includes('help')) {
      return 'I can help you with:\n• Appointment booking & cancellation\n• Bill uploads & wallet credits\n• Plan & membership queries\n• Insurance claims\n• Family member management\n\nWhat would you like assistance with?';
    }
    
    return 'Thank you for your message. A support representative will get back to you shortly. In the meantime, is there anything else I can help you with?';
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  const renderMessage = ({ item, index }) => {
    const isUser = item.senderType === 'user';
    const showDate = index === 0 || 
      new Date(item.timestamp).toDateString() !== 
      new Date(messages[index - 1]?.timestamp).toDateString();

    return (
      <View>
        {showDate && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateText}>{formatDate(item.timestamp)}</Text>
          </View>
        )}
        <View style={[styles.messageRow, isUser && styles.userMessageRow]}>
          {!isUser && (
            <View style={styles.hospitalAvatar}>
              <MaterialCommunityIcons name="hospital-building" size={20} color="#fff" />
            </View>
          )}
          <View style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.hospitalBubble
          ]}>
            <Text style={[
              styles.messageText,
              isUser && styles.userMessageText
            ]}>
              {item.message}
            </Text>
            <View style={[styles.messageFooter, isUser && styles.userMessageFooter]}>
              <Text style={[styles.timestamp, isUser && styles.userTimestamp]}>
                {formatTime(item.timestamp)}
              </Text>
              {isUser && item.read && (
                <MaterialCommunityIcons name="check-all" size={14} color="#10B981" />
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;
    
    return (
      <View style={styles.messageRow}>
        <View style={styles.hospitalAvatar}>
          <MaterialCommunityIcons name="hospital-building" size={20} color="#fff" />
        </View>
        <View style={[styles.messageBubble, styles.hospitalBubble, styles.typingBubble]}>
          <View style={styles.typingIndicator}>
            <View style={[styles.typingDot, styles.typingDot1]} />
            <View style={[styles.typingDot, styles.typingDot2]} />
            <View style={[styles.typingDot, styles.typingDot3]} />
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
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
        <View style={styles.headerInfo}>
          <View style={styles.headerAvatar}>
            <MaterialCommunityIcons name="hospital-building" size={20} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>{hospitalInfo.name || 'Hospital Support'}</Text>
            <View style={styles.onlineIndicator}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Online</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.menuBtn}>
          <Feather name="more-vertical" size={22} color="#111827" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={loadMessages} tintColor={Colors.primary} />
          }
          ListFooterComponent={renderTypingIndicator}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="chat-outline" size={64} color={Colors.gray300} />
              <Text style={styles.emptyTitle}>Start a conversation</Text>
              <Text style={styles.emptySubtitle}>
                Send a message and our support team will get back to you shortly
              </Text>
            </View>
          }
        />

        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachBtn}>
            <Feather name="paperclip" size={22} color={Colors.gray500} />
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            placeholder="Type your message..."
            placeholderTextColor={Colors.gray400}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.sendBtn, (!inputText.trim() || sending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFB' },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  backBtn: { padding: 5 },
  headerInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, marginLeft: 12 },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginLeft: 10 },
  onlineIndicator: { flexDirection: 'row', alignItems: 'center', marginLeft: 10, marginTop: 2 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success, marginRight: 4 },
  onlineText: { fontSize: 11, color: Colors.success },
  menuBtn: { padding: 5 },
  
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  messageList: { padding: 16, paddingBottom: 8 },
  
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateText: {
    fontSize: 12,
    color: Colors.gray500,
    backgroundColor: Colors.gray100,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  userMessageRow: {
    flexDirection: 'row-reverse',
  },
  hospitalAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  hospitalBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    ...Shadows.sm,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  typingBubble: {
    paddingVertical: 14,
  },
  
  messageText: {
    fontSize: 15,
    color: '#111827',
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  userMessageFooter: {
    justifyContent: 'flex-end',
  },
  timestamp: {
    fontSize: 10,
    color: Colors.gray500,
  },
  userTimestamp: {
    color: 'rgba(255,255,255,0.7)',
  },
  
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gray400,
  },
  typingDot1: {
    opacity: 0.4,
  },
  typingDot2: {
    opacity: 0.6,
  },
  typingDot3: {
    opacity: 0.8,
  },
  
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    gap: 8,
  },
  attachBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: Colors.gray100,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: Colors.gray300,
  },
});

export default ChatScreen;
