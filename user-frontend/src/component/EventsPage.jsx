import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import Breadcrumb from './shared/Breadcrumb';
import Footer from './shared/Footer';
import { usePanchayat } from '../context/PanchayatContext';
import api from '../api/axios';

const defaultEvents = [
    {
        id: 1, emoji: '🌱', title: 'Plantation Drive',
        description: 'Join 50+ volunteers for a community plantation initiative at Mobor Beach. Saplings will be provided.',
        date: '2 Mar 2025', time: '7:00 AM', location: 'Mobor Beach', participants: '50+', status: 'upcoming',
        color: 'from-green-500 to-emerald-400',
    },
    {
        id: 2, emoji: '🧹', title: 'Community Clean-up',
        description: 'A weekend clean-up drive across Ward 2. Gloves and bags will be distributed at the venue.',
        date: '9 Mar 2025', time: '8:00 AM', location: 'Ward 2, Main Road', participants: '30+', status: 'upcoming',
        color: 'from-blue-500 to-cyan-400',
    },
    {
        id: 3, emoji: '♻️', title: 'Recycling Workshop',
        description: 'Learn how to segregate waste correctly and discover the benefits of composting at home.',
        date: '15 Mar 2025', time: '10:00 AM', location: 'Panchayat Hall', participants: '40+', status: 'upcoming',
        color: 'from-purple-500 to-violet-400',
    },
    {
        id: 4, emoji: '🌿', title: 'Green Awareness School Program',
        description: 'An educational session for school students on eco-friendly practices and waste management basics.',
        date: '22 Feb 2025', time: '9:00 AM', location: 'Local School, Ward 1', participants: '120+', status: 'past',
        color: 'from-amber-500 to-orange-400',
    },
    {
        id: 5, emoji: '🏆', title: 'Eco-Hero Awards',
        description: 'Recognition ceremony for households and workers who have shown exceptional commitment to cleanliness.',
        date: '10 Feb 2025', time: '5:00 PM', location: 'Community Center', participants: '200+', status: 'past',
        color: 'from-pink-500 to-rose-400',
    },
];

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } })
};

const EventsPage = ({ navigate }) => {
    const { selectedPanchayat } = usePanchayat();
    const [filter, setFilter] = useState('upcoming');
    const [registered, setRegistered] = useState([]);
    const [events, setEvents] = useState(defaultEvents);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!selectedPanchayat?._id) {
            setEvents(defaultEvents);
            return;
        }
        setLoading(true);
        api.get(`/content/public/${selectedPanchayat._id}?type=events`)
            .then(res => {
                const data = res.data?.events;
                if (data && data.length > 0) {
                    setEvents(data.map((e, i) => ({ ...e, id: e._id || i, color: e.color || 'from-green-500 to-emerald-400' })));
                } else {
                    setEvents(defaultEvents);
                }
            })
            .catch(() => setEvents(defaultEvents))
            .finally(() => setLoading(false));
    }, [selectedPanchayat]);

    const filtered = filter === 'all' ? events : events.filter(e => e.status === filter);

    const toggleRegister = (event) => {
        const isReg = registered.includes(event.id);
        setRegistered(r => isReg ? r.filter(id => id !== event.id) : [...r, event.id]);
        if (!isReg) toast.success(`Registered for "${event.title}"!`);
        else toast.info(`Unregistered from "${event.title}".`);
    };

    return (
        <div className="min-h-screen" style={{ background: 'var(--surface-2)' }}>
            <div className="max-w-5xl mx-auto px-4 py-10">
                <Breadcrumb path={[{ label: 'Events & Workshops', view: null }]} navigate={navigate} />

                {/* Header */}
                <motion.div variants={fadeUp} initial="hidden" animate="visible" className="text-center mb-10">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 border border-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-7 h-7 text-purple-600" />
                    </div>
                    <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">
                        Events &amp; <span className="gradient-text">Workshops</span>
                    </h1>
                    <p className="text-gray-500">Participate in community events to make a difference.</p>
                </motion.div>

                {/* Filter Tabs */}
                <motion.div variants={fadeUp} custom={1} initial="hidden" animate="visible" className="flex gap-2 mb-8">
                    {[['upcoming', 'Upcoming'], ['past', 'Past Events'], ['all', 'All']].map(([val, label]) => (
                        <button key={val} onClick={() => setFilter(val)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                                filter === val ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                            }`}>
                            {label}
                        </button>
                    ))}
                </motion.div>

                {loading ? (
                    <div className="flex items-center justify-center py-20 text-gray-400">
                        <Loader2 className="animate-spin mr-2" size={24} /> Loading events...
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <p>No {filter === 'all' ? '' : filter} events found.</p>
                    </div>
                ) : (
                    /* Events Grid */
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filtered.map((event, i) => {
                            const isRegistered = registered.includes(event.id);
                            return (
                                <motion.div key={event.id} custom={i} variants={fadeUp} initial="hidden" animate="visible"
                                    className="card overflow-hidden flex flex-col">
                                    <div className={`h-2 bg-gradient-to-r ${event.color}`} />
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="text-3xl mb-3">{event.emoji || '📅'}</div>
                                        <h3 className="font-display font-bold text-gray-900 text-lg mb-1">{event.title}</h3>
                                        <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1">{event.description}</p>
                                        <div className="space-y-2 mb-5">
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Calendar className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                                {event.date} {event.time && `• ${event.time}`}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <MapPin className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />{event.location}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Users className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />{event.participants} participants
                                            </div>
                                        </div>
                                        {event.status === 'upcoming' ? (
                                            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                                onClick={() => toggleRegister(event)}
                                                className={isRegistered ? 'btn-outline w-full py-2.5 text-sm' : 'btn-primary w-full py-2.5 text-sm'}>
                                                {isRegistered ? (
                                                    <span className="flex items-center gap-1.5 justify-center"><CheckCircle2 className="w-4 h-4" /> Registered</span>
                                                ) : 'Register Now'}
                                            </motion.button>
                                        ) : (
                                            <span className="badge badge-yellow self-start">Completed</span>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
            <Footer navigate={navigate} />
        </div>
    );
};

export default EventsPage;
