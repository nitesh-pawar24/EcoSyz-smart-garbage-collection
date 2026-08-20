import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Phone, Mail, MapPin, Send, Clock, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import Breadcrumb from './shared/Breadcrumb';
import Footer from './shared/Footer';
import { contactMembers as defaultMembers } from '../config';
import { usePanchayat } from '../context/PanchayatContext';
import api from '../api/axios';

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } })
};

const avatarColors = [
    'from-green-500 to-emerald-400',
    'from-blue-500 to-cyan-400',
    'from-purple-500 to-violet-400',
    'from-amber-500 to-orange-400',
];

const ContactPage = ({ navigate }) => {
    const { selectedPanchayat } = usePanchayat();
    const [form, setForm] = useState({ name: '', email: '', message: '' });
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [errors, setErrors] = useState({});
    const [contactMembers, setContactMembers] = useState(defaultMembers);
    const [panchayatInfo, setPanchayatInfo] = useState(null);

    const clearErr = (field) => setErrors(prev => ({ ...prev, [field]: '' }));

    /* ── Load panchayat info (address, hours, contact members) ── */
    useEffect(() => {
        if (!selectedPanchayat?._id) {
            setContactMembers(defaultMembers);
            return;
        }
        api.get(`/panchayat/${selectedPanchayat._id}`)
            .then(res => {
                const p = res.data;
                setPanchayatInfo(p);
                // Build contact members from panchayat incharge data
                if (p.inchargeName) {
                    setContactMembers([
                        {
                            name: p.inchargeName,
                            designation: 'Panchayat Incharge',
                            phone: p.contactPhone || defaultMembers[0].phone,
                            email: p.contactEmail || defaultMembers[0].email,
                        },
                        ...defaultMembers.slice(1),
                    ]);
                }
            })
            .catch(() => setContactMembers(defaultMembers));
    }, [selectedPanchayat]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!form.name.trim()) {
            newErrors.name = 'Name is required.';
        } else if (form.name.trim().length < 3) {
            newErrors.name = 'Name must be at least 3 characters.';
        }
        if (!form.email.trim()) {
            newErrors.email = 'Email is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
            newErrors.email = 'Enter a valid email address.';
        }
        if (!form.message.trim()) {
            newErrors.message = 'Message is required.';
        } else if (form.message.trim().length < 10) {
            newErrors.message = 'Message must be at least 10 characters.';
        }
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        if (!selectedPanchayat?._id) {
            toast.error('Please select a Panchayat from the header first.');
            return;
        }
        setSending(true);
        try {
            await api.post('/contact-queries', {
                panchayatId: selectedPanchayat._id,
                name: form.name,
                email: form.email,
                message: form.message,
            });
            setSent(true);
            toast.success('Message sent! We will get back to you shortly.');
            setForm({ name: '', email: '', message: '' });
        } catch {
            toast.error('Failed to send message. Please try again.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen" style={{ background: 'var(--surface-2)' }}>
            <div className="max-w-4xl mx-auto px-4 py-10">
                <Breadcrumb path={[{ label: 'Contact', view: null }]} navigate={navigate} />

                {/* Header */}
                <motion.div variants={fadeUp} initial="hidden" animate="visible" className="text-center my-10">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 border border-green-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Users className="w-7 h-7 text-green-600" />
                    </div>
                    <h1 className="text-4xl font-display font-bold text-gray-900 mb-3">
                        Contact <span className="gradient-text">Us</span>
                    </h1>
                    <p className="text-gray-500 max-w-xl mx-auto">
                        {selectedPanchayat
                            ? `Connect with the committee responsible for ${selectedPanchayat.name}.`
                            : 'Connect with the committee responsible for cleanliness and waste management in your Panchayat.'}
                    </p>
                </motion.div>

                {/* Members Grid */}
                <div className="grid sm:grid-cols-2 gap-4 mb-10">
                    {contactMembers.map((member, i) => (
                        <motion.div
                            key={i}
                            custom={i}
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            className="card relative overflow-hidden p-5"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-600 to-emerald-400" />
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center flex-shrink-0 shadow-md`}>
                                    <span className="text-lg font-bold text-white">{member.name[0]}</span>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{member.name}</p>
                                    <p className="text-xs font-semibold text-green-600">{member.designation}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <a href={`tel:${member.phone}`} className="flex items-center gap-2.5 text-sm text-gray-600 hover:text-green-700 transition-colors group">
                                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 group-hover:bg-green-100 transition-colors">
                                        <Phone className="w-3.5 h-3.5 text-green-600" />
                                    </div>
                                    {member.phone}
                                </a>
                                <a href={`mailto:${member.email}`} className="flex items-center gap-2.5 text-sm text-gray-600 hover:text-green-700 transition-colors group">
                                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 group-hover:bg-green-100 transition-colors">
                                        <Mail className="w-3.5 h-3.5 text-green-600" />
                                    </div>
                                    <span className="truncate">{member.email}</span>
                                </a>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-12">
                    {/* Office Card */}
                    <motion.div
                        custom={contactMembers.length}
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        className="card p-7"
                    >
                        <h2 className="text-lg font-display font-bold text-gray-900 mb-5">Office Details</h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <MapPin className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Address</p>
                                    <p className="text-sm text-gray-700">
                                        {panchayatInfo?.address || '123 Clean Street, Ward 5,\nPincode 415 501'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Clock className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Office Hours</p>
                                    <p className="text-sm text-gray-700">Mon – Sat: 9:00 AM – 5:00 PM<br />Sunday: Closed</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                const addr = panchayatInfo?.address || 'Panchayat Office';
                                window.open(`https://maps.google.com?q=${encodeURIComponent(addr)}`, '_blank');
                            }}
                            className="btn-outline w-full mt-5 py-2.5 text-sm flex items-center gap-2"
                        >
                            <MapPin className="w-4 h-4" /> View on Map
                        </button>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        custom={contactMembers.length + 1}
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        className="card p-7"
                    >
                        <h2 className="text-lg font-display font-bold text-gray-900 mb-5">Send a Message</h2>
                        {sent ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Send className="w-8 h-8 text-green-600" />
                                </div>
                                <p className="font-semibold text-gray-900 mb-1">Message sent!</p>
                                <p className="text-sm text-gray-500">We'll get back to you soon.</p>
                                <button
                                    onClick={() => setSent(false)}
                                    className="mt-4 btn-outline px-5 py-2 text-sm"
                                >
                                    Send another
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Your Name <span className="text-red-500">*</span></label>
                                    <input
                                        value={form.name}
                                        onChange={(e) => { setForm(p => ({ ...p, name: e.target.value })); clearErr('name'); }}
                                        placeholder="Full Name"
                                        className={`input-field text-sm py-2.5 ${errors.name ? 'border-red-400 focus:ring-red-300' : ''}`}
                                    />
                                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Email <span className="text-red-500">*</span></label>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => { setForm(p => ({ ...p, email: e.target.value })); clearErr('email'); }}
                                        placeholder="you@example.com"
                                        className={`input-field text-sm py-2.5 ${errors.email ? 'border-red-400 focus:ring-red-300' : ''}`}
                                    />
                                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Message <span className="text-red-500">*</span></label>
                                    <textarea
                                        value={form.message}
                                        onChange={(e) => { setForm(p => ({ ...p, message: e.target.value })); clearErr('message'); }}
                                        rows={3}
                                        placeholder="How can we help you? (min 10 characters)"
                                        className={`input-field text-sm py-2.5 resize-none ${errors.message ? 'border-red-400 focus:ring-red-300' : ''}`}
                                    />
                                    {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
                                </div>
                                <motion.button
                                    type="submit"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    disabled={sending}
                                    className="btn-primary w-full py-2.5 text-sm disabled:opacity-60"
                                >
                                    {sending
                                        ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Sending...</span>
                                        : <span className="flex items-center gap-2"><Send className="w-4 h-4" />Send Message</span>
                                    }
                                </motion.button>
                            </form>
                        )}
                    </motion.div>
                </div>
            </div>
            <Footer navigate={navigate} />
        </div>
    );
};

export default ContactPage;
