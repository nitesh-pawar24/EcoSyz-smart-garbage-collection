"use client";

import { useState, useEffect } from 'react'
import { Search, Filter, Download, BarChart3, Edit, Trash2, Leaf, Recycle, Package, AlertTriangle, Plus, X } from 'lucide-react'
import { toast } from 'react-toastify'
import api from '../api/axios'
import DeleteWasteEntryModal from '../components/DeleteWasteEntryModal'

const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-teal-300 focus:ring-2 focus:ring-teal-100/60 transition-all bg-white"
const labelCls = "block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5"

const Field = ({ label, name, value, onChange, type = 'text', suffix, error, min, children }) => {
  const customInputCls = error 
    ? inputCls.replace('border-gray-200', 'border-red-300').replace('focus:border-teal-300', 'focus:border-red-500').replace('focus:ring-teal-100', 'focus:ring-red-100')
    : inputCls;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className={labelCls.replace(' mb-1.5', '')}>{label}</label>
        {error && <span className="text-[10px] text-red-500 font-bold">{error}</span>}
      </div>
      {children || (
        <div className="relative">
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder="0"
            min={min}
            className={customInputCls}
          />
          {suffix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold">{suffix}</span>
          )}
        </div>
      )}
    </div>
  )
}

export default function WasteDataManagement() {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    collectionType: 'Daily',
    ward: '',
    organic: '',
    recyclable: '',
    general: '',
  })
  const [wasteRecords, setWasteRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedWard, setSelectedWard] = useState('')
  const [wards, setWards] = useState([])
  const [editingId, setEditingId] = useState(null)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [entryToDelete, setEntryToDelete] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const [viewMode, setViewMode] = useState('ward')
  const [allScans, setAllScans] = useState([])

  useEffect(() => {
    fetchWards()
    fetchWasteData()
    fetchAllScans()
    const interval = setInterval(() => {
      fetchWasteData()
      fetchAllScans()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchWards = async () => {
    try {
      const res = await api.get('/wards')
      setWards(res.data)
      if (res.data.length > 0) {
        // Only set defaults if not already set
        setSelectedWard(prev => prev || res.data[0].name)
        setFormData(prev => ({ ...prev, ward: prev.ward || res.data[0].name }))
      }
    } catch (error) { console.error("Failed to fetch wards", error) }
  }

  const fetchAllScans = async () => {
    try {
      const res = await api.get('/attendance/all-scans')
      setAllScans(res.data)
    } catch (error) { console.error("Failed to fetch all scans", error) }
  }

  const fetchWasteData = async () => {
    try {
      const res = await api.get('/waste-data')
      setWasteRecords(res.data)
    } catch (error) {
      toast.error("Failed to fetch waste data")
    } finally {
      setLoading(false)
    }
  }

  const filteredRecords = wasteRecords.filter(record =>
    record.entryId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleInputChange = (e) => {
    let { name, value } = e.target
    // Prevent negative values for number fields
    if (e.target.type === 'number' && Number(value) < 0) value = '0'
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.date) newErrors.date = 'Required'
    if (!formData.ward) newErrors.ward = 'Required'
    if (!formData.collectionType) newErrors.collectionType = 'Required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSaveEntry = async (e) => {
    e.preventDefault()
    if (!validate()) { 
      toast.error('Please fill in required fields'); 
      return 
    }
    try {
      const payload = {
        date: formData.date, collectionType: formData.collectionType, ward: formData.ward,
        organic: formData.organic, recyclable: formData.recyclable,
        general: formData.general
      }
      if (editingId) {
        await api.put(`/waste-data/${editingId}`, payload)
        toast.success('Waste entry updated successfully!')
      } else {
        await api.post('/waste-data', payload)
        toast.success('Waste entry saved successfully!')
      }
      fetchWasteData()
      handleReset()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save entry')
    }
  }

  const handleEdit = (record) => {
    setEditingId(record._id)
    setFormData({
      date: new Date(record.date).toISOString().split('T')[0],
      collectionType: record.collectionType,
      ward: record.ward,
      organic: record.organic,
      recyclable: record.recyclable,
      general: record.general,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleReset = () => {
    setEditingId(null)
    setErrors({})
    setFormData({
      date: new Date().toISOString().split('T')[0],
      collectionType: 'Daily',
      ward: wards.length > 0 ? wards[0].name : '',
      organic: '', recyclable: '', general: ''
    })
  }

  const handleDeleteClick = (record) => { setEntryToDelete(record); setShowDeleteModal(true) }
  const handleConfirmDelete = async () => {
    if (!entryToDelete) return
    setDeleteLoading(true)
    try {
      await api.delete(`/waste-data/${entryToDelete._id}`)
      toast.success("Record deleted successfully")
      fetchWasteData()
      setShowDeleteModal(false)
      setEntryToDelete(null)
    } catch (error) {
      toast.error("Failed to delete record")
    } finally {
      setDeleteLoading(false)
    }
  }

  const wardRecords = wasteRecords.filter(r => r.ward === selectedWard)
  const avgOrganic = wardRecords.length > 0
    ? (wardRecords.reduce((sum, r) => sum + (r.organic || 0), 0) / wardRecords.length).toFixed(0) : 0
  const avgRecyclable = wardRecords.length > 0
    ? (wardRecords.reduce((sum, r) => sum + (r.recyclable || 0), 0) / wardRecords.length).toFixed(0) : 0
  const avgGeneral = wardRecords.length > 0
    ? (wardRecords.reduce((sum, r) => sum + (r.general || 0), 0) / wardRecords.length).toFixed(0) : 0
  const barData = [
    { label: 'Organic', value: avgOrganic, color: '#22c55e', icon: Leaf },
    { label: 'General', value: avgGeneral, color: '#ef4444', icon: AlertTriangle },
    { label: 'Recyclable', value: avgRecyclable, color: '#3b82f6', icon: Recycle },
  ]
  const maxBar = Math.max(...barData.map(b => Number(b.value))) || 100

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <p className="text-xs text-gray-400 font-medium mb-0.5">Main › Waste Data Management</p>
        <h1 className="text-xl font-black text-gray-800">Waste Data Management</h1>
      </div>

          {/* Top grid: Form + Visualization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">

            {/* Data Entry Form */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 flex items-center justify-between" style={{ background: editingId ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'linear-gradient(135deg, #1f9e9a, #16847f)' }}>
                <div>
                  <p className="text-white/70 text-[10px] font-medium uppercase tracking-wider">Waste Collection</p>
                  <h2 className="text-white font-bold text-base">{editingId ? 'Edit Entry' : 'New Data Entry'}</h2>
                </div>
                {editingId && (
                  <button onClick={handleReset} className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30">
                    <X size={16} />
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveEntry} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Date" name="date" value={formData.date} onChange={handleInputChange} type="date" error={errors.date} />
                  <Field label="Collection Type" error={errors.collectionType}>
                    <select name="collectionType" value={formData.collectionType} onChange={handleInputChange} className={errors.collectionType ? inputCls.replace('border-gray-200', 'border-red-300 focus:border-red-500 focus:ring-red-100') : inputCls}>
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </Field>
                </div>

                <Field label="Ward" error={errors.ward}>
                  <select name="ward" value={formData.ward} onChange={handleInputChange} className={errors.ward ? inputCls.replace('border-gray-200', 'border-red-300 focus:border-red-500 focus:ring-red-100') : inputCls}>
                    <option value="">Select Ward</option>
                    {wards.map(ward => <option key={ward._id} value={ward.name}>{ward.name}</option>)}
                  </select>
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Organic (kgs)" name="organic" value={formData.organic} onChange={handleInputChange} type="number" min={0} />
                  <Field label="Recyclable (kgs)" name="recyclable" value={formData.recyclable} onChange={handleInputChange} type="number" min={0} />
                  <Field label="General (kgs)" name="general" value={formData.general} onChange={handleInputChange} type="number" min={0} />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2"
                    style={{ background: editingId ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'linear-gradient(135deg, #1f9e9a, #16847f)' }}
                  >
                    {editingId ? <><Edit size={15} /> Update Entry</> : <><Plus size={15} /> Save Entry</>}
                  </button>
                  <button type="button" onClick={handleReset}
                    className="px-4 py-3 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                    Reset
                  </button>
                </div>
              </form>
            </div>

            {/* Visualization Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4" style={{ background: 'linear-gradient(135deg, #0f1923, #0d2620)' }}>
                <p className="text-white/60 text-[10px] font-medium uppercase tracking-wider">Analytics</p>
                <h2 className="text-white font-bold text-base">Ward Visualization</h2>
              </div>
              <div className="p-6">
                <div className="mb-5">
                  <label className={labelCls}>Select Ward</label>
                  <select value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)} className={inputCls}>
                    {wards.map(ward => <option key={ward._id} value={ward.name}>{ward.name}</option>)}
                  </select>
                </div>

                {wardRecords.length > 0 ? (
                  <div>
                    <div className="flex items-end justify-around h-44 gap-3 mb-4 px-2">
                      {barData.map(({ label, value, color }) => (
                        <div key={label} className="flex flex-col items-center gap-2 flex-1">
                          <span className="text-[10px] font-bold text-gray-600">{value} kg</span>
                          <div className="w-full rounded-t-lg transition-all duration-700 min-h-1"
                            style={{
                              height: `${(Number(value) / maxBar) * 140}px`,
                              background: `linear-gradient(180deg, ${color}cc, ${color})`,
                            }}
                          />
                          <p className="text-[10px] font-semibold text-gray-500">{label}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-center text-[10px] text-gray-400 font-medium">Average kg collected — {selectedWard}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <BarChart3 size={40} className="mb-3 opacity-30" />
                    <p className="text-sm font-medium">No data for {selectedWard}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Records Table Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3 flex-wrap">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Collection Records</h2>

              {/* View toggle */}
              <div className="flex bg-gray-100 p-1 rounded-xl gap-1 ml-2">
                {[{ mode: 'ward', label: 'Ward Wise' }, { mode: 'bin', label: 'Bin Wise (Live)' }].map(({ mode, label }) => (
                  <button key={mode} onClick={() => setViewMode(mode)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      viewMode === mode ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>

              <div className="ml-auto flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 w-52 border border-transparent focus-within:border-teal-300/50">
                <Search size={14} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by entry ID…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 outline-none text-xs bg-transparent text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Ward-wise Table */}
            <div className="overflow-x-auto">
              {viewMode === 'ward' ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      {['Entry ID', 'Date', 'Ward', 'Organic (kg)', 'General (kg)', 'Recyclable (kg)', 'Total (kg)', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3.5 text-left text-white text-[10px] font-bold uppercase tracking-wider bg-[#1f9e9a]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loading ? (
                      <tr><td colSpan="9" className="px-4 py-12 text-center text-gray-400 text-sm">Loading records…</td></tr>
                    ) : filteredRecords.length === 0 ? (
                      <tr><td colSpan="9" className="px-4 py-12 text-center text-gray-400 text-sm">No records found</td></tr>
                    ) : (
                      filteredRecords.map((record, idx) => (
                        <tr key={idx} className={`transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-teal-50/30`}>
                          <td className="px-4 py-3.5">
                            <span className="text-xs font-mono font-bold text-teal-600">{record.entryId}</span>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-gray-500">{new Date(record.date).toLocaleDateString()}</td>
                          <td className="px-4 py-3.5">
                            <span className="text-xs font-semibold text-gray-700 bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-100">{record.ward}</span>
                          </td>
                          <td className="px-4 py-3.5 text-xs font-semibold text-emerald-600">{record.organic || 0}</td>
                          <td className="px-4 py-3.5 text-xs font-semibold text-red-500">{record.general || 0}</td>
                          <td className="px-4 py-3.5 text-xs font-semibold text-blue-500">{record.recyclable || 0}</td>
                          <td className="px-4 py-3.5">
                            <span className="text-xs font-black text-gray-800">{record.total}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <button onClick={() => handleEdit(record)} className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors">
                                <Edit size={14} />
                              </button>
                              <button onClick={() => handleDeleteClick(record)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      {['Bin Code', 'Ward', 'Location', 'Collector', 'Type', 'Weight (kg)', 'Scanned At', 'Status'].map(h => (
                        <th key={h} className="px-4 py-3.5 text-left text-white text-[10px] font-bold uppercase tracking-wider bg-slate-800">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {allScans.map((scan, idx) => (
                      <tr key={idx} className={`transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-slate-50`}>
                        <td className="px-4 py-3.5">
                          <span className="text-xs font-mono font-bold text-gray-700">{scan.dustbin?.binCode || 'N/A'}</span>
                        </td>
                        <td className="px-4 py-3.5 text-xs font-semibold text-gray-700">{scan.dustbin?.ward || 'N/A'}</td>
                        <td className="px-4 py-3.5 text-xs text-gray-400 italic">{scan.dustbin?.locationText || 'N/A'}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                              style={{ background: 'linear-gradient(135deg, #1f9e9a, #22c55e)' }}>
                              {scan.labour?.name?.charAt(0) || '?'}
                            </div>
                            <span className="text-xs text-gray-700">{scan.labour?.name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            scan.dustbin?.type === 'Organic' ? 'bg-green-50 text-green-600 border-green-100' :
                            scan.dustbin?.type === 'Recyclable' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                            'bg-gray-50 text-gray-500 border-gray-100'
                          }`}>
                            {scan.dustbin?.type || 'Other'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-xs font-black text-teal-600">{scan.estimatedWeight || 0}</span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-400">
                          {new Date(scan.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-3.5">
                          {(scan.action === 'collected' || (scan.estimatedWeight > 0 && !scan.action)) ? (
                            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full">COLLECTED</span>
                          ) : scan.action === 'issue' ? (
                            <span className="text-[10px] font-bold bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full">REPORTED</span>
                          ) : (
                            <span className="text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full">SCANNED</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
      <DeleteWasteEntryModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        entry={entryToDelete}
        onConfirmDelete={handleConfirmDelete}
        loading={deleteLoading}
      />
    </div>
  )
}
