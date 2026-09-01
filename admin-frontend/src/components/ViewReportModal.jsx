"use client";

import { useRef, useEffect } from 'react'
import { X, Download, FileSpreadsheet, ImageIcon, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { generatePDF, generateExcel } from '../utils/reportGenerator'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import html2canvas from 'html2canvas'
import { toast } from 'react-toastify'

export default function ViewReportModal({ isOpen, onClose, report }) {
    const chartRef = useRef(null)
    const modalContentRef = useRef(null)

    useEffect(() => {
        if (isOpen && modalContentRef.current) {
            modalContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [isOpen, report]);

    if (!isOpen || !report) return null

    const handleDownloadPDF = async () => {
        let chartImage = null
        if (chartRef.current) {
            try {
                await new Promise(resolve => setTimeout(resolve, 500)) 
                const canvas = await html2canvas(chartRef.current, {
                    backgroundColor: '#ffffff',
                    useCORS: true,
                    scale: 2,
                })
                chartImage = canvas.toDataURL('image/png')
            } catch (error) {
                console.error("Error capturing chart", error)
            }
        }
        generatePDF({ ...report, chartImage })
    }

    const handleDownloadImage = async () => {
        if (!chartRef.current) return
        try {
            await new Promise(resolve => setTimeout(resolve, 500))
            const canvas = await html2canvas(chartRef.current, {
                backgroundColor: '#ffffff',
                useCORS: true,
                scale: 2,
            })
            const image = canvas.toDataURL('image/png')
            const link = document.createElement('a')
            link.href = image
            const fileName = (report.title || 'Report').replace(/\s+/g, '_')
            link.download = `${fileName}_Chart_${Date.now()}.png`
            link.click()
        } catch (error) {
            console.error("Error downloading chart image", error)
        }
    }

    const getTableContent = () => {
        try {
            if (!report || !report.data) return <p className="text-gray-500 italic">No data available for this report.</p>

            // Extract payload safely
            const payload = report.data?.data !== undefined ? report.data.data : report.data
            if (!payload) return <p className="text-gray-500 italic">Report payload is empty.</p>

            const data = payload
            const title = report.title || ""
            
            // Normalize type for comparison (handle & vs and)
            const type = title ? title.replace(/ and /g, ' & ') : ""

            // Case 1: Waste Collection
            if (type === 'Waste Collection Summaries') {
                const rows = Array.isArray(data) ? data : (data?.data || [])
                return (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="border p-2 text-left text-xs font-bold uppercase text-gray-500">Ward</th>
                                    <th className="border p-2 text-right text-xs font-bold uppercase text-gray-500">Organic (kg)</th>
                                    <th className="border p-2 text-right text-xs font-bold uppercase text-gray-500">Recyclable (kg)</th>
                                    <th className="border p-2 text-right text-xs font-bold uppercase text-gray-500">General (kg)</th>
                                    <th className="border p-2 text-right text-xs font-bold uppercase text-gray-500">Total (kg)</th>
                                    <th className="border p-2 text-center text-xs font-bold uppercase text-gray-500">Collections</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, i) => (
                                    <tr key={row?._id || i} className="hover:bg-gray-50 transition-colors">
                                        <td className="border p-2 text-sm font-medium text-gray-700">{row?._id || 'N/A'}</td>
                                        <td className="border p-2 text-right text-sm text-gray-600">{typeof row?.totalOrganic === 'number' ? row.totalOrganic.toFixed(2) : (row?.totalOrganic ?? 0)}</td>
                                        <td className="border p-2 text-right text-sm text-gray-600">{typeof row?.totalRecyclable === 'number' ? row.totalRecyclable.toFixed(2) : (row?.totalRecyclable ?? 0)}</td>
                                        <td className="border p-2 text-right text-sm text-gray-600">{typeof row?.totalGeneral === 'number' ? row.totalGeneral.toFixed(2) : (row?.totalGeneral ?? 0)}</td>
                                        <td className="border p-2 text-right text-sm font-bold text-teal-600">{typeof row?.totalWaste === 'number' ? row.totalWaste.toFixed(2) : (row?.totalWaste ?? 0)}</td>
                                        <td className="border p-2 text-center text-sm text-gray-600">{row?.collectionCount ?? 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            }

            if (type === 'Complaint & Grievance Resolution Times' || type === 'Feedback & Grievance Resolution Times') {
                const stats = data?.statusBreakdown || []
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-teal-50 border border-teal-100 p-5 rounded-2xl">
                                <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-1">Avg Resolution Time</h3>
                                <p className="text-3xl font-black text-teal-600">
                                    {typeof data?.avgResolutionTimeHours === 'number' ? data.avgResolutionTimeHours.toFixed(1) : (data?.avgResolutionTimeHours ?? 0)} 
                                    <span className="text-sm font-bold opacity-70 ml-1">Hours</span>
                                </p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                            <table className="w-full border-collapse">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-3 text-left text-xs font-bold uppercase text-gray-500">Status</th>
                                        <th className="p-3 text-right text-xs font-bold uppercase text-gray-500">Count</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {stats.map((row, i) => (
                                        <tr key={row?._id || i} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-3 text-sm font-medium text-gray-700">{row?._id || 'Unknown'}</td>
                                            <td className="p-3 text-right text-sm font-bold text-gray-900">{row?.count ?? 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            }

            if (type === 'Segregation Compliance Percentage') {
                const list = Array.isArray(data) ? data : (data?.data || [])
                return (
                    <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-3 text-left text-xs font-bold uppercase text-gray-500">Ward</th>
                                    <th className="p-3 text-right text-xs font-bold uppercase text-gray-500">Compliance (%)</th>
                                    <th className="p-3 text-right text-xs font-bold uppercase text-gray-500">Total Collections</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {list.map((row, i) => (
                                    <tr key={row?.ward || i} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-3 text-sm font-medium text-gray-700">{row?.ward || 'N/A'}</td>
                                        <td className="p-3 text-right text-sm font-black text-teal-600">
                                            {typeof row?.compliancePercentage === 'number' ? row.compliancePercentage.toFixed(2) : (row?.compliancePercentage ?? 0)}%
                                        </td>
                                        <td className="p-3 text-right text-sm text-gray-600">{row?.totalCollections ?? 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            }

            if (type === 'Employee Attendance Summaries') {
                const rows = Array.isArray(data) ? data : (data?.data || [])

                // Detect shape: new per-employee shape has 'employeeCode' field
                const isPerEmployee = rows.length > 0 && rows[0].employeeCode !== undefined

                if (isPerEmployee) {
                    // Summary KPIs
                    const totalPresent = rows.reduce((s, r) => s + (r.presentDays || 0), 0)
                    const totalAbsent = rows.reduce((s, r) => s + (r.absentDays || 0), 0)
                    const totalDays = rows.reduce((s, r) => s + (r.totalDays || 0), 0)
                    const avgPct = rows.length ? (rows.reduce((s, r) => s + (r.attendancePercentage || 0), 0) / rows.length).toFixed(1) : 0

                    return (
                        <div className="space-y-6">
                            {/* KPI Summary */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {[
                                    { label: 'Total Employees', value: rows.length, color: 'bg-blue-50 text-blue-700 border-blue-100' },
                                    { label: 'Total Present Days', value: totalPresent, color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
                                    { label: 'Total Absent Days', value: totalAbsent, color: 'bg-red-50 text-red-700 border-red-100' },
                                    { label: 'Avg Attendance %', value: `${avgPct}%`, color: 'bg-amber-50 text-amber-700 border-amber-100' },
                                ].map(kpi => (
                                    <div key={kpi.label} className={`${kpi.color} border rounded-xl p-4`}>
                                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1">{kpi.label}</p>
                                        <p className="text-2xl font-black">{kpi.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Per-employee table */}
                            <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
                                <table className="w-full border-collapse min-w-[700px]">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            {['Code', 'Name', 'Role', 'Ward(s)', 'Present', 'Absent', 'Total Days', 'Attendance %'].map(h => (
                                                <th key={h} className="p-3 text-left text-[10px] font-bold uppercase text-gray-500 tracking-wider whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {rows.map((row, i) => {
                                            const pct = row.attendancePercentage ?? 0
                                            const pctColor = pct >= 90 ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                : pct >= 70 ? 'bg-amber-50 text-amber-700 border-amber-100'
                                                : 'bg-red-50 text-red-700 border-red-100'
                                            return (
                                                <tr key={String(row.employeeId || i)} className="hover:bg-teal-50/30 transition-colors">
                                                    <td className="p-3">
                                                        <span className="text-[10px] font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{row.employeeCode || '—'}</span>
                                                    </td>
                                                    <td className="p-3 text-sm font-semibold text-gray-800 whitespace-nowrap">{row.name || '—'}</td>
                                                    <td className="p-3 text-xs text-gray-500">{row.role || '—'}</td>
                                                    <td className="p-3 text-xs text-gray-500">{Array.isArray(row.wards) && row.wards.length ? row.wards.join(', ') : '—'}</td>
                                                    <td className="p-3 text-sm font-bold text-emerald-600">{row.presentDays ?? 0}</td>
                                                    <td className="p-3 text-sm font-bold text-red-500">{row.absentDays ?? 0}</td>
                                                    <td className="p-3 text-sm text-gray-600">{row.totalDays ?? 0}</td>
                                                    <td className="p-3">
                                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border ${pctColor}`}>{pct}%</span>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                        {rows.length === 0 && (
                                            <tr><td colSpan="8" className="p-6 text-center text-gray-400 text-xs italic">No attendance data found for this period.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                }

                // Legacy shape fallback: {_id: bool, count} aggregation
                return (
                    <div className="overflow-hidden rounded-xl border border-gray-100 shadow-sm">
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-3 text-left text-xs font-bold uppercase text-gray-500">Attendance Status</th>
                                    <th className="p-3 text-right text-xs font-bold uppercase text-gray-500">Total Count</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {rows.map((row, i) => (
                                    <tr key={String(row?._id ?? i)} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-3 text-sm">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${row?._id ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                                {row?._id ? 'Present' : 'Absent'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right text-sm font-bold text-gray-900">{row?.count ?? 0}</td>
                                    </tr>
                                ))}
                                {rows.length === 0 && (
                                    <tr><td colSpan="2" className="p-6 text-center text-gray-400 text-xs italic">No attendance data found for this period.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )
            }

            if (type === 'Year-on-Year comparison charts') {
                const subType = data?.subType || 'waste'
                const stats = data?.stats || []

                let dataKey = "totalWaste"
                let label = "Total Waste (kg)"
                let color = "#0d9488" 

                if (subType === 'complaint') {
                    dataKey = "totalComplaints"
                    label = "Total Complaints"
                    color = "#ef4444" 
                } else if (subType === 'attendance') {
                    dataKey = "totalPresent"
                    label = "Total Present Days"
                    color = "#f59e0b" 
                } else if (subType === 'compliance') {
                    dataKey = "avgCompliance"
                    label = "Avg Compliance %"
                    color = "#8b5cf6" 
                }

                return (
                    <div className="space-y-8">
                        <div
                            ref={chartRef}
                            className="h-72 w-full rounded-2xl p-6 bg-white border border-gray-100 shadow-inner"
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={stats}
                                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey={dataKey} name={label} fill={color} radius={[6, 6, 0, 0]} isAnimationActive={false} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="overflow-hidden rounded-xl border border-gray-100 shadow-sm">
                            <table className="w-full border-collapse">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-3 text-left text-xs font-bold uppercase text-gray-500">Year</th>
                                        <th className="p-3 text-right text-xs font-bold uppercase text-gray-500">{label}</th>
                                        {subType === 'waste' && <th className="p-3 text-right text-xs font-bold uppercase text-gray-500">Avg Daily (kg)</th>}
                                        {subType === 'complaint' && <th className="p-3 text-right text-xs font-bold uppercase text-gray-500">Resolved</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {stats.map((row, i) => (
                                        <tr key={row?.year || i} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-3 text-sm font-black text-gray-700">{row?.year || 'N/A'}</td>
                                            <td className="p-3 text-right text-sm font-bold" style={{ color: color }}>
                                                {typeof row?.[dataKey] === 'number' && subType === 'compliance'
                                                    ? row[dataKey].toFixed(2) + '%'
                                                    : (row?.[dataKey] ?? 0)}
                                            </td>
                                            {subType === 'waste' && (
                                                <td className="p-3 text-right text-sm text-gray-600 font-medium">{typeof row?.avgDailyWaste === 'number' ? row.avgDailyWaste.toFixed(2) : (row?.avgDailyWaste ?? 0)}</td>
                                            )}
                                            {subType === 'complaint' && (
                                                <td className="p-3 text-right text-sm text-emerald-600 font-bold">{row?.resolvedCount ?? 0}</td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            }

            return <p className="text-gray-500 italic p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">Preview not available for this report type.</p>
        } catch (err) {
            console.error("Critical rendering error in ViewReportModal:", err)
            return (
                <div className="p-8 bg-red-50 border-2 border-red-100 rounded-[2rem] flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle size={32} />
                    </div>
                    <h3 className="text-lg font-black text-red-800 uppercase tracking-tight">Display Error</h3>
                    <p className="text-sm text-red-600 mt-2 font-medium max-w-sm">We encountered a problem while rendering the report preview. You can still try downloading the PDF/Excel version.</p>
                    <div className="mt-6 p-4 bg-white/50 rounded-xl text-[10px] font-mono text-red-500 break-all max-w-full">
                        Error: {err.message}
                    </div>
                </div>
            )
        }
    }

    return (
        <div className="fixed inset-0 modal-overlay z-[10002] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md"> 
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
                onClick={onClose}
            />
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                ref={modalContentRef} 
                className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-white/20 relative z-10">
                
                {/* Header */}
                <div className="px-10 py-8 border-b border-gray-50 flex items-center justify-between bg-white relative">
                    <div>
                        <p className="text-[10px] font-black text-teal-600 uppercase tracking-[0.2em] mb-1">Generated Analytics Report</p>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">{report.title}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{report.generatedAt}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-2xl transition-all border border-slate-100"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-10 overflow-y-auto custom-scrollbar flex-1">
                    {getTableContent()}
                </div>

                {/* Footer Actions */}
                <div className="px-10 py-8 bg-slate-50/80 border-t border-gray-100 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex gap-3">
                         {report.title === 'Year-on-Year comparison charts' && (
                            <button
                                onClick={handleDownloadImage}
                                className="flex items-center gap-2.5 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-xs hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                            >
                                <ImageIcon size={16} className="text-purple-500" />
                                Save Chart
                            </button>
                        )}
                        <button
                            onClick={handleDownloadPDF}
                            className="flex items-center gap-2.5 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-xs hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                        >
                            <Download size={16} className="text-rose-500" />
                            Download PDF
                        </button>
                        <button
                            onClick={() => generateExcel(report)}
                            className="flex items-center gap-2.5 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-xs hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                        >
                            <FileSpreadsheet size={16} className="text-emerald-500" />
                            Export Excel
                        </button>
                    </div>
                    
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95"
                    >
                        Dismiss
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
