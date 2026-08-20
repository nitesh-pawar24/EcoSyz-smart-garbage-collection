import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Edit2, Trash2, Truck, Eye, Plus, MapPin } from 'lucide-react';
import Button from '../shared/Button';

const FleetManagement = ({ navigate }) => {
    const [fleets] = useState([
        { id: 'T001', company: 'Eco Waste', driver: 'Ravi Kumar', status: 'Active', location: 'Downtown', capacity: '5 ton', lastService: '2025-02-15' },
        { id: 'T002', company: 'Green Dispose', driver: 'Amit Singh', status: 'Active', location: 'Westside', capacity: '6 ton', lastService: '2025-02-10' },
        { id: 'T003', company: 'Eco Waste', driver: 'Vikram Reddy', status: 'Maintenance', location: 'Service Center', capacity: '5 ton', lastService: '2025-02-01' },
        { id: 'T004', company: 'Clean City', driver: 'Priya Sharma', status: 'Active', location: 'North Zone', capacity: '4 ton', lastService: '2025-02-08' },
        { id: 'T005', company: 'Waste Mgmt Pro', driver: 'Neha Singh', status: 'Active', location: 'East Area', capacity: '7 ton', lastService: '2025-02-12' },
    ]);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredFleets = fleets.filter(fleet =>
        fleet.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fleet.driver.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-4 md:p-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl mx-auto"
            >
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <button onClick={() => navigate('admin-dashboard')} className="text-orange-600 hover:text-orange-700 mb-4">
                            ← Back to Admin
                        </button>
                        <h1 className="text-4xl font-bold text-gray-900">Fleet Management</h1>
                        <p className="text-gray-600 mt-2">Total Trucks: {fleets.length}</p>
                    </div>
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Add Truck
                    </Button>
                </div>

                {/* Search */}
                <div className="mb-6 relative">
                    <Search className="absolute left-4 top-3 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by truck ID or driver..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-orange-200 focus:border-orange-600 focus:outline-none"
                    />
                </div>

                {/* Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-orange-50 border-b-2 border-orange-200">
                                <tr>
                                    <th className="text-left py-4 px-6 text-gray-700 font-semibold">Truck ID</th>
                                    <th className="text-left py-4 px-6 text-gray-700 font-semibold">Company</th>
                                    <th className="text-left py-4 px-6 text-gray-700 font-semibold">Driver</th>
                                    <th className="text-left py-4 px-6 text-gray-700 font-semibold">Location</th>
                                    <th className="text-left py-4 px-6 text-gray-700 font-semibold">Status</th>
                                    <th className="text-left py-4 px-6 text-gray-700 font-semibold">Capacity</th>
                                    <th className="text-center py-4 px-6 text-gray-700 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFleets.map((fleet, i) => (
                                    <tr key={i} className="border-b border-gray-100 hover:bg-orange-50 transition">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <Truck className="w-5 h-5 text-orange-600" />
                                                <span className="font-semibold text-gray-900">{fleet.id}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-gray-600">{fleet.company}</td>
                                        <td className="py-4 px-6 text-gray-600">{fleet.driver}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <MapPin className="w-4 h-4" />
                                                {fleet.location}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                fleet.status === 'Active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {fleet.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 font-medium text-gray-900">{fleet.capacity}</td>
                                        <td className="py-4 px-6 text-center">
                                            <div className="flex justify-center gap-3">
                                                <motion.button whileHover={{ scale: 1.1 }} className="text-orange-600 hover:text-orange-700">
                                                    <Eye className="w-5 h-5" />
                                                </motion.button>
                                                <motion.button whileHover={{ scale: 1.1 }} className="text-gray-600 hover:text-gray-700">
                                                    <Edit2 className="w-5 h-5" />
                                                </motion.button>
                                                <motion.button whileHover={{ scale: 1.1 }} className="text-red-600 hover:text-red-700">
                                                    <Trash2 className="w-5 h-5" />
                                                </motion.button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default FleetManagement;
