"use client";

import { X, AlertTriangle, Trash2 } from 'lucide-react'

export default function DeleteDustbinConfirmModal({ isOpen, onClose, dustbin, onConfirmDelete }) {
  if (!isOpen || !dustbin) return null

  const handleConfirm = () => { onConfirmDelete(dustbin._id); onClose() }

  return (
    <>
 <div className="fixed inset-0 modal-overlay bg-black/50 backdrop-blur-sm z-[9999]" onClick={onClose} /> 
 <div className="fixed inset-0 modal-overlay flex items-center justify-center z-[9999] p-4"> 
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100 animate-fade-in-up overflow-hidden">

          {/* Header */}
          <div className="px-6 py-5 flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <AlertTriangle size={18} className="text-white" />
              </div>
              <div>
                <p className="text-white/70 text-[10px] font-medium uppercase tracking-wider">Confirm Action</p>
                <h2 className="text-white font-bold text-sm">Remove Bin</h2>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white/15 text-white hover:bg-white/25 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-500 text-center">
              The following dustbin will be <span className="font-bold text-gray-700">permanently removed</span> from the system.
            </p>
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 space-y-2">
              {[
                { label: 'Bin ID', value: dustbin.id, mono: true },
                { label: 'Location', value: dustbin.location },
                { label: 'Type', value: dustbin.type },
                { label: 'Status', value: dustbin.status },
              ].map(({ label, value, mono }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">{label}</span>
                  <span className={`text-gray-800 font-semibold ${mono ? 'font-mono text-red-600' : ''}`}>{value}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-[10px] font-bold text-red-500 uppercase tracking-wider">⚠ This action is not reversible</p>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex gap-3">
            <button onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button onClick={handleConfirm}
              className="flex-1 px-4 py-2.5 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
              <Trash2 size={14} /> Remove
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
