"use client";

import { LogOut, X } from 'lucide-react'

export default function LogoutConfirmation({ isOpen, onClose, onLogout }) {
  if (!isOpen) return null

  return (
    <>
 <div className="fixed inset-0 modal-overlay bg-black/50 backdrop-blur-sm z-[9999]" onClick={onClose} /> 
 <div className="fixed inset-0 modal-overlay flex items-center justify-center z-[9999] p-4"> 
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100 animate-fade-in-up overflow-hidden">

          {/* Header */}
          <div className="px-6 py-5 flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg, #1f9e9a, #16847f)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <LogOut size={18} className="text-white" />
              </div>
              <div>
                <p className="text-white/70 text-[10px] font-medium uppercase tracking-wider">Session</p>
                <h2 className="text-white font-bold text-sm">Log Out</h2>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white/15 text-white hover:bg-white/25 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
              style={{ background: 'linear-gradient(135deg, #1f9e9a22, #22c55e22)' }}>
              <span className="text-3xl">👋</span>
            </div>
            <p className="text-sm text-gray-500">
              Are you sure you want to <span className="font-bold text-gray-700">log out</span>? You can log in again anytime with your credentials.
            </p>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex gap-3">
            <button onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
              Stay Logged In
            </button>
            <button onClick={onLogout}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-xl text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
              <LogOut size={14} /> Log Out
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
