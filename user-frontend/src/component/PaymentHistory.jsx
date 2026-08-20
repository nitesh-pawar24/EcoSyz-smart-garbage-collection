import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Download, AlertCircle, CheckCircle2, ArrowLeft, TrendingUp } from 'lucide-react';

const payments = [
    { id: 'INV-001', date: '2025-02-01', amount: 500, status: 'Paid', method: 'UPI' },
    { id: 'INV-002', date: '2025-01-01', amount: 500, status: 'Paid', method: 'Debit Card' },
    { id: 'INV-003', date: '2024-12-01', amount: 450, status: 'Paid', method: 'Net Banking' },
    { id: 'INV-004', date: '2024-11-01', amount: 500, status: 'Pending', method: '-' },
];

const bills = [
    { month: 'February 2025', amount: 500, dueDate: '28 Feb 2025', status: 'Unpaid' },
    { month: 'March 2025', amount: 500, dueDate: '31 Mar 2025', status: 'Not Ready' },
];

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.45 } })
};

const PaymentHistory = ({ navigate }) => (
    <div className="min-h-screen" style={{ background: 'var(--surface-2)' }}>
        <div className="max-w-5xl mx-auto px-4 py-8">
            <button
                onClick={() => navigate('household-dashboard')}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-green-600 transition-colors mb-6"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="text-3xl font-display font-bold text-gray-900">Payments & Billing</h1>
                <p className="text-gray-400 mt-1 text-sm">Manage your payments and download invoices</p>
            </motion.div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {[
                    { label: 'Total Paid', value: '₹1,950', icon: CheckCircle2, color: 'bg-green-50 text-green-500', border: 'border-l-green-500' },
                    { label: 'Pending', value: '₹500', icon: AlertCircle, color: 'bg-amber-50 text-amber-500', border: 'border-l-amber-500' },
                    { label: 'Next Due', value: '28 Feb 2025', icon: CreditCard, color: 'bg-blue-50 text-blue-500', border: 'border-l-blue-500' },
                ].map(({ label, value, icon: Icon, color, border }, i) => (
                    <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" animate="visible"
                        className={`stat-card border-l-4 ${border}`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                                <p className="text-2xl font-display font-bold text-gray-900">{value}</p>
                            </div>
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${color}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Pending Bills */}
            <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="card p-6 mb-6">
                <h2 className="text-lg font-display font-bold text-gray-900 mb-4">Pending Bills</h2>
                <div className="space-y-3">
                    {bills.map((b, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-green-200 hover:bg-green-50/30 transition-all">
                            <div>
                                <p className="font-semibold text-gray-800 text-sm">{b.month}</p>
                                <p className="text-xs text-gray-400 mt-0.5">Due: {b.dueDate}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <p className="text-xl font-display font-bold text-gray-900">₹{b.amount}</p>
                                <span className={`badge ${b.status === 'Unpaid' ? 'badge-red' : 'badge-yellow'}`}>{b.status}</span>
                                {b.status === 'Unpaid' && (
                                    <motion.button
                                        whileHover={{ scale: 1.04 }}
                                        whileTap={{ scale: 0.96 }}
                                        className="btn-primary text-xs px-4 py-2"
                                    >
                                        Pay Now
                                    </motion.button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* History Table */}
            <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" className="card p-6">
                <h2 className="text-lg font-display font-bold text-gray-900 mb-4">Payment History</h2>
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Invoice</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Method</th>
                                <th>Status</th>
                                <th>Receipt</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map((p, i) => (
                                <tr key={i}>
                                    <td className="font-mono text-xs font-semibold text-green-700">{p.id}</td>
                                    <td className="text-gray-400">{p.date}</td>
                                    <td className="font-semibold text-gray-900">₹{p.amount}</td>
                                    <td className="text-gray-500">{p.method}</td>
                                    <td>
                                        <span className={`badge ${p.status === 'Paid' ? 'badge-green' : 'badge-yellow'}`}>{p.status}</span>
                                    </td>
                                    <td>
                                        <motion.button whileHover={{ scale: 1.15 }} className="text-green-600 hover:text-green-800">
                                            <Download className="w-4 h-4" />
                                        </motion.button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    </div>
);

export default PaymentHistory;
