"use client";

import { useState, useEffect } from 'react'
import { Search, Filter, Download, Eye, Trash2, CheckCircle, XCircle, FileText, Table } from 'lucide-react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { toast } from 'react-toastify'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import api from '../api/axios'
import ViewHouseholdModal from '../components/ViewHouseholdModal'
import EditHouseholdModal from '../components/EditHouseholdModal'
import DeleteHouseholdModal from '../components/DeleteHouseholdModal'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function HouseholdManagement() {
  const [households, setHouseholds] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [complaintsCount, setComplaintsCount] = useState(0)
  const [complaintStats, setComplaintStats] = useState([])
  const [formData, setFormData] = useState({
    houseNumber: '',
    address: '',
    wardAssigned: 'Ward 1',
    headName: '',
    contact: '',
  })
  const [errors, setErrors] = useState({})

  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedHousehold, setSelectedHousehold] = useState(null)

  // Filter & Download States
  const [wardFilter, setWardFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [showDownloadMenu, setShowDownloadMenu] = useState(false)

  const [wards, setWards] = useState([])

  useEffect(() => {
    fetchHouseholds()
    fetchComplaints()
    fetchWards()

    // ── Real-time polling: re-fetch every 5 seconds ──
    const interval = setInterval(() => {
      fetchHouseholds()
    }, 5000)

    return () => clearInterval(interval)   // cleanup on unmount
  }, [])

  const fetchWards = async () => {
    try {
      const res = await api.get('/wards')
      setWards(res.data)
      if (res.data.length > 0) {
        setFormData(prev => ({ ...prev, wardAssigned: res.data[0].name }))
      }
    } catch (error) {
      console.error('Failed to fetch wards', error)
    }
  }

  const fetchHouseholds = async () => {
    try {
      const res = await api.get('/households')
      // Backend: _id, ownerName, mobile, houseNumber, address, ward, status
      const mapped = res.data.map(h => ({
        id: h.houseNumber || h._id.slice(-6), // Prefer house number, fallback to ID
        _id: h._id,
        headOfHousehold: h.ownerName,
        ward: h.ward,
        contact: h.mobile,
        segregationCompliance: h.segregationCompliance || 'Compliant',
        address: h.address,
        complaints: 'No complaints',
        status: h.status || 'Pending'
      }))
      setHouseholds(mapped)
    } catch (error) {
      console.error('Failed to fetch households', error)
      // toast.error('Failed to fetch households')
    } finally {
      setLoading(false)
    }
  }

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints')
      const complaints = res.data;
      setComplaintsCount(complaints.length)

      // Calculate specific stats for the chart
      const statusCounts = complaints.reduce((acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
      }, {});

      const stats = Object.keys(statusCounts).map(key => ({
        name: key,
        value: statusCounts[key]
      }));

      // If empty (no complaints), show placeholder
      if (stats.length === 0) {
        setComplaintStats([{ name: 'No Data', value: 1 }]);
      } else {
        setComplaintStats(stats);
      }

    } catch (error) {
      console.error('Failed to fetch complaints', error)
      setComplaintStats([{ name: 'Error', value: 1 }]);
    }
  }

  // Filter households based on search
  // Filter households based on search, ward, and status
  const filteredHouseholds = households.filter((household) => {
    const matchesSearch = household.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      household.headOfHousehold?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesWard = wardFilter === 'All' || household.ward === wardFilter
    const matchesStatus = statusFilter === 'All' || household.status === statusFilter

    return matchesSearch && matchesWard && matchesStatus
  })

  // Download Handlers
  const handleDownloadCSV = () => {
    const headers = ['Household ID', 'Head of Household', 'Ward', 'Contact', 'Address', 'Status', 'Segregation Compliance']
    const rows = filteredHouseholds.map(h => [
      h.id,
      h.headOfHousehold,
      h.ward,
      h.contact,
      h.address,
      h.status,
      h.segregationCompliance
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(item => `"${item}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `households_registry_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    setShowDownloadMenu(false)
  }

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF()

      doc.text('Household Registry', 14, 15)
      doc.setFontSize(10)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22)

      const tableColumn = ['ID', 'Head Name', 'Ward', 'Contact', 'Status']
      const tableRows = filteredHouseholds.map(h => [
        h.id,
        h.headOfHousehold,
        h.ward,
        h.contact,
        h.status
      ])

      // Functional usage of autoTable with fallback
      if (typeof autoTable === 'function') {
        autoTable(doc, {
          startY: 25,
          head: [tableColumn],
          body: tableRows,
        })
      } else {
        doc.autoTable({
          startY: 25,
          head: [tableColumn],
          body: tableRows,
        })
      }

      doc.save(`households_registry_${new Date().toISOString().split('T')[0]}.pdf`)
      setShowDownloadMenu(false)
    } catch (error) {
      console.error("PDF Export Error:", error)
      toast.error(`Failed to download PDF: ${error.message}`)
    }
  }

  // Dynamic Compliance Metrics
  const totalHouseholds = households.length;
  const nonCompliantCount = households.filter(h => h.segregationCompliance === 'Non-Compliant').length;
  const compliantCount = totalHouseholds - nonCompliantCount; // Or filter specifically if other statuses exist

  // Compliance percentage for pie chart
  const compliancePercentage = totalHouseholds > 0 ? (compliantCount / totalHouseholds) * 100 : 100;
  const nonCompliancePercentage = 100 - compliancePercentage;

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.houseNumber.trim()) newErrors.houseNumber = 'House Number is required'
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.headName.trim()) newErrors.headName = 'Owner Name is required'

    const contactRegex = /^\d{10}$/
    if (!formData.contact.trim()) newErrors.contact = 'Contact is required'
    else if (!contactRegex.test(formData.contact)) newErrors.contact = 'Invalid 10-digit contact'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSaveHousehold = async (e) => {
    e.preventDefault()
    if (!validate()) {
      toast.error('Please fix the errors in the form')
      return
    }

    try {
      const payload = {
        ownerName: formData.headName,
        mobile: formData.contact,
        houseNumber: formData.houseNumber,
        address: formData.address,
        ward: formData.wardAssigned,
        // lat, lng - normally from map picker, hardcoding for now or optional
        lat: 15.2993,
        lng: 74.1240
      }

      await api.post('/households', payload)
      fetchHouseholds()
      setFormData({ houseNumber: '', address: '', wardAssigned: wards[0]?.name || 'Ward 1', headName: '', contact: '' })
      setErrors({})
      toast.success('Household added successfully!')
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Failed to add household')
    }
  }

  const handleViewHousehold = (household) => {
    setSelectedHousehold(household)
    setIsViewModalOpen(true)
  }

  const handleEditHousehold = () => {
    setIsViewModalOpen(false)
    setIsEditModalOpen(true)
  }

  const handleUpdateHousehold = async (householdId, updatedData) => {
    try {
      // payload mapping matching backend expectations
      const payload = {
        ownerName: updatedData.headOfHousehold,
        mobile: updatedData.contact,
        address: updatedData.address,
        ward: updatedData.ward,
        segregationCompliance: updatedData.segregationCompliance
      }

      await api.put(`/households/${householdId}`, payload)
      fetchHouseholds()
      toast.success('Household updated successfully')
    } catch (e) {
      console.error(e)
      toast.error(e.response?.data?.message || 'Update failed')
    }
  }

  const handleVerifyHousehold = async (householdId, newStatus) => {
    try {
      await api.patch(`/households/${householdId}/status`, { status: newStatus })

      setHouseholds(households.map(h =>
        h._id === householdId ? { ...h, status: newStatus } : h
      ))

      toast.success(`Household ${newStatus} successfully`)
    } catch (error) {
      console.error("Verification failed", error)
      toast.error("Failed to update status")
    }
  }

  const handleOpenDeleteModal = (household) => {
    setSelectedHousehold(household)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteFromViewModal = () => {
    setIsViewModalOpen(false)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (selectedHousehold) {
      try {
        await api.delete(`/households/${selectedHousehold._id}`)
        setHouseholds(households.filter(h => h._id !== selectedHousehold._id))
        toast.success('Household deleted successfully')
        setIsDeleteModalOpen(false)
      } catch (error) {
        console.error("Delete failed", error)
        toast.error('Failed to delete household')
      }
    }
  }

  const getComplianceColor = (compliance) => {
    return compliance === 'Compliant'
      ? 'bg-green-100 text-green-700 border border-green-300'
      : 'bg-red-100 text-red-700 border border-red-300'
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <p className="text-xs text-gray-400 font-medium mb-0.5">Main › Operational Management › Household Management</p>
        <h1 className="text-xl font-black text-gray-800">Household Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN - TABLE & METRICS (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">

          {/* ===== HOUSEHOLD REGISTRY TABLE ===== */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-visible relative">
            {/* Title & Search Toolbar */}
            <div className="px-6 py-4 border-b border-gray-50">
              <h2 className="text-lg font-bold text-gray-800 mb-4">HOUSEHOLD REGISTRY</h2>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-2 px-3 py-1 bg-white border border-gray-300 rounded-lg focus-within:ring-1 focus-within:ring-teal-500 focus-within:border-teal-500 shadow-sm w-full sm:w-64">
                  <Search size={18} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search household by ID"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-transparent border-0 focus:outline-none text-sm w-full py-1"
                  />
                </div>

                {/* Filter Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowFilterMenu(!showFilterMenu)
                      setShowDownloadMenu(false)
                    }}
                    className={`flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition ${wardFilter !== 'All' || statusFilter !== 'All' ? 'bg-teal-50 text-teal-700 border-teal-500' : ''}`}
                  >
                    <Filter size={16} />
                    <span>Filter</span>
                  </button>

                  {showFilterMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded shadow-xl z-20 p-4 space-y-4">
                      {/* Ward Filter */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Ward</label>
                        <select
                          value={wardFilter}
                          onChange={(e) => {
                            const newWard = e.target.value;
                            setWardFilter(newWard);
                            if (newWard !== 'All' && statusFilter !== 'All') {
                              setShowFilterMenu(false);
                            }
                          }}
                          className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
                        >
                          <option value="All">All Wards</option>
                          {wards.map(ward => (
                            <option key={ward._id} value={ward.name}>{ward.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Status Filter */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                        <select
                          value={statusFilter}
                          onChange={(e) => {
                            const newStatus = e.target.value;
                            setStatusFilter(newStatus)
                            if (newStatus !== 'All' && wardFilter !== 'All') {
                              setShowFilterMenu(false);
                            }
                          }}
                          className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
                        >
                          <option value="All">All Status</option>
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>

                      {/* Clear Filters */}
                      {(wardFilter !== 'All' || statusFilter !== 'All') && (
                        <button
                          onClick={() => {
                            setWardFilter('All')
                            setStatusFilter('All')
                            setShowFilterMenu(false)
                          }}
                          className="w-full py-1 text-xs text-red-500 hover:text-red-700 font-semibold border-t border-gray-100 pt-2"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Download Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowDownloadMenu(!showDownloadMenu)
                      setShowFilterMenu(false)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition"
                  >
                    <Download size={16} />
                    <span>Download</span>
                  </button>

                  {showDownloadMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-xl z-20">
                      <button
                        onClick={handleDownloadCSV}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Table size={16} /> Download CSV
                      </button>
                      <button
                        onClick={handleDownloadPDF}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <FileText size={16} /> Download PDF
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
                    {['Household ID', 'Head of Household', 'Ward', 'Contact', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-white text-[10px] font-bold uppercase tracking-wider bg-[#1f9e9a]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredHouseholds.map((household, idx) => (
                    <tr key={idx} className={`transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-teal-50/30`}>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-mono font-bold text-teal-600">{household.id}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #1f9e9a, #22c55e)' }}>
                            {household.headOfHousehold?.charAt(0)}
                          </div>
                          <span className="text-sm font-semibold text-gray-800">{household.headOfHousehold}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-500">{household.ward}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-500">{household.contact}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 text-[10px] rounded-full font-bold border ${household.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          household.status === 'Rejected' ? 'bg-red-50 text-red-500 border-red-100' :
                            'bg-amber-50 text-amber-600 border-amber-100'
                          }`}>
                          {household.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        {/* Verification Actions */}
                        {household.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleVerifyHousehold(household._id, 'Approved')}
                              title="Approve"
                              className="p-2 text-green-600 bg-green-50 border border-green-200 rounded hover:bg-green-100 transition"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => handleVerifyHousehold(household._id, 'Rejected')}
                              title="Reject"
                              className="p-2 text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => handleViewHousehold(household)}
                          title="View Details"
                          className="p-2 text-blue-500 border border-blue-500 rounded hover:bg-blue-50 transition"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(household)}
                          title="Delete"
                          className="p-2 text-red-500 border border-red-500 rounded hover:bg-red-50 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ===== COMPLIANCE METRICS ===== */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800">COMPLIANCE METRICS</h2>

            {/* Quick Stats */}
            <p className="text-sm text-gray-600 font-medium">Quick stats summary:</p>
            <div className="grid grid-cols-3 gap-4">
              {/* Total Households */}
              <div className="bg-gray-100 rounded-lg p-4 border border-gray-300 text-center">
                <p className="text-xs text-gray-600 font-semibold mb-2">Total Household Registered</p>
                <p className="text-2xl font-bold text-gray-800">{totalHouseholds}</p>
              </div>

              {/* Complaints */}
              <div className="bg-gray-100 rounded-lg p-4 border border-gray-300 text-center">
                <p className="text-xs text-gray-600 font-semibold mb-2">Complaints</p>
                <p className="text-2xl font-bold text-gray-800">{complaintsCount}</p>
              </div>

              {/* Non-Compliant */}
              <div className="bg-gray-100 rounded-lg p-4 border border-gray-300 text-center">
                <p className="text-xs text-gray-600 font-semibold mb-2">Non-Compliant</p>
                <p className="text-2xl font-bold text-gray-800">{nonCompliantCount}</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 font-medium mt-4">Visuals:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Complaints Chart */}
              <div className="bg-orange-100 rounded-lg p-4 min-h-64 flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={complaintStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {complaintStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <h3 className="text-center font-bold text-gray-800 mt-2 text-xs">
                  Complaints by Status
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - ADD HOUSEHOLD FORM (1/3 width) */}
        <div className="lg:col-span-1">
          {/* ===== ADD HOUSEHOLD FORM ===== */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">ADD HOUSEHOLD</h3>

            <form onSubmit={handleSaveHousehold} className="space-y-4">
              {/* Household ID (Auto) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Household ID
                </label>
                <input
                  type="text"
                  value="Auto Generated"
                  disabled
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded text-gray-600 text-xs"
                />
              </div>

              {/* House Number (Manual) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-700">House Number *</label>
                  {errors.houseNumber && <span className="text-[10px] text-red-500 font-bold">{errors.houseNumber}</span>}
                </div>
                <input
                  type="text"
                  name="houseNumber"
                  placeholder="e.g. H-101"
                  value={formData.houseNumber}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-xs transition-all ${errors.houseNumber ? 'border-red-300 focus:ring-red-400/20 focus:border-red-500' : 'border-gray-300 focus:ring-teal-500'}`}
                />
              </div>

              {/* Address */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-700">Address *</label>
                  {errors.address && <span className="text-[10px] text-red-500 font-bold">{errors.address}</span>}
                </div>
                <textarea
                  name="address"
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-xs transition-all resize-none h-16 ${errors.address ? 'border-red-300 focus:ring-red-400/20 focus:border-red-500' : 'border-gray-300 focus:ring-teal-500'}`}
                ></textarea>
              </div>

              {/* Ward Assigned */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Ward Assigned
                </label>
                <select
                  name="wardAssigned"
                  value={formData.wardAssigned}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs"
                >
                  {wards.map(ward => (
                    <option key={ward._id} value={ward.name}>
                      {ward.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Name of the Head */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-700">Owner Name *</label>
                  {errors.headName && <span className="text-[10px] text-red-500 font-bold">{errors.headName}</span>}
                </div>
                <input
                  type="text"
                  name="headName"
                  placeholder="Enter name"
                  value={formData.headName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-xs transition-all ${errors.headName ? 'border-red-300 focus:ring-red-400/20 focus:border-red-500' : 'border-gray-300 focus:ring-teal-500'}`}
                />
              </div>

              {/* Contact */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-700">Contact *</label>
                  {errors.contact && <span className="text-[10px] text-red-500 font-bold">{errors.contact}</span>}
                </div>
                <input
                  type="text"
                  name="contact"
                  placeholder="10-digit number"
                  value={formData.contact}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-xs transition-all ${errors.contact ? 'border-red-300 focus:ring-red-400/20 focus:border-red-500' : 'border-gray-300 focus:ring-teal-500'}`}
                />
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
                  onClick={() => {
                    setFormData({ houseNumber: '', address: '', wardAssigned: wards[0]?.name || 'Ward 1', headName: '', contact: '' });
                    setErrors({});
                  }}
                  className="flex-1 px-3 py-2 bg-red-500 text-white rounded font-semibold text-xs hover:bg-red-600 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* View Household Modal */}
      <ViewHouseholdModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        household={selectedHousehold}
        onEdit={handleEditHousehold}
        onDelete={handleDeleteFromViewModal}
      />

      {/* Edit Household Modal */}
      <EditHouseholdModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        household={selectedHousehold}
        onUpdate={handleUpdateHousehold}
      />

      <DeleteHouseholdModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        household={selectedHousehold}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  )
}
