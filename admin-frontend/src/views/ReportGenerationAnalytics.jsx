"use client";

import { useState, useRef, useEffect, useMemo } from 'react'
import { FileText, Download, BarChart3, TrendingUp, Users, Eye, ChevronDown, FileSpreadsheet, Trash2, Calendar } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import GenerationOfReportModal from '../components/GenerationOfReportModal'
import ViewReportModal from '../components/ViewReportModal'
import { generatePDF, generateExcel } from '../utils/reportGenerator'
import { toast } from 'react-toastify'

export default function ReportGenerationAnalytics() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)

  // Initialize from localStorage
  const [generatedReports, setGeneratedReports] = useState(() => {
    try {
      const saved = localStorage.getItem('generatedReports')
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      console.error("Failed to parse reports:", e)
      return []
    }
  })

  const [viewReport, setViewReport] = useState(null)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const resultsRef = useRef(null)

  // Save to localStorage whenever reports change
  useEffect(() => {
    localStorage.setItem('generatedReports', JSON.stringify(generatedReports))
  }, [generatedReports])



  const reports = [
    { id: 1, title: 'Waste Collection Summaries', description: 'Generate detailed reports on waste collection activities and trends', icon: TrendingUp, color: 'bg-blue-50 dark:bg-blue-900/20', iconColor: 'text-blue-600 dark:text-blue-400', borderColor: 'border-blue-100 dark:border-blue-800/50' },
    { id: 2, title: 'Complaint and Grievance Resolution Times', description: 'Analyze complaint handling and resolution timelines', icon: BarChart3, color: 'bg-green-50 dark:bg-green-900/20', iconColor: 'text-green-600 dark:text-green-400', borderColor: 'border-green-100 dark:border-green-800/50' },
    { id: 3, title: 'Segregation Compliance Percentage', description: 'View segregation compliance percentages across wards', icon: FileText, color: 'bg-purple-50 dark:bg-purple-900/20', iconColor: 'text-purple-600 dark:text-purple-400', borderColor: 'border-purple-100 dark:border-purple-800/50' },
    { id: 4, title: 'Employee Attendance Summaries', description: 'Generate employee attendance reports and statistics', icon: Users, color: 'bg-red-50 dark:bg-red-900/20', iconColor: 'text-red-600 dark:text-red-400', borderColor: 'border-red-100 dark:border-red-800/50' },
    { id: 5, title: 'Year-on-Year comparison charts', description: 'Compare performance metrics across different years', icon: BarChart3, color: 'bg-indigo-50 dark:bg-indigo-900/20', iconColor: 'text-indigo-600 dark:text-indigo-400', borderColor: 'border-indigo-100 dark:border-indigo-800/50' }
  ]

  const handleGenerateReport = (report) => {
    try {
      setSelectedReport(report)
      setIsModalOpen(true)
    } catch (error) {
      console.error("Error setting report:", error)
      toast.error("Could not open report generator")
    }
  }

  const [reportToDelete, setReportToDelete] = useState(null)

  const confirmDelete = () => {
    if (reportToDelete) {
      setGeneratedReports(prev => prev.filter(r => r.id !== reportToDelete))
      setReportToDelete(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div>
        <p className="text-xs text-gray-400 font-medium mb-0.5">Analytics & Settings › Report Generation & Analytics</p>
        <h1 className="text-xl font-black text-gray-800">Report Generation & Analytics</h1>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-8">
        <div>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">On-Demand Report Generation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => {
              const Icon = report.icon
              return (
                <div key={report.id} className={`${report.color} border ${report.borderColor} rounded-2xl p-6 text-center space-y-4 hover:shadow-md transition-all group`}>
                  <div className="flex justify-center">
                    <div className={`p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm ${report.iconColor} group-hover:scale-110 transition-transform`}>
                      <Icon size={32} />
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-800">{report.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{report.description}</p>
                  <button onClick={() => handleGenerateReport(report)} className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-xs hover:bg-teal-600 hover:text-white hover:border-teal-600 transition-all shadow-sm">
                    Generate New Report
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {generatedReports.length > 0 && (
          <div ref={resultsRef} className="pt-8 border-t border-gray-50">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Previously Generated Reports</h2>
            <div className="overflow-hidden border border-gray-100 rounded-2xl shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Report Details</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                  {generatedReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileText size={18} /></div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{report.title}</p>
                            <p className="text-[10px] text-gray-400">Generated: {report.generatedAt}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg uppercase tracking-wide border border-emerald-100">
                          {report.status || 'Success'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setViewReport(report)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="View"><Eye size={16} /></button>

                          <div className="relative">
                            <button onClick={() => setActiveDropdown(activeDropdown === report.id ? null : report.id)} className="p-2 text-gray-400 hover:text-teal-600 transition-colors" title="Download"><Download size={16} /></button>
                            {activeDropdown === report.id && (
                              <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl z-20 border border-gray-100 p-1">
                                <button onClick={() => { generatePDF(report); setActiveDropdown(null); }} className="w-full text-left px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2 tracking-tight"><FileText size={14} className="text-red-500" /> Save as PDF</button>
                                <button onClick={() => { generateExcel(report); setActiveDropdown(null); }} className="w-full text-left px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2 tracking-tight"><FileSpreadsheet size={14} className="text-green-600" /> Save as Excel</button>
                              </div>
                            )}
                          </div>

                          <button onClick={() => setReportToDelete(report.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Delete"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isModalOpen && (
          <GenerationOfReportModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            reportType={selectedReport?.title}
            onReportGenerated={(data) => {
              if (!selectedReport) return
              const newReport = {
                id: Date.now(),
                title: selectedReport.title,
                generatedAt: new Date().toLocaleString(),
                status: 'Success',
                data: data
              }
              const updated = [newReport, ...generatedReports]
              setGeneratedReports(updated)
              localStorage.setItem('generatedReports', JSON.stringify(updated))
              setIsModalOpen(false)
              setViewReport(newReport)
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewReport && (
          <ViewReportModal 
            isOpen={!!viewReport} 
            onClose={() => setViewReport(null)} 
            report={viewReport} 
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {reportToDelete && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 modal-overlay">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReportToDelete(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm relative z-10"
            >
              <div className="p-3 bg-red-50 text-red-600 w-fit rounded-xl mb-4"><Trash2 size={24} /></div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Report?</h3>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">This report will be permanently removed from your history. This action cannot be reversed.</p>
              <div className="flex gap-3">
                <button onClick={() => setReportToDelete(null)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition">Cancel</button>
                <button onClick={confirmDelete} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition">Delete Report</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
