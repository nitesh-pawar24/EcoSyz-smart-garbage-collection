"use client";

import { useRouter } from 'next/navigation'
import { ArrowRight, Users } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

export default function AttendanceCard({ total = 0, present = 0, recent = [] }) {
  const { isDark } = useTheme()
  const router = useRouter()
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0
  const absent = total - present

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm h-full">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Today's Attendance</h3>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1f9e9a] to-[#16847f] flex items-center justify-center shadow-sm">
          <Users size={14} className="text-white" />
        </div>
      </div>

      {/* Percentage hero */}
      <div className="flex items-end gap-3 mb-4">
        <p className="text-5xl font-black" style={{ background: 'linear-gradient(135deg, #1f9e9a, #22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          {percentage}%
        </p>
        <div className="mb-1.5">
          <p className="text-xs text-gray-400 font-medium">{present} Present</p>
          <p className="text-xs text-gray-400 font-medium">{absent} Absent</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden mb-5">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${percentage}%`,
            background: 'linear-gradient(90deg, #1f9e9a, #22c55e)'
          }}
        />
      </div>

      {/* Recent list */}
      <div className="space-y-2.5 mb-5">
        {recent.length > 0 ? recent.slice(0, 3).map((item, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                {item.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-700 truncate max-w-28">{item.name}</span>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors ${
              item.status === 'Present'
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20'
                : 'bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 border border-red-100 dark:border-red-500/20'
            }`}>
              {item.status}
            </span>
          </div>
        )) : (
          <p className="text-xs text-gray-400 text-center py-2">No attendance data yet.</p>
        )}
      </div>

      <button
        onClick={() => router.push('/attendance')}
        className="text-[#1f9e9a] text-xs font-semibold flex items-center gap-1.5 hover:gap-2.5 transition-all duration-200 group"
      >
        View Attendance Management
        <ArrowRight size={14} className="group-hover:text-[#22c55e] transition-colors" />
      </button>
    </div>
  )
}
