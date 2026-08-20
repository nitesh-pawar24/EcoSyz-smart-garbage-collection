"use client";

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Save, Loader2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api/axios'
import { toast } from 'react-toastify'

const CONTENT_TYPE = 'events'
const STATUS_OPTIONS = ['upcoming', 'past']
const COLOR_OPTIONS = [
  'from-green-500 to-emerald-400',
  'from-blue-500 to-cyan-400',
  'from-purple-500 to-violet-400',
  'from-amber-500 to-orange-400',
  'from-pink-500 to-rose-400',
  'from-red-500 to-orange-400',
]
const EMOJIS = ['🌱', '🧹', '♻️', '🌿', '🏆', '📅', '💧', '🌍']

const blankEvent = { emoji: '📅', title: '', description: '', date: '', time: '', location: '', participants: '', status: 'upcoming', color: COLOR_OPTIONS[0] }

export default function ManageEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editIdx, setEditIdx] = useState(null)
  const [form, setForm] = useState(blankEvent)

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/content?type=${CONTENT_TYPE}`)
      setEvents(res.data?.events || [])
    } catch { toast.error('Failed to load events') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchEvents() }, [])

  useEffect(() => {
    if (showForm) window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [showForm])

  const saveEvents = async (updatedEvents, status = 'published') => {
    setSaving(true)
    try {
      await api.post('/content', { type: CONTENT_TYPE, title: 'Events & Workshops', status, events: updatedEvents })
      toast.success('Events saved!')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const handleAdd = () => { setForm(blankEvent); setEditIdx(null); setShowForm(true) }
  const handleEdit = (idx) => { setForm({ ...events[idx] }); setEditIdx(idx); setShowForm(true) }

  const handleSave = async () => {
    if (!form.title || !form.date) { toast.error('Title and Date are required'); return }
    const updated = editIdx !== null
      ? events.map((e, i) => i === editIdx ? form : e)
      : [...events, form]
    setEvents(updated)
    setShowForm(false)
    await saveEvents(updated)
  }

  const handleDelete = async (idx) => {
    if (!confirm('Delete this event?')) return
    const updated = events.filter((_, i) => i !== idx)
    setEvents(updated)
    await saveEvents(updated)
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-gray-400 font-medium mb-0.5">Public Website CMS › Events & Workshops</p>
        <h1 className="text-xl font-black text-gray-800">Manage Events & Workshops</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <h2 className="text-xl font-bold text-gray-800">EVENTS MANAGEMENT</h2>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded font-semibold text-sm hover:bg-blue-700 transition">
              <Plus size={16} /> Add Event
            </button>
            <button onClick={() => saveEvents(events, 'published')} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded font-semibold text-sm hover:bg-teal-600 transition disabled:opacity-60">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Publish
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Loader2 className="animate-spin mr-2" size={24} /> Loading...
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p>No events yet. Click "Add Event" to create one.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((ev, idx) => (
              <div key={idx} className="border border-gray-200 rounded-xl p-4 flex items-start gap-4">
                <div className="text-3xl">{ev.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900">{ev.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${ev.status === 'upcoming' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{ev.status}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{ev.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{ev.date} {ev.time && `• ${ev.time}`} {ev.location && `• ${ev.location}`}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleEdit(idx)} className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
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
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto relative z-10"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-800">{editIdx !== null ? 'Edit Event' : 'Add Event'}</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Icon / Emoji</label>
                  <div className="flex flex-wrap gap-2">
                    {EMOJIS.map(e => (
                      <button key={e} type="button" onClick={() => setForm(f => ({ ...f, emoji: e }))}
                        className={`text-2xl p-2.5 rounded-xl border-2 transition-all ${form.emoji === e ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}>{e}</button>
                    ))}
                  </div>
                </div>
                {[['title', 'Title *'], ['description', 'Description'], ['date', 'Date *'], ['time', 'Time'], ['location', 'Location'], ['participants', 'Participants']].map(([field, label]) => (
                  <div key={field}>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
                    {field === 'description' ? (
                      <textarea value={form[field]} rows={3} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none" />
                    ) : (
                      <input value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
                    )}
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all">
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Card Accent Color</label>
                  <div className="flex flex-wrap gap-3">
                    {COLOR_OPTIONS.map(c => (
                      <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                        className={`w-9 h-9 rounded-full bg-gradient-to-br ${c} border-4 transition-all ${form.color === c ? 'border-gray-900 scale-110 shadow-lg' : 'border-white shadow-sm hover:scale-105'}`} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all disabled:opacity-60">
                  {saving ? 'Saving...' : (editIdx !== null ? 'Update Event' : 'Create Event')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
