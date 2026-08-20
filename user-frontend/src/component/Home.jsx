import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Users, Zap, Globe, Clock, CheckCircle,
    ArrowRight, Leaf, BarChart2, Calendar, AlertCircle,
    ChevronRight
} from 'lucide-react';
import { committeeMembers as defaultCommittee, contactMembers } from '../config';
import Footer from './shared/Footer';
import { usePanchayat } from '../context/PanchayatContext';
import api from '../api/axios';

import img1 from '../assets/imgg1.png';
import img2 from '../assets/imgg.png';
import img3 from '../assets/img3.png';

const slides = [
    { image: img1, title: 'Smart Waste Collection', sub: 'Powered by technology, driven by community.' },
    { image: img2, title: 'Real-Time Tracking', sub: 'Know exactly when the vehicle arrives.' },
    { image: img3, title: 'Clean Tomorrow', sub: 'A greener future starts with you.' },
];

const features = [
    { icon: Globe, title: 'Easy Scheduling', desc: 'Book pickups at your convenience', color: 'bg-blue-50 text-blue-600' },
    { icon: Zap, title: 'Real-time Tracking', desc: 'Live updates on collection status', color: 'bg-amber-50 text-amber-600' },
    { icon: Clock, title: '24/7 Support', desc: 'Round-the-clock assistance', color: 'bg-purple-50 text-purple-600' },
    { icon: CheckCircle, title: 'Quality Assured', desc: 'Certified eco-friendly processes', color: 'bg-green-50 text-green-600' },
];

const quickActions = [
    { icon: AlertCircle, label: 'Submit Complaint', view: 'complaint', color: 'from-red-500 to-rose-400' },
    { icon: Calendar, label: 'Schedule Pickup', view: 'schedule-booking', color: 'from-blue-500 to-cyan-400' },
    { icon: BarChart2, label: 'View Statistics', view: 'statisticsReports', color: 'from-purple-500 to-violet-400' },
];

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' } })
};

const HomePage = ({ navigate }) => {
    const { selectedPanchayat } = usePanchayat();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [panchayatDetails, setPanchayatDetails] = useState(null);
    const [committeeMembers, setCommitteeMembers] = useState(defaultCommittee);
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        const interval = setInterval(() => setCurrentSlide((p) => (p + 1) % slides.length), 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!selectedPanchayat?._id) {
            setCommitteeMembers(defaultCommittee);
            return;
        }
        // Fetch panchayat details
        api.get(`/panchayat/${selectedPanchayat._id}`).then((res) => {
            setPanchayatDetails(res.data);
            if (res.data.inchargeName) {
                setCommitteeMembers([
                    { name: res.data.inchargeName, designation: 'Panchayat Incharge', contact: res.data.contactPhone },
                    ...defaultCommittee.slice(1)
                ]);
            }
        }).catch(() => {});

        // Fetch leadership content from CMS if published
        api.get(`/content/public/${selectedPanchayat._id}?type=leadership`)
            .then((res) => {
                const members = res.data?.leadershipMembers;
                if (members && members.length > 0) {
                    setCommitteeMembers(members.map(m => ({
                        name: m.name,
                        designation: m.designation,
                        contact: m.contact,
                        phone: m.contact,
                    })));
                }
            })
            .catch(() => {}); // silently fall back
    }, [selectedPanchayat]);


    return (
        <div className="overflow-x-hidden">

            {/* ═══════════ HERO ═══════════ */}
            <section className="relative w-full aspect-[16/7] max-h-[560px] min-h-[280px] overflow-hidden">
                {slides.map((slide, i) => (
                    <motion.div
                        key={i}
                        className="absolute inset-0"
                        animate={{ opacity: i === currentSlide ? 1 : 0 }}
                        transition={{ duration: 0.9 }}
                    >
                        <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 px-4 text-center">
                            <motion.h1
                                key={`${i}-title`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: i === currentSlide ? 1 : 0, y: i === currentSlide ? 0 : 20 }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                                className="text-3xl sm:text-5xl font-display font-bold text-white drop-shadow-lg mb-2"
                            >
                                {slide.title}
                            </motion.h1>
                            <motion.p
                                key={`${i}-sub`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: i === currentSlide ? 1 : 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-lg text-white/80 mb-6"
                            >
                                {slide.sub}
                            </motion.p>
                            {!user && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: i === currentSlide ? 1 : 0, scale: 1 }}
                                    transition={{ delay: 0.5 }}
                                    onClick={() => navigate('login-household')}
                                    className="btn-primary px-8 py-3 text-base shadow-xl"
                                >
                                    Get Started <ArrowRight className="w-5 h-5" />
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                ))}

                {/* Slide dots */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentSlide(i)}
                            className={`transition-all duration-300 rounded-full ${
                                i === currentSlide ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50'
                            }`}
                        />
                    ))}
                </div>

                {/* Prev/Next */}
                <button
                    onClick={() => setCurrentSlide((p) => (p - 1 + slides.length) % slides.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-all backdrop-blur-sm"
                >❮</button>
                <button
                    onClick={() => setCurrentSlide((p) => (p + 1) % slides.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-all backdrop-blur-sm"
                >❯</button>
            </section>

            {/* ═══════════ QUICK ACTIONS (only if logged in) ═══════════ */}
            {user && (
                <section className="py-8 px-4 bg-white border-b border-gray-100">
                    <div className="max-w-5xl mx-auto">
                        <div className="grid grid-cols-3 gap-4">
                            {quickActions.map(({ icon: Icon, label, view, color }) => (
                                <motion.button
                                    key={view}
                                    onClick={() => navigate(view)}
                                    whileHover={{ y: -3, scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-gradient-to-br text-white shadow-md hover:shadow-lg transition-all"
                                    style={{ background: `linear-gradient(135deg, var(--quickColor, #16a34a), #059669)` }}
                                >
                                    <div className={`w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-sm font-semibold text-center leading-tight">{label}</span>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ═══════════ FEATURES ═══════════ */}
            <section className="py-20 px-4 section-hero">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="text-center mb-14"
                    >
                        <span className="inline-block px-4 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full mb-3">Why EcoSyz?</span>
                        <h2 className="text-4xl font-display font-bold text-gray-900 mb-3">
                            Smart. Simple. <span className="gradient-text">Sustainable.</span>
                        </h2>
                        <p className="text-gray-500 max-w-xl mx-auto">
                            We provide a complete waste management experience for households and communities.
                        </p>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((f, i) => (
                            <motion.div
                                key={i}
                                custom={i}
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                whileHover={{ y: -4 }}
                                className="card p-7"
                            >
                                <div className={`w-12 h-12 rounded-2xl ${f.color} flex items-center justify-center mb-4`}>
                                    <f.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">{f.title}</h3>
                                <p className="text-sm text-gray-500">{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ STATS ═══════════ */}
            <section className="py-16 px-4 bg-gradient-to-r from-green-700 via-green-600 to-emerald-500">
                <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        { num: panchayatDetails?.estHouseholds || '10K+', label: 'Households Served' },
                        { num: '100%', label: 'Eco-Friendly' },
                        { num: '24/7', label: 'Support' },
                        { num: panchayatDetails?.estLabours ? `${panchayatDetails.estLabours}+` : '200+', label: 'Active Workers' },
                    ].map((s, i) => (
                        <motion.div
                            key={i}
                            custom={i}
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            <p className="text-4xl font-display font-bold text-white mb-1">{s.num}</p>
                            <p className="text-green-100 text-sm font-medium">{s.label}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ═══════════ LEADERSHIP / COMMITTEE ═══════════ */}
            <section className="py-20 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <span className="inline-block px-4 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full mb-3">Team</span>
                        <h2 className="text-4xl font-display font-bold text-gray-900">
                            {selectedPanchayat ? `${selectedPanchayat.name} Leadership` : 'Our Leadership'}
                        </h2>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {committeeMembers.map((m, i) => (
                            <motion.div
                                key={i}
                                custom={i}
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                className="card-premium p-6 flex flex-col items-center text-center"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mb-4 border border-green-200">
                                    <Users className="w-8 h-8 text-green-600" />
                                </div>
                                <p className="font-semibold text-gray-900 truncate w-full px-2 mb-0.5">{m.name}</p>
                                <p className="text-xs font-medium text-green-600 mb-3">{m.designation}</p>
                                <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                                    📞 {m.contact || m.phone}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ CTA ═══════════ */}
            {!user && (
                <section className="py-20 px-4 section-alt">
                    <div className="max-w-2xl mx-auto text-center">
                        <motion.div
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="card-premium p-12"
                        >
                            <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
                                <Leaf className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-display font-bold text-gray-900 mb-3">Join the Clean Revolution</h2>
                            <p className="text-gray-500 mb-8">Log in to manage pickups, track complaints, and contribute to a cleaner Panchayat.</p>
                            <motion.button
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => navigate('login-household')}
                                className="btn-primary px-10 py-3 text-base mx-auto"
                            >
                                Login Now <ArrowRight className="w-5 h-5" />
                            </motion.button>
                        </motion.div>
                    </div>
                </section>
            )}

            <Footer navigate={navigate} />
        </div>
    );
};

export default HomePage;