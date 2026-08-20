import { useFocusEffect, useRouter } from 'expo-router';
import { ArrowLeft, Phone, Building2 } from 'lucide-react-native';
import React, { useState, useCallback } from 'react';
import { Linking, ScrollView, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { request } from '../utils/api';
import CustomAlert from '../components/CustomAlert';
import { useTheme } from '../context/ThemeContext';

type Member = { _id: string; name: string; role: string; phone: string; ward: string };

const ROLE_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  Supervisor: { color: '#7c3aed', bg: '#f5f3ff', label: 'Supervisor' },
  Collector: { color: '#0284c7', bg: '#f0f9ff', label: 'Collector' },
  Driver: { color: '#059669', bg: '#f0fdf4', label: 'Driver' },
  Helper: { color: '#d97706', bg: '#fffbeb', label: 'Helper' },
};
const DEFAULT_ROLE = { color: '#64748b', bg: '#f8fafc', label: 'Member' };

export default function ContactCommitteeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertCfg, setAlertCfg] = useState({ title: '', message: '', type: 'info' as any });

  const showAlert = (title: string, message: string, type: any) => {
    setAlertCfg({ title, message, type }); setAlertVisible(true);
  };

  useFocusEffect(useCallback(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await request('/employee/committee');
        if (res.ok) setMembers(await res.json());
      } catch { } finally { setLoading(false); }
    })();
  }, []));

  const handleCall = (phone: string) => {
    const url = `tel:${phone.replace(/\s/g, '')}`;
    Linking.canOpenURL(url)
      .then(ok => ok ? Linking.openURL(url) : showAlert('Not Supported', 'Phone calls are not supported on this device.', 'warning'))
      .catch(console.error);
  };

  const grouped = members.reduce<Record<string, Member[]>>((acc, m) => {
    const g = m.role || 'Other'; acc[g] = [...(acc[g] || []), m]; return acc;
  }, {});

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top', 'bottom']}>

      <View style={{ backgroundColor: '#f59e0b', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 14, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: 8 }}>
            <ArrowLeft size={20} color="white" />
          </TouchableOpacity>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '800' }}>Contact Committee</Text>
        </View>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Tap a card to call your supervisor directly</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text style={{ color: theme.muted, marginTop: 12 }}>Loading members…</Text>
        </View>
      ) : members.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
          <Building2 size={48} color="#e2e8f0" />
          <Text style={{ color: theme.muted, textAlign: 'center', marginTop: 14, fontSize: 15 }}>No committee members found.</Text>
        </View>
      ) : (
        <ScrollView style={{ paddingHorizontal: 16 }} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          {Object.entries(grouped).map(([role, list]) => {
            const cfg = ROLE_CONFIG[role] ?? DEFAULT_ROLE;
            return (
              <View key={role} style={{ marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  <View style={{ height: 1, flex: 1, backgroundColor: theme.border }} />
                  <View style={{ backgroundColor: cfg.bg, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginHorizontal: 10 }}>
                    <Text style={{ color: cfg.color, fontSize: 12, fontWeight: '700' }}>{cfg.label}s</Text>
                  </View>
                  <View style={{ height: 1, flex: 1, backgroundColor: theme.border }} />
                </View>
                {list.map(member => (
                  <View key={member._id} style={{
                    backgroundColor: theme.card, borderRadius: 18, padding: 16, marginBottom: 10,
                    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: theme.border,
                    shadowColor: theme.shadow, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
                  }}>
                    <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: cfg.bg, justifyContent: 'center', alignItems: 'center', marginRight: 14 }}>
                      <Text style={{ fontSize: 18, fontWeight: '800', color: cfg.color }}>
                        {member.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '700', fontSize: 15, color: theme.text }}>{member.name}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 8 }}>
                        <View style={{ backgroundColor: cfg.bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 }}>
                          <Text style={{ color: cfg.color, fontSize: 11, fontWeight: '700' }}>{member.role}</Text>
                        </View>
                        <Text style={{ color: theme.muted, fontSize: 12 }}>Ward {member.ward}</Text>
                      </View>
                      <Text style={{ color: theme.subtext, fontSize: 13, marginTop: 4, fontWeight: '500' }}>{member.phone}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleCall(member.phone)}
                      style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#bbf7d0' }}
                    >
                      <Phone size={20} color="#22c55e" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            );
          })}
        </ScrollView>
      )}

      <CustomAlert visible={alertVisible} title={alertCfg.title} message={alertCfg.message} type={alertCfg.type} onClose={() => setAlertVisible(false)} />
    </SafeAreaView>
  );
}