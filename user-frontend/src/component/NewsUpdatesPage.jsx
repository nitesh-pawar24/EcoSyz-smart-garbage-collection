import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, Tag, Calendar, Clock, ChevronRight, Loader2 } from 'lucide-react';
import Breadcrumb from './shared/Breadcrumb';
import Footer from './shared/Footer';
import { usePanchayat } from '../context/PanchayatContext';
import api from '../api/axios';

const categories = ['All', 'Announcement', 'Event', 'Update', 'Alert'];

const defaultNews = [
    { id: 1, category: 'Announcement', title: 'EcoSyz App Launched for Households', summary: 'The new EcoSyz mobile-friendly platform is now live, allowing households to schedule pickups, submit complaints, and track collection in real time.', date: '20 Feb 2025', readTime: '2 min read', badge: 'badge-blue', image: '🚀' },
    { id: 2, category: 'Update', title: 'Ward 3 Collection Schedule Updated', summary: 'Starting March 1st, Ward 3 will have an additional Saturday morning pickup slot. Households with organic waste are encouraged to use this slot.', date: '18 Feb 2025', readTime: '1 min read', badge: 'badge-green', image: '📅' },
    { id: 3, category: 'Alert', title: 'Public Holiday — No Collection on 26 Feb', summary: 'Due to the public holiday, waste collection services will be suspended on February 26th. Regular schedule resumes on February 27th.', date: '15 Feb 2025', readTime: '1 min read', badge: 'badge-red', image: '⚠️' },
    { id: 4, category: 'Event', title: 'Plantation Drive — Join Us This Sunday', summary: 'The Panchayat is organizing a community plantation drive on March 2nd at Community Garden, Plot 5. Volunteers are welcome!', date: '12 Feb 2025', readTime: '2 min read', badge: 'badge-green', image: '🌿' },
    { id: 5, category: 'Announcement', title: 'New Complaint Tracking Feature Added', summary: 'You can now view the real-time status of your submitted complaints directly from your household dashboard.', date: '10 Feb 2025', readTime: '1 min read', badge: 'badge-blue', image: '📢' },
    { id: 6, category: 'Update', title: 'Recycling Drop-off Points Expanded', summary: 'Three new recycling drop-off bins have been installed across Ward 1 and Ward 2 to improve segregation compliance.', date: '5 Feb 2025', readTime: '2 min read', badge: 'badge-yellow', image: '♻️' },
];

const badgeMap = {
    Announcement: 'badge-blue',
    Event: 'badge-green',
    Update: 'badge-yellow',
    Alert: 'badge-red',
};

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.45 } })
};

const NewsUpdatesPage = ({ navigate }) => {
    const { selectedPanchayat } = usePanchayat();
    const [activeCategory, setActiveCategory] = useState('All');
    const [news, setNews] = useState(defaultNews);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!selectedPanchayat?._id) {
            setNews(defaultNews);
            return;
        }
        setLoading(true);
        api.get(`/content/public/${selectedPanchayat._id}?type=news`)
            .then(res => {
                const items = res.data?.newsItems;
                if (items && items.length > 0) {
                    setNews(items.map((n, i) => ({
                        ...n,
                        id: n._id || i,
                        badge: n.badge || badgeMap[n.category] || 'badge-blue',
                    })));
                } else {
                    setNews(defaultNews);
                }
            })
            .catch(() => setNews(defaultNews))
            .finally(() => setLoading(false));
    }, [selectedPanchayat]);

    const filtered = activeCategory === 'All' ? news : news.filter(n => n.category === activeCategory);

    return (
        <div className="min-h-screen" style={{ background: 'var(--surface-2)' }}>
            <div className="max-w-4xl mx-auto px-4 py-10">
                <Breadcrumb path={[{ label: 'News & Updates', view: null }]} navigate={navigate} />

                {/* Header */}
                <motion.div variants={fadeUp} initial="hidden" animate="visible" className="text-center mb-10">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Newspaper className="w-7 h-7 text-blue-600" />
                    </div>
                    <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">
                        News &amp; <span className="gradient-text">Updates</span>
                    </h1>
                    <p className="text-gray-500">Stay informed with the latest news from your Panchayat.</p>
                </motion.div>

                {/* Category Filter */}
                <motion.div variants={fadeUp} custom={1} initial="hidden" animate="visible" className="flex gap-2 flex-wrap mb-8">
                    {categories.map(cat => (
                        <button key={cat} onClick={() => setActiveCategory(cat)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                                activeCategory === cat ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                            }`}>
                            <Tag className="w-3 h-3" /> {cat}
                        </button>
                    ))}
                </motion.div>

                {loading ? (
                    <div className="flex items-center justify-center py-20 text-gray-400">
                        <Loader2 className="animate-spin mr-2" size={24} /> Loading news...
                    </div>
                ) : (
                    /* News Cards */
                    <div className="space-y-4">
                        <AnimatePresence>
                            {filtered.map((item, i) => (
                                <motion.div key={item.id} layout custom={i} variants={fadeUp}
                                    initial="hidden" animate="visible" exit={{ opacity: 0, y: -10 }}
                                    className="card p-6 flex gap-5 items-start hover:cursor-pointer group">
                                    <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
                                        {item.image}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <span className={`badge ${item.badge}`}>{item.category}</span>
                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> {item.date}
                                            </span>
                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {item.readTime}
                                            </span>
                                        </div>
                                        <h3 className="font-display font-bold text-gray-900 group-hover:text-green-700 transition-colors leading-snug mb-1">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 leading-relaxed">{item.summary}</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-green-500 transition-colors flex-shrink-0 mt-1" />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
            <Footer navigate={navigate} />
        </div>
    );
};

export default NewsUpdatesPage;
