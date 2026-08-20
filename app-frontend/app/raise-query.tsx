import { useRouter } from 'expo-router';
import { ArrowLeft, Send } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView,
  Text, TextInput, TouchableOpacity, View, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { request } from '../utils/api';
import CustomAlert from '../components/CustomAlert';
import { useTheme } from '../context/ThemeContext';

const PRIMARY = '#6B5BFF';
const CATEGORIES = ['QR Code Damaged', 'Bin Location Wrong', 'App Issue', 'Supervisor Concern', 'Other'];

export default function RaiseQueryScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertCfg, setAlertCfg] = useState({ title: '', message: '', type: 'info' as any, onClose: undefined as (() => void) | undefined });

  const showAlert = (title: string, message: string, type: any, onClose?: () => void) => {
    setAlertCfg({ title, message, type, onClose });
    setAlertVisible(true);
  };

  const handleClose = () => {
    setAlertVisible(false);
    alertCfg.onClose?.();
  };

  const handleSubmit = async () => {
    if (!category) { showAlert('Select Category', 'Please select an issue category.', 'warning'); return; }
    if (!query.trim()) { showAlert('Missing Info', 'Please describe your issue.', 'warning'); return; }
    setSubmitting(true);
    try {
      const res = await request('/employee/query', {
        method: 'POST',
        body: JSON.stringify({ description: `[${category}] ${query}` }),
      });
      const data = await res.json();
      if (res.ok) showAlert('Submitted ✓', 'Your query has been sent to the supervisor.', 'success', () => router.back());
      else showAlert('Error', data.message || 'Failed to submit.', 'error');
    } catch { showAlert('Error', 'Could not connect to server.', 'error'); }
    finally { setSubmitting(false); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>

        {/* Header */}
        <View style={{ backgroundColor: PRIMARY, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 14, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 8 }}>
              <ArrowLeft size={20} color="white" />
            </TouchableOpacity>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '800' }}>Raise Query / Issue</Text>
          </View>
          <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>Your supervisor will be notified immediately</Text>
        </View>

        <ScrollView style={{ flex: 1, padding: 20 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

          {/* Category */}
          <Text style={{ fontSize: 13, fontWeight: '700', color: theme.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Issue Category</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                style={{
                  paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                  backgroundColor: category === cat ? PRIMARY : theme.card,
                  borderWidth: 1.5, borderColor: category === cat ? PRIMARY : theme.border,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: category === cat ? 'white' : theme.chipText }}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Description */}
          <Text style={{ fontSize: 13, fontWeight: '700', color: theme.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Description</Text>
          <View style={{
            backgroundColor: theme.card, borderRadius: 16, borderWidth: 1.5,
            borderColor: query.length > 0 ? PRIMARY : theme.border, padding: 16, marginBottom: 8,
            shadowColor: theme.shadow, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2, minHeight: 160,
          }}>
            <TextInput
              style={{ fontSize: 15, color: theme.text, textAlignVertical: 'top', minHeight: 130 }}
              placeholder="Describe your issue in detail…"
              placeholderTextColor={theme.muted}
              multiline value={query} onChangeText={setQuery}
            />
          </View>
          <Text style={{ textAlign: 'right', color: theme.muted, fontSize: 12, marginBottom: 28 }}>{query.length} characters</Text>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.9}
            style={{
              height: 56, borderRadius: 16, backgroundColor: submitting ? '#a5b4fc' : PRIMARY,
              flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
              shadowColor: PRIMARY, shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
            }}
          >
            {submitting ? <ActivityIndicator color="white" /> : (
              <>
                <Send size={18} color="white" style={{ marginRight: 10 }} />
                <Text style={{ color: 'white', fontWeight: '800', fontSize: 16 }}>Submit Query</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAlert
        visible={alertVisible}
        title={alertCfg.title}
        message={alertCfg.message}
        type={alertCfg.type}
        onClose={handleClose}
      />
    </SafeAreaView>
  );
}