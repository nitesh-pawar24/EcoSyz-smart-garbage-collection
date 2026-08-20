"use client";

import { X, Edit2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import api from '../api/axios'
import { toast } from 'react-toastify'

export default function EditHouseholdModal({ isOpen, onClose, household, onUpdate }) {
  const [editData, setEditData] = useState({
    headOfHousehold: household?.headOfHousehold || '',
    contact: household?.contact || '',
    segregationCompliance: household?.segregationCompliance || 'Compliant',
    complaints: household?.complaints || '',
    address: household?.address || '', // Added address
    ward: household?.ward || '',       // Added ward
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isOpen]);

  const [wards, setWards] = useState([])

  useEffect(() => {
    const fetchWards = async () => {
      try {
        const res = await api.get('/wards')
        setWards(res.data)
      } catch (err) {
        console.error('Failed to fetch wards', err)
      }
    }
    fetchWards()
  }, [])

  // Update state when household prop changes
  useEffect(() => {
    if (household) {
      setEditData({
        headOfHousehold: household.headOfHousehold || '',
        contact: household.contact || '',
        segregationCompliance: household.segregationCompliance || 'Compliant',
        complaints: household.complaints || '',
        address: household.address || '',
        ward: household.ward || ''
      })
      setErrors({})
    }
  }, [household])

  const [editingFields, setEditingFields] = useState({
    headOfHousehold: false,
    contact: false,
    segregationCompliance: false,
    address: false, // Added
    ward: false     // Added
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors = {}
    if (!editData.headOfHousehold?.trim()) newErrors.headOfHousehold = 'Name is required'
    if (!editData.address?.trim()) newErrors.address = 'Address is required'
    if (!editData.ward?.trim()) newErrors.ward = 'Ward is required'

    const contactRegex = /^\d{10}$/
    if (!editData.contact?.trim()) newErrors.contact = 'Contact is required'
    else if (!contactRegex.test(editData.contact)) newErrors.contact = 'Invalid 10-digit number'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const toggleEditing = (field) => {
    setEditingFields(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleSave = () => {
    if (!validate()) {
      toast.error('Please fix the errors in the form')
      return
    }
    onUpdate(household._id, editData)
    onClose()
  }

  if (!isOpen || !household) return null

  return (
    <>
 <div className="fixed inset-0 modal-overlay bg-black/50 backdrop-blur-sm z-[9999]" onClick={onClose} /> 
 <div className="fixed inset-0 modal-overlay flex items-center justify-center z-[9999] p-4 pointer-events-none"> 
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 animate-fade-in-up overflow-hidden max-h-[85vh] flex flex-col pointer-events-auto">

          {/* Header */}
          <div className="px-6 py-5 flex items-center justify-between flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #1f9e9a, #16847f)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Edit2 size={18} className="text-white" />
              </div>
              <div>
                <p className="text-white/70 text-[10px] font-medium uppercase tracking-wider">Edit Record</p>
                <h2 className="text-white font-bold text-sm">Household Details</h2>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white/15 text-white hover:bg-white/25 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4 overflow-y-auto flex-1">

            {/* Household ID - Read Only */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Household ID:
              </label>
              <input
                type="text"
                value={household.id}
                disabled
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded text-gray-700 text-sm font-medium"
              />
            </div>

            {/* Household Head Name - Editable */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <label className="block text-xs font-semibold text-gray-700">
                    Household Head Name:
                  </label>
                  {errors.headOfHousehold && <span className="text-[10px] text-red-500 font-bold">{errors.headOfHousehold}</span>}
                </div>
                <button
                  onClick={() => toggleEditing('headOfHousehold')}
                  className="p-1 hover:bg-gray-100 rounded transition"
                >
                  <Edit2 size={16} className="text-gray-600" />
                </button>
              </div>
              <input
                type="text"
                name="headOfHousehold"
                value={editData.headOfHousehold}
                onChange={handleInputChange}
                disabled={!editingFields.headOfHousehold}
                className={`w-full px-4 py-2 rounded text-sm border transition ${editingFields.headOfHousehold
                  ? errors.headOfHousehold
                    ? 'border-red-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500'
                    : 'border-teal-500 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500'
                  : 'bg-gray-50 border-gray-300 text-gray-700'
                  }`}
              />
            </div>

            {/* Address - Editable */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <label className="block text-xs font-semibold text-gray-700">
                    Address:
                  </label>
                  {errors.address && <span className="text-[10px] text-red-500 font-bold">{errors.address}</span>}
                </div>
                <button
                  onClick={() => toggleEditing('address')}
                  className="p-1 hover:bg-gray-100 rounded transition"
                >
                  <Edit2 size={16} className="text-gray-600" />
                </button>
              </div>
              <textarea
                name="address"
                value={editData.address}
                onChange={handleInputChange}
                disabled={!editingFields.address}
                className={`w-full px-4 py-2 rounded text-sm border transition resize-none h-20 ${editingFields.address
                  ? errors.address
                    ? 'border-red-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500'
                    : 'border-teal-500 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500'
                  : 'bg-gray-50 border-gray-300 text-gray-700'
                  }`}
              />
            </div>

            {/* Assigned Ward - Editable */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <label className="block text-xs font-semibold text-gray-700">
                    Assigned Ward:
                  </label>
                  {errors.ward && <span className="text-[10px] text-red-500 font-bold">{errors.ward}</span>}
                </div>
                <button
                  onClick={() => toggleEditing('ward')}
                  className="p-1 hover:bg-gray-100 rounded transition"
                >
                  <Edit2 size={16} className="text-gray-600" />
                </button>
              </div>
              <select
                name="ward"
                value={editData.ward}
                onChange={handleInputChange}
                disabled={!editingFields.ward}
                className={`w-full px-4 py-2 rounded text-sm border transition ${editingFields.ward
                  ? errors.ward
                    ? 'border-red-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500'
                    : 'border-teal-500 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500'
                  : 'bg-gray-50 border-gray-300 text-gray-700'
                  }`}
              >
                <option value="">Select Ward</option>
                {wards.map(w => (
                  <option key={w._id} value={w.name}>{w.name}</option>
                ))}
              </select>
            </div>

            {/* Contact - Editable */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <label className="block text-xs font-semibold text-gray-700">
                    Contact:
                  </label>
                  {errors.contact && <span className="text-[10px] text-red-500 font-bold">{errors.contact}</span>}
                </div>
                <button
                  onClick={() => toggleEditing('contact')}
                  className="p-1 hover:bg-gray-100 rounded transition"
                >
                  <Edit2 size={16} className="text-gray-600" />
                </button>
              </div>
              <input
                type="text"
                name="contact"
                value={editData.contact}
                onChange={handleInputChange}
                disabled={!editingFields.contact}
                className={`w-full px-4 py-2 rounded text-sm border transition ${editingFields.contact
                  ? errors.contact
                    ? 'border-red-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500'
                    : 'border-teal-500 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500'
                  : 'bg-gray-50 border-gray-300 text-gray-700'
                  }`}
              />
            </div>

            {/* Segregation Compliance - Editable */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-gray-700">
                  Segregation Compliance:
                </label>
                <button
                  onClick={() => toggleEditing('segregationCompliance')}
                  className="p-1 hover:bg-gray-100 rounded transition"
                >
                  <Edit2 size={16} className="text-gray-600" />
                </button>
              </div>
              <select
                name="segregationCompliance"
                value={editData.segregationCompliance}
                onChange={handleInputChange}
                disabled={!editingFields.segregationCompliance}
                className={`w-full px-4 py-2 rounded text-sm border transition ${editingFields.segregationCompliance
                  ? 'border-teal-500 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500'
                  : 'bg-gray-50 border-gray-300 text-gray-700'
                  }`}
              >
                <option value="Compliant">Compliant</option>
                <option value="Non-Compliant">Non-Compliant</option>
              </select>
            </div>

            {/* Complaints - Read Only */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Complaints:
              </label>
              <textarea
                value={editData.complaints}
                disabled
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded text-gray-700 text-sm resize-none h-20"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 pt-4 border-t border-gray-50 flex gap-3 flex-shrink-0">
            <button onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave}
              className="flex-1 px-4 py-2.5 text-white rounded-xl text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #1f9e9a, #16847f)' }}>
              Update & Save
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
