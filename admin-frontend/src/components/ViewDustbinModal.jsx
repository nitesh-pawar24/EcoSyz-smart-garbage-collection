"use client";

import { useEffect } from 'react'
import { X, Download, Trash2, Edit, Trash } from 'lucide-react'

export default function ViewDustbinModal({ isOpen, onClose, dustbin, onEdit, onDelete }) {
  useEffect(() => {
    if (isOpen) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isOpen]);

  if (!isOpen || !dustbin) return null

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${dustbin.id}`

  const handleDownloadQR = async () => {
    try {
      const response = await fetch(qrCodeUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Dustbin_QR_${dustbin.binCode || dustbin.id}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download QR code:', error)
    }
  }

  const statusColor = {
    Good: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    Damaged: 'bg-orange-50 text-orange-500 border-orange-100',
  }[dustbin.status] || 'bg-red-50 text-red-500 border-red-100'

  return (
    <>
 <div className="fixed inset-0 modal-overlay bg-black/50 backdrop-blur-sm z-[9999]" onClick={onClose} /> 
 <div className="fixed inset-0 modal-overlay z-[9999] flex items-center justify-center p-4"> 
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 animate-fade-in-up overflow-hidden max-h-[90vh] flex flex-col">

          {/* Header */}
          <div className="px-6 py-5 flex items-center justify-between flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #1e293b, #334155)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                <Trash2 size={18} className="text-white" />
              </div>
              <div>
                <p className="text-white/60 text-[10px] font-medium uppercase tracking-wider">Bin Details</p>
                <h2 className="text-white font-bold text-sm">{dustbin.binCode || dustbin.id}</h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${statusColor}`}>{dustbin.status}</span>
              <button onClick={onClose} className="p-1.5 rounded-lg bg-white/15 text-white hover:bg-white/25 transition-colors ml-1">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Ward', value: dustbin.ward },
                { label: 'Type', value: dustbin.type },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-sm font-semibold text-gray-800">{value || '—'}</p>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Location</p>
              <p className="text-sm font-semibold text-gray-800">{dustbin.location}</p>
              <p className="text-xs text-gray-400 mt-0.5">GPS: {dustbin.gps?.lat}, {dustbin.gps?.lng}</p>
            </div>

            {/* QR Code */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">QR Code</p>
                <button onClick={handleDownloadQR}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-teal-200 text-teal-600 hover:bg-teal-50 transition-colors">
                  <Download size={12} /> Download
                </button>
              </div>
              <div className="flex justify-center p-4 bg-gray-50 border border-gray-100 rounded-xl">
                <img src={qrCodeUrl} alt={`QR for ${dustbin.id}`} className="w-40 h-40 object-contain" />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 pt-4 border-t border-gray-50 flex gap-3 flex-shrink-0">
            <button onClick={onDelete}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-500 border border-red-100 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors">
              <Trash size={14} /> Remove
            </button>
            <button onClick={onEdit}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-xl text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #1f9e9a, #16847f)' }}>
              <Edit size={14} /> Edit Bin
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
