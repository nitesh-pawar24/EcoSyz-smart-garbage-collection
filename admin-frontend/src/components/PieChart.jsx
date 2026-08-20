"use client";

import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts'
import { useTheme } from '../contexts/ThemeContext'

export default function AttendanceChart({ present = 0, absent = 0 }) {
  const { isDark } = useTheme()
  const data = [
    { name: 'Present', value: present },
    { name: 'Absent', value: absent },
  ]

  // Handle empty state to avoid ugly chart
  if (present === 0 && absent === 0) {
     data[0].value = 1; // Placeholder
     data[1].value = 0;
  }

  const COLORS = ['#FBBF24', '#EF4444']

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-6">Attendance Chart</h3>
      
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend 
            layout="vertical" 
            align="right" 
            verticalAlign="middle"
            formatter={(value, entry) => (
              <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
