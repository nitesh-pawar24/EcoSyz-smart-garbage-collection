import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, TrendingUp, Truck, Users, BarChart3, LogOut } from 'lucide-react';
import Button from '../shared/Button';

const CompanyDashboard = ({ navigate }) => {
    const [trucks, setTrucks] = useState([
        { id: 'T001', driver: 'Ravi Kumar', status: 'Active', collections: 45 },
        { id: 'T002', driver: 'Amit Singh', status: 'Active', collections: 38 },
        { id: 'T003', driver: 'Vikram Patel', status: 'Maintenance', collections: 0 },
    ]);

    const fadeUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex justify-between items-center"
            >
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Company Dashboard</h1>
                    <p className="text-gray-600 mt-2">Manage your waste collection operations</p>
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

            {/* KPI Cards */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total Collections', value: '1,234', icon: <TrendingUp className="w-6 h-6" />, color: 'blue' },
                    { label: 'Active Trucks', value: '2', icon: <Truck className="w-6 h-6" />, color: 'green' },
                    { label: 'Team Members', value: '8', icon: <Users className="w-6 h-6" />, color: 'purple' },
                    { label: 'This Month', value: '340', icon: <BarChart3 className="w-6 h-6" />, color: 'orange' },
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
                                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                            </div>
                            <div className={`text-${stat.color}-500`}>{stat.icon}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Active Trucks */}
                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6"
                >
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Fleet Management</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b-2 border-gray-200">
                                <tr>
                                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Truck ID</th>
                                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Driver</th>
                                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Status</th>
                                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Collections</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trucks.map((truck, i) => (
                                    <tr key={i} className="border-b border-gray-100 hover:bg-blue-50 transition">
                                        <td className="py-3 px-4 font-semibold text-gray-900">{truck.id}</td>
                                        <td className="py-3 px-4 text-gray-600">{truck.driver}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                truck.status === 'Active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {truck.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 font-semibold text-gray-900">{truck.collections}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Operations */}
                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl shadow-xl p-6"
                >
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Operations</h2>
                    <div className="space-y-3">
                        {[
                            { label: 'Route Optimization', action: 'routes', icon: '📍' },
                            { label: 'Payment Tracking', action: 'company-payments', icon: '💳' },
                            { label: 'Generate Reports', action: 'company-reports', icon: '📊' },
                            { label: 'Manage Team', action: 'team-management', icon: '👥' },
                        ].map((action, i) => (
                            <motion.button
                                key={i}
                                whileHover={{ x: 4 }}
                                onClick={() => navigate(action.action)}
                                className="w-full text-left px-4 py-3 rounded-lg border-2 border-blue-200 hover:bg-blue-50 transition font-medium text-gray-900 flex items-center gap-3"
                            >
                                <span>{action.icon}</span>
                                {action.label}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Recent Activity */}
            <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.4 }}
                className="mt-8 bg-white rounded-2xl shadow-xl p-6"
            >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
                <div className="space-y-4">
                    {[
                        { action: 'Collection completed', truck: 'T001', time: '2 hours ago' },
                        { action: 'Route updated', truck: 'T002', time: '4 hours ago' },
                        { action: 'Payment received', truck: 'Company A', time: '1 day ago' },
                    ].map((activity, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ x: 4 }}
                            className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-blue-50 transition border-l-4 border-blue-500"
                        >
                            <div>
                                <p className="font-semibold text-gray-900">{activity.action}</p>
                                <p className="text-sm text-gray-600">{activity.truck}</p>
                            </div>
                            <span className="text-sm text-gray-500">{activity.time}</span>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default CompanyDashboard;
