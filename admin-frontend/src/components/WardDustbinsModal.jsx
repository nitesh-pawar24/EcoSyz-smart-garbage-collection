"use client";

import { useEffect } from 'react'
import { X, Trash2 } from "lucide-react"

export default function WardDustbinsModal({ isOpen, onClose, wardName, dustbins }) {
  useEffect(() => {
    if (isOpen) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isOpen]);

  if (!isOpen) return null

  return (
    <>
 <div className="fixed inset-0 modal-overlay bg-black/50 backdrop-blur-sm z-[9999]" onClick={onClose} /> 
 <div className="fixed inset-0 modal-overlay flex items-center justify-center z-[9999] p-4 pointer-events-none"> 
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-100 animate-fade-in-up overflow-hidden flex flex-col max-h-[80vh] pointer-events-auto">

          {/* Header */}
          <div className="px-6 py-5 flex items-center justify-between flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #1f9e9a, #16847f)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Trash2 size={18} className="text-white" />
              </div>
              <div>
                <p className="text-white/70 text-[10px] font-medium uppercase tracking-wider">Ward Details</p>
                <h2 className="text-white font-bold text-sm">Dustbins in {wardName}</h2>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white/15 text-white hover:bg-white/25 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1">
            {dustbins.length > 0 ? (
              <div className="rounded-xl overflow-hidden border border-gray-100">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr style={{ background: 'linear-gradient(135deg, #1f9e9a, #16847f)' }}>
                      {['Bin Code', 'Location', 'Type', 'Status'].map(h => (
                        <th key={h} className="px-4 py-3 text-white text-[10px] font-bold uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {dustbins.map((bin, i) => (
                      <tr key={bin._id} className={`transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-teal-50/30`}>
                        <td className="px-4 py-3 font-mono font-bold text-teal-600 text-xs">{bin.binCode}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{bin.locationText}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            bin.type === 'Organic' ? 'bg-green-50 text-green-600 border-green-100' :
                            bin.type === 'Recyclable' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                            'bg-gray-50 text-gray-600 border-gray-100'
                          }`}>{bin.type}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            bin.status === 'Good' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            'bg-red-50 text-red-500 border-red-100'
                          }`}>{bin.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <Trash2 className="mx-auto text-gray-300 mb-3" size={36} />
                <p className="text-sm font-semibold text-gray-400">No dustbins allotted to this ward yet.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-50 flex justify-end flex-shrink-0">
            <button onClick={onClose}
              className="px-5 py-2.5 text-white rounded-xl text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #1f9e9a, #16847f)' }}>
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
