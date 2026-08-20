import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Edit2, Trash2, Lock, Eye, Plus } from 'lucide-react';
import Button from '../shared/Button';

const UsersManagement = ({ navigate }) => {
    const [users] = useState([
        { id: 1, name: 'Rajesh Kumar', email: 'rajesh@gmail.com', role: 'Household', status: 'Active', joinDate: '2024-01-15' },
        { id: 2, name: 'Priya Sharma', email: 'priya@gmail.com', role: 'Household', status: 'Active', joinDate: '2024-02-20' },
        { id: 3, name: 'Amit Patel', email: 'amit@company.com', role: 'Company', status: 'Inactive', joinDate: '2024-03-10' },
        { id: 4, name: 'Neha Singh', email: 'neha@gmail.com', role: 'Household', status: 'Active', joinDate: '2024-04-05' },
        { id: 5, name: 'Vikram Reddy', email: 'vikram@company.com', role: 'Company', status: 'Active', joinDate: '2024-04-12' },
    ]);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl mx-auto"
            >
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <button onClick={() => navigate('admin-dashboard')} className="text-blue-600 hover:text-blue-700 mb-4">
                            ← Back to Admin
                        </button>
                        <h1 className="text-4xl font-bold text-gray-900">Users Management</h1>
                        <p className="text-gray-600 mt-2">Total Users: {users.length}</p>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Add User
                    </Button>
                </div>

                {/* Search */}
                <div className="mb-6 relative">
                    <Search className="absolute left-4 top-3 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-blue-200 focus:border-blue-600 focus:outline-none"
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
                            <thead className="bg-blue-50 border-b-2 border-blue-200">
                                <tr>
                                    <th className="text-left py-4 px-6 text-gray-700 font-semibold">Name</th>
                                    <th className="text-left py-4 px-6 text-gray-700 font-semibold">Email</th>
                                    <th className="text-left py-4 px-6 text-gray-700 font-semibold">Role</th>
                                    <th className="text-left py-4 px-6 text-gray-700 font-semibold">Status</th>
                                    <th className="text-left py-4 px-6 text-gray-700 font-semibold">Joined</th>
                                    <th className="text-center py-4 px-6 text-gray-700 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user, i) => (
                                    <tr key={i} className="border-b border-gray-100 hover:bg-blue-50 transition">
                                        <td className="py-4 px-6 font-medium text-gray-900">{user.name}</td>
                                        <td className="py-4 px-6 text-gray-600">{user.email}</td>
                                        <td className="py-4 px-6">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                user.role === 'Company'
                                                    ? 'bg-purple-100 text-purple-800'
                                                    : 'bg-green-100 text-green-800'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                user.status === 'Active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-gray-600">{user.joinDate}</td>
                                        <td className="py-4 px-6 text-center">
                                            <div className="flex justify-center gap-3">
                                                <motion.button whileHover={{ scale: 1.1 }} className="text-blue-600 hover:text-blue-700">
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

export default UsersManagement;
