import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Clock, MapPin, CheckCircle2, Leaf,
    Recycle, Trash2, AlertTriangle, Package, ArrowLeft, ChevronRight
} from 'lucide-react';
import { toast } from 'react-toastify';
import Breadcrumb from './shared/Breadcrumb';
import { usePanchayat } from '../context/PanchayatContext';
import api from '../api/axios';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: 'easeOut' } })
};

const wasteTypes = [
    { id: 'Organic',      icon: Leaf,          color: 'from-green-500 to-emerald-500', bg: 'bg-green-50',  border: 'border-green-100',  active: 'border-green-500 bg-green-50', desc: 'Food scraps, garden waste' },
    { id: 'Recyclable',   icon: Recycle,       color: 'from-blue-500 to-cyan-500',    bg: 'bg-blue-50',   border: 'border-blue-100',   active: 'border-blue-500 bg-blue-50',   desc: 'Paper, plastic, metal, glass' },
    { id: 'Hazardous',    icon: AlertTriangle, color: 'from-red-500 to-orange-500',   bg: 'bg-red-50',    border: 'border-red-100',    active: 'border-red-500 bg-red-50',     desc: 'Batteries, chemicals, e-waste' },
    { id: 'Bulk Items',   icon: Package,       color: 'from-purple-500 to-violet-500', bg: 'bg-purple-50', border: 'border-purple-100', active: 'border-purple-500 bg-purple-50', desc: 'Furniture, appliances' },
];

const timeSlots = ['07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'];

const ScheduleBooking = ({ navigate }) => {
    const { selectedPanchayat } = usePanchayat();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ date: '', time: '', address: '', phone: '', wasteType: '', note: '' });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [step3Errors, setStep3Errors] = useState({});

    const set = (field) => (val) => {
        setFormData(p => ({ ...p, [field]: val }));
        setStep3Errors(prev => ({ ...prev, [field]: '' }));
    };

    // Get date 1 day from now as min (advance booking)
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 1);
    const minDateStr = minDate.toISOString().split('T')[0];

    const step1Valid = formData.wasteType;
    const step2Valid = formData.date && formData.time;
    const step3Valid = formData.address;

    const handleSubmit = async () => {
        // Validate step 3 fields
        const errs = {};
        if (!formData.address.trim()) {
            errs.address = 'Pickup address is required.';
        } else if (formData.address.trim().length < 10) {
            errs.address = 'Please enter a full address (min 10 characters).';
        }
        if (formData.phone.trim() && !/^[6-9]\d{9}$/.test(formData.phone.replace(/\D/g, ''))) {
            errs.phone = 'Enter a valid 10-digit Indian mobile number.';
        }
        if (Object.keys(errs).length > 0) { setStep3Errors(errs); return; }
        if (!selectedPanchayat?._id) { toast.error('Please select a Panchayat from the header.'); return; }
        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            await api.post('/schedule-bookings', {
                panchayatId: selectedPanchayat._id,
                wasteType: formData.wasteType,
                date: formData.date,
                time: formData.time,
                address: formData.address,
                phone: formData.phone || user?.mobile,
                note: formData.note,
                userName: user?.name,
            });
            setSubmitted(true);
            toast.success('Pickup scheduled! You will receive an SMS confirmation.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to schedule. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const selectedWaste = wasteTypes.find(w => w.id === formData.wasteType);

    // ── Feature Toggle Check ──
    if (selectedPanchayat && selectedPanchayat.isScheduleEnabled === false) {
        return (
            <div className="min-h-screen py-10 px-4" style={{ background: 'var(--surface-2)' }}>
                <div className="max-w-2xl mx-auto">
                    <Breadcrumb path={[{ label: 'Dashboard', view: 'household-dashboard' }, { label: 'Schedule Pickup', view: null }]} navigate={navigate} />
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-12 text-center mt-10">
                        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-100">
                            <Clock className="w-10 h-10 text-amber-500" />
                        </div>
                        <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">Feature Temporarily Unavailable</h2>
                        <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">
                            The on-demand pickup scheduling feature is currently disabled for <strong>{selectedPanchayat.name}</strong>. Please check back later or contact your ward representative.
                        </p>
                        <button onClick={() => navigate('household-dashboard')} className="btn-primary px-8 py-3 text-sm mx-auto">
                            Back to Dashboard
                        </button>
                    </motion.div>
                </div>
            </div>
        );
    }

    // ── Success Screen ──
    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--surface-2)' }}>
                <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="card p-12 max-w-md w-full text-center"
                >
                    <div className="relative w-20 h-20 mx-auto mb-6">
                        <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-40" />
                        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-400 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
                            <CheckCircle2 className="w-10 h-10 text-white" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">Pickup Confirmed! 🎉</h2>
                    <p className="text-gray-500 text-sm mb-1">
                        Your <strong>{formData.wasteType}</strong> pickup is set for
                    </p>
                    <div className="flex items-center justify-center gap-4 my-4 p-4 bg-green-50 rounded-2xl border border-green-200">
                        <div className="text-center">
                            <p className="text-xs text-gray-400 mb-0.5">Date</p>
                            <p className="font-bold text-gray-900 text-sm">{formData.date}</p>
                        </div>
                        <div className="w-px h-8 bg-green-200" />
                        <div className="text-center">
                            <p className="text-xs text-gray-400 mb-0.5">Time</p>
                            <p className="font-bold text-gray-900 text-sm">{formData.time}</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mb-8">SMS confirmation will be sent to your registered number.</p>
                    <div className="flex gap-3">
                        <button onClick={() => navigate('household-dashboard')} className="btn-primary flex-1 py-2.5 text-sm">
                            Back to Dashboard
                        </button>
                        <button onClick={() => { setSubmitted(false); setFormData({ date: '', time: '', address: '', phone: '', wasteType: '', note: '' }); setStep(1); }} className="btn-outline flex-1 py-2.5 text-sm">
                            New Booking
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: 'var(--surface-2)' }}>
            <div className="max-w-2xl mx-auto px-4 py-10">
                <Breadcrumb path={[{ label: 'Dashboard', view: 'household-dashboard' }, { label: 'Schedule Pickup', view: null }]} navigate={navigate} />

                {/* Header */}
                <motion.div variants={fadeUp} initial="hidden" animate="visible" className="text-center mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 border border-green-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-7 h-7 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                        Schedule a <span className="gradient-text">Pickup</span>
                    </h1>
                    <p className="text-gray-400 text-sm">Choose what, when, and where in 3 easy steps.</p>
                </motion.div>

                {/* Step Progress */}
                <motion.div variants={fadeUp} custom={1} initial="hidden" animate="visible" className="flex items-center gap-0 mb-8">
                    {[1, 2, 3].map((s, i) => (
                        <React.Fragment key={s}>
                            <div className="flex flex-col items-center flex-1">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                                    step > s ? 'bg-green-500 border-green-500 text-white' :
                                    step === s ? 'bg-white border-green-500 text-green-600' :
                                    'bg-white border-gray-200 text-gray-400'
                                }`}>
                                    {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                                </div>
                                <p className={`text-xs mt-1.5 font-medium ${step === s ? 'text-green-700' : step > s ? 'text-green-500' : 'text-gray-400'}`}>
                                    {s === 1 ? 'Waste Type' : s === 2 ? 'Date & Time' : 'Address'}
                                </p>
                            </div>
                            {i < 2 && (
                                <div className={`flex-1 h-0.5 mb-5 transition-all ${step > s + 0 ? 'bg-green-400' : 'bg-gray-200'}`} />
                            )}
                        </React.Fragment>
                    ))}
                </motion.div>

                {/* Form Card */}
                <motion.div variants={fadeUp} custom={2} initial="hidden" animate="visible" className="card p-8">
                    <AnimatePresence mode="wait">

                        {/* ── STEP 1: Waste Type ── */}
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                                <h2 className="text-lg font-display font-bold text-gray-900 mb-1">What type of waste?</h2>
                                <p className="text-sm text-gray-400 mb-5">Select the category that best describes your waste.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {wasteTypes.map(w => {
                                        const Icon = w.icon;
                                        const isSelected = formData.wasteType === w.id;
                                        return (
                                            <motion.button
                                                key={w.id}
                                                whileHover={{ y: -2 }}
                                                whileTap={{ scale: 0.97 }}
                                                type="button"
                                                onClick={() => set('wasteType')(w.id)}
                                                className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                                                    isSelected ? `${w.active} shadow-md` : `${w.bg} ${w.border} hover:shadow-sm`
                                                }`}
                                            >
                                                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${w.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                                    <Icon className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 text-sm">{w.id}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">{w.desc}</p>
                                                </div>
                                                {isSelected && <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto flex-shrink-0" />}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {/* ── STEP 2: Date & Time ── */}
                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                                <h2 className="text-lg font-display font-bold text-gray-900 mb-1">When should we come?</h2>
                                <p className="text-sm text-gray-400 mb-5">Choose your preferred date and time slot.</p>

                                {/* Date */}
                                <div className="mb-5">
                                    <label className="block text-xs font-semibold text-gray-600 mb-2">
                                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-green-500" /> Preferred Date <span className="text-red-500">*</span></span>
                                    </label>
                                    <input
                                        type="date"
                                        min={minDateStr}
                                        value={formData.date}
                                        onChange={e => set('date')(e.target.value)}
                                        className="input-field"
                                    />
                                </div>

                                {/* Time Slots */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-2">
                                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-green-500" /> Preferred Time Slot <span className="text-red-500">*</span></span>
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {timeSlots.map(slot => (
                                            <motion.button
                                                key={slot}
                                                type="button"
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => set('time')(slot)}
                                                className={`py-2.5 rounded-xl text-sm font-medium border-2 transition-all flex items-center justify-center gap-1.5 ${
                                                    formData.time === slot
                                                        ? 'border-green-500 bg-green-50 text-green-700 shadow-sm'
                                                        : 'border-gray-200 bg-white text-gray-600 hover:border-green-300'
                                                }`}
                                            >
                                                {formData.time === slot && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                {slot}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ── STEP 3: Address & Confirm ── */}
                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                                <h2 className="text-lg font-display font-bold text-gray-900 mb-1">Pickup location</h2>
                                <p className="text-sm text-gray-400 mb-5">Tell us where to collect your waste.</p>

                                {/* Summary chip */}
                                {selectedWaste && (
                                    <div className="mb-5 p-3 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3 flex-wrap">
                                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${selectedWaste.color} flex items-center justify-center flex-shrink-0`}>
                                            <selectedWaste.icon className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-green-700 font-semibold">{selectedWaste.id}</p>
                                            <p className="text-xs text-green-600">{formData.date} · {formData.time}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                            Pickup Address <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                                                <MapPin className={`w-4 h-4 ${step3Errors.address ? 'text-red-400' : 'text-gray-400'}`} />
                                            </span>
                                            <textarea
                                                rows={3}
                                                value={formData.address}
                                                onChange={e => set('address')(e.target.value)}
                                                placeholder="House No, Street, Area, City (min 10 chars)..."
                                                className={`input-field resize-none ${step3Errors.address ? 'border-red-400 focus:ring-red-300' : ''}`}
                                                style={{ paddingLeft: '2.5rem' }}
                                            />
                                        </div>
                                        {step3Errors.address && <p className="mt-1 text-xs text-red-500">{step3Errors.address}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Contact Phone <span className="text-gray-400 font-normal">(optional)</span></label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={e => set('phone')(e.target.value)}
                                            placeholder="10-digit mobile number (optional)"
                                            className={`input-field ${step3Errors.phone ? 'border-red-400 focus:ring-red-300' : ''}`}
                                        />
                                        {step3Errors.phone && <p className="mt-1 text-xs text-red-500">{step3Errors.phone}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Additional Notes <span className="text-gray-400 font-normal">(optional)</span></label>
                                        <textarea
                                            rows={2}
                                            value={formData.note}
                                            onChange={e => set('note')(e.target.value)}
                                            placeholder="Any specific instructions for the pickup team..."
                                            className="input-field resize-none"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => step === 1 ? navigate('household-dashboard') : setStep(s => s - 1)}
                            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            {step === 1 ? 'Cancel' : 'Back'}
                        </button>

                        {step < 3 ? (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                type="button"
                                disabled={(step === 1 && !step1Valid) || (step === 2 && !step2Valid)}
                                onClick={() => setStep(s => s + 1)}
                                className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2 disabled:opacity-50"
                            >
                                Continue <ChevronRight className="w-4 h-4" />
                            </motion.button>
                        ) : (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                type="button"
                                disabled={!step3Valid || loading}
                                onClick={handleSubmit}
                                className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2 disabled:opacity-60"
                            >
                                {loading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                        Scheduling...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" /> Confirm Pickup
                                    </>
                                )}
                            </motion.button>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ScheduleBooking;
