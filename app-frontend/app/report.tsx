import { useRouter } from 'expo-router';
import { ArrowLeft, Mic, Trash2, CheckCircle } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomAlert from '../components/CustomAlert';

const PRIMARY = '#6B5BFF';

const GARBAGE_TYPES = [
  { value: 'dry', label: 'Dry Waste', color: '#4f46e5', bg: '#eef2ff', desc: 'Paper, cardboard, plastics' },
  { value: 'wet', label: 'Wet Waste', color: '#059669', bg: '#f0fdf4', desc: 'Food scraps, organic material' },
  { value: 'hazardous', label: 'Hazardous Waste', color: '#dc2626', bg: '#fef2f2', desc: 'Batteries, chemicals, e-waste' },
];

export default function ReportScreen() {
  const router = useRouter();
  const [garbageType, setGarbageType] = useState<'dry' | 'wet' | 'hazardous' | null>(null);
  const [weight, setWeight] = useState('');

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertCfg, setAlertCfg] = useState({ title: '', message: '', type: 'info' as any, onClose: undefined as (() => void) | undefined });

  const showAlert = (title: string, message: string, type: any, onClose?: () => void) => {
    setAlertCfg({ title, message, type, onClose }); setAlertVisible(true);
  };

  const handleClose = () => { setAlertVisible(false); alertCfg.onClose?.(); };

  const handleSubmit = () => {
    if (!garbageType) { showAlert('Missing Info', 'Please select a garbage type before submitting.', 'warning'); return; }
    showAlert('Submitted ✓', 'Garbage details submitted successfully!', 'success', () => router.back());
  };

  const selected = GARBAGE_TYPES.find(g => g.value === garbageType);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }} edges={['top', 'bottom']}>

      {/* Header */}
      <View style={{ backgroundColor: PRIMARY, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 14, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 8 }}>
            <ArrowLeft size={20} color="white" />
          </TouchableOpacity>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '800' }}>Garbage Details</Text>
        </View>
        <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>Record waste type and estimated weight</Text>
      </View>

      <ScrollView style={{ paddingHorizontal: 20 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Garbage Type */}
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Garbage Type</Text>
        <View style={{ gap: 10, marginBottom: 28 }}>
          {GARBAGE_TYPES.map(g => {
            const active = garbageType === g.value;
            return (
              <TouchableOpacity
                key={g.value}
                onPress={() => setGarbageType(g.value as any)}
                activeOpacity={0.8}
                style={{
                  flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 16,
                  backgroundColor: active ? g.bg : 'white',
                  borderWidth: 2, borderColor: active ? g.color : '#e2e8f0',
                  shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, elevation: 1,
                }}
              >
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: active ? g.color : '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginRight: 14 }}>
                  <Trash2 size={20} color={active ? 'white' : '#94a3b8'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700', fontSize: 15, color: active ? g.color : '#1e293b' }}>{g.label}</Text>
                  <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{g.desc}</Text>
                </View>
                {active && <CheckCircle size={22} color={g.color} fill={g.bg} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Weight Input */}
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Estimated Weight (kg)</Text>
        <View style={{
          flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
          borderRadius: 14, borderWidth: 1.5, borderColor: weight ? PRIMARY : '#e2e8f0',
          paddingHorizontal: 14, height: 54, marginBottom: 32,
          shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, elevation: 1,
        }}>
          <TextInput
            style={{ flex: 1, fontSize: 16, color: '#1e293b', fontWeight: '600' }}
            placeholder="Enter weight in kg"
            placeholderTextColor="#cbd5e1"
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
          />
          <TouchableOpacity style={{ padding: 6 }}>
            <Mic size={22} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Submit */}
        <TouchableOpacity
          onPress={handleSubmit}
          activeOpacity={0.9}
          style={{
            height: 56, borderRadius: 16, backgroundColor: PRIMARY,
            justifyContent: 'center', alignItems: 'center',
            shadowColor: PRIMARY, shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
          }}
        >
          <Text style={{ color: 'white', fontWeight: '800', fontSize: 16 }}>Submit Report</Text>
        </TouchableOpacity>
      </ScrollView>

      <CustomAlert visible={alertVisible} title={alertCfg.title} message={alertCfg.message} type={alertCfg.type} onClose={handleClose} />
    </SafeAreaView>
  );
}