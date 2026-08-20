"use client";

import { useState, useEffect } from 'react'
import api from '../api/axios'
import { ChevronDown } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

export default function WasteStats() {
  const { isDark } = useTheme()
  const [filterDay, setFilterDay] = useState('All')
  const [filterWard, setFilterWard] = useState('')
  const [wards, setWards] = useState([])
  const [showDayDropdown, setShowDayDropdown] = useState(false)
  const [showWardDropdown, setShowWardDropdown] = useState(false)

  const days = ['All', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const [stats, setStats] = useState({
    weeklyTotal: 0,
    monthlyTotal: 0,
    lastMonthTotal: 0,
    weeklyData: [],
    typeBreakdown: [],
    recentCollections: []
  })

  const COLORS = ['#1f9e9a', '#FBBF24', '#EF4444', '#8B5CF6']

  useEffect(() => {
    fetchStats()
    fetchWards()
    const interval = setInterval(fetchStats, 10000) // Poll every 10s
    return () => clearInterval(interval)
  }, [])

  const fetchWards = async () => {
    try {
      const res = await api.get('/wards')
      setWards(res.data)
      if (res.data.length > 0 && !filterWard) {
        setFilterWard(res.data[0].name)
      }
    } catch (error) {
      console.error("Failed to fetch wards", error)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await api.get('/waste-data/stats')
      setStats(res.data)
    } catch (error) {
      console.error("Failed to fetch waste stats", error)
    }
  }

  // Use recentCollections for the table, formatted
  const tableData = stats.recentCollections.map(item => ({
    day: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
    ward: item.ward,
    volume: `${item.total}kg`
  }))

  // Filter table data based on selected filters
  const filteredData = tableData.filter(item => {
    const dayMatch = filterDay === 'All' || item.day === filterDay
    const wardMatch = item.ward === filterWard
    return dayMatch && wardMatch
  })

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Weekly Collection */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Weekly collection</h3>
        <p className="text-4xl font-bold text-gray-900 mb-1">{stats.weeklyTotal}</p>
        <p className="text-xs text-gray-500 mb-6">kg collected this week</p>
        <div className="h-40 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#f0f0f0'} />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#9ca3af' }}
              />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6' }}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: isDark ? '1px solid rgba(255,255,255,0.08)' : 'none', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  background: isDark ? '#1e293b' : '#ffffff',
                  color: isDark ? '#f1f5f9' : '#1f2937'
                }}
              />
              <Bar dataKey="total" fill="url(#tealGradient)" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Collection */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Monthly collection</h3>
        <p className="text-4xl font-bold text-gray-900 mb-1">{stats.monthlyTotal}</p>
        <p className="text-xs text-gray-500 mb-6">kg collected this month<br />vs last month {stats.lastMonthTotal} kg</p>
        <div className="h-40 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stats.typeBreakdown}
                innerRadius={35}
                outerRadius={55}
                paddingAngle={5}
                dataKey="value"
              >
                {stats.typeBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend 
                verticalAlign="bottom" 
                align="center"
                iconSize={8}
                formatter={(value) => <span className="text-[10px] text-gray-500 font-medium">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Collection Summary with Filters */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Waste collection summary</h3>
          
          {/* Filter Buttons */}
          <div className="flex gap-2">
            {/* Day Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDayDropdown(!showDayDropdown)}
                className="px-3 py-2 bg-gray-100 dark:bg-slate-700 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600 transition flex items-center gap-1 border border-gray-200 dark:border-white/5"
              >
                {filterDay}
                <ChevronDown size={14} className={`transition-transform ${showDayDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Day Dropdown Menu */}
              {showDayDropdown && (
                <div className="absolute top-full right-0 mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-lg shadow-lg z-10 min-w-32 py-1">
                  {days.map((day) => (
                    <button
                      key={day}
                      onClick={() => {
                        setFilterDay(day)
                        setShowDayDropdown(false)
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors ${
                        filterDay === day
                          ? 'bg-gradient-to-r from-[#1f9e9a] to-[#16847f] text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-700 dark:hover:text-teal-400'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Ward Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowWardDropdown(!showWardDropdown)}
                className="px-3 py-2 bg-gray-100 dark:bg-slate-700 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600 transition flex items-center gap-1 border border-gray-200 dark:border-white/5"
              >
                {filterWard}
                <ChevronDown size={14} className={`transition-transform ${showWardDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Ward Dropdown Menu */}
              {showWardDropdown && (
                <div className="absolute top-full right-0 mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-lg shadow-lg z-10 min-w-32 py-1">
                  {wards.map((ward) => (
                    <button
                      key={ward._id}
                      onClick={() => {
                        setFilterWard(ward.name)
                        setShowWardDropdown(false)
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors ${
                        filterWard === ward.name
                          ? 'bg-gradient-to-r from-[#1f9e9a] to-[#16847f] text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-700 dark:hover:text-teal-400'
                      }`}
                    >
                      {ward.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="space-y-2 text-xs">
          <div className="grid grid-cols-3 gap-4 font-semibold text-gray-700 pb-2 border-b border-gray-200">
            <span>Day</span>
            <span>Ward</span>
            <span>Volume(kg)</span>
          </div>
          {filteredData.length > 0 ? (
            filteredData.map((item, idx) => (
              <div key={idx} className="grid grid-cols-3 gap-4 text-gray-700">
                <span>{item.day}</span>
                <span>{item.ward}</span>
                <span>{item.volume}</span>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              No data available for selected filters
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
