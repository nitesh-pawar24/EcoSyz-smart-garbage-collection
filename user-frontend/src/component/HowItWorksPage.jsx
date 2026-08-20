import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Smartphone, UserCheck, Calendar, Truck, CheckCircle2, BarChart2, Leaf } from 'lucide-react';
import Breadcrumb from './shared/Breadcrumb';
import Footer from './shared/Footer';

const steps = [
    {
        step: '01',
        icon: Smartphone,
        title: 'Open EcoSyz',
        description: 'Access EcoSyz on any device — no app download needed. Open the website and select your Panchayat from the header to get started.',
        color: 'from-blue-500 to-cyan-400',
        bg: 'bg-blue-50 text-blue-600',
    },
    {
        step: '02',
        icon: UserCheck,
        title: 'Register & Login',
        description: 'Login with your registered mobile number. You will receive a 6-digit OTP to verify your identity — no password required. Sessions stay active for 24 hours.',
        color: 'from-green-500 to-emerald-400',
        bg: 'bg-green-50 text-green-600',
    },
    {
        step: '03',
        icon: Calendar,
        title: 'Schedule a Pickup',
        description: 'From your dashboard, click "Schedule Pickup". Choose your preferred date, time, waste type, and pickup address. You\'ll get an SMS confirmation.',
        color: 'from-purple-500 to-violet-400',
        bg: 'bg-purple-50 text-purple-600',
    },
    {
        step: '04',
        icon: Truck,
        title: 'Collection Vehicle Arrives',
        description: 'On the scheduled day, the collection vehicle will arrive within the assigned time window. Ensure your waste is segregated and placed outside.',
        color: 'from-amber-500 to-orange-400',
        bg: 'bg-amber-50 text-amber-600',
    },
    {
        step: '05',
        icon: CheckCircle2,
        title: 'Confirm & Report',
        description: 'If a collection is missed or an issue occurs, submit a complaint from your dashboard. Our team will resolve it within 24–48 hours.',
        color: 'from-rose-500 to-pink-400',
        bg: 'bg-rose-50 text-rose-600',
    },
    {
        step: '06',
        icon: BarChart2,
        title: 'Track Your Impact',
        description: 'View statistics showing waste collected, segregation compliance rates, and your ward\'s performance. Together, we are building a cleaner community.',
        color: 'from-teal-500 to-cyan-400',
        bg: 'bg-teal-50 text-teal-600',
    },
];

const highlights = [
    { icon: '📲', label: 'No App Download', sub: 'Works on any browser' },
    { icon: '🔒', label: 'OTP Login', sub: 'No password needed' },
    { icon: '⚡', label: 'Real-time Updates', sub: 'Live collection status' },
    { icon: '🗑️', label: 'Waste Segregation', sub: 'Guided at every step' },
];

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } })
};

const HowItWorksPage = ({ navigate }) => (
    <div className="min-h-screen" style={{ background: 'var(--surface-2)' }}>
        <div className="max-w-4xl mx-auto px-4 py-10">
            <Breadcrumb path={[{ label: 'How It Works', view: null }]} navigate={navigate} />

            {/* Header */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" className="text-center mb-12">
                <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 border border-green-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Leaf className="w-7 h-7 text-green-600" />
                </div>
                <h1 className="text-4xl font-display font-bold text-gray-900 mb-3">
                    How <span className="gradient-text">EcoSyz</span> Works
                </h1>
                <p className="text-gray-500 max-w-xl mx-auto">
                    From registration to collection — here's a complete guide to how EcoSyz helps your household stay clean and organized.
                </p>
            </motion.div>

            {/* Highlights */}
            <motion.div
                variants={fadeUp}
                custom={1}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-14"
            >
                {highlights.map(({ icon, label, sub }) => (
                    <div key={label} className="card p-4 text-center">
                        <div className="text-2xl mb-2">{icon}</div>
                        <p className="font-semibold text-gray-800 text-sm">{label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                    </div>
                ))}
            </motion.div>

            {/* Steps */}
            <div className="relative">
                {/* Connector line (desktop) */}
                <div className="hidden md:block absolute left-8 top-12 bottom-12 w-0.5 bg-gradient-to-b from-blue-200 via-green-200 to-teal-200 z-0" />

                <div className="space-y-6">
                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            custom={i}
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            className="relative z-10 flex gap-5 items-start"
                        >
                            {/* Step number bubble */}
                            <div className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex flex-col items-center justify-center shadow-md`}>
                                <step.icon className="w-6 h-6 text-white" />
                                <span className="text-[9px] font-bold text-white/80 mt-0.5">{step.step}</span>
                            </div>

                            <div className="card p-5 flex-1">
                                <h3 className="font-display font-bold text-gray-900 mb-1.5">{step.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* CTA */}
            <motion.div
                custom={7}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="card-premium p-10 text-center mt-12"
            >
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-3">Ready to get started?</h2>
                <p className="text-gray-500 mb-6">Log in and take control of your household waste management today.</p>
                <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('login-household')}
                    className="btn-primary px-8 py-3 text-base mx-auto"
                >
                    Login Now <ArrowRight className="w-5 h-5" />
                </motion.button>
            </motion.div>
        </div>
        <Footer navigate={navigate} />
    </div>
);

export default HowItWorksPage;
