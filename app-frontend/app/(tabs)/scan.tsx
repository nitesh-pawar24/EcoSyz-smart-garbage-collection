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
import { CheckCircle, AlertTriangle, MapPin, Info, ArrowLeft, Scale, Scan, X, Edit2, Camera, Zap, RefreshCw } from 'lucide-react-native';
import CustomAlert from '../../components/CustomAlert';
import CustomDropdown from '../../components/CustomDropdown';
import { request } from '../../utils/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SCAN_FRAME_SIZE = Math.min(SCREEN_WIDTH - 72, 260);

const PRIMARY = '#6B5BFF';
const GREEN = '#22c55e';
const ORANGE = '#F59E0B';
const RED = '#EF4444';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [locationPermission, requestLocationPermission] = Location.useForegroundPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [torch, setTorch] = useState(false);
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
  const [isFocused, setIsFocused] = useState(true);

  const router = useRouter();

  // Pulse animation for the scan ring
  const pulse = useRef(new Animated.Value(1)).current;
  // Laser scan vertical line animation
  const laserAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let anim: Animated.CompositeAnimation;
    let laser: Animated.CompositeAnimation;

    if (!scanned && !loading && isFocused) {
      anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.03, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      );
      anim.start();

      laser = Animated.loop(
        Animated.sequence([
          Animated.timing(laserAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
          Animated.timing(laserAnim, { toValue: 0, duration: 1800, useNativeDriver: true }),
        ])
      );
      laser.start();
    } else {
      pulse.setValue(1);
      laserAnim.setValue(0);
    }
    return () => {
      anim?.stop();
      laser?.stop();
    };
  }, [scanned, loading, isFocused]);

  useEffect(() => {
    (async () => {
      if (!locationPermission?.granted) await requestLocationPermission();
      if (!permission?.granted) await requestPermission();
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      setIsFocused(true);

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
        setIsFocused(false);
        setTorch(false);
      };
    }, [])
  );

  const barcodeScannerSettings = useMemo(() => ({
    barcodeTypes: ['qr'] as any,
  }), []);

  const handleBarCodeScanned = async (event: any) => {
    if (scanned || loading) return;
    const rawData = event?.data ?? event;
    if (!rawData) return;
    const data = String(rawData).trim();

    setScanned(true);
    setLoading(true);
    setEstimatedWeight('');
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
      if (!userStr) {
        setScanned(false);
        setLoading(false);
        return;
      }
      const user = JSON.parse(userStr);
      const labourId = user.id || user._id;

      const res = await request('/attendance/scan', {
        method: 'POST',
        body: JSON.stringify({ labourId, dustbinId: data, lat, lng }),
      });
      const resData = await res.json();
      if (res.ok) {
        setScanResult(resData);
        setModalVisible(true);
      } else {
        setAlertConfig({ title: 'Scan Failed', message: resData.message || 'Unknown error', type: 'error' });
        setAlertVisible(true);
        setScanned(false);
      }
    } catch {
      setAlertConfig({ title: 'Error', message: 'Failed to process scan', type: 'error' });
      setAlertVisible(true);
      setScanned(false);
    } finally {
      setLoading(false);
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
    
    // Trigger scan flow with manual bin code
    await handleBarCodeScanned({ type: 'manual', data: binCodeToSubmit });
  };

  const handleAction = async (action: 'collected' | 'issue') => {
    if (!scanResult?.scanId) return;
    if (action === 'issue' && !issueType) {
      setAlertConfig({ title: 'Required', message: 'Please select an issue type', type: 'error' });
      setAlertVisible(true);
      return;
    }
    if (action === 'collected' && !estimatedWeight.trim()) {
      setAlertConfig({ title: 'Required', message: 'Please enter the estimated waste volume', type: 'error' });
      setAlertVisible(true);
      return;
    }
    setLoading(true);
    try {
      const isIssue = action === 'issue';
      const finalIssueDesc = isIssue ? issueType : submittedManualReason;

      const res = await request('/attendance/update-action', {
        method: 'PUT',
        body: JSON.stringify({
          scanId: scanResult.scanId,
          action,
          issueDescription: finalIssueDesc,
          estimatedWeight: action === 'collected' ? estimatedWeight : undefined,
        }),
      });
      const resData = await res.json();
      if (res.ok) {
        setAlertConfig({
          title: 'Success ✓',
          message: action === 'collected' ? 'Bin marked as collected!' : 'Issue reported successfully!',
          type: 'success',
        });
        setAlertVisible(true);
        closeModal();
      } else {
        setAlertConfig({ title: 'Error', message: resData.message || 'Failed to update status', type: 'error' });
        setAlertVisible(true);
      }
    } catch {
      setAlertConfig({ title: 'Error', message: 'Network error', type: 'error' });
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setScanned(false);
    setScanResult(null);
    setReportMode(false);
    setIssueType('');
    setEstimatedWeight('');
    setSubmittedManualReason('');
  };

  const ISSUES = ['Waste not segregated', 'Hazardous waste', 'Civic issues (illegal dumping)', 'Bin damaged/missing'];

  if (checkingDuty) {
    return (
      <SafeAreaView style={styles.stateContainer}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={styles.stateSubtitle}>Verifying duty status...</Text>
      </SafeAreaView>
    );
  }

  if (!isAvailable) {
    return (
      <SafeAreaView style={styles.stateContainer} edges={['top']}>
        <AlertTriangle size={56} color={ORANGE} />
        <Text style={styles.stateTitle}>You are Off Duty</Text>
        <Text style={styles.stateSubtitle}>
          Please turn on your availability toggle on the dashboard to start scanning bins.
        </Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)')} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>Go to Dashboard</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!permission || !permission.granted) {
    return (
      <SafeAreaView style={styles.stateContainer} edges={['top']}>
        <Camera size={56} color={PRIMARY} />
        <Text style={styles.stateTitle}>Camera Access Needed</Text>
        <Text style={styles.stateSubtitle}>
          We need camera permission to scan dustbin QR codes quickly.
        </Text>
        <TouchableOpacity onPress={requestPermission} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const laserTranslateY = laserAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [12, SCAN_FRAME_SIZE - 16],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Native Camera Background Feed ── */}
      {isFocused ? (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={torch}
          onBarcodeScanned={scanned || loading ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={barcodeScannerSettings}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0b0621' }]} />
      )}

      {/* ── Overlay Structure with Pinned Header, Centered Frame, and Actions ── */}
      <SafeAreaView style={styles.overlayContainer} edges={['top', 'bottom']} pointerEvents="box-none">
        
        {/* Top Header Card */}
        <View style={styles.headerArea}>
          <View style={styles.headerBadge}>
            <Scan size={14} color={PRIMARY} />
            <Text style={styles.headerBadgeText}>SMART SCANNER</Text>
          </View>
          <Text style={styles.headerTitle}>SCAN DUSTBIN</Text>
          <Text style={styles.headerSubtitle}>Align the QR code within the frame to scan</Text>
        </View>

        {/* Viewfinder Center Area */}
        <View style={styles.viewfinderCenter} pointerEvents="none">
          <Animated.View
            style={[
              styles.viewfinderFrame,
              {
                borderColor: scanned ? GREEN : 'rgba(107, 91, 255, 0.7)',
                transform: [{ scale: pulse }],
              },
            ]}
          >
            {/* Corner Markers */}
            <View style={[styles.cornerMarker, styles.topLeft]} />
            <View style={[styles.cornerMarker, styles.topRight]} />
            <View style={[styles.cornerMarker, styles.bottomLeft]} />
            <View style={[styles.cornerMarker, styles.bottomRight]} />

            {/* Laser Scanning Line */}
            {!scanned && !loading && (
              <Animated.View
                style={[
                  styles.laserLine,
                  { transform: [{ translateY: laserTranslateY }] }
                ]}
              />
            )}

            {/* Loading Overlay */}
            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={PRIMARY} />
                <Text style={styles.loadingText}>Processing Bin…</Text>
              </View>
            )}
          </Animated.View>
        </View>

        {/* Bottom Actions Area */}
        <View style={styles.bottomArea} pointerEvents="box-none">
          <View style={styles.actionRow}>
            {/* Torch Toggle */}
            <TouchableOpacity
              onPress={() => setTorch(prev => !prev)}
              style={[styles.actionBtn, torch && styles.actionBtnActive]}
              activeOpacity={0.8}
            >
              <Zap size={18} color={torch ? '#fbbf24' : 'white'} fill={torch ? '#fbbf24' : 'transparent'} />
              <Text style={[styles.actionBtnText, torch && { color: '#fbbf24' }]}>
                {torch ? 'Flash On' : 'Flash'}
              </Text>
            </TouchableOpacity>

            {/* Reset Scanner */}
            <TouchableOpacity
              onPress={() => {
                setScanned(false);
                setLoading(false);
              }}
              style={styles.actionBtn}
              activeOpacity={0.8}
            >
              <RefreshCw size={18} color="white" />
              <Text style={styles.actionBtnText}>Reset</Text>
            </TouchableOpacity>

            {/* Enter Manually */}
            <TouchableOpacity
              onPress={openManualEntry}
              style={[styles.actionBtn, styles.actionBtnManual]}
              activeOpacity={0.8}
            >
              <Edit2 size={18} color={ORANGE} />
              <Text style={[styles.actionBtnText, { color: ORANGE }]}>Manual</Text>
            </TouchableOpacity>
          </View>
        </View>

      </SafeAreaView>

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

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertVisible(false)}
      />

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
    backgroundColor: '#0b0621',
  },
  stateContainer: {
    flex: 1,
    backgroundColor: '#0b0621',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  stateTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  stateSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
    fontSize: 14,
  },
  primaryBtn: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: PRIMARY,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  headerArea: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 36 : 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(11, 6, 33, 0.75)',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(107, 91, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(107, 91, 255, 0.4)',
  },
  headerBadgeText: {
    color: PRIMARY,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
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
    borderWidth: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
  },
  laserLine: {
    width: '90%',
    height: 3,
    backgroundColor: PRIMARY,
    borderRadius: 2,
    alignSelf: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 4,
  },
  cornerMarker: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: 'white',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 20,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 20,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 20,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 20,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(11, 6, 33, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 12,
    fontWeight: '700',
    fontSize: 15,
  },
  bottomArea: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: Platform.OS === 'android' ? 65 : 60,
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(11, 6, 33, 0.75)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtnActive: {
    backgroundColor: 'rgba(251, 191, 36, 0.25)',
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  actionBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 13,
  },
  actionBtnManual: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.6)',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
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