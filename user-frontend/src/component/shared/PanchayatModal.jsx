import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Building2, Leaf, ArrowRight, X } from 'lucide-react';
import { usePanchayat } from '../../context/PanchayatContext';
import api from '../../api/axios';
import { toast } from 'react-toastify';

const PanchayatModal = () => {
    const { selectedPanchayat, setSelectedPanchayat, isPanchayatModalOpen, setIsPanchayatModalOpen } = usePanchayat();
    const [panchayats, setPanchayats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [fetched, setFetched] = useState(false);
    const [error, setError] = useState(null);

    const fetchPanchayats = async () => {
        if (fetched) return;
        setLoading(true);
        setError(null);
        try {
            // Fetch all panchayats — no status filter so work in dev/staging too
            const res = await api.get('/panchayat');
            if (res.data && res.data.length > 0) {
                const approved = res.data.filter(p => p.status === 'active');
                setPanchayats(approved);
                if (approved.length === 0) setError('No approved Panchayats are registered yet.');
            } else {
                setError('No Panchayats are registered yet. Please contact your administrator.');
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Could not connect to server. Make sure the backend is running.';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
            setFetched(true);
        }
    };

    const filtered = panchayats.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.address?.toLowerCase().includes(search.toLowerCase())
    );

    if (!isPanchayatModalOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
 className="fixed inset-0 z-[9999] flex items-center justify-center p-4" 
            style={{ background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(8px)' }}
            onAnimationStart={fetchPanchayats}
        >
            <motion.div
                initial={{ scale: 0.9, y: 24 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
                {/* Header */}
                <div className="bg-gradient-to-br from-green-700 to-emerald-500 p-8 text-white text-center relative">
                    {selectedPanchayat && (
                        <button
                            onClick={() => setIsPanchayatModalOpen(false)}
                            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    )}
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Leaf className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-2xl font-display font-bold mb-1">Welcome to EcoSyz</h2>
                    <p className="text-green-100 text-sm">Select your Panchayat to get started.</p>
                </div>

                {/* Search */}
                <div className="px-6 pt-5 pb-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or location..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input-field !pl-10"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="px-6 pb-6 overflow-y-auto" style={{ maxHeight: '320px' }}>
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="spinner" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-400">
                            <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                            <p className="text-sm font-medium">{error}</p>
                            <button
                                onClick={() => { setFetched(false); fetchPanchayats(); }}
                                className="mt-3 text-xs text-green-600 hover:text-green-700 font-semibold"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                            <p className="text-sm">No results match your search.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filtered.map((p) => (
                                <motion.button
                                    key={p._id}
                                    whileHover={{ x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedPanchayat(p)}
                                    className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-green-300 hover:bg-green-50 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors">
                                            <MapPin className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
                                            {p.address && <p className="text-xs text-gray-400 mt-0.5">{p.address}</p>}
                                        </div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-green-500 transition-colors" />
                                </motion.button>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default PanchayatModal;
