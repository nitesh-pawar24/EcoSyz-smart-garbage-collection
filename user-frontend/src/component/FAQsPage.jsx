import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, MessageSquare, Search, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import Breadcrumb from './shared/Breadcrumb';
import Footer from './shared/Footer';

const faqCategories = [
    {
        id: 'general',
        label: 'General',
        faqs: [
            {
                q: 'What is EcoSyz?',
                a: 'EcoSyz is a smart, government-backed waste management platform that connects households with their local Panchayat for scheduled waste pickups, complaint tracking, and real-time collection updates.'
            },
            {
                q: 'Who can use EcoSyz?',
                a: 'Any registered household under a participating Panchayat can use EcoSyz. Simply select your Panchayat and log in with your registered mobile number.'
            },
            {
                q: 'Is EcoSyz free to use?',
                a: 'The EcoSyz app is free for all registered households. Your Panchayat may charge a nominal monthly service fee directly — this is managed separately.'
            },
        ]
    },
    {
        id: 'account',
        label: 'Account & Login',
        faqs: [
            {
                q: 'How do I log in?',
                a: "EcoSyz uses OTP-based login. Enter your registered mobile number, receive a 6-digit code, and you're in — no password needed."
            },
            {
                q: 'My OTP is not arriving. What should I do?',
                a: 'Please ensure you have a working mobile signal and have entered the correct 10-digit number. OTPs expire in 10 minutes. If the issue persists, contact your Panchayat office.'
            },
            {
                q: 'How long does my session stay active?',
                a: 'You remain logged in for 24 hours. After that, you will be prompted to log in again for security.'
            },
            {
                q: 'What if my mobile number changes?',
                a: 'Please contact your Panchayat incharge to update your registered mobile number in the system.'
            },
        ]
    },
    {
        id: 'pickups',
        label: 'Pickup & Schedule',
        faqs: [
            {
                q: 'How do I schedule a waste pickup?',
                a: 'Go to your Dashboard → Schedule Pickup. Choose a date, time, waste type, and address. You will receive an SMS confirmation once the pickup is confirmed.'
            },
            {
                q: 'Can I cancel or reschedule a pickup?',
                a: 'At this time, cancellations must be done by contacting your Panchayat directly. Self-service cancellations will be available in a future update.'
            },
            {
                q: 'What types of waste can be scheduled for pickup?',
                a: 'You can schedule pickups for Organic Waste, Recyclable materials, Hazardous items, and Bulk Items. Please ensure proper segregation before collection.'
            },
            {
                q: 'What happens if the pickup vehicle doesn\'t arrive?',
                a: 'If a confirmed pickup is missed, please submit a complaint through the app with the "Missed Bin" category. Our team will follow up within 24 hours.'
            },
        ]
    },
    {
        id: 'complaints',
        label: 'Complaints',
        faqs: [
            {
                q: 'How do I submit a complaint?',
                a: 'From your Dashboard or via the navbar Quick Links, go to "Submit Complaint". Fill in the type, description, and submit. You\'ll receive a complaint ID to track the status.'
            },
            {
                q: 'How long does it take to resolve a complaint?',
                a: 'Most complaints are addressed within 24–48 hours. Complex issues may take up to 5 working days. You can track the status in your Dashboard.'
            },
            {
                q: 'Can I submit a complaint without logging in?',
                a: 'Basic complaints can be submitted without an account, but you won\'t be able to track the status. We recommend logging in for a complete experience.'
            },
        ]
    },
];

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.45 } })
};

const FAQsPage = ({ navigate }) => {
    const [activeCategory, setActiveCategory] = useState('general');
    const [expanded, setExpanded] = useState(null);
    const [search, setSearch] = useState('');
    const [feedback, setFeedback] = useState('');
    const [feedbackSent, setFeedbackSent] = useState(false);

    const currentFaqs = faqCategories.find(c => c.id === activeCategory)?.faqs || [];

    const filteredFaqs = search.trim()
        ? faqCategories.flatMap(c => c.faqs).filter(
            f => f.q.toLowerCase().includes(search.toLowerCase()) ||
                 f.a.toLowerCase().includes(search.toLowerCase())
          )
        : currentFaqs;

    const handleFeedback = (e) => {
        e.preventDefault();
        if (!feedback.trim()) return;
        setFeedbackSent(true);
        setFeedback('');
    };

    return (
        <div className="min-h-screen" style={{ background: 'var(--surface-2)' }}>
            <div className="max-w-4xl mx-auto px-4 py-10">

                <Breadcrumb path={[{ label: 'FAQs & Feedback', view: null }]} navigate={navigate} />

                {/* Header */}
                <motion.div variants={fadeUp} initial="hidden" animate="visible" className="text-center mb-10">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 border border-green-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <HelpCircle className="w-7 h-7 text-green-600" />
                    </div>
                    <h1 className="text-4xl font-display font-bold text-gray-900 mb-3">
                        Frequently Asked <span className="gradient-text">Questions</span>
                    </h1>
                    <p className="text-gray-500 max-w-lg mx-auto">
                        Find answers to the most common questions about EcoSyz. Can't find what you're looking for? Use the feedback form below.
                    </p>
                </motion.div>

                {/* Search */}
                <motion.div
                    variants={fadeUp}
                    custom={1}
                    initial="hidden"
                    animate="visible"
                    className="relative mb-8"
                >
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search FAQs…"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setExpanded(null); }}
                        className="input-field !pl-11 text-sm"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                    )}
                </motion.div>

                {/* Category Tabs (hidden while searching) */}
                {!search && (
                    <motion.div
                        variants={fadeUp}
                        custom={2}
                        initial="hidden"
                        animate="visible"
                        className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide"
                    >
                        {faqCategories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => { setActiveCategory(cat.id); setExpanded(null); }}
                                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                                    activeCategory === cat.id
                                        ? 'border-green-500 bg-green-50 text-green-700'
                                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </motion.div>
                )}

                {/* FAQ Accordion */}
                <motion.div
                    variants={fadeUp}
                    custom={3}
                    initial="hidden"
                    animate="visible"
                    className="card overflow-hidden mb-10"
                >
                    {filteredFaqs.length === 0 ? (
                        <div className="py-14 text-center text-gray-400">
                            <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No FAQs matched your search. Try different keywords.</p>
                        </div>
                    ) : (
                        filteredFaqs.map((faq, i) => (
                            <div key={i} className="border-b border-gray-100 last:border-0">
                                <button
                                    onClick={() => setExpanded(expanded === i ? null : i)}
                                    className="w-full flex items-start justify-between gap-4 px-6 py-5 text-left hover:bg-gray-50 transition-colors group"
                                >
                                    <span className={`font-semibold text-sm leading-snug transition-colors ${
                                        expanded === i ? 'text-green-700' : 'text-gray-800 group-hover:text-green-600'
                                    }`}>
                                        {faq.q}
                                    </span>
                                    <ChevronDown
                                        className={`w-5 h-5 flex-shrink-0 mt-0.5 text-gray-400 transition-transform duration-300 ${
                                            expanded === i ? 'rotate-180 text-green-500' : ''
                                        }`}
                                    />
                                </button>

                                <AnimatePresence>
                                    {expanded === i && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3 bg-green-50/30">
                                                {faq.a}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))
                    )}
                </motion.div>

                {/* Feedback Section */}
                <motion.div
                    variants={fadeUp}
                    custom={4}
                    initial="hidden"
                    animate="visible"
                    className="card-premium p-8"
                >
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                            <MessageSquare className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-display font-bold text-gray-900">Still have questions?</h2>
                            <p className="text-xs text-gray-400">Send us your query and we'll get back to you.</p>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {feedbackSent ? (
                            <motion.div
                                key="done"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="py-6 text-center"
                            >
                                <div className="text-3xl mb-2">🎉</div>
                                <p className="font-semibold text-gray-800">Thank you for your feedback!</p>
                                <p className="text-sm text-gray-400 mt-1">Our team will review your message soon.</p>
                                <button
                                    onClick={() => setFeedbackSent(false)}
                                    className="mt-4 text-sm text-green-600 hover:text-green-800 font-medium"
                                >
                                    Send another message
                                </button>
                            </motion.div>
                        ) : (
                            <motion.form
                                key="form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onSubmit={handleFeedback}
                                className="flex flex-col sm:flex-row gap-3"
                            >
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    rows={3}
                                    placeholder="Type your question or feedback here…"
                                    className="input-field resize-none flex-1 text-sm"
                                />
                                <motion.button
                                    type="submit"
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="btn-primary sm:self-end px-5 py-3 text-sm flex items-center gap-2 flex-shrink-0"
                                >
                                    <Send className="w-4 h-4" />
                                    Send
                                </motion.button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </motion.div>

            </div>
            <Footer navigate={navigate} />
        </div>
    );
};

export default FAQsPage;
