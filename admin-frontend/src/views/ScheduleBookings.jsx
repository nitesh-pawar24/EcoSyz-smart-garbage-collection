"use client";

import { useState, useEffect } from 'react'
import { Calendar, Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react'
import api from '../api/axios'
import { toast } from 'react-toastify'

const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Confirmed: 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
}

export default function ScheduleBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const res = await api.get('/schedule-bookings')
      setBookings(res.data)
    } catch { toast.error('Failed to load bookings') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchBookings() }, [])

  const handleStatus = async (id, status) => {
    try {
      await api.patch(`/schedule-bookings/${id}`, { status })
      setBookings(b => b.map(item => item._id === id ? { ...item, status } : item))
      toast.success(`Status updated to ${status}`)
    } catch { toast.error('Failed to update') }
  }

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-gray-400 font-medium mb-0.5">Reports & Complaints › Schedule Bookings</p>
        <h1 className="text-xl font-black text-gray-800">Pickup Schedule Bookings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage pickup requests submitted by citizens.</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-5">
          <h2 className="text-xl font-bold text-gray-800">SCHEDULE BOOKINGS</h2>
          <button onClick={fetchBookings} className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-200 transition">Refresh</button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {['all', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border-2 transition ${filter === s ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 bg-white text-gray-600'}`}>
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Loader2 className="animate-spin mr-2" size={24} /> Loading bookings...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Calendar size={48} className="mx-auto mb-4 opacity-30" />
            <p>No bookings found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(booking => (
              <div key={booking._id} className="border border-gray-200 rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center flex-shrink-0 border border-green-200">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-bold text-gray-900">{booking.userName || 'Anonymous'}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[booking.status] || 'bg-gray-100'}`}>{booking.status}</span>
                        <span className="text-xs text-gray-400">{new Date(booking.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm mt-2">
                        <p className="text-gray-600">♻️ <span className="font-medium">{booking.wasteType}</span></p>
                        <p className="text-gray-600">📞 {booking.phone || booking.userMobile || '—'}</p>
                        <p className="text-gray-600">📅 {booking.date} {booking.time && `• ${booking.time}`}</p>
                        <p className="text-gray-600">📍 {booking.address}</p>
                      </div>
                      {booking.note && <p className="text-xs text-gray-500 mt-2 italic">Note: {booking.note}</p>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {booking.status === 'Pending' && (
                      <>
                        <button onClick={() => handleStatus(booking._id, 'Confirmed')}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg hover:bg-blue-200 transition">
                          <CheckCircle2 size={13} /> Confirm
                        </button>
                        <button onClick={() => handleStatus(booking._id, 'Cancelled')}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-200 transition">
                          <XCircle size={13} /> Cancel
                        </button>
                      </>
                    )}
                    {booking.status === 'Confirmed' && (
                      <button onClick={() => handleStatus(booking._id, 'Completed')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 text-xs font-semibold rounded-lg hover:bg-green-200 transition">
                        <CheckCircle2 size={13} /> Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
