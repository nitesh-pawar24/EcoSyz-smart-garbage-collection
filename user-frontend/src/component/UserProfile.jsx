import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, MapPin, Lock, Save, Edit3, ArrowLeft, Shield } from 'lucide-react';

const UserProfile = ({ navigate }) => {
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({
        name: storedUser?.name || 'John Doe',
        email: storedUser?.email || 'john@example.com',
        phone: storedUser?.mobile || '+91 99999 99999',
        address: '123 Main Street, City',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        memberSince: storedUser?.createdAt ? new Date(storedUser.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Jan 2024',
    });
    const [tempProfile, setTempProfile] = useState({ ...profile });
    const [profileErrors, setProfileErrors] = useState({});

    const handleChange = (e) => {
        setTempProfile((p) => ({ ...p, [e.target.name]: e.target.value }));
        setProfileErrors(prev => ({ ...prev, [e.target.name]: '' }));
    };

    const validateProfile = () => {
        const errs = {};
        if (!tempProfile.name.trim()) {
            errs.name = 'Full name is required.';
        } else if (tempProfile.name.trim().length < 3) {
            errs.name = 'Name must be at least 3 characters.';
        } else if (!/^[a-zA-Z\s.'`-]+$/.test(tempProfile.name.trim())) {
            errs.name = 'Name can only contain letters and spaces.';
        }
        if (tempProfile.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tempProfile.email.trim())) {
            errs.email = 'Enter a valid email address.';
        }
        if (tempProfile.phone.trim() && !/^[6-9]\d{9}$/.test(tempProfile.phone.replace(/\D/g, ''))) {
            errs.phone = 'Enter a valid 10-digit Indian phone number.';
        }
        if (tempProfile.pincode.trim() && !/^\d{6}$/.test(tempProfile.pincode.trim())) {
            errs.pincode = 'Pincode must be exactly 6 digits.';
        }
        setProfileErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSave = () => {
        if (!validateProfile()) return;
        setProfile({ ...tempProfile });
        setIsEditing(false);
    };

    const fields = [
        { name: 'name', label: 'Full Name', icon: User },
        { name: 'email', label: 'Email', icon: Mail },
        { name: 'phone', label: 'Phone', icon: Phone },
        { name: 'address', label: 'Address', icon: MapPin },
        { name: 'city', label: 'City', icon: MapPin },
        { name: 'state', label: 'State', icon: MapPin },
        { name: 'pincode', label: 'Pincode', icon: MapPin },
    ];

    return (
        <div className="min-h-screen" style={{ background: 'var(--surface-2)' }}>
            <div className="max-w-3xl mx-auto px-4 py-8">
                <button
                    onClick={() => navigate('household-dashboard')}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-green-600 transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>

                {/* Avatar Card */}
                <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-8 mb-5 flex flex-col sm:flex-row items-center gap-6"
                >
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-200 flex-shrink-0">
                        <span className="text-3xl font-display font-bold text-white">
                            {profile.name?.[0]?.toUpperCase() || 'U'}
                        </span>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="text-2xl font-display font-bold text-gray-900">{profile.name}</h1>
                        <p className="text-gray-400 text-sm mt-0.5">Member since {profile.memberSince}</p>
                        <div className="inline-flex items-center gap-1.5 mt-2 badge badge-green">
                            <Shield className="w-3 h-3" />
                            Household Member
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        className={isEditing ? 'btn-primary' : 'btn-outline'}
                    >
                        {isEditing ? <><Save className="w-4 h-4" /> Save</> : <><Edit3 className="w-4 h-4" /> Edit</>}
                    </motion.button>
                </motion.div>

                <AnimatePresence mode="wait">
                    {!isEditing ? (
                        <motion.div
                            key="view"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="space-y-4"
                        >
                            {/* Info */}
                            <div className="card p-6">
                                <h3 className="text-base font-display font-bold text-gray-900 mb-4">Contact Information</h3>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {[
                                        { icon: Mail, label: 'Email', val: profile.email },
                                        { icon: Phone, label: 'Phone', val: profile.phone },
                                        { icon: MapPin, label: 'City', val: profile.city },
                                        { icon: MapPin, label: 'State', val: profile.state },
                                    ].map(({ icon: Icon, label, val }) => (
                                        <div key={label} className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                                            <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                                                <Icon className="w-4 h-4 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400">{label}</p>
                                                <p className="text-sm font-semibold text-gray-800">{val}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Address */}
                            <div className="card p-6">
                                <h3 className="text-base font-display font-bold text-gray-900 mb-3">Address</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">{profile.address}, {profile.city}, {profile.state} - {profile.pincode}</p>
                            </div>

                            {/* Security */}
                            <div className="card p-6">
                                <h3 className="text-base font-display font-bold text-gray-900 mb-3">Security</h3>
                                <motion.button
                                    whileHover={{ x: 4 }}
                                    className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100 hover:border-amber-300 hover:bg-amber-50 transition-all text-sm font-medium text-gray-700"
                                >
                                    <Lock className="w-4 h-4 text-amber-500" />
                                    Change Password / OTP Preferences
                                </motion.button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="edit"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="card p-8"
                        >
                            <h3 className="text-lg font-display font-bold text-gray-900 mb-6">Edit Profile</h3>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {fields.map(({ name, label }) => (
                                    <div key={name} className={name === 'address' ? 'sm:col-span-2' : ''}>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
                                        <input
                                            name={name}
                                            value={tempProfile[name]}
                                            onChange={handleChange}
                                            className={`input-field ${profileErrors[name] ? 'border-red-400 focus:ring-red-300' : ''}`}
                                            placeholder={label}
                                        />
                                        {profileErrors[name] && <p className="mt-1 text-xs text-red-500">{profileErrors[name]}</p>}
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button onClick={handleSave} className="btn-primary px-6 py-2.5">Save Changes</button>
                                <button onClick={() => { setIsEditing(false); setTempProfile({ ...profile }); setProfileErrors({}); }} className="btn-outline px-6 py-2.5">Cancel</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default UserProfile;
