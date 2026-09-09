import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Animated,
  StyleSheet,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import {
  Mic,
  MicOff,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  X,
  Scale,
  Trash2,
  Sparkles,
} from 'lucide-react-native';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { useTheme } from '../context/ThemeContext';
import { request } from '../utils/api';
import { parseVoiceCollection } from '../utils/voiceParser';

const PRIMARY = '#6B5BFF';
const GREEN = '#22c55e';
const ORANGE = '#F59E0B';
const RED = '#EF4444';

interface VoiceCollectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function VoiceCollectionModal({
  visible,
  onClose,
  onSuccess,
}: VoiceCollectionModalProps) {
  const { theme } = useTheme();

  // Modal lifecycle states: 'listening' | 'confirming' | 'submitting' | 'error' | 'success'
  const [modalState, setModalState] = useState<
    'listening' | 'confirming' | 'submitting' | 'error' | 'success'
  >('listening');

  const [isRecognizing, setIsRecognizing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Editable confirmation card values
  const [dustbinId, setDustbinId] = useState('');
  const [weight, setWeight] = useState('');
  const [action, setAction] = useState<'collected' | 'issue'>('collected');

  // Animated pulse for microphone ring
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isRecognizing) {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.current.start();
    } else {
      pulseLoop.current?.stop();
      pulseAnim.setValue(1);
    }
    return () => pulseLoop.current?.stop();
  }, [isRecognizing]);

  // Speech Recognition Event Listeners
  useSpeechRecognitionEvent('start', () => {
    setIsRecognizing(true);
  });

  useSpeechRecognitionEvent('end', () => {
    setIsRecognizing(false);
  });

  useSpeechRecognitionEvent('result', (event) => {
    const speechText = event.results[0]?.transcript || '';
    if (speechText) {
      setTranscript(speechText);
      if (event.isFinal) {
        processTranscript(speechText);
      }
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    setIsRecognizing(false);
    console.log('Speech Recognition Error:', event.error, event.message);
    if (modalState === 'listening' && !transcript) {
      setErrorMessage(
        event.message || 'Speech recognition encountered an issue. Please try again.'
      );
      setModalState('error');
    }
  });

  // Start speech recognition when modal opens
  useEffect(() => {
    if (visible) {
      resetAndStartListening();
    } else {
      stopSpeechRecognition();
    }
  }, [visible]);

  const stopSpeechRecognition = async () => {
    try {
      await ExpoSpeechRecognitionModule.stop();
    } catch {
      // Ignore if not currently running
    }
    setIsRecognizing(false);
  };

  const resetAndStartListening = async () => {
    setModalState('listening');
    setTranscript('');
    setErrorMessage('');
    setDustbinId('');
    setWeight('');
    setAction('collected');

    try {
      const permission =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permission.granted) {
        setErrorMessage(
          'Microphone permission is required for voice collection. Please allow access.'
        );
        setModalState('error');
        return;
      }

      await ExpoSpeechRecognitionModule.start({
        lang: 'en-IN',
        interimResults: true,
        continuous: false,
      });
      setIsRecognizing(true);
    } catch (err: any) {
      console.log('Start Recognition Error:', err);
      setErrorMessage(
        'Speech recognition service is unavailable on this device. You can type or try again.'
      );
      setModalState('error');
    }
  };

  const processTranscript = (spokenText: string) => {
    if (!spokenText.trim()) return;

    const parsed = parseVoiceCollection(spokenText);
    if (parsed.isValid && parsed.dustbinId) {
      setDustbinId(parsed.dustbinId);
      setWeight(parsed.weight ? String(parsed.weight) : '');
      setAction(parsed.action || 'collected');
      setModalState('confirming');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setErrorMessage(
        parsed.errorMessage ||
          'Could not understand collection details. Please try speaking again.'
      );
      setModalState('error');
    }
  };

  const handleManualStopAndParse = async () => {
    await stopSpeechRecognition();
    if (transcript.trim()) {
      processTranscript(transcript);
    } else {
      setErrorMessage('No speech detected. Please try speaking again.');
      setModalState('error');
    }
  };

  // Submit through existing collection APIs
  const handleConfirmAndSubmit = async () => {
    if (!dustbinId.trim()) {
      setErrorMessage('Please provide a valid dustbin ID.');
      return;
    }
    if (action === 'collected' && (!weight.trim() || isNaN(Number(weight)) || Number(weight) <= 0)) {
      setErrorMessage('Please provide a valid waste weight in kg.');
      return;
    }

    setModalState('submitting');

    try {
      // 1. Get GPS Location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMessage('Location access is required to record bin collection.');
        setModalState('error');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});

      // 2. Get Labour Auth Info
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) {
        setErrorMessage('Authentication session missing. Please log in again.');
        setModalState('error');
        return;
      }
      const user = JSON.parse(userStr);

      // 3. Step 1: POST /attendance/scan
      const scanRes = await request('/attendance/scan', {
        method: 'POST',
        body: JSON.stringify({
          labourId: user.id,
          dustbinId: dustbinId.trim(),
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        }),
      });

      const scanData = await scanRes.json();
      if (!scanRes.ok) {
        setErrorMessage(scanData.message || 'Dustbin scan validation failed.');
        setModalState('error');
        return;
      }

      // 4. Step 2: PUT /attendance/update-action
      const actionRes = await request('/attendance/update-action', {
        method: 'PUT',
        body: JSON.stringify({
          scanId: scanData.scanId,
          action: action,
          issueDescription: action === 'issue' ? 'Voice reported issue' : '',
          estimatedWeight: action === 'collected' ? weight : undefined,
        }),
      });

      const actionData = await actionRes.json();
      if (!actionRes.ok) {
        setErrorMessage(actionData.message || 'Failed to update collection record.');
        setModalState('error');
        return;
      }

      // Success
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setModalState('success');

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1400);
    } catch (error: any) {
      console.error('Voice Collection Submit Error:', error);
      setErrorMessage(error.message || 'Network error occurred while submitting.');
      setModalState('error');
    }
  };

  const handleClose = async () => {
    await stopSpeechRecognition();
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View
          style={[
            styles.modalContent,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleRow}>
              <View style={styles.sparkleIconContainer}>
                <Sparkles size={18} color={PRIMARY} />
              </View>
              <Text style={[styles.headerTitle, { color: theme.text }]}>
                Voice Collection
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={20} color={theme.muted} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
          >
            {/* ── STATE: LISTENING ───────────────────────────── */}
            {modalState === 'listening' && (
              <View style={styles.stateCenterContainer}>
                <Text style={[styles.stateSubtitle, { color: theme.subtext }]}>
                  Say something like:
                </Text>
                <Text style={[styles.exampleText, { color: PRIMARY }]}>
                  "Bin 123 collected with 3 kg weight"
                </Text>

                {/* Animated Mic Ring */}
                <View style={styles.micRingWrapper}>
                  <Animated.View
                    style={[
                      styles.micPulseRing,
                      {
                        transform: [{ scale: pulseAnim }],
                        borderColor: isRecognizing ? PRIMARY : '#cbd5e1',
                      },
                    ]}
                  />
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleManualStopAndParse}
                    style={[
                      styles.micMainButton,
                      { backgroundColor: isRecognizing ? PRIMARY : '#94a3b8' },
                    ]}
                  >
                    {isRecognizing ? (
                      <Mic size={36} color="white" />
                    ) : (
                      <MicOff size={36} color="white" />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Live Status indicator */}
                <View style={styles.statusIndicatorRow}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: isRecognizing ? GREEN : ORANGE },
                    ]}
                  />
                  <Text style={[styles.statusText, { color: theme.muted }]}>
                    {isRecognizing ? 'Listening... Speak now' : 'Processing speech...'}
                  </Text>
                </View>

                {/* Live Transcript Box */}
                <View
                  style={[
                    styles.transcriptBox,
                    {
                      backgroundColor: theme.dark ? '#1e1e2d' : '#f8fafc',
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.transcriptText,
                      { color: transcript ? theme.text : theme.muted },
                    ]}
                  >
                    {transcript || 'Listening for your voice...'}
                  </Text>
                </View>

                {/* Action button */}
                <TouchableOpacity
                  onPress={handleManualStopAndParse}
                  style={[styles.actionBtn, { backgroundColor: PRIMARY }]}
                >
                  <Text style={styles.actionBtnText}>Done Speaking</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── STATE: CONFIRMING ──────────────────────────── */}
            {modalState === 'confirming' && (
              <View style={styles.confirmationContainer}>
                <Text style={[styles.confirmTitle, { color: theme.text }]}>
                  Confirm Collection Details
                </Text>
                <Text style={[styles.confirmSubtitle, { color: theme.subtext }]}>
                  Please verify or edit the extracted information before submitting.
                </Text>

                {/* Dustbin ID Input */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>
                    Dustbin / Bin ID:
                  </Text>
                  <View
                    style={[
                      styles.inputBox,
                      {
                        backgroundColor: theme.dark ? '#1e1e2d' : '#f8fafc',
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Trash2 size={18} color={PRIMARY} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.textInput, { color: theme.text }]}
                      value={dustbinId}
                      onChangeText={setDustbinId}
                      placeholder="e.g. 123 or B-102"
                      placeholderTextColor={theme.muted}
                      autoCapitalize="characters"
                    />
                  </View>
                </View>

                {/* Action Selector */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>
                    Action / Status:
                  </Text>
                  <View style={styles.actionToggleRow}>
                    <TouchableOpacity
                      onPress={() => setAction('collected')}
                      style={[
                        styles.togglePill,
                        action === 'collected'
                          ? { backgroundColor: GREEN, borderColor: GREEN }
                          : {
                              backgroundColor: theme.dark ? '#1e1e2d' : '#f1f5f9',
                              borderColor: theme.border,
                            },
                      ]}
                    >
                      <CheckCircle
                        size={16}
                        color={action === 'collected' ? 'white' : theme.muted}
                      />
                      <Text
                        style={[
                          styles.togglePillText,
                          { color: action === 'collected' ? 'white' : theme.muted },
                        ]}
                      >
                        Collected
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setAction('issue')}
                      style={[
                        styles.togglePill,
                        action === 'issue'
                          ? { backgroundColor: ORANGE, borderColor: ORANGE }
                          : {
                              backgroundColor: theme.dark ? '#1e1e2d' : '#f1f5f9',
                              borderColor: theme.border,
                            },
                      ]}
                    >
                      <AlertTriangle
                        size={16}
                        color={action === 'issue' ? 'white' : theme.muted}
                      />
                      <Text
                        style={[
                          styles.togglePillText,
                          { color: action === 'issue' ? 'white' : theme.muted },
                        ]}
                      >
                        Report Issue
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Weight Input (Only for collected) */}
                {action === 'collected' && (
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: theme.text }]}>
                      Waste Weight (kg):
                    </Text>
                    <View
                      style={[
                        styles.inputBox,
                        {
                          backgroundColor: theme.dark ? '#1e1e2d' : '#f8fafc',
                          borderColor: theme.border,
                        },
                      ]}
                    >
                      <Scale size={18} color={PRIMARY} style={styles.inputIcon} />
                      <TextInput
                        style={[styles.textInput, { color: theme.text }]}
                        value={weight}
                        onChangeText={setWeight}
                        placeholder="e.g. 3 or 4.5"
                        placeholderTextColor={theme.muted}
                        keyboardType="numeric"
                      />
                      <Text style={[styles.unitText, { color: theme.muted }]}>kg</Text>
                    </View>
                  </View>
                )}

                {/* Transcript reminder snippet */}
                {transcript ? (
                  <Text style={[styles.transcriptSnippet, { color: theme.muted }]}>
                    Heard: "{transcript}"
                  </Text>
                ) : null}

                {/* Action Buttons */}
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    onPress={resetAndStartListening}
                    style={[styles.retryBtn, { borderColor: theme.border }]}
                  >
                    <RotateCcw size={18} color={theme.subtext} />
                    <Text style={[styles.retryBtnText, { color: theme.subtext }]}>
                      Record Again
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleConfirmAndSubmit}
                    style={[styles.confirmBtn, { backgroundColor: PRIMARY }]}
                  >
                    <CheckCircle size={18} color="white" />
                    <Text style={styles.confirmBtnText}>Confirm & Submit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ── STATE: SUBMITTING ──────────────────────────── */}
            {modalState === 'submitting' && (
              <View style={styles.stateCenterContainer}>
                <ActivityIndicator size="large" color={PRIMARY} />
                <Text style={[styles.submittingTitle, { color: theme.text }]}>
                  Recording Collection...
                </Text>
                <Text style={[styles.submittingSubtitle, { color: theme.muted }]}>
                  Validating dustbin and syncing waste metrics
                </Text>
              </View>
            )}

            {/* ── STATE: SUCCESS ─────────────────────────────── */}
            {modalState === 'success' && (
              <View style={styles.stateCenterContainer}>
                <View style={styles.successIconCircle}>
                  <CheckCircle size={44} color="white" />
                </View>
                <Text style={[styles.successTitle, { color: theme.text }]}>
                  Collection Recorded!
                </Text>
                <Text style={[styles.successSubtitle, { color: theme.subtext }]}>
                  Bin {dustbinId} marked as {action} ({weight ? `${weight} kg` : ''})
                </Text>
              </View>
            )}

            {/* ── STATE: ERROR ───────────────────────────────── */}
            {modalState === 'error' && (
              <View style={styles.stateCenterContainer}>
                <View style={styles.errorIconCircle}>
                  <AlertTriangle size={36} color={RED} />
                </View>
                <Text style={[styles.errorTitle, { color: theme.text }]}>
                  Notice
                </Text>
                <Text style={[styles.errorMessageText, { color: theme.subtext }]}>
                  {errorMessage || 'An error occurred during voice collection.'}
                </Text>
                {transcript ? (
                  <Text style={[styles.transcriptSnippet, { color: theme.muted, marginTop: 8 }]}>
                    Heard: "{transcript}"
                  </Text>
                ) : null}

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    onPress={handleClose}
                    style={[styles.cancelBtn, { borderColor: theme.border }]}
                  >
                    <Text style={[styles.cancelBtnText, { color: theme.muted }]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={resetAndStartListening}
                    style={[styles.retryBtnFilled, { backgroundColor: PRIMARY }]}
                  >
                    <RotateCcw size={16} color="white" />
                    <Text style={styles.retryBtnFilledText}>Try Again</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    minHeight: '55%',
    maxHeight: '85%',
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sparkleIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ede9fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  closeButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  stateCenterContainer: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  stateSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  exampleText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  micRingWrapper: {
    width: 110,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  micPulseRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    backgroundColor: 'rgba(107, 91, 255, 0.08)',
  },
  micMainButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  statusIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  transcriptBox: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 64,
    justifyContent: 'center',
    marginBottom: 20,
  },
  transcriptText: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
  },
  actionBtn: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: PRIMARY,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  actionBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
  },
  confirmationContainer: {
    paddingVertical: 8,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  confirmSubtitle: {
    fontSize: 13,
    marginBottom: 18,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  unitText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
  actionToggleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  togglePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  togglePillText: {
    fontSize: 14,
    fontWeight: '700',
  },
  transcriptSnippet: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  retryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  retryBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  confirmBtn: {
    flex: 1.6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: PRIMARY,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '800',
  },
  submittingTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 18,
  },
  submittingSubtitle: {
    fontSize: 13,
    marginTop: 6,
  },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: GREEN,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  successSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  errorIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  errorMessageText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
    paddingHorizontal: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  retryBtnFilled: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  retryBtnFilledText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '800',
  },
});
