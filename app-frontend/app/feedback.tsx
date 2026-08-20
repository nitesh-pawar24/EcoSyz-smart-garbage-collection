import { useRouter } from 'expo-router';
import { ArrowLeft, Send, Star } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView,
  Text, TextInput, TouchableOpacity, View, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { request } from '../utils/api';
import CustomAlert from '../components/CustomAlert';
import { useTheme } from '../context/ThemeContext';

const STAR_LABELS: Record<number, string> = { 1: 'Very Poor', 2: 'Poor', 3: 'Average', 4: 'Good', 5: 'Excellent' };

export default function FeedbackScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertCfg, setAlertCfg] = useState({ title: '', message: '', type: 'info' as any, onClose: undefined as (() => void) | undefined });

  const showAlert = (title: string, message: string, type: any, onClose?: () => void) => {
    setAlertCfg({ title, message, type, onClose }); setAlertVisible(true);
  };

  const handleClose = () => { setAlertVisible(false); alertCfg.onClose?.(); };

  const handleSubmit = async () => {
    if (rating === 0) { showAlert('Rating Required', 'Please select a star rating.', 'warning'); return; }
    if (!feedback.trim()) { showAlert('Empty', 'Please write your feedback before submitting.', 'warning'); return; }
    setSubmitting(true);
    try {
      const res = await request('/employee/feedback', { method: 'POST', body: JSON.stringify({ message: feedback, rating }) });
      const data = await res.json();
      if (res.ok) showAlert('Thank You! 🙏', 'Your feedback helps us improve the service.', 'success', () => router.back());
      else showAlert('Error', data.message || 'Failed to submit.', 'error');
    } catch { showAlert('Error', 'Could not connect to server.', 'error'); }
    finally { setSubmitting(false); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>

        {/* Header */}
        <View style={{ backgroundColor: '#8b5cf6', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 14, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 8 }}>
              <ArrowLeft size={20} color="white" />
            </TouchableOpacity>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '800' }}>Feedback</Text>
          </View>
          <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>Share your experience — we read every response</Text>
        </View>

        <ScrollView style={{ flex: 1, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

          {/* Star Rating */}
          <View style={{ backgroundColor: theme.card, borderRadius: 20, padding: 24, marginBottom: 20, alignItems: 'center', borderWidth: 1, borderColor: theme.border, shadowColor: theme.shadow, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: theme.text, marginBottom: 18 }}>How was your experience?</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
              {[1, 2, 3, 4, 5].map(s => (
                <TouchableOpacity key={s} onPress={() => setRating(s)} activeOpacity={0.7}>
                  <Star size={42} color={s <= rating ? '#FBBF24' : '#e2e8f0'} fill={s <= rating ? '#FBBF24' : 'transparent'} strokeWidth={1.5} />
                </TouchableOpacity>
              ))}
            </View>
            {rating > 0 && (
              <View style={{ backgroundColor: '#fef9c3', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 }}>
                <Text style={{ color: '#854d0e', fontWeight: '700', fontSize: 13 }}>{STAR_LABELS[rating]}</Text>
              </View>
            )}
          </View>

          {/* Text */}
          <Text style={{ fontSize: 13, fontWeight: '700', color: theme.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Your Comments</Text>
          <View style={{ backgroundColor: theme.card, borderRadius: 16, borderWidth: 1.5, borderColor: feedback.length > 0 ? '#8b5cf6' : theme.border, padding: 16, marginBottom: 28, minHeight: 150 }}>
            <TextInput
              style={{ fontSize: 15, color: theme.text, textAlignVertical: 'top', minHeight: 120 }}
              placeholder="What went well? What could be improved?…"
              placeholderTextColor={theme.muted}
              multiline value={feedback} onChangeText={setFeedback}
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            style={{
              height: 56, borderRadius: 16, backgroundColor: submitting ? '#ddd6fe' : '#8b5cf6',
              flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
              shadowColor: '#8b5cf6', shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
            }}
          >
            {submitting ? <ActivityIndicator color="white" /> : (
              <><Send size={18} color="white" style={{ marginRight: 10 }} /><Text style={{ color: 'white', fontWeight: '800', fontSize: 16 }}>Submit Feedback</Text></>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAlert visible={alertVisible} title={alertCfg.title} message={alertCfg.message} type={alertCfg.type} onClose={handleClose} />
    </SafeAreaView>
  );
}