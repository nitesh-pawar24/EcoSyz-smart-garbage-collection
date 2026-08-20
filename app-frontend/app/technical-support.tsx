import { useRouter } from 'expo-router';
import { ArrowLeft, Phone, Mail, Globe, ChevronRight, Headphones } from 'lucide-react-native';
import React, { useState } from 'react';
import { Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomAlert from '../components/CustomAlert';
import { useTheme } from '../context/ThemeContext';

const CONTACTS = [
  { title: 'Helpline', value: '+91 1800-XXX-XXXX', sub: 'Mon–Sat, 9 AM – 6 PM', icon: Phone, action: 'tel:+911800XXXXXXX', color: '#22c55e', bg: '#f0fdf4' },
  { title: 'Email Support', value: 'support@ecosyz.in', sub: 'Response within 24 hrs', icon: Mail, action: 'mailto:support@ecosyz.in', color: '#3b82f6', bg: '#eff6ff' },
  { title: 'Help Portal', value: 'help.ecosyz.in', sub: 'FAQs, guides & tutorials', icon: Globe, action: 'https://help.ecosyz.in', color: '#6B5BFF', bg: '#eef2ff' },
];

export default function TechnicalSupportScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertCfg, setAlertCfg] = useState({ title: '', message: '', type: 'info' as any });

  const showAlert = (title: string, message: string, type: any) => {
    setAlertCfg({ title, message, type }); setAlertVisible(true);
  };

  const handleOpen = (action: string) => {
    Linking.canOpenURL(action)
      .then(ok => ok ? Linking.openURL(action) : showAlert('Not Supported', 'This link cannot be opened on your device.', 'warning'))
      .catch(console.error);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top', 'bottom']}>

      <View style={{ backgroundColor: '#0ea5e9', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 14, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: 8 }}>
            <ArrowLeft size={20} color="white" />
          </TouchableOpacity>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '800' }}>Technical Support</Text>
        </View>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>We're here to help — reach us anytime</Text>
      </View>

      <ScrollView style={{ paddingHorizontal: 16 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ alignItems: 'center', marginBottom: 28 }}>
          <View style={{ width: 80, height: 80, borderRadius: 24, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#bfdbfe' }}>
            <Headphones size={40} color="#3b82f6" />
          </View>
          <Text style={{ fontWeight: '800', fontSize: 17, color: theme.text, marginTop: 14 }}>How can we help?</Text>
          <Text style={{ color: theme.muted, fontSize: 13, textAlign: 'center', marginTop: 4 }}>Choose a channel below to get in touch</Text>
        </View>

        {CONTACTS.map(({ title, value, sub, icon: Icon, action, color, bg }) => (
          <TouchableOpacity
            key={title}
            activeOpacity={0.8}
            onPress={() => handleOpen(action)}
            style={{
              backgroundColor: theme.card, borderRadius: 18, padding: 18,
              flexDirection: 'row', alignItems: 'center', marginBottom: 12,
              shadowColor: theme.shadow, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
              borderWidth: 1, borderColor: theme.border,
            }}
          >
            <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: bg, justifyContent: 'center', alignItems: 'center', marginRight: 14, borderWidth: 1, borderColor: color + '30' }}>
              <Icon size={24} color={color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: theme.muted, fontWeight: '600', marginBottom: 2 }}>{title}</Text>
              <Text style={{ fontSize: 15, fontWeight: '800', color: theme.text }}>{value}</Text>
              <Text style={{ fontSize: 12, color: theme.muted, marginTop: 2 }}>{sub}</Text>
            </View>
            <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: theme.chipBg, justifyContent: 'center', alignItems: 'center' }}>
              <ChevronRight size={16} color={theme.border} />
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ backgroundColor: '#eff6ff', borderRadius: 16, padding: 16, marginTop: 4, borderWidth: 1, borderColor: '#bfdbfe' }}>
          <Text style={{ color: '#1d4ed8', fontWeight: '700', marginBottom: 4, fontSize: 13 }}>💡 Before Contacting Us</Text>
          <Text style={{ color: '#3b82f6', fontSize: 13, lineHeight: 20 }}>
            Check that your app is up to date, your internet connection is stable, and you've tried restarting the app. Most issues are resolved this way.
          </Text>
        </View>
      </ScrollView>

      <CustomAlert visible={alertVisible} title={alertCfg.title} message={alertCfg.message} type={alertCfg.type} onClose={() => setAlertVisible(false)} />
    </SafeAreaView>
  );
}