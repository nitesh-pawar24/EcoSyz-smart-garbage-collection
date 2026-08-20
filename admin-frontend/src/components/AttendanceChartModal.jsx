"use client";

import { X } from 'lucide-react'

export default function AttendanceChartModal({ isOpen, onClose, presentCount, absentCount, attendanceData }) {
  if (!isOpen) return null

  // Prepare data for charts
  const roleGroups = {}
  attendanceData.forEach(emp => {
    if (!roleGroups[emp.role]) {
      roleGroups[emp.role] = { role: emp.role, count: 0 }
    }
    if (emp.status === 'present') {
      roleGroups[emp.role].count++
    }
  })

  const roleData = Object.values(roleGroups)

  return (
    <>
      {/* Overlay */}
      <div
 className="fixed inset-0 modal-overlay bg-black bg-opacity-40 z-[9999]" 
        onClick={onClose}
      ></div>

      {/* Modal */}
 <div className="fixed inset-0 modal-overlay flex items-center justify-center z-[9999] p-4"> 
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200 sticky top-0 bg-white">
            <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">Attendance Chart</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition"
            >
              <X size={24} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-8">
            {/* Pie Chart Section */}
            <div className="mb-12">
              <h3 className="text-base font-bold text-gray-900 mb-6">Overall Attendance Distribution</h3>
              <div className="flex items-center justify-center gap-12">
                {/* SVG Pie Chart */}
                <svg width="200" height="200" viewBox="0 0 200 200" className="flex-shrink-0">
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#FCD34D"
                    strokeWidth="40"
                    strokeDasharray={`${(absentCount / attendanceData.length) * 502.65} 502.65`}
                    transform="rotate(-90 100 100)"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="40"
                    strokeDasharray={`${(presentCount / attendanceData.length) * 502.65} 502.65`}
                    strokeDashoffset={`-${(absentCount / attendanceData.length) * 502.65}`}
                    transform="rotate(-90 100 100)"
                  />
                </svg>

                {/* Legend */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-[#FCD34D] rounded"></div>
                    <span className="text-sm font-medium text-gray-700">Absent</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-[#EF4444] rounded"></div>
                    <span className="text-sm font-medium text-gray-700">Present</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bar Chart Section */}
            <div className="grid grid-cols-2 gap-8">
              {/* Bar Chart - Employee vs Days Present */}
              <div className="bg-[#E0F2F1] rounded-lg p-8 border border-[#1f9e9a]">
                <h4 className="text-sm font-bold text-gray-900 mb-6 text-center">Bar chart (employee vs days present)</h4>
                <div className="flex items-end justify-center gap-4 h-40">
                  {roleData.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-2">
                      <div
                        className="w-8 bg-gray-400 rounded"
                        style={{ height: `${(item.count / Math.max(...roleData.map(r => r.count))) * 120}px` }}
                      ></div>
                      <span className="text-xs text-gray-600 text-center whitespace-nowrap">{item.role}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pie Chart - Overall Attendance % */}
              <div className="bg-[#E0F2F1] rounded-lg p-8 border border-[#1f9e9a]">
                <h4 className="text-sm font-bold text-gray-900 mb-6 text-center">Pie chart (overall % attendance for the month)</h4>
                <div className="flex items-center justify-center">
                  <svg width="150" height="150" viewBox="0 0 150 150">
                    <circle
                      cx="75"
                      cy="75"
                      r="60"
                      fill="none"
                      stroke="#6B7280"
                      strokeWidth="30"
                      strokeDasharray={`${(absentCount / attendanceData.length) * 376.99} 376.99`}
                      transform="rotate(-90 75 75)"
                    />
                    <circle
                      cx="75"
                      cy="75"
                      r="60"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="30"
                      strokeDasharray={`${(presentCount / attendanceData.length) * 376.99} 376.99`}
                      strokeDashoffset={`-${(absentCount / attendanceData.length) * 376.99}`}
                      transform="rotate(-90 75 75)"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end mt-8">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg transition font-semibold text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
