import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
    User, Mail, Lock, Home, MapPin, Phone, Upload,
    FileText, CheckCircle2, ChevronRight, Leaf, ArrowLeft, Eye, EyeOff
} from 'lucide-react';
import api from '../api/axios';
import { usePanchayat } from '../context/PanchayatContext';
import Breadcrumb from './shared/Breadcrumb';
import Footer from './shared/Footer';

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.45 } })
};

/* ─── Defined OUTSIDE RegisterPage so React never remounts it on state change ─── */
const InputField = ({ label, icon: Icon, type = 'text', value, onChange, placeholder, required = false, error }) => (
    <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <div className="relative">
            {Icon && (
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Icon className="w-4 h-4 text-gray-400" />
                </span>
            )}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`input-field ${error ? 'border-red-400 focus:ring-red-300' : ''} ${Icon ? '!pl-10' : ''}`}
            />
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
);

const RegisterPage = ({ navigate }) => {
    const { selectedPanchayat } = usePanchayat();

    const [form, setForm] = useState({
        ownerName: '',
        email: '',
        mobile: '',
        houseNumber: '',
        ward: '',
        address: '',
        pincode: '',
    });
    const [wards, setWards] = useState([]);
    const [identityFile, setIdentityFile] = useState(null);
    const [premisesFile, setPremisesFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchingWards, setFetchingWards] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState({});

    const clearError = (field) => setErrors(prev => ({ ...prev, [field]: '' }));

    // Fetch wards whenever panchayat changes
    React.useEffect(() => {
        if (selectedPanchayat?._id) {
            const fetchWards = async () => {
                setFetchingWards(true);
                try {
                    const res = await api.get(`/wards/public?panchayatId=${selectedPanchayat._id}`);
                    setWards(Array.isArray(res.data) ? res.data : []);
                    // Reset ward
                    setForm(p => ({ ...p, ward: '' }));
                } catch (err) {
                    console.error('Error fetching wards:', err);
                    toast.error('Could not fetch wards for the selected Panchayat.');
                } finally {
                    setFetchingWards(false);
                }
            };
            fetchWards();
        } else {
            setWards([]);
        }
    }, [selectedPanchayat]);

    const update = (field) => (e) => {
        setForm(p => ({ ...p, [field]: e.target.value }));
        clearError(field);
    };

    const MAX_FILE_MB = 5;

    const validate = () => {
        const newErrors = {};

        // Panchayat
        if (!selectedPanchayat?._id) {
            toast.error('Please select your Panchayat first from the top bar.');
            return false;
        }

        // Full Name
        if (!form.ownerName.trim()) {
            newErrors.ownerName = 'Full name is required.';
        } else if (form.ownerName.trim().length < 3) {
            newErrors.ownerName = 'Name must be at least 3 characters.';
        } else if (!/^[a-zA-Z\s.'-]+$/.test(form.ownerName.trim())) {
            newErrors.ownerName = 'Name can only contain letters, spaces, and . \' -';
        }

        // Email (optional but must be valid if provided)
        if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
            newErrors.email = 'Enter a valid email address.';
        }

        // Mobile
        if (!form.mobile.trim()) {
            newErrors.mobile = 'Mobile number is required.';
        } else if (!/^[6-9]\d{9}$/.test(form.mobile.trim())) {
            newErrors.mobile = 'Enter a valid 10-digit Indian mobile number (starts with 6-9).';
        }

        // House Number
        if (!form.houseNumber.trim()) {
            newErrors.houseNumber = 'House number is required.';
        }

        // Ward
        if (wards.length > 0 && !form.ward) {
            newErrors.ward = 'Please select a ward.';
        }

        // Pincode (required, must be 6 digits)
        if (!form.pincode.trim()) {
            newErrors.pincode = 'Pincode is required.';
        } else if (!/^\d{6}$/.test(form.pincode.trim())) {
            newErrors.pincode = 'Pincode must be exactly 6 digits.';
        }

        // Full Address
        if (!form.address.trim()) {
            newErrors.address = 'Full address is required.';
        } else if (form.address.trim().length < 10) {
            newErrors.address = 'Address must be at least 10 characters.';
        }

        // Identity File
        if (!identityFile) {
            newErrors.identityFile = 'Identity proof document is required.';
        } else if (identityFile.size > MAX_FILE_MB * 1024 * 1024) {
            newErrors.identityFile = `File size must be under ${MAX_FILE_MB} MB.`;
        }

        // Premises File
        if (!premisesFile) {
            newErrors.premisesFile = 'Premises proof document is required.';
        } else if (premisesFile.size > MAX_FILE_MB * 1024 * 1024) {
            newErrors.premisesFile = `File size must be under ${MAX_FILE_MB} MB.`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const data = new FormData();
            data.append('ownerName', form.ownerName);
            data.append('email', form.email);
            data.append('mobile', form.mobile);
            data.append('houseNumber', form.houseNumber);
            data.append('address', form.address);
            data.append('ward', wards.length > 0 ? form.ward : 'Unassigned');
            data.append('pincode', form.pincode);
            data.append('panchayatId', selectedPanchayat._id);
            if (identityFile) data.append('identity', identityFile);
            if (premisesFile) data.append('premises', premisesFile);

            const res = await api.post('/households/register', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                setSubmitted(true);
                toast.success('Registration submitted successfully!');
            } else {
                toast.error(res.data.message || 'Registration failed.');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not connect to server. Try again.');
        } finally {
            setLoading(false);
        }
    };


    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--surface-2)' }}>
                <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="card p-12 max-w-md w-full text-center"
                >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-gray-900 mb-3">
                        Registration Submitted!
                    </h2>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4">
                        Your registration request for <span className="font-semibold text-gray-800">{selectedPanchayat?.name}</span> is under review. The Panchayat admin will approve it shortly.
                    </p>
                    <p className="text-xs text-gray-400 mb-8">You will be able to log in once your account is approved.</p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={() => navigate('home')} className="btn-primary px-6 py-2.5 text-sm">
                            Back to Home
                        </button>
                        <button onClick={() => navigate('login-household')} className="btn-outline px-6 py-2.5 text-sm">
                            Try Login
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: 'var(--surface-2)' }}>
            <div className="max-w-3xl mx-auto px-4 py-10">
                <Breadcrumb path={[{ label: 'Register', view: null }]} navigate={navigate} />

                {/* Header */}
                <motion.div variants={fadeUp} initial="hidden" animate="visible" className="text-center mb-10">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 border border-green-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Leaf className="w-7 h-7 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                        Household <span className="gradient-text">Registration</span>
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Register your household under{' '}
                        <span className="font-semibold text-green-700">
                            {selectedPanchayat ? selectedPanchayat.name : 'your Panchayat'}
                        </span>
                    </p>
                </motion.div>

                {!selectedPanchayat && (
                    <motion.div variants={fadeUp} custom={1} initial="hidden" animate="visible"
                        className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 text-sm flex items-center gap-3">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span>Please select your <strong>Panchayat</strong> from the top bar before registering.</span>
                    </motion.div>
                )}

                <motion.form
                    variants={fadeUp}
                    custom={2}
                    initial="hidden"
                    animate="visible"
                    onSubmit={handleSubmit}
                    className="card p-8 space-y-6"
                >
                    {/* Personal Info */}
                    <div>
                        <h2 className="text-base font-display font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                            Personal Information
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <InputField label="Full Name (Owner)" icon={User} value={form.ownerName} onChange={update('ownerName')} placeholder="Enter full name" required error={errors.ownerName} />
                            <InputField label="Email Address" icon={Mail} type="email" value={form.email} onChange={update('email')} placeholder="Enter email (optional)" error={errors.email} />
                            <InputField label="Mobile Number" icon={Phone} type="tel" value={form.mobile} onChange={update('mobile')} placeholder="10-digit mobile number" required error={errors.mobile} />
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <h2 className="text-base font-display font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                            Address Details
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <InputField label="House Number" icon={Home} value={form.houseNumber} onChange={update('houseNumber')} placeholder="Enter house number" required error={errors.houseNumber} />
                            {wards.length > 0 && (
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                        Area / Ward<span className="text-red-500 ml-0.5">*</span>
                                    </label>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                        </span>
                                        <select
                                            value={form.ward}
                                            onChange={(e) => { update('ward')(e); clearError('ward'); }}
                                            className={`input-field appearance-none pr-8 !pl-10 ${errors.ward ? 'border-red-400 focus:ring-red-300' : ''}`}
                                            disabled={fetchingWards || !selectedPanchayat}
                                        >
                                            <option value="">{fetchingWards ? 'Loading wards...' : 'Select Ward'}</option>
                                            {wards.map(w => (
                                                <option key={w._id} value={w.name}>{w.name}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                                            <ChevronRight className="w-4 h-4 rotate-90" />
                                        </div>
                                    </div>
                                    {errors.ward && <p className="mt-1 text-xs text-red-500">{errors.ward}</p>}
                                </div>
                            )}
                            <InputField label="Pincode" icon={MapPin} value={form.pincode} onChange={update('pincode')} placeholder="Enter 6-digit pincode" required error={errors.pincode} />
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                    Full Address<span className="text-red-500 ml-0.5">*</span>
                                </label>
                                <textarea
                                    value={form.address}
                                    onChange={(e) => { update('address')(e); clearError('address'); }}
                                    rows={2}
                                    placeholder="Street, Area, City..."
                                    className={`input-field resize-none ${errors.address ? 'border-red-400 focus:ring-red-300' : ''}`}
                                />
                                {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Document Uploads */}
                    <div>
                        <h2 className="text-base font-display font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                            Upload Documents
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {/* Identity */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                    Identity Proof<span className="text-red-500 ml-0.5">*</span>
                                </label>
                                <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-5 cursor-pointer transition-all group ${
                                    errors.identityFile ? 'border-red-400 bg-red-50' : identityFile ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-green-400 hover:bg-green-50'
                                }`}>
                                    <Upload className={`w-6 h-6 mb-2 transition-colors ${identityFile ? 'text-green-500' : errors.identityFile ? 'text-red-400' : 'text-gray-400 group-hover:text-green-500'}`} />
                                    <span className={`text-sm font-medium transition-colors ${identityFile ? 'text-green-700' : errors.identityFile ? 'text-red-500' : 'text-gray-600 group-hover:text-green-700'}`}>
                                        {identityFile ? identityFile.name : 'Choose file'}
                                    </span>
                                    <span className="text-xs text-gray-400 mt-1">Aadhaar, Passport, Voter ID · Max 5 MB</span>
                                    <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;
                                        const allowed = ['application/pdf','image/jpeg','image/png','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
                                        if (!allowed.includes(file.type)) {
                                            setErrors(prev => ({ ...prev, identityFile: 'Only PDF, JPG, PNG, DOC or DOCX files are accepted.' }));
                                            e.target.value = ''; return;
                                        }
                                        setIdentityFile(file); clearError('identityFile');
                                    }} className="hidden" />
                                </label>
                                {errors.identityFile && <p className="mt-1 text-xs text-red-500">{errors.identityFile}</p>}
                            </div>
                            {/* Premises */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                    Premises Proof<span className="text-red-500 ml-0.5">*</span>
                                </label>
                                <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-5 cursor-pointer transition-all group ${
                                    errors.premisesFile ? 'border-red-400 bg-red-50' : premisesFile ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-green-400 hover:bg-green-50'
                                }`}>
                                    <Upload className={`w-6 h-6 mb-2 transition-colors ${premisesFile ? 'text-green-500' : errors.premisesFile ? 'text-red-400' : 'text-gray-400 group-hover:text-green-500'}`} />
                                    <span className={`text-sm font-medium transition-colors ${premisesFile ? 'text-green-700' : errors.premisesFile ? 'text-red-500' : 'text-gray-600 group-hover:text-green-700'}`}>
                                        {premisesFile ? premisesFile.name : 'Choose file'}
                                    </span>
                                    <span className="text-xs text-gray-400 mt-1">Electricity bill, Rent agreement · Max 5 MB</span>
                                    <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;
                                        const allowed = ['application/pdf','image/jpeg','image/png','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
                                        if (!allowed.includes(file.type)) {
                                            setErrors(prev => ({ ...prev, premisesFile: 'Only PDF, JPG, PNG, DOC or DOCX files are accepted.' }));
                                            e.target.value = ''; return;
                                        }
                                        setPremisesFile(file); clearError('premisesFile');
                                    }} className="hidden" />
                                </label>
                                {errors.premisesFile && <p className="mt-1 text-xs text-red-500">{errors.premisesFile}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Panchayat chip */}
                    {selectedPanchayat && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-200 text-sm text-green-800">
                            <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" />
                            Registering under: <strong>{selectedPanchayat.name}</strong>
                        </div>
                    )}

                    {/* Submit */}
                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.015 }}
                        whileTap={{ scale: 0.97 }}
                        disabled={loading}
                        className="btn-primary w-full py-3.5 text-base disabled:opacity-60"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2 justify-center">
                                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                Submitting...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2 justify-center">
                                <CheckCircle2 className="w-5 h-5" /> Register
                            </span>
                        )}
                    </motion.button>

                    <p className="text-center text-sm text-gray-500">
                        Already registered?{' '}
                        <button type="button" onClick={() => navigate('login-household')} className="text-green-700 font-semibold hover:underline">
                            Login here
                        </button>
                    </p>
                </motion.form>
            </div>
            <Footer navigate={navigate} />
        </div>
    );
};

export default RegisterPage;
