import React, { useState, useEffect, useRef } from "react";
import {
  KeyboardAvoidingView, Platform, Text, TextInput,
  TouchableOpacity, View, ActivityIndicator, Modal,
  FlatList, Animated, StatusBar, ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Leaf, Check, X, ChevronDown, Phone, KeyRound } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config';
import CustomAlert from '../../components/CustomAlert';
import CustomDropdown from '../../components/CustomDropdown';

const PRIMARY = '#6B5BFF';
const PRIMARY_DARK = '#4f46e5';

export default function LoginScreen() {
  const router = useRouter();
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [panchayats, setPanchayats] = useState<any[]>([]);
  const [selectedPanchayatId, setSelectedPanchayatId] = useState("");
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: "", message: "", type: "success" as 'success' | 'error', otp: "" });

  // Fade-in animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  useEffect(() => { fetchPanchayats(); }, []);

  useEffect(() => {
    let interval: any;
    if (timer > 0) interval = setInterval(() => setTimer(p => p - 1), 1000);
    else if (timer === 0 && showOtpInput) setCanResend(true);
    return () => clearInterval(interval);
  }, [timer, showOtpInput]);

  const startResendTimer = () => { setTimer(30); setCanResend(false); };

  const fetchPanchayats = async () => {
    try {
      const res = await fetch(`${API_URL}/panchayat`);
      const data = await res.json();
      if (res.ok) setPanchayats(data);
      else showAlert("Error", "Failed to load Panchayats", "error");
    } catch {
      showAlert("Connection Error", "Could not connect to server.", "error");
    }
  };

  const showAlert = (title: string, message: string, type: 'success' | 'error' = 'success', otp: string = "") => {
    setAlertConfig({ title, message, type, otp }); setAlertVisible(true);
  };

  const handleSendOtp = async () => {
    if (!selectedPanchayatId) { showAlert("Required", "Please select your Panchayat", "error"); return; }
    if (mobile.length < 10) { showAlert("Invalid", "Enter a valid 10-digit mobile number", "error"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/send-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, type: 'employee', panchayatId: selectedPanchayatId }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowOtpInput(true); startResendTimer();
        showAlert("OTP Sent ✓", data.message || "Enter the verification code to continue", "success", data.otp);
      } else showAlert("Error", data.message || "Failed to send OTP", "error");
    } catch { showAlert("Error", "Network request failed", "error"); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 4) { showAlert("Invalid OTP", "Please enter valid OTP", "error"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp, type: 'employee', panchayatId: selectedPanchayatId }),
      });
      const data = await res.json();
      if (res.ok) {
        await AsyncStorage.setItem("token", data.token);
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        showAlert("Welcome! ✓", "Login successful", "success");
        setTimeout(() => { setAlertVisible(false); router.replace("/(tabs)" as any); }, 900);
      } else showAlert("Error", data.message || "Invalid OTP", "error");
    } catch { showAlert("Error", "Network request failed", "error"); }
    finally { setLoading(false); }
  };

  const selectedName = panchayats.find(p => p._id === selectedPanchayatId)?.name || "Select your Panchayat";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f0a2e' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0a2e" />
      <KeyboardAvoidingView
        behavior="padding"
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >

          {/* Top Hero Section */}
          <View style={{ alignItems: 'center', paddingTop: 50, paddingBottom: 40 }}>
            <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
              <View style={{
                width: 80, height: 80, borderRadius: 40,
                backgroundColor: `${PRIMARY}30`, justifyContent: 'center', alignItems: 'center',
                borderWidth: 2, borderColor: `${PRIMARY}50`, marginBottom: 20,
              }}>
                <Leaf size={38} color={PRIMARY} />
              </View>
              <Text style={{ color: 'white', fontSize: 28, fontWeight: '800', letterSpacing: 0.5 }}>EcoSyz Labour</Text>
              <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginTop: 6 }}>
                {showOtpInput ? 'Enter your OTP to verify' : 'Sign in to your account'}
              </Text>
            </Animated.View>
          </View>

          {/* Card */}
          <Animated.View style={{
            opacity: fadeAnim,
            backgroundColor: 'white',
            borderTopLeftRadius: 32, borderTopRightRadius: 32,
            flex: 1, paddingHorizontal: 28, paddingTop: 32,
            minHeight: 340,
          }}>

            {!showOtpInput ? (
              <>
                <Text style={{ fontSize: 22, fontWeight: '800', color: '#1e293b', marginBottom: 6 }}>Welcome back 👋</Text>
                <Text style={{ color: '#94a3b8', fontSize: 14, marginBottom: 28 }}>Select panchayat & enter your mobile number</Text>

                <CustomDropdown
                  label="Panchayat"
                  options={panchayats.map(p => ({ label: p.name, value: p._id }))}
                  selectedValue={selectedPanchayatId}
                  onValueChange={setSelectedPanchayatId}
                  placeholder="Select your Panchayat"
                />

                {/* Mobile Number */}
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Mobile Number</Text>
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 32 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, height: 54, borderRadius: 14, borderWidth: 1.5, borderColor: '#e2e8f0', backgroundColor: '#f8fafc', paddingHorizontal: 14 }}>
                    <Phone size={18} color="#94a3b8" />
                    <TextInput
                      style={{ flex: 1, marginLeft: 10, fontSize: 16, color: '#1e293b', fontWeight: '600' }}
                      placeholder="10-digit number"
                      placeholderTextColor="#cbd5e1"
                      value={mobile}
                      onChangeText={setMobile}
                      keyboardType="phone-pad"
                      maxLength={10}
                    />
                  </View>
                  <TouchableOpacity
                    onPress={handleSendOtp}
                    disabled={loading}
                    style={{
                      height: 54, paddingHorizontal: 18, borderRadius: 14,
                      backgroundColor: PRIMARY, justifyContent: 'center', alignItems: 'center',
                      opacity: loading ? 0.7 : 1,
                      shadowColor: PRIMARY, shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
                    }}>
                    {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: '800', fontSize: 14 }}>GET OTP</Text>}
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={{ fontSize: 22, fontWeight: '800', color: '#1e293b', marginBottom: 6 }}>Verify OTP</Text>
                <Text style={{ color: '#94a3b8', fontSize: 14, marginBottom: 28 }}>
                  Code sent to <Text style={{ color: PRIMARY, fontWeight: '700' }}>+91 {mobile}</Text>
                </Text>

                {/* OTP Input */}
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Enter OTP</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', height: 54, borderRadius: 14, borderWidth: 1.5, borderColor: '#e2e8f0', backgroundColor: '#f8fafc', paddingHorizontal: 14, marginBottom: 16 }}>
                  <KeyRound size={18} color="#94a3b8" />
                  <TextInput
                    style={{ flex: 1, marginLeft: 10, fontSize: 24, color: '#1e293b', fontWeight: '800', letterSpacing: 8 }}
                    placeholder="• • • • • •"
                    placeholderTextColor="#cbd5e1"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>

                {/* Resend + Change */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28 }}>
                  {canResend ? (
                    <TouchableOpacity onPress={handleSendOtp}>
                      <Text style={{ color: PRIMARY, fontWeight: '700' }}>Resend OTP</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={{ color: '#94a3b8' }}>Resend in <Text style={{ fontWeight: '700' }}>{timer}s</Text></Text>
                  )}
                  <TouchableOpacity onPress={() => setShowOtpInput(false)}>
                    <Text style={{ color: '#64748b', fontWeight: '600' }}>✏️ Change number</Text>
                  </TouchableOpacity>
                </View>

                {/* Verify Button */}
                <TouchableOpacity
                  onPress={handleVerifyOtp}
                  disabled={loading}
                  style={{
                    height: 56, borderRadius: 16, backgroundColor: PRIMARY,
                    justifyContent: 'center', alignItems: 'center',
                    opacity: loading ? 0.7 : 1,
                    shadowColor: PRIMARY, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
                  }}>
                  {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: '800', fontSize: 17, letterSpacing: 0.5 }}>Verify & Login →</Text>}
                </TouchableOpacity>
              </>
            )}

            {/* Footer */}
            <View style={{ marginTop: 'auto', paddingBottom: 24, alignItems: 'center' }}>
              <Text style={{ color: '#94a3b8', fontSize: 13 }}>Having trouble? <Text style={{ color: PRIMARY, fontWeight: '700' }}>Contact Support</Text></Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>



      <CustomAlert visible={alertVisible} title={alertConfig.title} message={alertConfig.message} type={alertConfig.type} otp={alertConfig.otp} onClose={() => setAlertVisible(false)} />
    </SafeAreaView>
  );
}