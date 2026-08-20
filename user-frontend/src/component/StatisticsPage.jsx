import React from 'react';
import { motion } from 'framer-motion';
import { BarChart2, TrendingUp, Truck, Users, AlertCircle, CheckCircle2, Leaf, Recycle } from 'lucide-react';
import Breadcrumb from './shared/Breadcrumb';
import Footer from './shared/Footer';

const stats = [
    { icon: Users, label: 'Households Covered', value: '2,500+', sub: 'Across 5 wards', color: 'bg-blue-50 text-blue-600' },
    { icon: Truck, label: 'Pickups This Month', value: '1,840', sub: '+12% vs last month', color: 'bg-green-50 text-green-600' },
    { icon: BarChart2, label: 'Waste Collected', value: '35 Tons', sub: 'Monthly average', color: 'bg-amber-50 text-amber-600' },
    { icon: Users, label: 'Active Workers', value: '48', sub: 'On ground daily', color: 'bg-purple-50 text-purple-600' },
    { icon: CheckCircle2, label: 'Complaints Resolved', value: '92%', sub: 'Within 48 hours', color: 'bg-emerald-50 text-emerald-600' },
    { icon: AlertCircle, label: 'Open Complaints', value: '17', sub: 'Under review', color: 'bg-red-50 text-red-500' },
];

const wasteBreakdown = [
    { label: 'Organic Waste', value: 48, color: 'bg-green-500' },
    { label: 'Recyclable', value: 30, color: 'bg-blue-500' },
    { label: 'General', value: 17, color: 'bg-amber-500' },
    { label: 'Hazardous', value: 5, color: 'bg-red-500' },
];

const monthlyData = [
    { month: 'Sep', tons: 28 }, { month: 'Oct', tons: 31 }, { month: 'Nov', tons: 29 },
    { month: 'Dec', tons: 33 }, { month: 'Jan', tons: 32 }, { month: 'Feb', tons: 35 },
];

const maxTons = Math.max(...monthlyData.map(m => m.tons));

const wardCompliance = [
    { ward: 'Ward 1', rate: 88 },
    { ward: 'Ward 2', rate: 95 },
    { ward: 'Ward 3', rate: 72 },
    { ward: 'Ward 4', rate: 91 },
    { ward: 'Ward 5', rate: 84 },
];

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.45 } })
};

const StatisticsPage = ({ navigate }) => (
    <div className="min-h-screen" style={{ background: 'var(--surface-2)' }}>
        <div className="max-w-5xl mx-auto px-4 py-10">
            <Breadcrumb path={[{ label: 'Statistics & Reports', view: null }]} navigate={navigate} />

            {/* Header */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" className="text-center mb-10">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-green-100 border border-green-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BarChart2 className="w-7 h-7 text-green-600" />
                </div>
                <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">
                    Statistics & <span className="gradient-text">Reports</span>
                </h1>
                <p className="text-gray-500">Real-time data on waste collection and community impact.</p>
            </motion.div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {stats.map(({ icon: Icon, label, value, sub, color }, i) => (
                    <motion.div
                        key={i}
                        custom={i}
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        className="stat-card"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-2xl font-display font-bold text-gray-900">{value}</p>
                        <p className="text-xs font-semibold text-gray-600 mt-0.5">{label}</p>
                        <p className="text-xs text-gray-400 mt-1">{sub}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-6">
                {/* Monthly Collection Bar Chart */}
                <motion.div
                    custom={4}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    className="card p-6"
                >
                    <h2 className="font-display font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        Monthly Collection (Tons)
                    </h2>
                    <div className="flex items-end gap-3 h-36">
                        {monthlyData.map(({ month, tons }, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <span className="text-xs font-bold text-gray-500">{tons}</span>
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(tons / maxTons) * 100}%` }}
                                    transition={{ delay: i * 0.1, duration: 0.5, ease: 'easeOut' }}
                                    className="w-full rounded-t-lg bg-gradient-to-t from-green-600 to-emerald-400 min-h-[4px]"
                                    style={{ height: `${(tons / maxTons) * 120}px` }}
                                />
                                <span className="text-[10px] text-gray-400 font-medium">{month}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Waste Breakdown */}
                <motion.div
                    custom={5}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    className="card p-6"
                >
                    <h2 className="font-display font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Recycle className="w-5 h-5 text-blue-600" />
                        Waste Breakdown (%)
                    </h2>
                    <div className="space-y-4">
                        {wasteBreakdown.map(({ label, value, color }, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm mb-1.5">
                                    <span className="font-medium text-gray-700">{label}</span>
                                    <span className="font-bold text-gray-900">{value}%</span>
                                </div>
                                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${value}%` }}
                                        transition={{ delay: i * 0.1 + 0.2, duration: 0.6, ease: 'easeOut' }}
                                        className={`h-full rounded-full ${color}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Ward Segregation Compliance */}
            <motion.div
                custom={6}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="card p-6"
            >
                <h2 className="font-display font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-green-600" />
                    Segregation Compliance by Ward
                </h2>
                <div className="space-y-4">
                    {wardCompliance.map(({ ward, rate }, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <span className="text-sm font-semibold text-gray-700 w-16 flex-shrink-0">{ward}</span>
                            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${rate}%` }}
                                    transition={{ delay: i * 0.1 + 0.2, duration: 0.6, ease: 'easeOut' }}
                                    className={`h-full rounded-full ${rate >= 90 ? 'bg-green-500' : rate >= 80 ? 'bg-amber-400' : 'bg-red-400'}`}
                                />
                            </div>
                            <span className={`text-sm font-bold w-10 text-right ${rate >= 90 ? 'text-green-600' : rate >= 80 ? 'text-amber-600' : 'text-red-500'}`}>
                                {rate}%
                            </span>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
        <Footer navigate={navigate} />
    </div>
);

export default StatisticsPage;
