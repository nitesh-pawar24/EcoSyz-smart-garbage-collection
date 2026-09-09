import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Alert, StyleSheet, Text, TouchableOpacity, View, Modal,
  ActivityIndicator, TextInput, Animated, StatusBar, Dimensions, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { CheckCircle, AlertTriangle, MapPin, Info, ArrowLeft, Scale, Scan, X, Edit2, Camera, Zap } from 'lucide-react-native';
import CustomAlert from '../../components/CustomAlert';
import CustomDropdown from '../../components/CustomDropdown';
import { request } from '../../utils/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SCAN_FRAME_SIZE = Math.min(SCREEN_WIDTH - 64, 280);

const PRIMARY = '#6B5BFF';
const GREEN = '#22c55e';
const ORANGE = '#F59E0B';
const RED = '#EF4444';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [locationPermission, requestLocationPermission] = Location.useForegroundPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [reportMode, setReportMode] = useState(false);
  const [issueType, setIssueType] = useState('');
  const [estimatedWeight, setEstimatedWeight] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'success' as 'success' | 'error' });
  
  // Manual Entry States
  const [manualModalVisible, setManualModalVisible] = useState(false);
  const [manualTab, setManualTab] = useState<'id' | 'ward'>('id');
  const [manualBinCode, setManualBinCode] = useState('B-');
  const [manualReason, setManualReason] = useState('');
  const [allDustbins, setAllDustbins] = useState<any[]>([]);
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedBinId, setSelectedBinId] = useState('');
  const [wardsList, setWardsList] = useState<string[]>([]);
  const [submittedManualReason, setSubmittedManualReason] = useState('');

  const [isAvailable, setIsAvailable] = useState(true);
  const [checkingDuty, setCheckingDuty] = useState(true);

  const [isFocused, setIsFocused] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const router = useRouter();

  // Pulse animation for the scan ring
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    let anim: Animated.CompositeAnimation;
    if (!scanned && !loading) {
      anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.04, duration: 900, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        ])
      );
      anim.start();
    } else {
      pulse.setValue(1);
    }
    return () => anim?.stop();
  }, [scanned, loading]);

  useEffect(() => {
    (async () => {
      if (!locationPermission?.granted) await requestLocationPermission();
      if (!permission?.granted) await requestPermission();
    })();
  }, []);

  // Listen for Google Native Code Scanner callbacks (Google Play Services)
  useEffect(() => {
    let subscription: any;
    try {
      if (CameraView.isModernBarcodeScannerAvailable) {
        subscription = CameraView.onModernBarcodeScanned((event: any) => {
          if (event && event.data) {
            handleBarCodeScanned({ data: event.data, type: event.type || 'qr' });
          }
        });
      }
    } catch (e) {
      console.log('Modern Barcode Scanner listener not supported', e);
    }
    return () => {
      subscription?.remove?.();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      // Delay mounting CameraView slightly to allow Android screen transition to complete
      const timer = setTimeout(() => {
        if (isActive) setIsFocused(true);
      }, 150);

      const checkDuty = async () => {
        setCheckingDuty(true);
        try {
          const res = await request('/attendance/dashboard');
          const data = await res.json();
          if (res.ok && isActive) {
            setIsAvailable(data.onDuty ?? true);
          }
        } catch (e) {
          // Fail silently, assume available if network error
        } finally {
          if (isActive) setCheckingDuty(false);
        }
      };
      checkDuty();

      return () => {
        isActive = false;
        clearTimeout(timer);
        setIsFocused(false);
        setCameraReady(false);
      };
    }, [])
  );

  const barcodeScannerSettings = useMemo(() => ({
    barcodeTypes: ['qr', 'code128', 'code39', 'ean13', 'ean8', 'upc_a', 'upc_e', 'aztec', 'pdf417', 'datamatrix'] as any,
  }), []);

  const handleBarCodeScanned = async (event: any) => {
    if (scanned || loading) return;
    const rawData = event?.data ?? event;
    if (!rawData) return;
    const data = String(rawData).trim();

    setScanned(true); setLoading(true); setEstimatedWeight('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    try {
      let lat = 0;
      let lng = 0;
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        lat = location.coords.latitude;
        lng = location.coords.longitude;
      } catch (locErr) {
        const lastLocation = await Location.getLastKnownPositionAsync({});
        if (lastLocation) {
          lat = lastLocation.coords.latitude;
          lng = lastLocation.coords.longitude;
        }
      }

      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) { setScanned(false); setLoading(false); return; }
      const user = JSON.parse(userStr);
      const labourId = user.id || user._id;

      const res = await request('/attendance/scan', {
        method: 'POST',
        body: JSON.stringify({ labourId, dustbinId: data, lat, lng }),
      });
      const resData = await res.json();
      if (res.ok) { setScanResult(resData); setModalVisible(true); }
      else {
        setAlertConfig({ title: 'Scan Failed', message: resData.message || 'Unknown error', type: 'error' });
        setAlertVisible(true); setScanned(false);
      }
    } catch {
      setAlertConfig({ title: 'Error', message: 'Failed to process scan', type: 'error' });
      setAlertVisible(true); setScanned(false);
    } finally { setLoading(false); }
  };

  const launchGoogleCodeScanner = async () => {
    try {
      if (CameraView.isModernBarcodeScannerAvailable) {
        const result: any = await CameraView.launchScanner({ barcodeTypes: ['qr'] });
        if (result && result.data) {
          handleBarCodeScanned({ data: result.data, type: result.type || 'qr' });
        }
      } else {
        setScanned(false);
      }
    } catch (e) {
      console.log('Error launching native code scanner:', e);
    }
  };

  const openManualEntry = async () => {
    setManualModalVisible(true);
    setManualBinCode('B-');
    setManualReason('');
    setSelectedWard('');
    setSelectedBinId('');
    try {
      const res = await request('/dustbins');
      const data = await res.json();
      if (res.ok) {
        setAllDustbins(data);
        const uniqueWards = Array.from(new Set(data.map((b: any) => b.ward).filter(Boolean))) as string[];
        setWardsList(uniqueWards);
      }
    } catch (e) {
      console.log('Error fetching dustbins', e);
    }
  };

  const submitManualEntry = async () => {
    if (!manualReason) {
      setAlertConfig({ title: 'Required', message: 'Please select a reason for manual entry', type: 'error' });
      setAlertVisible(true);
      return;
    }

    let binCodeToSubmit = '';
    if (manualTab === 'id') {
      if (!manualBinCode || manualBinCode === 'B-') {
        setAlertConfig({ title: 'Required', message: 'Please enter a valid Bin ID', type: 'error' });
        setAlertVisible(true);
        return;
      }
      binCodeToSubmit = manualBinCode;
    } else {
      if (!selectedBinId) {
        setAlertConfig({ title: 'Required', message: 'Please select a bin from the ward', type: 'error' });
        setAlertVisible(true);
        return;
      }
      binCodeToSubmit = selectedBinId;
    }

    setManualModalVisible(false);
    setSubmittedManualReason(manualReason);
    
    // Trigger existing scan flow
    await handleBarCodeScanned({ type: 'manual', data: binCodeToSubmit });
  };

  const handleAction = async (action: 'collected' | 'issue') => {
    if (!scanResult?.scanId) return;
    if (action === 'issue' && !issueType) {
      setAlertConfig({ title: 'Required', message: 'Please select an issue type', type: 'error' });
      setAlertVisible(true); return;
    }
    if (action === 'collected' && !estimatedWeight.trim()) {
      setAlertConfig({ title: 'Required', message: 'Please enter the estimated waste volume', type: 'error' });
      setAlertVisible(true); return;
    }
    setLoading(true);
    try {
      const isIssue = action === 'issue';
      const finalIssueDesc = isIssue ? issueType : submittedManualReason;

      const res = await request('/attendance/update-action', {
        method: 'PUT',
        body: JSON.stringify({ scanId: scanResult.scanId, action, issueDescription: finalIssueDesc, estimatedWeight: action === 'collected' ? estimatedWeight : undefined }),
      });
      const resData = await res.json();
      if (res.ok) {
        setAlertConfig({ title: 'Success ✓', message: action === 'collected' ? 'Bin marked as collected!' : 'Issue reported successfully!', type: 'success' });
        setAlertVisible(true); closeModal();
      } else {
        setAlertConfig({ title: 'Error', message: resData.message || 'Failed to update status', type: 'error' });
        setAlertVisible(true);
      }
    } catch {
      setAlertConfig({ title: 'Error', message: 'Network error', type: 'error' });
      setAlertVisible(true);
    } finally { setLoading(false); }
  };

  const closeModal = () => { setModalVisible(false); setScanned(false); setScanResult(null); setReportMode(false); setIssueType(''); setEstimatedWeight(''); setSubmittedManualReason(''); };

  const ISSUES = ['Waste not segregated', 'Hazardous waste', 'Civic issues (illegal dumping)', 'Bin damaged/missing'];

  if (checkingDuty) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0f0a2e', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </SafeAreaView>
    );
  }

  if (!isAvailable) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0f0a2e', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }} edges={['top']}>
        <AlertTriangle size={56} color={ORANGE} />
        <Text style={{ color: 'white', fontSize: 20, fontWeight: '700', textAlign: 'center', marginTop: 20, marginBottom: 10 }}>
          You are Off Duty
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 32, lineHeight: 22 }}>
          Please turn on your availability toggle on the dashboard to start scanning bins.
        </Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)')} style={{
          backgroundColor: PRIMARY, paddingHorizontal: 32, paddingVertical: 14,
          borderRadius: 14, shadowColor: PRIMARY, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
        }}>
          <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>Go to Dashboard</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!permission || !permission.granted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0f0a2e', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }} edges={['top']}>
        <Camera size={56} color={PRIMARY} />
        <Text style={{ color: 'white', fontSize: 20, fontWeight: '700', textAlign: 'center', marginTop: 20, marginBottom: 10 }}>
          Camera Access Needed
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 32, lineHeight: 22 }}>
          We need camera permission to scan dustbin QR codes.
        </Text>
        <TouchableOpacity onPress={requestPermission} style={{
          backgroundColor: PRIMARY, paddingHorizontal: 32, paddingVertical: 14,
          borderRadius: 14, shadowColor: PRIMARY, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
        }}>
          <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>Grant Permission</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Native Camera View with Explicit Viewport Dimensions ── */}
      {isFocused ? (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onCameraReady={() => setCameraReady(true)}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={barcodeScannerSettings}
        />
      ) : (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#0f0a2e' }]} />
      )}

      {/* ── Transparent Viewfinder & Controls Overlay ── */}
      <View style={styles.overlayContainer} pointerEvents="box-none">
        
        {/* Top Header */}
        <SafeAreaView edges={['top']} style={styles.headerArea}>
          <Text style={styles.headerTitle}>SCAN BIN</Text>
          <Text style={styles.headerSubtitle}>Align the QR code within the frame</Text>
        </SafeAreaView>

        {/* Viewfinder Center Area */}
        <View style={styles.viewfinderCenter} pointerEvents="none">
          <Animated.View
            style={[
              styles.viewfinderFrame,
              {
                borderColor: scanned ? GREEN : PRIMARY,
                transform: [{ scale: pulse }],
              },
            ]}
          >
            {/* Corner Markers */}
            <View style={[styles.cornerMarker, styles.topLeft]} />
            <View style={[styles.cornerMarker, styles.topRight]} />
            <View style={[styles.cornerMarker, styles.bottomLeft]} />
            <View style={[styles.cornerMarker, styles.bottomRight]} />

            {/* Loading / Processing Indicator */}
            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={PRIMARY} />
                <Text style={styles.loadingText}>Processing Scan…</Text>
              </View>
            )}
          </Animated.View>
        </View>

        {/* Bottom Actions Area */}
        <SafeAreaView edges={['bottom']} style={styles.bottomArea}>
          {/* Quick Launch Native Scanner Banner */}
          <TouchableOpacity
            onPress={launchGoogleCodeScanner}
            style={styles.nativeScanBanner}
            activeOpacity={0.85}
          >
            <Zap size={18} color="white" fill="white" />
            <Text style={styles.nativeScanBannerText}>Open Full-Screen Google Scanner</Text>
          </TouchableOpacity>

          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={() => { setScanned(false); setLoading(false); }}
              style={styles.actionBtnReset}
              activeOpacity={0.8}
            >
              <Scan size={18} color="white" />
              <Text style={styles.actionBtnResetText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={openManualEntry}
              style={styles.actionBtnManual}
              activeOpacity={0.8}
            >
              <Edit2 size={18} color={ORANGE} />
              <Text style={styles.actionBtnManualText}>Enter Manually</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>

      </View>

      {/* ── Result Bottom Sheet Modal ─────────────── */}
      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={closeModal}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.sheetHandle} />

            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitleText}>
                {reportMode ? '⚠️ Report Issue' : '✅ Bin Scanned'}
              </Text>
              <TouchableOpacity onPress={closeModal} style={styles.modalCloseBtn}>
                <X size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Bin Info */}
            {!reportMode && scanResult?.bin && (
              <View style={styles.binInfoCard}>
                {[
                  { icon: Info, label: 'Bin Code', value: scanResult.bin.binCode || '—' },
                  { icon: MapPin, label: 'Location', value: scanResult.bin.location || '—' },
                  { icon: CheckCircle, label: 'Type', value: scanResult.bin.type || 'General' },
                ].map(({ icon: Icon, label, value }) => (
                  <View key={label} style={styles.binInfoRow}>
                    <Icon size={18} color={PRIMARY} />
                    <Text style={styles.binInfoLabel}>{label}: </Text>
                    <Text style={styles.binInfoValue}>{value}</Text>
                  </View>
                ))}
              </View>
            )}

            {!reportMode ? (
              <View style={{ gap: 12 }}>
                {/* Weight Input */}
                <View style={styles.weightInputRow}>
                  <Scale size={20} color={PRIMARY} />
                  <TextInput
                    style={styles.weightTextInput}
                    placeholder="Estimated weight (kg)"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                    value={estimatedWeight}
                    onChangeText={setEstimatedWeight}
                  />
                </View>

                {/* Collected Button */}
                <TouchableOpacity
                  onPress={() => handleAction('collected')}
                  style={styles.collectedBtn}
                  activeOpacity={0.85}
                >
                  <CheckCircle size={22} color="white" />
                  <Text style={styles.collectedBtnText}>Bin Collected ✓</Text>
                </TouchableOpacity>

                {/* Report Issue */}
                <TouchableOpacity
                  onPress={() => setReportMode(true)}
                  style={styles.reportIssueBtn}
                  activeOpacity={0.85}
                >
                  <AlertTriangle size={22} color={ORANGE} />
                  <Text style={styles.reportIssueBtnText}>Report an Issue</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <TouchableOpacity onPress={() => setReportMode(false)} style={styles.backBtnRow}>
                  <ArrowLeft size={18} color="#64748b" />
                  <Text style={styles.backBtnText}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.issueSelectLabel}>Select issue type:</Text>
                <View style={{ gap: 10, marginBottom: 20 }}>
                  {ISSUES.map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      onPress={() => setIssueType(opt)}
                      style={[
                        styles.issueOption,
                        {
                          borderColor: issueType === opt ? PRIMARY : '#e2e8f0',
                          backgroundColor: issueType === opt ? '#eef2ff' : 'white',
                        },
                      ]}
                    >
                      <Text style={[styles.issueOptionText, { color: issueType === opt ? PRIMARY : '#374151' }]}>
                        {opt}
                      </Text>
                      {issueType === opt && (
                        <View style={styles.issueCheckedCircle}>
                          <Text style={{ color: 'white', fontSize: 12, fontWeight: '800' }}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  onPress={() => handleAction('issue')}
                  disabled={!issueType}
                  style={[styles.submitReportBtn, { backgroundColor: issueType ? RED : '#fca5a5' }]}
                >
                  <Text style={{ color: 'white', fontWeight: '800', fontSize: 16 }}>Submit Report</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <CustomAlert visible={alertVisible} title={alertConfig.title} message={alertConfig.message} type={alertConfig.type} onClose={() => setAlertVisible(false)} />

      {/* ── Manual Entry Modal ─────────────── */}
      <Modal animationType="slide" transparent visible={manualModalVisible} onRequestClose={() => setManualModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { minHeight: '60%' }]}>
            <View style={styles.sheetHandle} />

            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitleText}>Manual Bin Entry</Text>
              <TouchableOpacity onPress={() => setManualModalVisible(false)} style={styles.modalCloseBtn}>
                <X size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Pill Tabs */}
            <View style={styles.pillTabsRow}>
              <TouchableOpacity
                onPress={() => setManualTab('id')}
                style={[styles.pillTabBtn, manualTab === 'id' && styles.pillTabBtnActive]}
              >
                <Text style={[styles.pillTabText, { color: manualTab === 'id' ? PRIMARY : '#64748b' }]}>By Bin Code</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setManualTab('ward')}
                style={[styles.pillTabBtn, manualTab === 'ward' && styles.pillTabBtnActive]}
              >
                <Text style={[styles.pillTabText, { color: manualTab === 'ward' ? PRIMARY : '#64748b' }]}>By Ward Selection</Text>
              </TouchableOpacity>
            </View>

            {/* Tab Content */}
            {manualTab === 'id' ? (
              <View style={{ marginBottom: 20 }}>
                <Text style={styles.inputFieldLabel}>Bin Code</Text>
                <TextInput
                  style={styles.manualTextInput}
                  value={manualBinCode}
                  onChangeText={setManualBinCode}
                  placeholder="B-..."
                  autoCapitalize="characters"
                />
              </View>
            ) : (
              <View style={{ marginBottom: 20 }}>
                <CustomDropdown
                  label="Select Ward"
                  options={wardsList.map(w => ({ label: w, value: w }))}
                  selectedValue={selectedWard}
                  onValueChange={setSelectedWard}
                  placeholder="-- Choose Ward --"
                />

                {selectedWard && (
                  <CustomDropdown
                    label="Select Bin"
                    options={allDustbins
                      .filter(b => b.ward === selectedWard)
                      .map(b => ({
                        label: b.binCode,
                        value: b._id,
                        sublabel: b.locationText || 'No location'
                      }))}
                    selectedValue={selectedBinId}
                    onValueChange={setSelectedBinId}
                    placeholder="-- Choose Bin --"
                  />
                )}
              </View>
            )}

            {/* Reason Dropdown */}
            <CustomDropdown
              label="Reason for Manual Entry"
              options={[
                { label: 'QR Code Damaged / Unreadable', value: 'QR Code Damaged / Unreadable' },
                { label: 'QR Code Missing', value: 'QR Code Missing' },
                { label: 'Camera / Phone Issue', value: 'Camera / Phone Issue' },
              ]}
              selectedValue={manualReason}
              onValueChange={setManualReason}
              placeholder="-- Select Reason --"
            />

            {/* Submit */}
            <TouchableOpacity
              onPress={submitManualEntry}
              style={styles.manualSubmitBtn}
            >
              <Text style={styles.manualSubmitBtnText}>Continue Scan Flow</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  headerArea: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(15, 10, 46, 0.65)',
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 2,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginTop: 4,
  },
  viewfinderCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  viewfinderFrame: {
    width: SCAN_FRAME_SIZE,
    height: SCAN_FRAME_SIZE,
    borderRadius: 24,
    borderWidth: 2.5,
    backgroundColor: 'transparent',
  },
  cornerMarker: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: 'white',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 18,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 18,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 18,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 18,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 12,
    fontWeight: '600',
    fontSize: 15,
  },
  bottomArea: {
    backgroundColor: 'rgba(15, 10, 46, 0.65)',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  nativeScanBanner: {
    backgroundColor: PRIMARY,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 14,
    shadowColor: PRIMARY,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  nativeScanBannerText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  actionBtnReset: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtnResetText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  actionBtnManual: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(245,158,11,0.2)',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtnManualText: {
    color: ORANGE,
    fontWeight: '700',
    fontSize: 14,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    minHeight: '55%',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitleText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
  },
  modalCloseBtn: {
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
  },
  binInfoCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  binInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  binInfoLabel: {
    color: '#64748b',
    marginLeft: 10,
    fontSize: 14,
  },
  binInfoValue: {
    color: '#1e293b',
    fontWeight: '700',
    fontSize: 14,
    flex: 1,
  },
  weightInputRow: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  weightTextInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '600',
  },
  collectedBtn: {
    backgroundColor: GREEN,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: GREEN,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  collectedBtnText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 16,
    marginLeft: 10,
  },
  reportIssueBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fde68a',
    backgroundColor: '#fffbeb',
  },
  reportIssueBtnText: {
    color: ORANGE,
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 10,
  },
  backBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backBtnText: {
    color: '#6b7280',
    marginLeft: 8,
    fontWeight: '600',
  },
  issueSelectLabel: {
    color: '#475569',
    fontWeight: '600',
    marginBottom: 12,
  },
  issueOption: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  issueOptionText: {
    fontWeight: '600',
    flex: 1,
  },
  issueCheckedCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitReportBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  pillTabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  pillTabBtnActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pillTabText: {
    fontWeight: '700',
  },
  inputFieldLabel: {
    color: '#475569',
    fontWeight: '600',
    marginBottom: 8,
  },
  manualTextInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '600',
  },
  manualSubmitBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  manualSubmitBtnText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 16,
  },
});