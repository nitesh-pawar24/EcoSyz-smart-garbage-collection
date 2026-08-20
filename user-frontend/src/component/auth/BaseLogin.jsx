import React, { useState } from 'react';
import { Phone, KeyRound, X, ArrowRight, Shield, Zap, Leaf, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { usePanchayat } from '../../context/PanchayatContext';
import LoginSuccessModal from '../shared/LoginSuccessModal';

/* ── OTP Box (each digit cell) ── */
const OtpInput = ({ value, onChange }) => {
    const digits = value.split('').concat(Array(6).fill('')).slice(0, 6);
    const handleChange = (e, idx) => {
        const val = e.target.value.replace(/\D/, '');
        const arr = value.split('').concat(Array(6).fill('')).slice(0, 6);
        arr[idx] = val;
        onChange(arr.join('').slice(0, 6));
        if (val && e.target.nextSibling) e.target.nextSibling.focus();
    };
    const handleKeyDown = (e, idx) => {
        if (e.key === 'Backspace' && !digits[idx] && e.target.previousSibling)
            e.target.previousSibling.focus();
    };
    return (
        <div className="flex gap-2 justify-center">
            {digits.map((d, i) => (
                <input
                    key={i}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleChange(e, i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    className="w-11 text-center text-xl font-bold border-2 rounded-xl transition-all focus:outline-none focus:border-green-500 focus:bg-green-50"
                    style={{ height: '3.25rem', borderColor: d ? 'var(--eco-500)' : 'var(--border)' }}
                />
            ))}
        </div>
    );
};

const Field = ({ icon: Icon, placeholder, type = 'text', value, onChange, disabled }) => (
    <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Icon className="w-4 h-4 text-gray-400" />
        </span>
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className="input-field disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ paddingLeft: '2.5rem' }}
        />
    </div>
);

const BaseLogin = ({ navigate, type }) => {
    const { selectedPanchayat } = usePanchayat();
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showOtpPopup, setShowOtpPopup] = useState(null);
    const [loginSuccessUser, setLoginSuccessUser] = useState(null);
    const [pendingDashboard, setPendingDashboard] = useState(null);
    const [statusError, setStatusError] = useState(null); // { type: 'PENDING'|'REJECTED', message: '...' }

    const loginType = type === 'Company' ? 'company' : 'household';

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!mobile || mobile.length < 10) {
            toast.error('Please enter a valid 10-digit mobile number.');
            return;
        }
        if (!selectedPanchayat) {
            toast.error('Please select a Panchayat from the header first.');
            return;
        }
        setLoading(true);
        try {
            const res = await api.post('/auth/send-otp', { mobile, type: loginType, panchayatId: selectedPanchayat._id });
            if (res.data.otp) setShowOtpPopup(res.data.otp);
            toast.success('OTP sent successfully!');
            setStep(2);
        } catch (err) {
            const data = err.response?.data;
            if (data?.statusCode === 'PENDING' || data?.statusCode === 'REJECTED') {
                setStatusError({ type: data.statusCode, message: data.message });
            } else {
                toast.error(data?.message || 'Failed to send OTP. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (otp.length < 6) {
            toast.error('Please enter the complete 6-digit OTP.');
            return;
        }
        setLoading(true);
        try {
            const res = await api.post('/auth/verify-otp', { mobile, otp, type: loginType, panchayatId: selectedPanchayat._id });
            const { token, user } = res.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            const dashView = type === 'Company' ? 'company-dashboard' : 'household-dashboard';
            setPendingDashboard(dashView);
            setLoginSuccessUser(user);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLoginSuccessContinue = () => {
        setLoginSuccessUser(null);
        navigate(pendingDashboard || 'household-dashboard');
    };

    const features = [
        { icon: Shield, text: 'Secure OTP Login' },
        { icon: Zap, text: 'Instant Access' },
        { icon: Leaf, text: 'Eco-friendly System' },
    ];

    return (
        <>
        <div className="min-h-[calc(100vh-4rem)] section-hero flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                <div className="card overflow-hidden flex flex-col lg:flex-row shadow-xl">
                    {/* LEFT PANEL */}
                    <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 p-12 flex-col justify-between relative overflow-hidden">
                        <div>
                            <div className="flex items-center gap-2 mb-8">
                                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                                    <Leaf className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-display text-xl font-bold text-white">EcoSyz</span>
                            </div>
                            <h2 className="text-3xl font-display font-bold text-white leading-tight mb-4">
                                Welcome back to a cleaner future
                            </h2>
                            <p className="text-green-100 text-sm leading-relaxed">
                                Manage your {type.toLowerCase()} profile, track pickups, and submit complaints — all in one place.
                            </p>
                        </div>
                        <div className="space-y-3 mt-8">
                            {features.map(({ icon: Icon, text }) => (
                                <div key={text} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                                        <Icon className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-sm text-green-50 font-medium">{text}</span>
                                </div>
                            ))}
                        </div>
                        <div className="absolute bottom-8 right-8 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
                        <div className="absolute bottom-16 right-16 w-16 h-16 rounded-full bg-white/5 pointer-events-none" />
                    </div>

                    {/* RIGHT PANEL */}
                    <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
                        <div className="max-w-sm mx-auto w-full">
                            <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center mb-4">
                                    {step === 1 ? <Phone className="w-6 h-6 text-green-600" /> : <KeyRound className="w-6 h-6 text-green-600" />}
                                </div>
                                <h1 className="text-2xl font-display font-bold text-gray-900">
                                    {step === 1 ? `${type} Login` : 'Verify OTP'}
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    {step === 1
                                        ? 'Enter your mobile number to receive a one-time password.'
                                        : `We sent a 6-digit code to +91 ${mobile}`}
                                </p>
                            </motion.div>

                            {step === 1 && (
                                <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSendOtp} className="space-y-4">
                                    <Field
                                        icon={Phone}
                                        placeholder="Mobile Number (10 digits)"
                                        type="tel"
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value.replace(/\D/, '').slice(0, 10))}
                                    />
                                    <motion.button
                                        type="submit"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        disabled={loading}
                                        className="btn-primary w-full py-3 text-base disabled:opacity-60"
                                    >
                                        {loading ? (
                                            <span className="flex items-center gap-2">
                                                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                                Sending OTP...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">Send OTP <ArrowRight className="w-4 h-4" /></span>
                                        )}
                                    </motion.button>
                                </motion.form>
                            )}

                            {step === 2 && (
                                <motion.form
                                    initial={{ opacity: 0, x: 12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    onSubmit={handleVerifyOtp}
                                    className="space-y-5"
                                >
                                    <OtpInput value={otp} onChange={setOtp} />
                                    <motion.button
                                        type="submit"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        disabled={loading || otp.length < 6}
                                        className="btn-primary w-full py-3 text-base disabled:opacity-60"
                                    >
                                        {loading ? (
                                            <span className="flex items-center gap-2">
                                                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                                Verifying...
                                            </span>
                                        ) : 'Login to EcoSyz'}
                                    </motion.button>
                                    <div className="text-center">
                                        <button type="button" onClick={() => { setStep(1); setOtp(''); }} className="text-sm text-green-600 hover:text-green-800 font-medium transition-colors">
                                            ← Change Number
                                        </button>
                                    </div>
                                </motion.form>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* OTP POPUP MODAL */}
            <AnimatePresence>
                {showOtpPopup && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
 className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.88, y: 24 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.88, y: 24 }}
                            className="bg-white rounded-3xl p-8 max-w-xs w-full shadow-2xl relative text-center"
                        >
                            <button
                                onClick={() => setShowOtpPopup(null)}
                                className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                <X className="w-4 h-4 text-gray-500" />
                            </button>
                            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <KeyRound className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-display font-bold text-gray-900 mb-1">Your OTP</h3>
                            <p className="text-sm text-gray-500 mb-5">Use this code to complete login</p>
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl py-5 px-4 text-4xl font-mono tracking-[0.3em] font-bold text-green-700 shadow-inner mb-6">
                                {showOtpPopup}
                            </div>
                            <button onClick={() => setShowOtpPopup(null)} className="btn-primary w-full py-3">Got It!</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
        <LoginSuccessModal
            isOpen={!!loginSuccessUser}
            user={loginSuccessUser}
            onContinue={handleLoginSuccessContinue}
        />

        {/* ── Status Error Modal (Pending / Rejected) ── */}
        <AnimatePresence>
            {statusError && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
 className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    style={{ background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)' }}
                    onClick={() => setStatusError(null)}
                >
                    <motion.div
                        initial={{ scale: 0.88, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.88, y: 20, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                        onClick={e => e.stopPropagation()}
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center relative"
                    >
                        <button
                            onClick={() => setStatusError(null)}
                            className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-500" />
                        </button>

                        {statusError.type === 'PENDING' ? (
                            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                                <Clock className="w-8 h-8 text-amber-500" />
                            </div>
                        ) : (
                            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            </div>
                        )}

                        <h2 className="text-xl font-display font-bold text-gray-900 mb-2">
                            {statusError.type === 'PENDING' ? 'Approval Pending' : 'Registration Rejected'}
                        </h2>
                        <p className="text-gray-500 text-sm leading-relaxed mb-6">
                            {statusError.message}
                        </p>

                        <div className="flex flex-col gap-2">
                            <a
                                href="tel:+911800XXXXXX"
                                className="btn-primary py-2.5 text-sm"
                            >
                                📞 Contact Panchayat Office
                            </a>

                            <button
                                onClick={() => setStatusError(null)}
                                className="text-sm text-gray-400 hover:text-gray-600 transition-colors pt-1"
                            >
                                Dismiss
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
        </>
    );
};

export default BaseLogin;
