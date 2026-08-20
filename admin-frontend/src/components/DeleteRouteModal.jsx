"use client";

import { X, AlertTriangle, Trash2 } from 'lucide-react'

export default function DeleteRouteModal({ isOpen, onClose, route, onConfirmDelete, loading }) {
  if (!isOpen || !route) return null

  return (
    <>
 <div className="fixed inset-0 modal-overlay bg-black/50 backdrop-blur-sm z-[9999]" onClick={onClose} /> 
 <div className="fixed inset-0 modal-overlay flex items-center justify-center z-[9999] p-4 overflow-y-auto"> 
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
                <h2 className="text-white font-bold text-sm">Delete Route</h2>
              </div>
            </div>
            <button onClick={onClose} disabled={loading}
              className="p-1.5 rounded-lg bg-white/15 text-white hover:bg-white/25 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-500 text-center">
              This route will be <span className="font-bold text-gray-700">permanently deleted</span> and cannot be recovered.
            </p>
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Route Name</span>
                <span className="text-gray-800 font-bold">{route.routeName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Route Code</span>
                <span className="font-mono text-red-600 font-bold text-xs bg-red-100 px-2 py-0.5 rounded">{route.routeCode}</span>
              </div>
            </div>
            <p className="text-center text-[10px] font-bold text-red-500 uppercase tracking-wider">⚠ This action cannot be undone</p>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex gap-3">
            <button onClick={onClose} disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button onClick={onConfirmDelete} disabled={loading}
              className="flex-1 px-4 py-2.5 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
              {loading
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><Trash2 size={14} /> Delete</>
              }
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
