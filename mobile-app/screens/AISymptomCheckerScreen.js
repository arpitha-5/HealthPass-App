import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { Colors, Shadows, Spacing, FontSize, FontWeight, BorderRadius } from '../theme/index';
import Card from '../components/Card';

const { width } = Dimensions.get('window');

const AISymptomCheckerScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([
    { id: '1', text: "Hello! I'm your AI Health Assistant. How are you feeling today? Please describe your symptoms.", sender: 'ai', time: '10:00 AM' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = { id: Date.now().toString(), text: input, sender: 'user', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Simulating AI Processing
    setTimeout(() => {
      const aiReply = { 
        id: (Date.now() + 1).toString(), 
        text: "Based on your symptoms, it could be a mild fever or common cold. I recommend consulting a General Physician.", 
        sender: 'ai', 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendation: {
           condition: 'Common Cold / Viral Fever',
           specialist: 'General Physician',
           urgency: 'Moderate'
        }
      };
      setMessages(prev => [...prev, aiReply]);
      setLoading(false);
    }, 2000);
  };

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const renderMessage = (msg) => (
    <View key={msg.id} style={[styles.msgWrapper, msg.sender === 'ai' ? styles.msgAi : styles.msgUser]}>
      {msg.sender === 'ai' && (
        <View style={styles.aiIconBubble}>
          <MaterialCommunityIcons name="robot" size={20} color="#fff" />
        </View>
      )}
      <View style={{ maxWidth: width * 0.75 }}>
        <View style={[styles.msgBubble, msg.sender === 'ai' ? styles.bubbleAi : styles.bubbleUser]}>
           <Text style={[styles.msgText, msg.sender === 'ai' ? styles.textAi : styles.textUser]}>{msg.text}</Text>
        </View>
        
        {msg.recommendation && (
           <Card style={styles.recCard}>
              <View style={styles.recHeader}>
                 <Text style={styles.recLabel}>AI Recommendation</Text>
                 <View style={[styles.urgencyBadge, { backgroundColor: msg.recommendation.urgency === 'High' ? '#FEE2E2' : '#FEF3C7' }]}>
                    <Text style={[styles.urgencyText, { color: msg.recommendation.urgency === 'High' ? Colors.primary : '#D97706' }]}>
                       {msg.recommendation.urgency} Urgency
                    </Text>
                 </View>
              </View>
              <Text style={styles.recTitle}>{msg.recommendation.condition}</Text>
              <Text style={styles.recDoc}>Suggested: {msg.recommendation.specialist}</Text>
              <TouchableOpacity 
                style={styles.bookBtn}
                onPress={() => navigation.navigate('DoctorList')}
              >
                 <Text style={styles.bookText}>Consult Best {msg.recommendation.specialist}s</Text>
                 <Feather name="arrow-right" size={14} color="#fff" />
              </TouchableOpacity>
           </Card>
        )}
        <Text style={[styles.msgTime, msg.sender === 'ai' ? { textAlign: 'left' } : { textAlign: 'right' }]}>{msg.time}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>AI Health Assistant</Text>
          <View style={styles.activeRow}>
             <View style={styles.activeDot} />
             <Text style={styles.activeText}>Online & Ready</Text>
          </View>
        </View>
        <TouchableOpacity>
           <Feather name="more-vertical" size={22} color="#111827" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          ref={scrollRef}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(renderMessage)}
          {loading && (
             <View style={styles.typingBox}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.typingText}>Assessing symptoms...</Text>
             </View>
          )}
        </ScrollView>

        {/* Input Dock */}
        <View style={styles.inputDock}>
           <View style={styles.inputBar}>
              <TouchableOpacity style={styles.actionBtn}>
                 <Feather name="plus" size={20} color={Colors.primary} />
              </TouchableOpacity>
              <TextInput
                placeholder="Type your symptoms here..."
                style={styles.input}
                value={input}
                onChangeText={setInput}
                multiline
              />
              <TouchableOpacity 
                style={[styles.sendBtn, !input.trim() && { backgroundColor: '#F1F5F9' }]} 
                onPress={handleSend}
                disabled={!input.trim() || loading}
              >
                 <Ionicons name="send" size={20} color={input.trim() ? '#fff' : '#64748B'} />
              </TouchableOpacity>
           </View>
           <Text style={styles.warning}>Disclaimer: AI results are for informational purposes only. Consult a doctor for medical advice.</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FB' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 20, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  headerContent: { flex: 1, marginLeft: 15 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  activeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  activeText: { fontSize: 12, color: '#10B981', fontWeight: '600' },
  
  scroll: { padding: 20, paddingBottom: 40 },
  msgWrapper: { flexDirection: 'row', marginBottom: 20 },
  msgAi: { justifyContent: 'flex-start' },
  msgUser: { justifyContent: 'flex-end' },
  
  aiIconBubble: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 10, alignSelf: 'flex-end', marginBottom: 20,
  },
  
  msgBubble: {
    padding: 16, borderRadius: 20,
    ...Shadows.xs,
  },
  bubbleAi: { backgroundColor: '#fff', borderBottomLeftRadius: 4 },
  bubbleUser: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  msgText: { fontSize: 15, lineHeight: 22 },
  textAi: { color: '#111827' },
  textUser: { color: '#fff' },
  msgTime: { fontSize: 11, color: '#94A3B8', marginTop: 6, fontWeight: '500' },

  recCard: { padding: 15, marginTop: 15, borderRadius: 16, backgroundColor: '#fff' },
  recHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recLabel: { fontSize: 11, fontWeight: '800', color: Colors.primary, textTransform: 'uppercase' },
  urgencyBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  urgencyText: { fontSize: 10, fontWeight: '700' },
  recTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginTop: 10 },
  recDoc: { fontSize: 13, color: '#64748B', marginTop: 4 },
  bookBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, borderRadius: 12, marginTop: 15, gap: 8,
  },
  bookText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  typingBox: { flexDirection: 'row', alignItems: 'center', gap: 10, marginLeft: 10 },
  typingText: { fontSize: 13, color: '#64748B', fontStyle: 'italic' },

  inputDock: { 
    backgroundColor: '#fff', padding: 15, paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    borderTopWidth: 1, borderTopColor: '#F1F5F9',
  },
  inputBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAFC', borderRadius: 25,
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  actionBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  input: { flex: 1, marginHorizontal: 10, fontSize: 15, maxHeight: 100 },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  warning: { textAlign: 'center', fontSize: 10, color: '#94A3B8', marginTop: 12, lineHeight: 14 },
});

export default AISymptomCheckerScreen;
