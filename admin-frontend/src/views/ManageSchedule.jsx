"use client";

import { useState, useEffect } from 'react'
import { 
  Plus, Trash2, Edit2, Loader2, X, Calendar, 
  CheckCircle2, XCircle, Clock, ToggleLeft, ToggleRight,
  Filter, RefreshCcw, MapPin
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api/axios'
import { toast } from 'react-toastify'

const CONTENT_TYPE = 'schedule'
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const COLOR_OPTIONS = [
  { color: 'from-blue-500 to-cyan-400', bg: 'bg-blue-50 border-blue-200' },
  { color: 'from-green-500 to-emerald-400', bg: 'bg-green-50 border-green-200' },
  { color: 'from-purple-500 to-violet-400', bg: 'bg-purple-50 border-purple-200' },
  { color: 'from-amber-500 to-orange-400', bg: 'bg-amber-50 border-amber-200' },
  { color: 'from-rose-500 to-pink-400', bg: 'bg-rose-50 border-rose-200' },
]

const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Confirmed: 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
}

const blankEntry = { ward: '', days: [], time: '', area: '', vehicle: '', color: COLOR_OPTIONS[0].color, bg: COLOR_OPTIONS[0].bg }

export default function ManageSchedule() {
  const [activeTab, setActiveTab] = useState('ward-schedule') // 'ward-schedule' or 'pickup-requests'
  const [panchayat, setPanchayat] = useState(null)
  const [entries, setEntries] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editIdx, setEditIdx] = useState(null)
  const [form, setForm] = useState(blankEntry)
  const [bookingFilter, setBookingFilter] = useState('all')
  const [wards, setWards] = useState([])
  const [allBins, setAllBins] = useState([])
  const [drivers, setDrivers] = useState([])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [contentRes, bookingsRes, profileRes, wardsRes, binsRes, driversRes] = await Promise.all([
        api.get(`/content?type=${CONTENT_TYPE}`),
        api.get('/schedule-bookings'),
        api.get('/auth/profile'),
        api.get('/wards'),
        api.get('/dustbins'),
        api.get('/employees?role=driver')
      ])
      setEntries(contentRes.data?.scheduleEntries || [])
      setBookings(bookingsRes.data || [])
      setPanchayat(profileRes.data?.panchayat || null)
      setWards(wardsRes.data || [])
      setAllBins(binsRes.data || [])
      setDrivers(driversRes.data?.filter(e => e.role?.toLowerCase().includes('driver') || e.role?.toLowerCase().includes('labour')) || [])
    } catch { 
      toast.error('Failed to load schedule data') 
    } finally { 
      setLoading(false) 
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleToggleFeature = async () => {
    if (!panchayat) return
    const newState = !panchayat.isScheduleEnabled
    try {
      await api.patch(`/panchayat/${panchayat._id}/settings`, { isScheduleEnabled: newState })
      setPanchayat({ ...panchayat, isScheduleEnabled: newState })
      toast.success(`Schedule feature ${newState ? 'enabled' : 'disabled'}`)
    } catch {
      toast.error('Failed to update toggle')
    }
  }

  // Ward Schedule Handlers
  const saveSchedule = async (updated) => {
    setSaving(true)
    try {
      await api.post('/content', { type: CONTENT_TYPE, title: 'Ward Collection Schedule', status: 'published', scheduleEntries: updated })
      toast.success('Schedule saved!')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const handleAdd = () => { setForm(blankEntry); setEditIdx(null); setShowForm(true) }
  const handleEdit = (idx) => { setForm({ ...entries[idx], days: [...(entries[idx].days || [])] }); setEditIdx(idx); setShowForm(true) }
  const toggleDay = (day) => setForm(f => ({
    ...f, days: f.days.includes(day) ? f.days.filter(d => d !== day) : [...f.days, day]
  }))

  const handleSave = async () => {
    if (!form.ward || !form.time) { toast.error('Ward and Time are required'); return }
    const updated = editIdx !== null ? entries.map((e, i) => i === editIdx ? form : e) : [...entries, form]
    setEntries(updated)
    setShowForm(false)
    await saveSchedule(updated)
  }

  const handleDelete = async (idx) => {
    if (!confirm('Delete this ward entry?')) return
    const updated = entries.filter((_, i) => i !== idx)
    setEntries(updated)
    await saveSchedule(updated)
  }

  // Pickup Request Handlers
  const handleStatus = async (id, status) => {
    try {
      await api.patch(`/schedule-bookings/${id}`, { status })
      setBookings(b => b.map(item => item._id === id ? { ...item, status } : item))
      toast.success(`Status updated to ${status}`)
    } catch { toast.error('Failed to update') }
  }

  const filteredBookings = bookingFilter === 'all' ? bookings : bookings.filter(b => b.status === bookingFilter)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-gray-400 font-medium mb-0.5">Management › Schedule Hub</p>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Manage Schedules</h1>
        </div>
        
        {/* Toggle Feature */}
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm">
          <div className={`p-2 rounded-xl ${panchayat?.isScheduleEnabled ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
            <Calendar size={18} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 leading-none mb-1">Pickup Feature</p>
            <p className={`text-xs font-bold leading-none ${panchayat?.isScheduleEnabled ? 'text-green-600' : 'text-gray-500'}`}>
              {panchayat?.isScheduleEnabled ? 'ENABLED' : 'DISABLED'}
            </p>
          </div>
          <button 
            onClick={handleToggleFeature}
            className={`p-1.5 rounded-full transition-all ${panchayat?.isScheduleEnabled ? 'text-green-600' : 'text-gray-300'}`}
          >
            {panchayat?.isScheduleEnabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100/50 p-1.5 rounded-2xl w-fit">
        {[
          { id: 'ward-schedule', label: 'Ward Schedule', icon: Calendar },
          { id: 'pickup-requests', label: 'Pickup Requests', icon: Clock }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
            {tab.id === 'pickup-requests' && bookings.filter(b => b.status === 'Pending').length > 0 && (
              <span className="w-5 h-5 flex items-center justify-center bg-red-500 text-white text-[10px] rounded-full">
                {bookings.filter(b => b.status === 'Pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'ward-schedule' && (
          <motion.div
            key="ward-schedule"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-[2px]">Ward Collection Schedule</h2>
              <button 
                onClick={handleAdd} 
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all active:scale-95"
              >
                <Plus size={16} /> Add Entry
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              {loading ? (
                <div className="flex items-center justify-center py-24 text-gray-400">
                  <Loader2 className="animate-spin mr-3" size={28} />
                  <span className="font-medium">Loading schedule...</span>
                </div>
              ) : entries.length === 0 ? (
                <div className="text-center py-20 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
                  <p className="text-gray-400 font-medium">No schedule entries found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {entries.map((entry, idx) => (
                    <div key={idx} className={`group relative border rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-md ${entry.bg || 'bg-gray-50 border-gray-200'}`}>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-black text-gray-900 text-lg">{entry.ward}</span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(idx)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition"><Edit2 size={16} /></button>
                            <button onClick={() => handleDelete(idx)} className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition"><Trash2 size={16} /></button>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-gray-700 mb-1">{entry.area}</p>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed">
                          {(entry.days || []).join(', ')} • {entry.time}
                        </p>
                      </div>
                      {entry.vehicle && (
                        <div className="mt-4 pt-3 border-t border-black/5 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                          <span className="bg-white/50 px-2 py-0.5 rounded-full">🚛 {entry.vehicle}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
        {activeTab === 'pickup-requests' && (
          <motion.div
            key="pickup-requests"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-[2px]">On-Demand Pickup Requests</h2>
              <button 
                onClick={fetchData} 
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
              >
                <RefreshCcw size={18} />
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex flex-wrap gap-2 mb-6">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mr-2">
                  <Filter size={14} /> Filter:
                </div>
                {['all', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map(s => (
                  <button 
                    key={s} 
                    onClick={() => setBookingFilter(s)}
                    className={`px-4 py-1.5 text-xs font-bold rounded-xl border-2 transition-all ${
                      bookingFilter === s 
                        ? 'border-blue-600 bg-blue-50 text-blue-700' 
                        : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    {s === 'all' ? 'All Requests' : s}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20 text-gray-400">
                  <Loader2 className="animate-spin mr-3" size={24} />
                  <span className="font-medium">Loading requests...</span>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="text-center py-20 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
                  <p className="text-gray-400 font-medium">No pickup requests found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBookings.map(booking => (
                    <div key={booking._id} className="group border border-gray-100 rounded-2xl p-5 hover:border-blue-200 hover:shadow-sm transition-all">
                      <div className="flex flex-col lg:flex-row justify-between gap-6">
                        <div className="flex gap-4 flex-1">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border ${
                            booking.status === 'Pending' ? 'bg-yellow-50 border-yellow-100 text-yellow-600' :
                            booking.status === 'Confirmed' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                            booking.status === 'Completed' ? 'bg-green-50 border-green-100 text-green-600' :
                            'bg-gray-50 border-gray-100 text-gray-400'
                          }`}>
                            <Calendar size={20} />
                          </div>
                          
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="font-black text-gray-900">{booking.userName || 'Citizen'}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${STATUS_COLORS[booking.status] || 'bg-gray-100'}`}>
                                {booking.status}
                              </span>
                              <span className="text-xs text-gray-400 font-medium">
                                {new Date(booking.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-400"><Trash2 size={14} /></span>
                                <span className="text-gray-600 font-bold">{booking.wasteType}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-400"><Clock size={14} /></span>
                                <span className="text-gray-600 font-bold">{booking.date} • {booking.time}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm sm:col-span-2">
                                <span className="text-gray-400 flex-shrink-0"><MapPin size={14} /></span>
                                <span className="text-gray-600 font-medium">{booking.address}</span>
                              </div>
                            </div>
                            
                            {booking.note && (
                              <div className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                                <span className="font-bold text-gray-400 uppercase tracking-widest text-[9px] block mb-1">Citizen Note:</span>
                                "{booking.note}"
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex lg:flex-col gap-2 justify-end lg:justify-start">
                          {booking.status === 'Pending' && (
                            <>
                              <button 
                                onClick={() => handleStatus(booking._id, 'Confirmed')}
                                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-black rounded-xl hover:bg-blue-700 transition"
                              >
                                <CheckCircle2 size={14} /> APPROVE
                              </button>
                              <button 
                                onClick={() => handleStatus(booking._id, 'Cancelled')}
                                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white text-red-500 border border-red-100 text-xs font-black rounded-xl hover:bg-red-50 transition"
                              >
                                <XCircle size={14} /> REJECT
                              </button>
                            </>
                          )}
                          {booking.status === 'Confirmed' && (
                            <button 
                              onClick={() => handleStatus(booking._id, 'Completed')}
                              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white text-xs font-black rounded-xl hover:bg-green-700 transition"
                            >
                              <CheckCircle2 size={14} /> MARK AS COMPLETED
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Modal (Static Ward Schedule) */}
      <AnimatePresence>
        {showForm && (
 <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto modal-overlay"> 
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto relative z-10"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-800 tracking-tight">{editIdx !== null ? 'Edit Ward' : 'Add New Ward'}</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"><X size={24} /></button>
              </div>

              <div className="space-y-5">
                {/* Ward Name Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Ward Name / Number *</label>
                  <select
                    value={form.ward}
                    onChange={e => {
                      const wardName = e.target.value;
                      // Auto-select all bins for the ward initially when ward changes
                      const wardBins = allBins.filter(b => b.ward === wardName);
                      const binNames = wardBins.map(b => `${b.locationText} (${b.binCode})`).join(', ');
                      setForm(f => ({ ...f, ward: wardName, area: binNames }));
                    }}
                    className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-200 transition-all appearance-none"
                  >
                    <option value="">Select Ward</option>
                    {wards.map(w => (
                      <option key={w._id} value={w.name}>{w.name}</option>
                    ))}
                  </select>
                </div>

                {/* Collection Time */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Collection Time *</label>
                  <input
                    value={form.time}
                    onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                    placeholder="e.g. 7:00 AM - 10:00 AM"
                    className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-200 transition-all"
                  />
                </div>

                {/* Localities Covered (Bins) */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Localities Covered (Dustbins)</label>
                  {!form.ward ? (
                    <div className="px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs text-gray-400 italic">Select a ward first...</div>
                  ) : (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border border-gray-100 rounded-2xl">
                        {allBins.filter(b => b.ward === form.ward).map(bin => {
                          const binName = `${bin.locationText} (${bin.binCode})`;
                          const isSelected = form.area.includes(binName);
                          return (
                            <label key={bin._id} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${isSelected ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100'}`}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {
                                  let currentStops = form.area ? form.area.split(', ').filter(s => s) : [];
                                  if (isSelected) {
                                    currentStops = currentStops.filter(s => s !== binName);
                                  } else {
                                    currentStops.push(binName);
                                  }
                                  setForm(f => ({ ...f, area: currentStops.join(', ') }));
                                }}
                                className="w-3 h-3 rounded text-blue-600"
                              />
                              <span className="text-[10px] font-bold text-gray-700 truncate">{binName}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Vehicle/Driver Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Assigned Driver *</label>
                  <select
                    value={form.vehicle}
                    onChange={e => setForm(f => ({ ...f, vehicle: e.target.value }))}
                    className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-200 transition-all appearance-none"
                  >
                    <option value="">Select Driver</option>
                    {drivers.map(d => (
                      <option key={d._id} value={d.name}>{d.name} ({d.employeeCode})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Collection Days</label>
                  <div className="flex flex-wrap gap-2">
                    {WEEK_DAYS.map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-4 py-2 rounded-xl text-xs font-black border-2 transition-all ${(form.days || []).includes(day)
                            ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-200'
                            : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                          }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Card Theme</label>
                  <div className="flex flex-wrap gap-3">
                    {COLOR_OPTIONS.map((c, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, color: c.color, bg: c.bg }))}
                        className={`w-10 h-10 rounded-full bg-gradient-to-br ${c.color} border-4 transition-all ${form.color === c.color
                            ? 'border-gray-900 scale-110 shadow-lg'
                            : 'border-white shadow-sm hover:scale-105 hover:shadow-md'
                          }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-10">
                <button onClick={() => setShowForm(false)} className="flex-1 px-6 py-4 bg-gray-50 text-gray-500 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-colors uppercase tracking-widest">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-2 px-6 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 shadow-xl shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-60">
                  {saving ? 'SAVING...' : (editIdx !== null ? 'UPDATE SCHEDULE' : 'ADD WARD ENTRY')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
