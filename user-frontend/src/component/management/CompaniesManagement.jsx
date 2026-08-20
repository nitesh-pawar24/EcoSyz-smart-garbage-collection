import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Edit2, Trash2, Building2, Eye, Plus } from 'lucide-react';
import Button from '../shared/Button';

const CompaniesManagement = ({ navigate }) => {
    const [companies] = useState([
        { id: 1, name: 'Eco Waste Solutions', contact: 'Rajesh Kumar', email: 'info@ecowaste.com', trucks: 5, status: 'Active' },
        { id: 2, name: 'Green Dispose Ltd', contact: 'Priya Sharma', email: 'contact@greendispose.com', trucks: 8, status: 'Active' },
        { id: 3, name: 'Clean City Services', contact: 'Amit Patel', email: 'admin@cleancity.com', trucks: 3, status: 'Inactive' },
        { id: 4, name: 'Waste Management Pro', contact: 'Neha Singh', email: 'hello@wmpro.com', trucks: 12, status: 'Active' },
    ]);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCompanies = companies.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-4 md:p-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl mx-auto"
            >
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <button onClick={() => navigate('admin-dashboard')} className="text-purple-600 hover:text-purple-700 mb-4">
                            ← Back to Admin
                        </button>
                        <h1 className="text-4xl font-bold text-gray-900">Companies Management</h1>
                        <p className="text-gray-600 mt-2">Total Companies: {companies.length}</p>
                    </div>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Add Company
                    </Button>
                </div>

                {/* Search */}
                <div className="mb-6 relative">
                    <Search className="absolute left-4 top-3 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search companies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-purple-200 focus:border-purple-600 focus:outline-none"
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
                            <thead className="bg-purple-50 border-b-2 border-purple-200">
                                <tr>
                                    <th className="text-left py-4 px-6 text-gray-700 font-semibold">Company Name</th>
                                    <th className="text-left py-4 px-6 text-gray-700 font-semibold">Contact Person</th>
                                    <th className="text-left py-4 px-6 text-gray-700 font-semibold">Email</th>
                                    <th className="text-left py-4 px-6 text-gray-700 font-semibold">Trucks</th>
                                    <th className="text-left py-4 px-6 text-gray-700 font-semibold">Status</th>
                                    <th className="text-center py-4 px-6 text-gray-700 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCompanies.map((company, i) => (
                                    <tr key={i} className="border-b border-gray-100 hover:bg-purple-50 transition">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <Building2 className="w-5 h-5 text-purple-600" />
                                                <span className="font-medium text-gray-900">{company.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-gray-600">{company.contact}</td>
                                        <td className="py-4 px-6 text-gray-600">{company.email}</td>
                                        <td className="py-4 px-6 font-semibold text-gray-900">{company.trucks}</td>
                                        <td className="py-4 px-6">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                company.status === 'Active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {company.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <div className="flex justify-center gap-3">
                                                <motion.button whileHover={{ scale: 1.1 }} className="text-purple-600 hover:text-purple-700">
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

export default CompaniesManagement;
