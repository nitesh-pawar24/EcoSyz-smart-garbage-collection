import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, Truck, AlertTriangle, Settings, LogOut } from 'lucide-react';
import Button from '../shared/Button';

const AdminDashboard = ({ navigate }) => {
    const [systemStats] = useState({
        totalUsers: 2450,
        activeCompanies: 45,
        totalTrucks: 234,
        pendingComplaints: 12,
    });

    const fadeUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-4 md:p-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex justify-between items-center"
            >
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600 mt-2">System monitoring and management</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => navigate('home')}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
                >
                    <LogOut className="w-5 h-5" />
                    Logout
                </motion.button>
            </motion.div>

            {/* System Overview */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total Users', value: systemStats.totalUsers, icon: <Users className="w-6 h-6" />, color: 'blue' },
                    { label: 'Active Companies', value: systemStats.activeCompanies, icon: <BarChart3 className="w-6 h-6" />, color: 'green' },
                    { label: 'Total Trucks', value: systemStats.totalTrucks, icon: <Truck className="w-6 h-6" />, color: 'orange' },
                    { label: 'Pending Complaints', value: systemStats.pendingComplaints, icon: <AlertTriangle className="w-6 h-6" />, color: 'red' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: i * 0.1 }}
                        className={`bg-white rounded-xl shadow-lg p-6 border-l-4 border-${stat.color}-500`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">{stat.label}</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                            </div>
                            <div className={`text-${stat.color}-500`}>{stat.icon}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Management Panels */}
                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6"
                >
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Management</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            { title: 'Users Management', desc: 'View and manage users', action: 'users-management', count: '2,450' },
                            { title: 'Companies', desc: 'Manage registered companies', action: 'companies-management', count: '45' },
                            { title: 'Fleet Operations', desc: 'Monitor trucks and drivers', action: 'fleet-management', count: '234' },
                            { title: 'Complaints', desc: 'Handle user complaints', action: 'complaints-management', count: '12' },
                        ].map((panel, i) => (
                            <motion.button
                                key={i}
                                whileHover={{ y: -4 }}
                                onClick={() => navigate(panel.action)}
                                className="text-left p-4 rounded-lg border-2 border-purple-200 hover:bg-purple-50 transition"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-gray-900">{panel.title}</h3>
                                        <p className="text-sm text-gray-600">{panel.desc}</p>
                                    </div>
                                    <span className="text-2xl font-bold text-purple-600">{panel.count}</span>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Administration */}
                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl shadow-xl p-6"
                >
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
                    <div className="space-y-3">
                        {[
                            { label: 'System Settings', icon: '⚙️', action: 'system-settings' },
                            { label: 'Reports', icon: '📊', action: 'admin-reports' },
                            { label: 'Notifications', icon: '🔔', action: 'notifications' },
                            { label: 'Backup & Restore', icon: '💾', action: 'backup' },
                            { label: 'Audit Logs', icon: '📝', action: 'audit-logs' },
                            { label: 'Security', icon: '🔒', action: 'security' },
                        ].map((setting, i) => (
                            <motion.button
                                key={i}
                                whileHover={{ x: 4 }}
                                onClick={() => navigate(setting.action)}
                                className="w-full text-left px-4 py-3 rounded-lg border-2 border-purple-200 hover:bg-purple-50 transition font-medium text-gray-900 flex items-center gap-3"
                            >
                                <span>{setting.icon}</span>
                                {setting.label}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* System Health */}
            <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.4 }}
                className="mt-8 bg-white rounded-2xl shadow-xl p-6"
            >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">System Health</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        { metric: 'Server Status', value: 'Online', color: 'green', uptime: '99.9%' },
                        { metric: 'Database', value: 'Healthy', color: 'green', uptime: 'All systems operational' },
                        { metric: 'API Response', value: '145ms', color: 'green', uptime: 'Within normal range' },
                    ].map((health, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ scale: 1.02 }}
                            className="p-4 rounded-lg border-2 border-purple-200 hover:border-purple-400 transition"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-3 h-3 rounded-full bg-${health.color}-500`}></div>
                                <p className="font-semibold text-gray-900">{health.metric}</p>
                            </div>
                            <p className="text-lg font-bold text-gray-900">{health.value}</p>
                            <p className="text-sm text-gray-600">{health.uptime}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default AdminDashboard;
