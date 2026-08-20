import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, AlertTriangle } from 'lucide-react';

const LogoutConfirmModal = ({ isOpen, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
 className="fixed inset-0 z-[9999] flex items-center justify-center p-4" 
                style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)' }}
                onClick={onCancel}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 16, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.9, y: 16, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center"
                >
                    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                        <LogOut className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-display font-bold text-gray-900 mb-2">Logout?</h2>
                    <p className="text-gray-500 text-sm mb-7 leading-relaxed">
                        Are you sure you want to logout? You'll need to verify your OTP again to login.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="btn-outline flex-1 py-2.5 text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 py-2.5 text-sm font-semibold rounded-2xl bg-red-500 hover:bg-red-600 text-white transition-colors"
                        >
                            Yes, Logout
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default LogoutConfirmModal;
