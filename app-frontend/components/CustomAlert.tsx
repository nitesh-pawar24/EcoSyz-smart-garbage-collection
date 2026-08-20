import React, { useEffect, useRef } from 'react';
import { Animated, Modal, Text, TouchableOpacity, View } from 'react-native';
import { CheckCircle, AlertCircle, Info, AlertTriangle, HelpCircle } from 'lucide-react-native';

// ── Types ────────────────────────────────────────────────────────────────────
export type AlertType = 'success' | 'error' | 'info' | 'warning' | 'confirm';

interface CustomAlertProps {
    visible: boolean;
    title: string;
    message: string;
    type?: AlertType;
    onClose: () => void;
    // Confirm dialog extras
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    destructive?: boolean; // makes confirm button red
    otp?: string; // renders a big OTP box
}

// ── Config per type ──────────────────────────────────────────────────────────
const CONFIG: Record<AlertType, { icon: any; color: string; bg: string; border: string }> = {
    success: { icon: CheckCircle, color: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0' },
    error: { icon: AlertCircle, color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
    info: { icon: Info, color: '#6B5BFF', bg: '#eef2ff', border: '#c7d2fe' },
    warning: { icon: AlertTriangle, color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
    confirm: { icon: HelpCircle, color: '#6B5BFF', bg: '#eef2ff', border: '#c7d2fe' },
};

// ── Component ────────────────────────────────────────────────────────────────
const CustomAlert: React.FC<CustomAlertProps> = ({
    visible, title, message, type = 'success', onClose,
    confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, destructive = false,
    otp,
}) => {
    const scale = useRef(new Animated.Value(0.85)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scale, { toValue: 1, damping: 14, stiffness: 200, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
            ]).start();
        } else {
            scale.setValue(0.85);
            opacity.setValue(0);
        }
    }, [visible]);

    const { icon: Icon, color, bg, border } = CONFIG[type] ?? CONFIG.success;
    const isConfirm = type === 'confirm';
    const confirmBg = destructive ? '#ef4444' : '#6B5BFF';
    const confirmShadow = destructive ? '#ef4444' : '#6B5BFF';

    return (
        <Modal animationType="none" transparent visible={visible} onRequestClose={onClose}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 28 }}>
                <Animated.View style={{
                    transform: [{ scale }], opacity,
                    backgroundColor: 'white', width: '100%', maxWidth: 360,
                    borderRadius: 24, overflow: 'hidden',
                    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.18, shadowRadius: 28, elevation: 18,
                }}>
                    {/* Coloured accent strip */}
                    <View style={{ height: 5, backgroundColor: color }} />

                    <View style={{ padding: 28, alignItems: 'center' }}>
                        {/* Icon circle */}
                        <View style={{
                            width: 68, height: 68, borderRadius: 34,
                            backgroundColor: bg, borderWidth: 2, borderColor: border,
                            justifyContent: 'center', alignItems: 'center', marginBottom: 18,
                        }}>
                            <Icon size={32} color={color} />
                        </View>

                        <Text style={{ fontSize: 19, fontWeight: '800', color: '#1e293b', textAlign: 'center', marginBottom: 8 }}>
                            {title}
                        </Text>
                        <Text style={{ fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 22, marginBottom: otp ? 16 : 24 }}>
                            {message}
                        </Text>

                        {otp && (
                            <View style={{
                                backgroundColor: '#f1f5f9',
                                paddingHorizontal: 24,
                                paddingVertical: 12,
                                borderRadius: 12,
                                marginBottom: 24,
                                borderWidth: 1,
                                borderColor: '#e2e8f0',
                            }}>
                                <Text style={{
                                    fontSize: 28,
                                    fontWeight: '900',
                                    color: '#0f172a',
                                    letterSpacing: 6,
                                    textAlign: 'center',
                                }}>
                                    {otp}
                                </Text>
                            </View>
                        )}

                        {/* Buttons */}
                        {isConfirm ? (
                            <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
                                {/* Cancel */}
                                <TouchableOpacity
                                    onPress={onClose}
                                    style={{
                                        flex: 1, height: 46, borderRadius: 14,
                                        backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center',
                                    }}
                                >
                                    <Text style={{ color: '#64748b', fontWeight: '700', fontSize: 15 }}>{cancelText}</Text>
                                </TouchableOpacity>
                                {/* Confirm */}
                                <TouchableOpacity
                                    onPress={() => { onClose(); onConfirm?.(); }}
                                    style={{
                                        flex: 1, height: 46, borderRadius: 14,
                                        backgroundColor: confirmBg, justifyContent: 'center', alignItems: 'center',
                                        shadowColor: confirmShadow, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
                                    }}
                                >
                                    <Text style={{ color: 'white', fontWeight: '800', fontSize: 15 }}>{confirmText}</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                onPress={onClose}
                                style={{
                                    width: '100%', height: 48, borderRadius: 14,
                                    backgroundColor: color, justifyContent: 'center', alignItems: 'center',
                                    shadowColor: color, shadowOpacity: 0.28, shadowRadius: 8, elevation: 4,
                                }}
                            >
                                <Text style={{ color: 'white', fontWeight: '800', fontSize: 15, letterSpacing: 0.3 }}>Got it</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

export default CustomAlert;
