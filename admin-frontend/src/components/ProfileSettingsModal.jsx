"use client";

import { useState } from 'react'
import { X, Edit2, Settings, Trash2, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ProfileSettingsModal({ isOpen, onClose }) {
  const [isEditing, setIsEditing] = useState({})
  const [profile, setProfile] = useState({
    name: 'Aakash Singh',
    contact: 'xxxxxxxxxx',
    email: 'a@gmail.com',
    password: '••••••••',
    role: 'Admin',
    status: true,
    preferences: ['View', 'Edit', 'Delete'],
    notification: 'email/sms',
    theme: 'Dark'
  })

  const handleEditToggle = (field) => {
    setIsEditing(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handlePreferenceChange = (pref) => {
    setProfile(prev => ({
      ...prev,
      preferences: prev.preferences.includes(pref)
        ? prev.preferences.filter(p => p !== pref)
        : [...prev.preferences, pref]
    }))
  }

  const handleDeleteProfile = () => {
    if (window.confirm('Are you sure you want to delete your profile?')) {
      alert('Profile deleted')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 modal-overlay overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl border border-gray-100 overflow-hidden relative z-10 max-h-[90vh] flex flex-col my-8">

        {/* Header */}
        <div className="flex items-center justify-between px-10 py-8 flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #1f9e9a, #16847f)' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
              <Settings size={24} className="text-white" />
            </div>
            <div>
              <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em]">User Account</p>
              <h2 className="text-white font-black text-2xl tracking-tight">Profile Settings</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-3 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-all active:scale-90">
            <X size={24} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-10 overflow-y-auto flex-1 custom-scrollbar bg-gray-50/50">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            
            {/* Left Column - Form */}
            <div className="lg:col-span-3 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 size={16} className="text-teal-600" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Account Details</p>
                </div>

                {/* NAME */}
                <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                    <div className="flex-1">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Display Name</label>
                        {isEditing.name ? (
                        <input
                            type="text"
                            value={profile.name}
                            onChange={(e) => setProfile({...profile, name: e.target.value})}
                            className="w-full px-4 py-2 bg-gray-50 border border-teal-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-sm font-bold text-slate-800"
                            onBlur={() => handleEditToggle('name')}
                            autoFocus
                        />
                        ) : (
                        <span className="text-sm font-bold text-slate-800">{profile.name}</span>
                        )}
                    </div>
                    <button onClick={() => handleEditToggle('name')} className="ml-4 p-2.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all">
                        <Edit2 size={18} />
                    </button>
                </div>

                {/* CONTACT */}
                <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                    <div className="flex-1">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Contact Number</label>
                        {isEditing.contact ? (
                        <input
                            type="text"
                            value={profile.contact}
                            onChange={(e) => setProfile({...profile, contact: e.target.value})}
                            className="w-full px-4 py-2 bg-gray-50 border border-teal-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-sm font-bold text-slate-800"
                            onBlur={() => handleEditToggle('contact')}
                            autoFocus
                        />
                        ) : (
                        <span className="text-sm font-bold text-slate-800">{profile.contact}</span>
                        )}
                    </div>
                    <button onClick={() => handleEditToggle('contact')} className="ml-4 p-2.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all">
                        <Edit2 size={18} />
                    </button>
                </div>

                {/* EMAIL */}
                <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                    <div className="flex-1">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Email Address</label>
                        {isEditing.email ? (
                        <input
                            type="email"
                            value={profile.email}
                            onChange={(e) => setProfile({...profile, email: e.target.value})}
                            className="w-full px-4 py-2 bg-gray-50 border border-teal-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-sm font-bold text-slate-800"
                            onBlur={() => handleEditToggle('email')}
                            autoFocus
                        />
                        ) : (
                        <span className="text-sm font-bold text-slate-800">{profile.email}</span>
                        )}
                    </div>
                    <button onClick={() => handleEditToggle('email')} className="ml-4 p-2.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all">
                        <Edit2 size={18} />
                    </button>
                </div>

                {/* PASSWORD */}
                <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                    <div className="flex-1">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Account Password</label>
                        {isEditing.password ? (
                        <input
                            type="password"
                            value={profile.password}
                            onChange={(e) => setProfile({...profile, password: e.target.value})}
                            className="w-full px-4 py-2 bg-gray-50 border border-teal-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-sm font-bold text-slate-800"
                            onBlur={() => handleEditToggle('password')}
                            autoFocus
                        />
                        ) : (
                        <span className="text-sm font-bold text-slate-800">{profile.password}</span>
                        )}
                    </div>
                    <button onClick={() => handleEditToggle('password')} className="ml-4 p-2.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all">
                        <Edit2 size={18} />
                    </button>
                </div>

                {/* ROLE */}
                <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex-1">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">System Role</label>
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-lg">
                            {profile.role}
                        </span>
                    </div>
                    <div className="p-2.5 text-slate-200">
                        <Settings size={18} />
                    </div>
                </div>

                {/* PREFERENCES */}
                <div className="bg-white px-6 py-5 rounded-2xl border border-gray-100 shadow-sm">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Functional Preferences</label>
                    <div className="flex gap-4 flex-wrap">
                        {['View', 'Edit', 'Delete'].map(pref => (
                        <label key={pref} className="flex items-center gap-3 bg-slate-50 px-5 py-2.5 rounded-xl border border-slate-100 cursor-pointer hover:border-teal-500 transition-all group">
                            <input
                            type="checkbox"
                            checked={profile.preferences.includes(pref)}
                            onChange={() => handlePreferenceChange(pref)}
                            className="w-4 h-4 accent-teal-600 rounded"
                            />
                            <span className="text-xs font-bold text-slate-600 group-hover:text-teal-700">{pref}</span>
                        </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column - Photo */}
            <div className="flex flex-col items-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Avatar Photo</p>
                <div className="w-40 h-40 bg-white border-4 border-white shadow-xl rounded-3xl flex items-center justify-center mb-6 relative group overflow-hidden">
                    <div className="text-center">
                        <div className="w-10 h-10 bg-slate-800 rounded-full mx-auto mb-3"></div>
                        <div className="w-16 h-8 bg-slate-700 rounded-xl mx-auto"></div>
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm cursor-pointer">
                        <Edit2 size={24} className="text-white" />
                    </div>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
                    <Edit2 size={14} />
                    Change Photo
                </button>
            </div>
            </div>
        </div>

        {/* Footer - Fixed */}
        <div className="flex gap-4 justify-end border-t border-gray-100 px-10 py-8 bg-white flex-shrink-0">
          <button onClick={handleDeleteProfile}
            className="flex items-center gap-2 px-6 py-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all active:scale-95 shadow-sm shadow-rose-100">
            <Trash2 size={14} />
            Delete Account
          </button>
          <button onClick={onClose}
            className="px-10 py-3 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-teal-600/20 active:scale-95 transition-all"
            style={{ background: 'linear-gradient(135deg, #1f9e9a, #16847f)' }}>
            Save & Exit
          </button>
        </div>
      </motion.div>
    </div>
  )
}
