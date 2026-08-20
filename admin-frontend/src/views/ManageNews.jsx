"use client";

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Save, Loader2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api/axios'
import { toast } from 'react-toastify'

const CONTENT_TYPE = 'news'
const CATEGORIES = ['Announcement', 'Event', 'Update', 'Alert']
const BADGE_MAP = { Announcement: 'badge-blue', Event: 'badge-green', Update: 'badge-yellow', Alert: 'badge-red' }
const IMAGES = ['📢', '📅', '⚠️', '🌿', '🚀', '♻️', '🔔', '📰']

const blankItem = { category: 'Announcement', title: '', summary: '', date: '', readTime: '1 min read', badge: 'badge-blue', image: '📢' }

export default function ManageNews() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editIdx, setEditIdx] = useState(null)
  const [form, setForm] = useState(blankItem)

  const fetchNews = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/content?type=${CONTENT_TYPE}`)
      setItems(res.data?.newsItems || [])
    } catch { toast.error('Failed to load news') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchNews() }, [])

  useEffect(() => {
    if (showForm) window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [showForm])

  const saveNews = async (updated) => {
    setSaving(true)
    try {
      await api.post('/content', { type: CONTENT_TYPE, title: 'News & Updates', status: 'published', newsItems: updated })
      toast.success('News saved!')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const handleAdd = () => { setForm(blankItem); setEditIdx(null); setShowForm(true) }
  const handleEdit = (idx) => { setForm({ ...items[idx] }); setEditIdx(idx); setShowForm(true) }

  const handleSave = async () => {
    if (!form.title || !form.date) { toast.error('Title and Date are required'); return }
    const updated = editIdx !== null ? items.map((n, i) => i === editIdx ? form : n) : [...items, form]
    setItems(updated)
    setShowForm(false)
    await saveNews(updated)
  }

  const handleDelete = async (idx) => {
    if (!confirm('Delete this news item?')) return
    const updated = items.filter((_, i) => i !== idx)
    setItems(updated)
    await saveNews(updated)
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-gray-400 font-medium mb-0.5">Public Website CMS › News & Updates</p>
        <h1 className="text-xl font-black text-gray-800">Manage News & Updates</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <h2 className="text-xl font-bold text-gray-800">NEWS MANAGEMENT</h2>
          <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded font-semibold text-sm hover:bg-blue-700 transition">
            <Plus size={16} /> Add News
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Loader2 className="animate-spin mr-2" size={24} /> Loading...
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-gray-400"><p>No news items yet.</p></div>
        ) : (
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="border border-gray-200 rounded-xl p-4 flex items-start gap-4">
                <div className="text-3xl">{item.image}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900 truncate">{item.title}</span>
                    <span className={`badge ${item.badge} flex-shrink-0`}>{item.category}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{item.summary}</p>
                  <p className="text-xs text-gray-400 mt-1">{item.date} • {item.readTime}</p>
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
                <h2 className="text-xl font-bold text-gray-800">{editIdx !== null ? 'Edit News Article' : 'Add News Article'}</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Icon / Cover Emoji</label>
                  <div className="flex flex-wrap gap-2">
                    {IMAGES.map(img => (
                      <button key={img} type="button" onClick={() => setForm(f => ({ ...f, image: img }))}
                        className={`text-2xl p-2.5 rounded-xl border-2 transition-all ${form.image === img ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}>{img}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value, badge: BADGE_MAP[e.target.value] || 'badge-blue' }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                {[['title', 'Title *'], ['summary', 'Summary / Excerpt'], ['date', 'Published Date *'], ['readTime', 'Read Time (e.g. 2 min read)']].map(([field, label]) => (
                  <div key={field}>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
                    {field === 'summary'
                      ? <textarea value={form[field]} rows={3} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none" />
                      : <input value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
                    }
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-8">
                <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all disabled:opacity-60">
                  {saving ? 'Saving...' : (editIdx !== null ? 'Update News' : 'Publish News')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
