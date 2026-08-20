import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Settings, Lock, Bell, Shield, Eye, EyeOff } from 'lucide-react';
import Button from '../shared/Button';

const SystemSettings = ({ navigate }) => {
    const [settings, setSettings] = useState({
        appName: 'EcoSyz',
        adminEmail: 'admin@d2d.com',
        supportPhone: '+91 99999 99999',
        timezone: 'IST',
        maintenanceMode: false,
        emailNotifications: true,
        smsNotifications: true,
        dataRetention: '12',
        backupFrequency: 'daily',
        twoFactorAuth: true,
    });

    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
            >
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <button onClick={() => navigate('admin-dashboard')} className="text-gray-600 hover:text-gray-700 mb-4">
                            ← Back to Admin
                        </button>
                        <h1 className="text-4xl font-bold text-gray-900">System Settings</h1>
                        <p className="text-gray-600 mt-2">Configure system-wide settings and preferences</p>
                    </div>
                    {isEditing && (
                        <Button onClick={() => setIsEditing(false)} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2">
                            <Save className="w-5 h-5" />
                            Save Changes
                        </Button>
                    )}
                </div>

                {/* General Settings */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl p-8 mb-6"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <Settings className="w-6 h-6 text-gray-600" />
                        <h2 className="text-2xl font-bold text-gray-900">General Settings</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Application Name</label>
                                <input
                                    type="text"
                                    name="appName"
                                    value={settings.appName}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-gray-600 focus:outline-none disabled:bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Admin Email</label>
                                <input
                                    type="email"
                                    name="adminEmail"
                                    value={settings.adminEmail}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-gray-600 focus:outline-none disabled:bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Support Phone</label>
                                <input
                                    type="tel"
                                    name="supportPhone"
                                    value={settings.supportPhone}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-gray-600 focus:outline-none disabled:bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Timezone</label>
                                <select
                                    name="timezone"
                                    value={settings.timezone}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-gray-600 focus:outline-none disabled:bg-gray-100"
                                >
                                    <option>IST</option>
                                    <option>UTC</option>
                                    <option>EST</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition">
                            <div>
                                <p className="font-semibold text-gray-900">Maintenance Mode</p>
                                <p className="text-sm text-gray-600">Enable to prevent user access</p>
                            </div>
                            <input
                                type="checkbox"
                                name="maintenanceMode"
                                checked={settings.maintenanceMode}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-6 h-6 cursor-pointer"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Notification Settings */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-xl p-8 mb-6"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <Bell className="w-6 h-6 text-gray-600" />
                        <h2 className="text-2xl font-bold text-gray-900">Notification Settings</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition">
                            <div>
                                <p className="font-semibold text-gray-900">Email Notifications</p>
                                <p className="text-sm text-gray-600">Send email alerts</p>
                            </div>
                            <input
                                type="checkbox"
                                name="emailNotifications"
                                checked={settings.emailNotifications}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-6 h-6 cursor-pointer"
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition">
                            <div>
                                <p className="font-semibold text-gray-900">SMS Notifications</p>
                                <p className="text-sm text-gray-600">Send SMS alerts</p>
                            </div>
                            <input
                                type="checkbox"
                                name="smsNotifications"
                                checked={settings.smsNotifications}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-6 h-6 cursor-pointer"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Data Retention (Days)</label>
                            <input
                                type="number"
                                name="dataRetention"
                                value={settings.dataRetention}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-gray-600 focus:outline-none disabled:bg-gray-100"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Backup Frequency</label>
                            <select
                                name="backupFrequency"
                                value={settings.backupFrequency}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-gray-600 focus:outline-none disabled:bg-gray-100"
                            >
                                <option value="hourly">Hourly</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                            </select>
                        </div>
                    </div>
                </motion.div>

                {/* Security Settings */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-xl p-8"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <Shield className="w-6 h-6 text-gray-600" />
                        <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition">
                            <div>
                                <p className="font-semibold text-gray-900">Two-Factor Authentication</p>
                                <p className="text-sm text-gray-600">Require 2FA for admin access</p>
                            </div>
                            <input
                                type="checkbox"
                                name="twoFactorAuth"
                                checked={settings.twoFactorAuth}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-6 h-6 cursor-pointer"
                            />
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <Button
                                onClick={() => setIsEditing(!isEditing)}
                                className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                                    isEditing
                                        ? 'bg-gray-600 hover:bg-gray-700 text-white'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                            >
                                {isEditing ? 'Cancel' : 'Edit Settings'}
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default SystemSettings;
