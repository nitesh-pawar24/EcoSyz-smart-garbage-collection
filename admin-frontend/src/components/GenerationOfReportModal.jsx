"use client";

import { useState, useEffect, useMemo } from 'react'
import { X, Calendar, FileText, Filter, Eye, FileSpreadsheet, MapPin, Tag, CheckCircle, CheckCircle2, Users, BarChart3 } from 'lucide-react'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import api from '../api/axios'
import { generatePDF, generateExcel } from '../utils/reportGenerator'

const REPORT_CONFIGS = {
  'Waste Collection Summaries': {
    icon: BarChart3,
    color: 'from-blue-600 to-blue-700',
    fields: ['dateRange', 'ward'],
    description: 'Detailed analysis of waste volumes across different wards and time periods.'
  },
  'Complaint and Grievance Resolution Times': {
    icon: CheckCircle,
    color: 'from-emerald-600 to-emerald-700',
    fields: ['dateRange', 'ward', 'category', 'status'],
    description: 'Track resolution efficiency and category-wise complaint distribution.'
  },
  'Segregation Compliance Percentage': {
    icon: Filter,
    color: 'from-purple-600 to-purple-700',
    fields: ['dateRange', 'ward'],
    description: 'Monitor how effectively households are segregating waste.'
  },
  'Employee Attendance Summaries': {
    icon: Users,
    color: 'from-orange-600 to-orange-700',
    fields: ['dateRange', 'ward', 'role', 'employee'],
    description: 'Detailed attendance tracking for field staff and drivers.'
  },
  'Year-on-Year comparison charts': {
    icon: BarChart3,
    color: 'from-indigo-600 to-indigo-700',
    fields: ['dateRange', 'subType'],
    description: 'Compare current performance against historical data points.'
  }
}

const DEFAULT_FILTERS = {
  fromDate: '',
  toDate: '',
  ward: 'All',
  category: 'All',
  status: 'All',
  role: 'All',
  employeeId: 'All',
  outputFormat: 'screen',
  subType: 'waste'
}

export default function GenerationOfReportModal({ isOpen, onClose, reportType, onReportGenerated }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [loading, setLoading] = useState(false)
  const [wards, setWards] = useState([])
  const [employees, setEmployees] = useState([])

  const config = useMemo(() => {
    if (!reportType) return {
      icon: FileText,
      color: 'from-teal-600 to-teal-700',
      fields: ['dateRange', 'ward'],
      description: 'Generate customized analytics and data reports.'
    }
    return REPORT_CONFIGS[reportType] || {
      icon: FileText,
      color: 'from-teal-600 to-teal-700',
      fields: ['dateRange', 'ward'],
      description: 'Generate customized analytics and data reports.'
    }
  }, [reportType])

  useEffect(() => {
    if (isOpen) {
      fetchWards()
      fetchEmployees()
    }
  }, [isOpen])

  const fetchWards = async () => {
    try {
      const res = await api.get('/wards')
      setWards(res.data || [])
    } catch (error) { console.error("Failed to fetch wards", error) }
  }

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees')
      setEmployees(res.data || [])
    } catch (error) { console.error("Failed to fetch employees", error) }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleGenerate = async () => {
    if (!filters.fromDate || !filters.toDate) {
      toast.error('Please select both From and To dates')
      return
    }

    setLoading(true)
    try {
      const res = await api.get('/reports/generate', {
        params: {
          type: reportType,
          from: filters.fromDate,
          to: filters.toDate,
          subType: filters.subType,
          ward: filters.ward !== 'All' ? filters.ward : undefined,
          category: filters.category !== 'All' ? filters.category : undefined,
          status: filters.status !== 'All' ? filters.status : undefined,
          role: filters.role !== 'All' ? filters.role : undefined,
          employeeId: filters.employeeId !== 'All' ? filters.employeeId : undefined,
        }
      })

      const reportData = res.data?.data || []

      const fullReportObject = {
        title: reportType || 'Analytics Report',
        generatedAt: new Date().toLocaleString(),
        data: reportData,
        period: { from: filters.fromDate, to: filters.toDate },
        appliedFilters: {
          ward: filters.ward,
          category: filters.category,
          status: filters.status,
          role: filters.role,
          employee: filters.employeeId !== 'All' ? (employees.find(e => e._id === filters.employeeId)?.name || 'Unknown') : 'All'
        }
      }

      if (filters.outputFormat === 'pdf') {
        generatePDF(fullReportObject)
        toast.success("PDF Downloaded")
      } else if (filters.outputFormat === 'excel') {
        generateExcel(fullReportObject)
        toast.success("Excel Downloaded")
      } else {
        if (onReportGenerated) {
          onReportGenerated(res.data)
        }
        toast.success("Report Generated for Screen View")
      }
      onClose()
    } catch (error) {
      console.error("Generate Error", error)
      toast.error(error.response?.data?.message || "Failed to generate report")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFilters(DEFAULT_FILTERS)
    onClose()
  }

  if (!isOpen) return null

  const inputCls = "w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm bg-gray-50/50"
  const labelCls = "block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1"
  const sectionTitleCls = "text-[11px] font-black text-gray-800 uppercase tracking-[0.1em] mb-4 flex items-center gap-2"

  const Icon = config.icon || FileText

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 modal-overlay">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-md" 
        onClick={handleCancel} 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl border border-gray-100 overflow-hidden flex flex-col pointer-events-auto relative z-10">
        
        {/* Header */}
        <div className={`px-10 py-8 flex items-center justify-between bg-gradient-to-r ${config.color} relative overflow-hidden`}>
           {/* Decorative Background Elements */}
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
           <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12 blur-xl" />

          <div className="flex items-center gap-5 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-xl border border-white/30 shadow-inner">
              <Icon size={28} className="text-white" />
            </div>
            <div>
              <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.25em] mb-1">Analytical Report</p>
              <h2 className="text-white font-black text-2xl leading-tight tracking-tight">{reportType}</h2>
            </div>
          </div>
          <button onClick={handleCancel} className="p-2.5 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-all backdrop-blur-md border border-white/20 relative z-10">
            <X size={20} />
          </button>
        </div>

        <div className="p-10 space-y-8 max-h-[65vh] overflow-y-auto custom-scrollbar">
          {/* Description Tagline */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex gap-3 items-center">
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <p className="text-xs text-gray-600 font-medium">{config.description}</p>
          </div>

          {/* Date Range Section */}
          {(config.fields || []).includes('dateRange') && (
            <div className="space-y-4">
              <h3 className={sectionTitleCls}>
                <Calendar size={14} className="text-teal-600" />
                Select Reporting Period
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={labelCls}>From Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input type="date" name="fromDate" value={filters.fromDate} onChange={handleFilterChange} className={`${inputCls} pl-10`} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>To Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input type="date" name="toDate" value={filters.toDate} onChange={handleFilterChange} className={`${inputCls} pl-10`} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Filters Section */}
          <div className="space-y-6">
             <h3 className={sectionTitleCls}>
              <Filter size={14} className="text-teal-600" />
              Refine with Filters
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Year-on-Year comparison specific */}
              {(config.fields || []).includes('subType') && (
                <div className="md:col-span-2">
                  <label className={labelCls}>Metric for Comparison</label>
                  <div className="relative">
                    <BarChart3 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <select name="subType" value={filters.subType} onChange={handleFilterChange} className={`${inputCls} pl-10`}>
                      <option value="waste">Waste Collection Volumes</option>
                      <option value="complaint">Complaint Resolution Rates</option>
                      <option value="compliance">Segregation Compliance %</option>
                      <option value="attendance">Staff Presence Stats</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Ward Filter */}
              {(config.fields || []).includes('ward') && (
                <div>
                  <label className={labelCls}>Ward Selection</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <select name="ward" value={filters.ward} onChange={handleFilterChange} className={`${inputCls} pl-10`}>
                      <option value="All">All Wards</option>
                      {wards.map(w => <option key={w._id} value={w.name}>{w.name}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* Complaint Category */}
              {(config.fields || []).includes('category') && (
                <div>
                  <label className={labelCls}>Complaint Category</label>
                  <div className="relative">
                    <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <select name="category" value={filters.category} onChange={handleFilterChange} className={`${inputCls} pl-10`}>
                      <option value="All">All Categories</option>
                      {['Waste Collection', 'Streetlight', 'Water Supply', 'Drainage', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* Status Filter */}
              {(config.fields || []).includes('status') && (
                <div>
                  <label className={labelCls}>Current Status</label>
                  <div className="relative">
                    <CheckCircle2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <select name="status" value={filters.status} onChange={handleFilterChange} className={`${inputCls} pl-10`}>
                      <option value="All">All Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Attendance Role */}
              {(config.fields || []).includes('role') && (
                <div>
                  <label className={labelCls}>Staff Role</label>
                  <div className="relative">
                    <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <select name="role" value={filters.role} onChange={handleFilterChange} className={`${inputCls} pl-10`}>
                      <option value="All">All Roles</option>
                      <option value="Driver">Driver</option>
                      <option value="Labour">Labour</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Specific Employee */}
              {(config.fields || []).includes('employee') && (
                <div>
                  <label className={labelCls}>Specific Employee</label>
                  <div className="relative">
                    <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <select name="employeeId" value={filters.employeeId} onChange={handleFilterChange} className={`${inputCls} pl-10`}>
                      <option value="All">All Employees</option>
                      {employees
                        .filter(e => filters.role === 'All' || e.role === filters.role)
                        .map(e => <option key={e._id} value={e._id}>{e.name} ({e.employeeCode})</option>)
                      }
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Output Format */}
          <div className="pt-8 border-t border-gray-100">
            <h3 className={sectionTitleCls}>
              <FileSpreadsheet size={14} className="text-teal-600" />
              Select Output Format
            </h3>
            <div className="flex bg-gray-100/50 p-2 rounded-2xl gap-3">
              {[
                { id: 'screen', label: 'Screen View', icon: Eye },
                { id: 'pdf', label: 'PDF Report', icon: FileText },
                { id: 'excel', label: 'Excel Sheet', icon: FileSpreadsheet }
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setFilters(prev => ({ ...prev, outputFormat: fmt.id }))}
                  className={`flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl text-xs font-bold transition-all ${
                    filters.outputFormat === fmt.id ? 'bg-white text-teal-700 shadow-md ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                  }`}
                >
                  <fmt.icon size={15} />
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-10 bg-gray-50/80 border-t border-gray-100 flex gap-5">
          <button onClick={handleCancel} disabled={loading}
            className="flex-1 py-4 bg-white border border-gray-200 text-gray-700 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-gray-50 transition-all shadow-sm active:scale-95">
            Discard
          </button>
          <button onClick={handleGenerate} disabled={loading}
            className={`flex-[2] py-4 bg-gradient-to-r ${config.color} text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-teal-600/20 hover:opacity-90 transition-all flex items-center justify-center gap-3 active:scale-[0.98]`}>
            {loading ? <><span className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin" /> Processing...</> : 'Generate Analytics'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
