"use client";

import { useState, useEffect } from 'react'
import { Search, Filter, Download, Eye, Trash2, MapPin, FileSpreadsheet, FileText, QrCode, Plus } from 'lucide-react'
import { toast } from 'react-toastify'
import api from '../api/axios'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import ViewDustbinModal from '../components/ViewDustbinModal'
import EditDustbinModal from '../components/EditDustbinModal'
import DeleteDustbinConfirmModal from '../components/DeleteDustbinConfirmModal'

// Ensure autoTable is registered
// (Usually importing it is enough, but sometimes explicit apply is needed if tree-shaking removes it)


export default function DustbinManagement() {
  const [dustbins, setDustbins] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [downloadDropdownOpen, setDownloadDropdownOpen] = useState(false)
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [formData, setFormData] = useState({
    location: '',
    ward: 'Ward 1',
    type: 'General',
    status: 'Good',
  })
  const [errors, setErrors] = useState({})

  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedBin, setSelectedBin] = useState(null)

  const [wards, setWards] = useState([])

  // Fetch Dustbins and Wards
  useEffect(() => {
    fetchDustbins()
    fetchWards()
  }, [])

  const fetchWards = async () => {
    try {
      const res = await api.get('/wards')
      setWards(res.data)
      if (res.data.length > 0) {
        setFormData(prev => ({ ...prev, ward: res.data[0].name }))
      }
    } catch (error) {
      console.error('Failed to fetch wards', error)
    }
  }

  const fetchDustbins = async () => {
    try {
      const res = await api.get('/dustbins')
      // Map backend fields to frontend expected structure if needed
      // Backend: _id, binCode, locationText, type, status, geo: {lat, lng}
      // Frontend expects: id, location, type, status...
      const mapped = res.data.map(d => ({
        id: d.binCode,
        _id: d._id,
        location: d.locationText,
        ward: d.ward || 'N/A',
        type: d.type,
        status: d.status,
        gps: d.geo
      }))
      setDustbins(mapped)
    } catch (error) {
      console.error('Failed to fetch dustbins', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter dustbins based on search and filters
  const filteredDustbins = dustbins.filter((bin) => {
    const matchesSearch =
      (bin.id?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (bin.location?.toLowerCase().includes(searchTerm.toLowerCase()) || '')

    const matchesStatus = statusFilter === 'All' || bin.status === statusFilter
    const matchesType = typeFilter === 'All' || bin.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  // KPI calculations
  const kpis = {
    total: dustbins.length,
    good: dustbins.filter((b) => b.status === 'Good').length,
    damaged: dustbins.filter((b) => b.status === 'Damaged').length,
    needReplacement: dustbins.filter((b) => b.status === 'Need Replacement').length,
  }

  // Status badge styling
  const getStatusColor = (status) => {
    switch (status) {
      case 'Good':
        return 'bg-green-100 text-green-700 border border-green-300'
      case 'Damaged':
        return 'bg-orange-100 text-orange-700 border border-orange-300'
      case 'Need Replacement':
        return 'bg-red-100 text-red-700 border border-red-300'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  // Pin color for map
  const getPinColor = (status) => {
    switch (status) {
      case 'Good':
        return '#16a34a'
      case 'Damaged':
        return '#ea580c'
      case 'Need Replacement':
        return '#dc2626'
      default:
        return '#6b7280'
    }
  }

  // --- Download Functions ---

  const generateExcel = () => {
    const dataToExport = filteredDustbins.map(bin => ({
      'Bin ID': bin.id,
      'Ward': bin.ward,
      'Location': bin.location,
      'Type': bin.type,
      'Status': bin.status,
      'Latitude': bin.gps?.lat,
      'Longitude': bin.gps?.lng
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(dataToExport)
    XLSX.utils.book_append_sheet(wb, ws, 'Dustbins')
    XLSX.writeFile(wb, 'Dustbins_Registry.xlsx')
    setDownloadDropdownOpen(false)
    toast.success('Excel downloaded successfully')
  }

  const generatePDF = () => {
    try {
      const doc = new jsPDF()
      doc.text('Dustbin Registry', 14, 15)

      const head = [["Bin ID", "Ward", "Location", "Type", "Status"]]
      const body = filteredDustbins.map(bin => [
        bin.id || "N/A",
        bin.ward || "N/A",
        bin.location || "N/A",
        bin.type || "N/A",
        bin.status || "N/A",
      ])

      // Functional usage of autoTable
      if (typeof autoTable === 'function') {
        autoTable(doc, { head, body, startY: 20 })
      } else {
        // Fallback: Check if it's attached to doc
        doc.autoTable({ head, body, startY: 20 })
      }

      doc.save('Dustbins_Registry.pdf')
      setDownloadDropdownOpen(false)
      toast.success('PDF downloaded successfully')
    } catch (error) {
      console.error("PDF Generation Error:", error)
      toast.error(`PDF Failed: ${error.message}`)
    }
  }

  // Helper to load image
  const loadImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'Anonymous'
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
      img.src = url
    })
  }

  const generateQRPDF = async () => {
    setDownloadDropdownOpen(false)
    const toastId = toast.loading('Generating QR Code PDF...')

    try {
      const doc = new jsPDF()
      let isFirstPage = true

      for (const bin of filteredDustbins) {
        if (!isFirstPage) doc.addPage()
        isFirstPage = false

        // Title
        doc.setFontSize(22)
        doc.text(`Bin ID: ${bin.id}`, 105, 40, { align: 'center' })

        doc.setFontSize(14)
        doc.text(`Location: ${bin.location}`, 105, 50, { align: 'center' })
        doc.text(`Type: ${bin.type}`, 105, 60, { align: 'center' })

        // Fetch QR
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${bin.id}`
        const img = await loadImage(qrUrl)

        // Add QR Image (centered)
        const imgSize = 100
        const x = (210 - imgSize) / 2
        doc.addImage(img, 'PNG', x, 80, imgSize, imgSize)

        doc.setFontSize(10)
        doc.text('Scan to complete collection or to report issue', 105, 190, { align: 'center' })
      }

      doc.save('Dustbin_QR_Codes.pdf')
      toast.update(toastId, { render: 'QR PDF downloaded!', type: 'success', isLoading: false, autoClose: 3000 })
    } catch (error) {
      console.error(error)
      toast.update(toastId, { render: 'Failed to generate QR PDF', type: 'error', isLoading: false, autoClose: 3000 })
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.location.trim()) newErrors.location = 'Location is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSaveBin = async (e) => {
    e.preventDefault()
    if (!validate()) {
      toast.error('Please fix the errors in the form')
      return
    }

    try {
      const payload = {
        binCode: `B-${Math.floor(1000 + Math.random() * 9000)}`, // Random 4-digit ID
        locationText: formData.location,
        ward: formData.ward,
        type: formData.type,
        status: formData.status,
        lat: 15.3,
        lng: 73.8
      }

      const res = await api.post('/dustbins', payload)
      // Refresh list
      fetchDustbins()
      setFormData({ location: '', ward: wards[0]?.name || 'Ward 1', type: 'General', status: 'Good' })
      setErrors({})
      toast.success('Bin added successfully!')
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Failed to add bin')
    }
  }

  const handleViewBin = (bin) => {
    setSelectedBin(bin)
    setIsViewModalOpen(true)
  }

  const handleEditBin = () => {
    setIsViewModalOpen(false)
    setIsEditModalOpen(true)
  }

  const handleUpdateBin = async (binId, updatedData) => {
    try {
      await api.put(`/dustbins/${binId}`, updatedData)
      setDustbins(dustbins.map(bin =>
        bin._id === binId
          ? { ...bin, ...updatedData }
          : bin
      ))
      toast.success('Bin updated successfully!')
    } catch (error) {
      console.error("Failed to update bin", error)
      toast.error("Failed to update bin")
    }
  }

  const handleDeleteBinClick = (bin) => {
    setSelectedBin(bin)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async (binId) => {
    try {
      await api.delete(`/dustbins/${binId}`)
      setDustbins(dustbins.filter(b => b._id !== binId))
      toast.success('Bin deleted successfully!')
    } catch (error) {
      console.error("Failed to delete bin", error)
      toast.error("Failed to delete bin")
    }
  }

  const handleDeleteFromViewModal = () => {
    setIsViewModalOpen(false)
    handleDeleteBinClick(selectedBin)
  }

  const handleDirectTableDelete = (bin) => {
    handleDeleteBinClick(bin)
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-gray-400 font-medium mb-0.5">Main › Operational Management › Dustbin Management</p>
        <h1 className="text-xl font-black text-gray-800">Dustbin Management</h1>
      </div>

      {/* Main Container - 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN - TABLE & MAP (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">

          {/* ===== DUSTBIN REGISTRY TABLE ===== */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            {/* Title & Search Toolbar */}
            <div className="px-6 py-4 border-b border-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-gray-800">DUSTBIN REGISTRY</h2>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto mt-3 sm:mt-0">
                <div className="flex items-center gap-2 px-3 py-1 bg-white border border-gray-300 rounded-lg focus-within:ring-1 focus-within:ring-teal-500 focus-within:border-teal-500 shadow-sm w-full sm:w-64">
                  <Search size={18} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by Bin ID or location"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-transparent border-0 focus:outline-none text-sm w-full py-1"
                  />
                </div>
                <div className="relative">
                  <button
                    onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                    className={`flex items-center gap-2 px-3 py-2 bg-white border rounded-lg transition-all shadow-sm ${(statusFilter !== 'All' || typeFilter !== 'All')
                      ? 'border-teal-500 text-teal-600 bg-teal-50'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <Filter size={18} />
                    <span className="text-sm font-medium">Filter</span>
                    {(statusFilter !== 'All' || typeFilter !== 'All') && (
                      <span className="flex h-2 w-2 rounded-full bg-teal-500"></span>
                    )}
                  </button>

                  {filterDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-50 border border-gray-100 p-4 space-y-4">
                      {/* Status Filter */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                        <select
                          value={statusFilter}
                          onChange={(e) => {
                            const newStatus = e.target.value;
                            setStatusFilter(newStatus);
                            if (newStatus !== 'All' && typeFilter !== 'All') {
                              setFilterDropdownOpen(false);
                            }
                          }}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                        >
                          <option value="All">All Status</option>
                          <option value="Good">Good</option>
                          <option value="Damaged">Damaged</option>
                          <option value="Need Replacement">Need Replacement</option>
                        </select>
                      </div>

                      {/* Type Filter */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Type</label>
                        <select
                          value={typeFilter}
                          onChange={(e) => {
                            const newType = e.target.value;
                            setTypeFilter(newType);
                            if (newType !== 'All' && statusFilter !== 'All') {
                              setFilterDropdownOpen(false);
                            }
                          }}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                        >
                          <option value="All">All Types</option>
                          <option value="General">General</option>
                          <option value="Recyclable">Recyclable</option>
                          <option value="Organic">Organic</option>
                        </select>
                      </div>

                      {/* Clear Button */}
                      {(statusFilter !== 'All' || typeFilter !== 'All') && (
                        <button
                          onClick={() => {
                            setStatusFilter('All')
                            setTypeFilter('All')
                            setFilterDropdownOpen(false)
                          }}
                          className="w-full py-1 text-xs text-red-500 hover:text-red-600 font-semibold text-center border-t border-gray-100 pt-2"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button
                    onClick={() => setDownloadDropdownOpen(!downloadDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 bg-teal-50 border border-teal-200 rounded-lg text-teal-700 hover:bg-teal-100 transition-all shadow-sm"
                  >
                    <Download size={18} />
                    <span className="text-sm font-medium">Download</span>
                  </button>

                  {downloadDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-50 border border-gray-100 py-1">
                      <button
                        onClick={generateExcel}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <FileSpreadsheet size={16} className="text-green-600" /> Download Excel
                      </button>
                      <button
                        onClick={generatePDF}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <FileText size={16} className="text-red-500" /> Download PDF (List)
                      </button>
                      <button
                        onClick={generateQRPDF}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-t border-gray-100"
                      >
                        <QrCode size={16} className="text-blue-600" /> Download QR PDF
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    {['Bin ID', 'Ward', 'Location', 'Type', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-white text-[10px] font-bold uppercase tracking-wider bg-[#1f9e9a]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredDustbins.map((bin, idx) => (
                    <tr key={idx} className={`transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-teal-50/30`}>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-mono font-bold text-teal-600">{bin.id}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-semibold text-gray-700 bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-100">{bin.ward}</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-500 max-w-32 truncate">{bin.location}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-600 font-medium">{bin.type}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${bin.status === 'Good' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          bin.status === 'Damaged' ? 'bg-orange-50 text-orange-500 border-orange-100' :
                            'bg-red-50 text-red-500 border-red-100'
                          }`}>
                          {bin.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleViewBin(bin)}
                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleDirectTableDelete(bin)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ===== MAP VIEW ===== */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">MAP VIEW</h3>

            <div className="w-full bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg overflow-hidden" style={{ height: '300px' }}>
              <svg viewBox="0 0 600 400" className="w-full h-full" style={{ background: '#e0e7ff' }}>
                {/* Grid lines */}
                <line x1="0" y1="100" x2="600" y2="100" stroke="#d1d5db" strokeWidth="2" />
                <line x1="0" y1="200" x2="600" y2="200" stroke="#d1d5db" strokeWidth="2" />
                <line x1="0" y1="300" x2="600" y2="300" stroke="#d1d5db" strokeWidth="2" />
                <line x1="150" y1="0" x2="150" y2="400" stroke="#d1d5db" strokeWidth="2" />
                <line x1="300" y1="0" x2="300" y2="400" stroke="#d1d5db" strokeWidth="2" />
                <line x1="450" y1="0" x2="450" y2="400" stroke="#d1d5db" strokeWidth="2" />

                {/* Blocks */}
                <rect x="10" y="10" width="130" height="80" fill="#f3f4f6" stroke="#d1d5db" />
                <rect x="160" y="10" width="130" height="80" fill="#f3f4f6" stroke="#d1d5db" />
                <rect x="310" y="10" width="130" height="80" fill="#f3f4f6" stroke="#d1d5db" />
                <rect x="460" y="10" width="130" height="80" fill="#f3f4f6" stroke="#d1d5db" />

                <rect x="10" y="110" width="130" height="80" fill="#f3f4f6" stroke="#d1d5db" />
                <rect x="160" y="110" width="130" height="80" fill="#f3f4f6" stroke="#d1d5db" />
                <rect x="310" y="110" width="130" height="80" fill="#f3f4f6" stroke="#d1d5db" />
                <rect x="460" y="110" width="130" height="80" fill="#f3f4f6" stroke="#d1d5db" />

                <rect x="10" y="210" width="130" height="80" fill="#f3f4f6" stroke="#d1d5db" />
                <rect x="160" y="210" width="130" height="80" fill="#f3f4f6" stroke="#d1d5db" />
                <rect x="310" y="210" width="130" height="80" fill="#f3f4f6" stroke="#d1d5db" />
                <rect x="460" y="210" width="130" height="80" fill="#f3f4f6" stroke="#d1d5db" />

                {/* Compass */}
                <text x="30" y="360" fontSize="16" fontWeight="bold" fill="#6b7280">N</text>
                <line x1="40" y1="365" x2="40" y2="385" stroke="#6b7280" strokeWidth="2" />

                {/* Pins */}
                {filteredDustbins.map((pin, idx) => {
                  const x = (idx % 3) * 150 + 75
                  const y = Math.floor(idx / 3) * 120 + 80
                  const color = getPinColor(pin.status)
                  return (
                    <g key={idx}>
                      <circle cx={x} cy={y} r="12" fill={color} stroke="white" strokeWidth="2" />
                      <path d={`M ${x} ${y + 12} L ${x - 8} ${y + 30} L ${x + 8} ${y + 30} Z`} fill={color} />
                    </g>
                  )
                })}
              </svg>
            </div>

            {/* Legend */}
            <div className="mt-4 flex justify-end gap-6 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Good</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-gray-700">Damaged</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-700">Needs Replacement</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - FORM & SUMMARY (1/3 width) */}
        <div className="lg:col-span-1 space-y-6">

          {/* ===== ADD BIN FORM ===== */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Add Bin</h3>

            <form onSubmit={handleSaveBin} className="space-y-4">
              {/* Bin ID */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Bin ID</label>
                <input
                  type="text"
                  value="Auto Generated (e.g. B-1234)"
                  disabled
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded text-gray-600 text-xs"
                />
              </div>

              {/* Location */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-700">Location *</label>
                  {errors.location && <span className="text-[10px] text-red-500 font-bold">{errors.location}</span>}
                </div>
                <textarea
                  name="location"
                  placeholder="Enter location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-xs transition-all resize-none h-16 ${errors.location ? 'border-red-300 focus:ring-red-400/20 focus:border-red-500' : 'border-gray-300 focus:ring-teal-500'}`}
                ></textarea>
              </div>

              {/* GPS Picker */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">GPS picker</label>
                <button
                  type="button"
                  className="w-full py-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 hover:bg-gray-100"
                >
                  <MapPin size={28} />
                </button>
              </div>

              {/* Ward */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Ward</label>
                <select
                  name="ward"
                  value={formData.ward}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-2 focus:ring-teal-500 text-xs"
                >
                  {wards.map(ward => (
                    <option key={ward._id} value={ward.name}>{ward.name}</option>
                  ))}
                </select>
              </div>

              {/* Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs"
                >
                  <option value="General">General</option>
                  <option value="Recyclable">Recyclable</option>
                  <option value="Organic">Organic</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Status</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="Good"
                    checked={formData.status === 'Good'}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <span className="text-xs text-gray-700">Good</span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-3 py-2 bg-teal-500 text-white rounded font-semibold text-xs hover:bg-teal-600 transition"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ location: '', type: 'General', status: 'Good' })}
                  className="flex-1 px-3 py-2 bg-red-500 text-white rounded font-semibold text-xs hover:bg-red-600 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* ===== DUSTBIN SUMMARY ===== */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-800">DUSTBIN SUMMARY</h3>

            {/* Total Bins */}
            <div className="bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-900/10 rounded-lg p-4 border-l-4 border-purple-500 dark:border-purple-600">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-700">Total Bins</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🗑</span>
                  <span className="text-2xl font-bold text-gray-800">{kpis.total}</span>
                </div>
              </div>
            </div>

            {/* Good */}
            <div className="bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-900/10 rounded-lg p-4 border-l-4 border-green-500 dark:border-green-600">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-700">Good</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👍</span>
                  <span className="text-2xl font-bold text-gray-800">{kpis.good}</span>
                </div>
              </div>
            </div>

            {/* Damaged */}
            <div className="bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-900/10 rounded-lg p-4 border-l-4 border-red-500 dark:border-red-600">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-700">Damaged</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚙️</span>
                  <span className="text-2xl font-bold text-gray-800">{kpis.damaged}</span>
                </div>
              </div>
            </div>

            {/* Needs Replacement */}
            <div className="bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-900/10 rounded-lg p-4 border-l-4 border-orange-500 dark:border-orange-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-700">Needs</p>
                  <p className="text-xs font-semibold text-gray-700">Replacement</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🔄</span>
                  <span className="text-2xl font-bold text-gray-800">{kpis.needReplacement}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Dustbin Modal */}
      <ViewDustbinModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        dustbin={selectedBin}
        onEdit={handleEditBin}
        onDelete={handleDeleteFromViewModal}
      />

      {/* Edit Dustbin Modal */}
      <EditDustbinModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        dustbin={selectedBin}
        onUpdate={handleUpdateBin}
      />

      {/* Delete Confirmation Modal */}
      <DeleteDustbinConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        dustbin={selectedBin}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  )
}