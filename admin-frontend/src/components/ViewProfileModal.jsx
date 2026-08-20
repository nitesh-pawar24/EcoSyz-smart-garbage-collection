"use client";

import { useEffect } from 'react'
import { X, User, Edit, ShieldCheck, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ViewProfileModal({ isOpen, onClose, user, onEdit, onDelete }) {
  useEffect(() => {
    if (isOpen) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isOpen]);

  if (!isOpen) return null

  const isActive = user?.isActive

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 modal-overlay">
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
        className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col relative z-10">

        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #1f9e9a, #16847f)' }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center font-black text-xl text-white shadow-inner">
              {user?.name?.charAt(0) || '?'}
            </div>
            <div>
              <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em]">User Profile</p>
              <h2 className="text-white font-black text-xl tracking-tight">{user?.name || 'N/A'}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                <p className="text-white/70 text-xs font-bold uppercase tracking-wider">{user?.role}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <span className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 ${isActive ? 'bg-emerald-500/20 text-emerald-100 border-emerald-500/30' : 'bg-rose-500/20 text-rose-100 border-rose-500/30'}`}>
                {isActive ? 'Active' : 'Inactive'}
              </span>
            <button onClick={onClose} className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all active:scale-90">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar bg-gray-50/50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Profile info */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <User size={16} className="text-teal-600" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">User Information</p>
                </div>
                <div className="grid gap-6">
                    {[
                      { label: 'Full Name', value: user?.name },
                      { label: 'Email Address', value: user?.email },
                      { label: 'Contact Number', value: user?.mobile },
                      { label: 'Assigned Role', value: user?.role },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                        <p className="text-sm font-black text-slate-800">{value || '—'}</p>
                      </div>
                    ))}
                </div>
            </div>

            {/* Permissions & Meta */}
            <div className="space-y-6">
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 bg-teal-50 rounded-xl text-teal-600">
                    <ShieldCheck size={20} />
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Permissions</p>
                </div>
                <div className="flex gap-3 flex-wrap">
                  {user?.permissions?.length > 0
                    ? user.permissions.map(perm => (
                      <span key={perm} className="px-4 py-2 bg-slate-50 text-slate-700 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-100 shadow-sm">
                        {perm}
                      </span>
                    ))
                    : <p className="text-sm text-gray-400 italic">No permissions set</p>
                  }
                </div>
              </div>

              <div className="bg-teal-600/5 border border-teal-600/10 rounded-3xl p-6">
                  <p className="text-[10px] font-black text-teal-600 uppercase tracking-[0.2em] mb-2">System ID</p>
                  <p className="text-sm font-mono font-bold text-teal-900 bg-white px-4 py-2 rounded-xl inline-block border border-teal-100">
                    {user?._id || 'UNIDENTIFIED'}
                  </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="px-8 py-6 border-t border-gray-100 flex gap-4 flex-shrink-0 justify-end bg-white">
          <button onClick={() => onDelete(user)}
            className="flex items-center gap-2 px-6 py-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all active:scale-95 shadow-sm shadow-rose-100">
            <Trash2 size={14} />
            Delete Account
          </button>
          <button onClick={() => onEdit(user)}
            className="flex items-center gap-2.5 px-8 py-3 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-teal-600/20 transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #1f9e9a, #16847f)' }}>
            <Edit size={16} /> Edit Profile
          </button>
        </div>
      </motion.div>
    </div>
  )
}
