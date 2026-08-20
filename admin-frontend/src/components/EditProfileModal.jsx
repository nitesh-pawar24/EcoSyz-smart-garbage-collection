"use client";

import { useState, useEffect } from 'react'
import { X, Upload } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'

export default function EditProfileModal({ isOpen, onClose, user, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    role: '',
    isActive: true,
    permissions: [],
    photo: null
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isOpen]);

  const validateField = (name, value) => {
    let error = ""
    switch (name) {
      case 'name':
        if (!value.trim()) error = "Name is required"
        break
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!value.trim()) error = "Email is required"
        else if (!emailRegex.test(value)) error = "Invalid email format"
        break
      case 'mobile':
        const mobileRegex = /^\d{10}$/
        if (!value.trim()) error = "Contact is required"
        else if (!mobileRegex.test(value)) error = "Must be 10 digits"
        break
      default:
        break
    }
    setErrors(prev => ({ ...prev, [name]: error }))
    return error
  }

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || '',
        role: user.role || 'ADMIN',
        isActive: user.isActive,
        permissions: user.permissions || []
      })
      setErrors({})
    }
  }, [user])

  const handleSave = () => {
    const e1 = validateField('name', formData.name)
    const e2 = validateField('email', formData.email)
    const e3 = validateField('mobile', formData.mobile)

    if (e1 || e2 || e3) {
      toast.error('Please fix error codes in the form')
      return
    }

    const updatedUser = {
      ...user,
      ...formData,
    }
    if (onSave) onSave(updatedUser)
  }

  const togglePermission = (perm) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm]
    }))
  }

  if (!isOpen) return null

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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col relative z-10">

        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #1f9e9a, #16847f)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Upload size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white/70 text-[10px] font-medium uppercase tracking-wider">Edit Record</p>
              <h2 className="text-white font-bold text-sm">User Profile</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/15 text-white hover:bg-white/25 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Content Area - Scrollable */}
        <div className="p-8 bg-gray-50 overflow-y-auto flex-1 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Left - Photo */}
            <div className="flex flex-col items-center gap-6">
              <div className="w-32 h-32 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                <span className="text-4xl">👤</span>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-700">Upload Photo</p>
                <p className="text-[10px] text-gray-400 mt-1">Recommended size: 500x500px</p>
              </div>
            </div>

            {/* Right - Form */}
            <div className="space-y-4">

              {/* Photo Upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Profile Photo
                </label>
                <div
                  onClick={() => document.getElementById('edit-user-photo').click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-teal-500 transition-all group"
                >
                  {formData.photo ? (
                    <div className="flex items-center gap-4">
                      <img
                        src={formData.photo instanceof File ? URL.createObjectURL(formData.photo) : formData.photo}
                        alt="preview"
                        className="w-14 h-14 rounded-full object-cover border-2 border-teal-100 shadow-sm"
                      />
                      <div className="text-left">
                        <p className="text-xs font-bold text-gray-700">{formData.photo instanceof File ? formData.photo.name : 'Current Photo'}</p>
                        <p className="text-[10px] text-teal-600 font-medium">Click to change</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-teal-50 transition-colors">
                        <Upload size={20} className="text-gray-400 group-hover:text-teal-600" />
                      </div>
                      <span className="text-xs text-gray-500 font-medium">Click to upload photo (JPG, PNG)</span>
                    </>
                  )}
                </div>
                <input
                  id="edit-user-photo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (file) {
                      setFormData({ ...formData, photo: file })
                    }
                  }}
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value })
                    validateField('name', e.target.value)
                  }}
                  className={`w-full px-4 py-2.5 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                />
                {errors.name && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value })
                    validateField('email', e.target.value)
                  }}
                  className={`w-full px-4 py-2.5 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                />
                {errors.email && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.email}</p>}
              </div>

              {/* Contact */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Contact Number</label>
                <input
                  type="text"
                  value={formData.mobile}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                    setFormData({ ...formData, mobile: val })
                    validateField('mobile', val)
                  }}
                  className={`w-full px-4 py-2.5 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm ${errors.mobile ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                />
                {errors.mobile && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.mobile}</p>}
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Access Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="MANAGER">Manager</option>
                  <option value="STAFF">Staff</option>
                  <option value="SUPERVISOR">Supervisor</option>
                  <option value="EMPLOYEE">Employee</option>
                </select>
              </div>

              {/* Status */}
              <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account Status</label>
                <div className="flex items-center gap-3">
                  <div 
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${formData.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${formData.isActive ? 'translate-x-6' : ''}`} />
                  </div>
                  <span className={`text-sm font-bold ${formData.isActive ? 'text-emerald-700' : 'text-gray-500'}`}>{formData.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>

              {/* Permissions */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1">Permissions</label>
                <div className="flex gap-4 flex-wrap">
                  {['View', 'Edit', 'Delete'].map(perm => (
                    <label key={perm} className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm cursor-pointer hover:border-teal-500 transition-all group">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(perm)}
                        onChange={() => togglePermission(perm)}
                        className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="text-xs font-bold text-gray-600 group-hover:text-teal-700 transition-colors">{perm}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="flex justify-end gap-3 p-8 bg-gray-50 border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose}
            className="px-6 py-3 bg-white border border-gray-200 text-gray-700 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gray-50 transition-all active:scale-95">
            Cancel
          </button>
          <button onClick={handleSave}
            className="px-8 py-3 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-teal-600/20 active:scale-95 transition-all"
            style={{ background: 'linear-gradient(135deg, #1f9e9a, #16847f)' }}>
            Update & Save
          </button>
        </div>
      </motion.div>
    </div>
  )
}
