"use client";

import { useState, useEffect } from 'react'
import { Search, Filter, Download, Eye, ImageIcon, FileText, Table, AlertCircle, Clock, CheckCircle2, Users, X } from 'lucide-react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { toast } from 'react-toastify'
import api from '../api/axios'
import ViewComplaintModal from '../components/ViewComplaintModal'

export default function ReportAndComplaintManagement() {
  const [complaints, setComplaints] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState(null)

  const [statusFilter, setStatusFilter] = useState('All')
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [showDownloadMenu, setShowDownloadMenu] = useState(false)

  const [metrics, setMetrics] = useState({ new: 0, pending: 0, resolved: 0 })

  useEffect(() => {
    fetchData()
    const interval = setInterval(() => fetchData(true), 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true)
      const [complaintsRes, employeesRes] = await Promise.all([
        api.get('/complaints'),
        api.get('/employees')
      ])
      const mappedComplaints = complaintsRes.data.map(c => ({
        originalId: c._id,
        id: c.complaintId || c._id,
        createdAt: c.createdAt,
        dateSubmitted: new Date(c.createdAt).toLocaleDateString(),
        name: c.reporterName,
        mobile: c.reporterMobile,
        category: c.type,
        ward: c.ward || 'N/A',
        photo: c.photo,
        status: c.status,
        assignedEmployee: c.assignedTo || null,
        description: c.description
      }))
      setComplaints(mappedComplaints)
      setEmployees(employeesRes.data)
      calculateMetrics(mappedComplaints)
    } catch (error) {
      console.error('Failed to fetch data', error)
    } finally {
      if (!isBackground) setLoading(false)
    }
  }

  const calculateMetrics = (data) => {
    setMetrics({
      new: data.filter(c => c.status === 'Received').length,
      pending: data.filter(c => c.status === 'In Progress' || (c.status === 'Received' && !c.assignedEmployee)).length,
      resolved: data.filter(c => c.status === 'Resolved').length,
    })
  }

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch =
      complaint.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'All' || complaint.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleDownloadCSV = () => {
    const headers = ['Feedback ID', 'Date', 'Name', 'Category', 'Ward', 'Status', 'Assigned To']
    const rows = filteredComplaints.map(c => [
      c.id, c.dateSubmitted, c.name, c.category, c.ward, c.status,
      c.assignedEmployee ? c.assignedEmployee.name : 'Unassigned'
    ])
    const csvContent = [headers.join(','), ...rows.map(row => row.map(item => `"${item}"`).join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `feedback_report_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    setShowDownloadMenu(false)
  }

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF()
      doc.text('Feedback Report', 14, 15)
      doc.setFontSize(10)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22)
      autoTable(doc, {
        startY: 25,
        head: [['ID', 'Date', 'Name', 'Category', 'Ward', 'Status', 'Assigned']],
        body: filteredComplaints.map(c => [
          c.id, c.dateSubmitted, c.name, c.category, c.ward, c.status,
          c.assignedEmployee ? c.assignedEmployee.name : 'Unassigned'
        ]),
        headStyles: { fillColor: [31, 158, 154] },
      })
      doc.save(`feedback_report_${new Date().toISOString().split('T')[0]}.pdf`)
      setShowDownloadMenu(false)
    } catch (error) {
      toast.error(`Failed to download PDF: ${error.message}`)
    }
  }

  const receivedComplaints = complaints.filter(c => c.status === 'Received')
  const inProgressComplaints = complaints.filter(c => c.status === 'In Progress')
  const resolvedComplaints = complaints.filter(c => c.status === 'Resolved')

  const handleViewComplaint = (complaint) => {
    setSelectedComplaint(complaint)
    setIsViewModalOpen(true)
  }

  const handleStatusUpdate = async (complaintId, updatedData) => {
    try {
      await api.patch(`/complaints/${complaintId}`, updatedData)
      fetchData()
      toast.success("Feedback updated successfully")
    } catch (error) {
      toast.error('Failed to update feedback')
    }
  }

  const handleAssignEmployee = async (complaintId, employeeId) => {
    if (!employeeId) return
    try {
      await api.patch(`/complaints/${complaintId}`, { assignedTo: employeeId, status: 'In Progress' })
      fetchData()
      toast.success("Employee assigned successfully")
    } catch (err) {
      toast.error("Failed to assign employee")
    }
  }

  const statusConfig = {
    'Received': { badge: 'bg-red-50 text-red-600 border-red-100', dot: 'bg-red-500', col: 'border-t-4 border-red-400', colBg: 'bg-red-50/60', link: 'text-red-600' },
    'In Progress': { badge: 'bg-amber-50 text-amber-600 border-amber-100', dot: 'bg-amber-500', col: 'border-t-4 border-amber-400', colBg: 'bg-amber-50/60', link: 'text-amber-600' },
    'Resolved': { badge: 'bg-emerald-50 text-emerald-600 border-emerald-100', dot: 'bg-emerald-500', col: 'border-t-4 border-emerald-400', colBg: 'bg-emerald-50/60', link: 'text-emerald-600' },
  }

  const KanbanCard = ({ complaint, columnStatus }) => {
    const cfg = statusConfig[columnStatus] || statusConfig['Received']
    return (
      <div className={`bg-white rounded-xl border ${cfg.col} shadow-sm hover:shadow-md transition-shadow duration-200 p-4 space-y-3`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] text-gray-400 font-mono">{complaint.id?.substring(0, 12)}…</p>
            <p className="text-sm font-bold text-gray-800 mt-0.5 truncate">{complaint.category}</p>
          </div>
          <span className={`flex-shrink-0 text-[10px] font-bold border rounded-full px-2 py-0.5 ${cfg.badge}`}>{complaint.ward}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{complaint.dateSubmitted}</span>
          {complaint.photo && <ImageIcon size={12} className="text-teal-500" />}
        </div>

        {columnStatus === 'Received' && (
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Assign To</p>
            <select
              onChange={(e) => handleAssignEmployee(complaint.originalId, e.target.value)}
              value={complaint.assignedEmployee ? complaint.assignedEmployee._id : ""}
              className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-teal-300 focus:ring-1 focus:ring-teal-100 text-gray-700 bg-gray-50"
            >
              <option value="">+ Assign employee</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>{emp.name} — {emp.role}</option>
              ))}
            </select>
          </div>
        )}

        {complaint.assignedEmployee && columnStatus !== 'Received' && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #1f9e9a, #22c55e)' }}>
              {complaint.assignedEmployee.name?.charAt(0)}
            </div>
            <span className="text-xs font-semibold text-gray-700">{complaint.assignedEmployee.name}</span>
          </div>
        )}

        <button
          onClick={() => handleViewComplaint(complaint)}
          className={`text-xs font-bold hover:underline ${cfg.link}`}
        >
          View details →
        </button>
      </div>
    )
  }

  const KanbanColumn = ({ title, icon: Icon, complaints: items, status, accentClass }) => {
    const cfg = statusConfig[status] || {}
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className={`px-5 py-4 border-b ${accentClass}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon size={16} className="text-white" />
              <h3 className="text-sm font-bold text-white">{title}</h3>
            </div>
            <span className="bg-white/30 text-white text-xs font-bold rounded-full px-2.5 py-0.5 min-w-6 text-center">{items.length}</span>
          </div>
        </div>
        <div className="p-4 space-y-3 max-h-[520px] overflow-y-auto">
          {items.length > 0 ? (
            items.map(c => <KanbanCard key={c.id} complaint={c} columnStatus={status} />)
          ) : (
            <div className="text-center py-10 text-gray-400">
              <p className="text-sm font-medium">No {title.toLowerCase()} feedback</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-gray-400 font-medium mb-0.5">Main › Reports & Feedback</p>
        <h1 className="text-xl font-black text-gray-800">Report & Feedback Management</h1>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
        {[
          { label: 'New Feedback', value: String(metrics.new).padStart(2, '0'), sub: 'Status: Received', icon: AlertCircle, color: 'from-rose-500 to-rose-700' },
          { label: 'Pending Feedback', value: String(metrics.pending).padStart(2, '0'), sub: 'In Progress or Unassigned', icon: Clock, color: 'from-amber-500 to-amber-700' },
          { label: 'Resolved Feedback', value: metrics.resolved, sub: 'Total Resolved', icon: CheckCircle2, color: 'from-emerald-500 to-emerald-700' },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm flex-shrink-0`}>
              <Icon size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{label}</p>
              <p className="text-3xl font-black text-gray-800">{value}</p>
              <p className="text-[10px] text-gray-400">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Complaints Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3 flex-wrap">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Feedback Table</h2>

          <div className="ml-auto flex items-center gap-2">
            {/* Search */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 w-56 border border-transparent focus-within:border-teal-300/50">
              <Search size={14} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search by ID or name…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 outline-none text-xs bg-transparent text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <button
                onClick={() => { setShowFilterMenu(!showFilterMenu); setShowDownloadMenu(false) }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${statusFilter !== 'All' ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                  }`}
              >
                <Filter size={13} />
                {statusFilter !== 'All' ? statusFilter : 'Filter'}
              </button>
              {showFilterMenu && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-1 overflow-hidden">
                  {['All', 'Received', 'In Progress', 'Resolved'].map(status => (
                    <button key={status} onClick={() => { setStatusFilter(status); setShowFilterMenu(false) }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors ${statusFilter === status ? 'bg-teal-50 text-teal-700' : 'text-gray-700 hover:bg-gray-50'
                        }`}>
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Download */}
            <div className="relative">
              <button
                onClick={() => { setShowDownloadMenu(!showDownloadMenu); setShowFilterMenu(false) }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white btn-lift"
                style={{ background: 'linear-gradient(135deg, #1f9e9a, #16847f)' }}
              >
                <Download size={13} /> Export
              </button>
              {showDownloadMenu && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-1 overflow-hidden">
                  <button onClick={handleDownloadCSV} className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-teal-50 hover:text-teal-700 flex items-center gap-2">
                    <Table size={12} /> Download CSV
                  </button>
                  <button onClick={handleDownloadPDF} className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-teal-50 hover:text-teal-700 flex items-center gap-2">
                    <FileText size={12} /> Download PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {['Feedback ID', 'Date', 'Name', 'Category', 'Ward', 'Photo', 'Status', 'Assigned', 'View'].map(h => (
                  <th key={h} className="px-4 py-3.5 text-left text-white text-[10px] font-bold uppercase tracking-wider bg-[#1f9e9a]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="9" className="px-4 py-12 text-center text-gray-400 text-sm">Loading feedback…</td></tr>
              ) : filteredComplaints.length === 0 ? (
                <tr><td colSpan="9" className="px-4 py-12 text-center text-gray-400 text-sm">No feedback found.</td></tr>
              ) : (
                filteredComplaints.map((complaint, idx) => (
                  <tr key={idx} className={`transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-teal-50/30`}>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-mono font-bold text-teal-600">{complaint.id}</span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-500">{complaint.dateSubmitted}</td>
                    <td className="px-4 py-3.5 text-xs font-semibold text-gray-800">{complaint.name}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-600">{complaint.category}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{complaint.ward}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {complaint.photo
                        ? <ImageIcon size={14} className="text-teal-500 mx-auto" />
                        : <span className="text-gray-300">—</span>
                      }
                    </td>
                    <td className="px-4 py-3.5">
                      {(() => {
                        const cfg = statusConfig[complaint.status] || {}
                        return (
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${cfg.badge}`}>
                            {complaint.status}
                          </span>
                        )
                      })()}
                    </td>
                    <td className="px-4 py-3.5">
                      {complaint.assignedEmployee ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #1f9e9a, #22c55e)' }}>
                            {complaint.assignedEmployee.name?.charAt(0)}
                          </div>
                          <span className="text-xs text-gray-700 font-medium truncate max-w-20">{complaint.assignedEmployee.name}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-red-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <button onClick={() => handleViewComplaint(complaint)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Update Status — Kanban Board</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <KanbanColumn
            title="Received"
            icon={AlertCircle}
            complaints={receivedComplaints}
            status="Received"
            accentClass="bg-gradient-to-r from-red-500 to-rose-600"
          />
          <KanbanColumn
            title="In Progress"
            icon={Clock}
            complaints={inProgressComplaints}
            status="In Progress"
            accentClass="bg-gradient-to-r from-amber-500 to-orange-500"
          />
          <KanbanColumn
            title="Resolved"
            icon={CheckCircle2}
            complaints={resolvedComplaints}
            status="Resolved"
            accentClass="bg-gradient-to-r from-emerald-500 to-teal-600"
          />
        </div>
      </div>
      <ViewComplaintModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        complaint={selectedComplaint}
        onStatusUpdate={handleStatusUpdate}
        employees={employees}
      />
    </div>
  )
}
