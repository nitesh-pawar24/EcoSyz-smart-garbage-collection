"use client";

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Save, Loader2, X, Users, Phone, Mail, Award } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api/axios'
import { toast } from 'react-toastify'

const CONTENT_TYPE = 'leadership'
const blank = { name: '', designation: '', contact: '', email: '', bio: '' }

export default function ManageLeadership() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editIdx, setEditIdx] = useState(null)
  const [form, setForm] = useState(blank)

  const fetchLeadership = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/content?type=${CONTENT_TYPE}`)
      setMembers(res.data?.leadershipMembers || [])
    } catch { toast.error('Failed to load leadership') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchLeadership() }, [])

  useEffect(() => {
    if (showForm) window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [showForm])

  const saveLeadership = async (updated) => {
    setSaving(true)
    try {
      await api.post('/content', { type: CONTENT_TYPE, title: 'Leadership', status: 'published', leadershipMembers: updated })
      toast.success('Leadership info saved!')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const handleAdd = () => { setForm(blank); setEditIdx(null); setShowForm(true) }
  const handleEdit = (idx) => { setForm({ ...members[idx] }); setEditIdx(idx); setShowForm(true) }

  const handleSave = async () => {
    if (!form.name || !form.designation) { toast.error('Name and Designation are required'); return }
    const updated = editIdx !== null ? members.map((m, i) => i === editIdx ? form : m) : [...members, form]
    setMembers(updated)
    setShowForm(false)
    await saveLeadership(updated)
  }

  const handleDelete = async (idx) => {
    if (!confirm('Remove this member?')) return
    const updated = members.filter((_, i) => i !== idx)
    setMembers(updated)
    await saveLeadership(updated)
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-gray-400 font-medium mb-0.5">Public Website CMS › Leadership</p>
        <h1 className="text-xl font-black text-gray-800">Manage Leadership / Committee Members</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <h2 className="text-xl font-bold text-gray-800">LEADERSHIP MANAGEMENT</h2>
          <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded font-semibold text-sm hover:bg-blue-700 transition">
            <Plus size={16} /> Add Member
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Loader2 className="animate-spin mr-2" size={24} /> Loading...
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-20 text-gray-400"><p>No members yet.</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((m, idx) => (
              <div key={idx} className="border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center border border-green-200">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{m.name}</p>
                    <p className="text-xs text-green-600 font-semibold">{m.designation}</p>
                  </div>
                </div>
                {m.contact && <p className="text-xs text-gray-500">📞 {m.contact}</p>}
                {m.email && <p className="text-xs text-gray-500">✉️ {m.email}</p>}
                {m.bio && <p className="text-xs text-gray-500 italic">{m.bio}</p>}
                <div className="flex gap-2 mt-auto">
                  <button onClick={() => handleEdit(idx)} className="flex-1 py-1.5 text-xs font-semibold bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition flex items-center gap-1 justify-center"><Edit2 size={13} />Edit</button>
                  <button onClick={() => handleDelete(idx)} className="flex-1 py-1.5 text-xs font-semibold bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition flex items-center gap-1 justify-center"><Trash2 size={13} />Remove</button>
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
                <h2 className="text-xl font-bold text-gray-800">{editIdx !== null ? 'Edit Member' : 'Add Member'}</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                {[['name', 'Full Name *'], ['designation', 'Designation *'], ['contact', 'Phone Number'], ['email', 'Email Address']].map(([field, label]) => (
                  <div key={field}>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
                    <input value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Short Bio</label>
                  <textarea value={form.bio} rows={3} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all disabled:opacity-60">
                  {saving ? 'Saving...' : (editIdx !== null ? 'Update Member' : 'Add Member')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
