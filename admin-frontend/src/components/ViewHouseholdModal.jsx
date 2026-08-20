"use client";

import { useEffect } from 'react'
import { X, Home, Edit, Trash2 } from 'lucide-react'

const InfoRow = ({ label, value, wide }) => (
  <div className={wide ? 'col-span-2' : ''}>
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
    <p className="text-sm font-semibold text-gray-800">{value || '—'}</p>
  </div>
)

export default function ViewHouseholdModal({ isOpen, onClose, household, onEdit, onDelete }) {
  useEffect(() => {
    if (isOpen) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isOpen]);

  if (!isOpen || !household) return null

  const statusColor = {
    Approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    Rejected: 'bg-red-50 text-red-500 border-red-100',
  }[household.status] || 'bg-amber-50 text-amber-600 border-amber-100'

  return (
    <>
 <div className="fixed inset-0 modal-overlay bg-black/50 backdrop-blur-sm z-[9999]" onClick={onClose} /> 
 <div className="fixed inset-0 modal-overlay flex items-center justify-center z-[9999] p-4 pointer-events-none"> 
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 animate-fade-in-up overflow-hidden pointer-events-auto">

          {/* Header */}
          <div className="px-6 py-5 flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg, #1f9e9a, #16847f)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Home size={18} className="text-white" />
              </div>
              <div>
                <p className="text-white/70 text-[10px] font-medium uppercase tracking-wider">Household Details</p>
                <h2 className="text-white font-bold text-sm">{household.headOfHousehold}</h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${statusColor}`}>
                {household.status || 'Pending'}
              </span>
              <button onClick={onClose} className="p-1.5 rounded-lg bg-white/15 text-white hover:bg-white/25 transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <InfoRow label="Household ID" value={household.id} />
              <InfoRow label="Ward" value={household.ward} />
              <InfoRow label="Contact" value={household.contact} />
              <InfoRow label="Segregation" value={household.segregationCompliance} />
              <InfoRow label="Address" value={household.address} wide />
              {household.complaints && <InfoRow label="Complaints" value={household.complaints} wide />}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex gap-3">
            <button onClick={onDelete}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-500 border border-red-100 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors">
              <Trash2 size={14} /> Remove
            </button>
            <button onClick={onEdit}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-xl text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #1f9e9a, #16847f)' }}>
              <Edit size={14} /> Edit Details
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
