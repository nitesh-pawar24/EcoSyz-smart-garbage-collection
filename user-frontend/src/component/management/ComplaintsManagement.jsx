import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Edit2, Trash2, AlertCircle, Eye, Plus, CheckCircle } from 'lucide-react';
import Button from '../shared/Button';

const ComplaintsManagement = ({ navigate }) => {
    const [complaints] = useState([
        { id: 1, user: 'Rajesh Kumar', title: 'Missed Collection', date: '2025-02-20', status: 'Open', priority: 'High' },
        { id: 2, user: 'Priya Sharma', title: 'Driver Behavior', date: '2025-02-18', status: 'In Progress', priority: 'Medium' },
        { id: 3, user: 'Amit Patel', title: 'Spillage Issue', date: '2025-02-15', status: 'Resolved', priority: 'High' },
        { id: 4, user: 'Neha Singh', title: 'Wrong Timing', date: '2025-02-10', status: 'Resolved', priority: 'Low' },
        { id: 5, user: 'Vikram Reddy', title: 'Vehicle Damage', date: '2025-02-22', status: 'Open', priority: 'Critical' },
    ]);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredComplaints = complaints.filter(complaint =>
        complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.user.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getPriorityColor = (priority) => {
        switch(priority) {
            case 'Critical': return 'red';
            case 'High': return 'orange';
            case 'Medium': return 'yellow';
            case 'Low': return 'green';
            default: return 'gray';
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'Open': return <AlertCircle className="w-5 h-5" />;
            case 'In Progress': return <Edit2 className="w-5 h-5" />;
            case 'Resolved': return <CheckCircle className="w-5 h-5" />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-4 md:p-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl mx-auto"
            >
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <button onClick={() => navigate('admin-dashboard')} className="text-red-600 hover:text-red-700 mb-4">
                            ← Back to Admin
                        </button>
                        <h1 className="text-4xl font-bold text-gray-900">Complaints Management</h1>
                        <p className="text-gray-600 mt-2">Total Complaints: {complaints.length}</p>
                    </div>
                    <Button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Add Complaint
                    </Button>
                </div>

                {/* Search */}
                <div className="mb-6 relative">
                    <Search className="absolute left-4 top-3 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search complaints..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-red-200 focus:border-red-600 focus:outline-none"
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
                            <thead className="bg-red-50 border-b-2 border-red-200">
                                <tr>
                                    <th className="text-left py-4 px-6 text-gray-700 font-semibold">User</th>
                                    <th className="text-left py-4 px-6 text-gray-700 font-semibold">Title</th>
                                    <th className="text-left py-4 px-6 text-gray-700 font-semibold">Date</th>
                                    <th className="text-left py-4 px-6 text-gray-700 font-semibold">Status</th>
                                    <th className="text-left py-4 px-6 text-gray-700 font-semibold">Priority</th>
                                    <th className="text-center py-4 px-6 text-gray-700 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredComplaints.map((complaint, i) => (
                                    <tr key={i} className="border-b border-gray-100 hover:bg-red-50 transition">
                                        <td className="py-4 px-6 font-medium text-gray-900">{complaint.user}</td>
                                        <td className="py-4 px-6 text-gray-600">{complaint.title}</td>
                                        <td className="py-4 px-6 text-gray-600">{complaint.date}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-${complaint.status === 'Resolved' ? 'green' : complaint.status === 'In Progress' ? 'blue' : 'orange'}-600`}>
                                                    {getStatusIcon(complaint.status)}
                                                </span>
                                                <span className="text-gray-700">{complaint.status}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${getPriorityColor(complaint.priority)}-100 text-${getPriorityColor(complaint.priority)}-800`}>
                                                {complaint.priority}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <div className="flex justify-center gap-3">
                                                <motion.button whileHover={{ scale: 1.1 }} className="text-red-600 hover:text-red-700">
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

export default ComplaintsManagement;
