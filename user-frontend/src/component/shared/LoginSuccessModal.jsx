import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, User, ArrowRight } from 'lucide-react';

const LoginSuccessModal = ({ isOpen, user, onContinue }) => {
    if (!isOpen || !user) return null;

    const roleLabel = {
        HOUSEHOLD: 'Household Member',
        COMPANY: 'Company',
        EMPLOYEE: 'Field Employee',
        PANCHAYAT_ADMIN: 'Panchayat Admin',
        ADMIN: 'Admin',
    }[user.role] || 'User';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
 className="fixed inset-0 z-[9999] flex items-center justify-center p-4" 
                style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)' }}
            >
                <motion.div
                    initial={{ scale: 0.85, y: 24, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.85, y: 24, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center"
                >
                    {/* Animated checkmark ring */}
                    <div className="relative w-20 h-20 mx-auto mb-6">
                        <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-30" />
                        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-400 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
                            <CheckCircle2 className="w-10 h-10 text-white" />
                        </div>
                    </div>
                    <h2 className="text-xl font-display font-bold text-gray-900 mb-1">Welcome back!</h2>
                    <p className="text-2xl font-display font-extrabold gradient-text mb-1">
                        {user.name || 'User'}
                    </p>
                    <span className="inline-block px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold mb-6 border border-green-200">
                        {roleLabel}
                    </span>
                    <p className="text-gray-400 text-sm mb-7">You're successfully logged in.</p>
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={onContinue}
                        className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2"
                    >
                        Go to Dashboard <ArrowRight className="w-4 h-4" />
                    </motion.button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default LoginSuccessModal;
