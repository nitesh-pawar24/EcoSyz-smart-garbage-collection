"use client";

import { useState, useEffect } from 'react'
import { Mail, Trash2, CheckCircle2, Loader2, MessageSquare } from 'lucide-react'
import api from '../api/axios'
import { toast } from 'react-toastify'

export default function ContactQueries() {
  const [queries, setQueries] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchQueries = async () => {
    try {
      setLoading(true)
      const res = await api.get('/contact-queries')
      setQueries(res.data)
    } catch { toast.error('Failed to load queries') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchQueries() }, [])

  const handleStatus = async (id, status) => {
    try {
      await api.patch(`/contact-queries/${id}`, { status })
      setQueries(q => q.map(item => item._id === id ? { ...item, status } : item))
      toast.success(`Marked as ${status}`)
    } catch { toast.error('Failed to update') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this query?')) return
    try {
      await api.delete(`/contact-queries/${id}`)
      setQueries(q => q.filter(item => item._id !== id))
      toast.success('Deleted')
    } catch { toast.error('Failed to delete') }
  }

  const badgeClass = (status) => ({
    unread: 'bg-red-100 text-red-700',
    read: 'bg-yellow-100 text-yellow-700',
    replied: 'bg-green-100 text-green-700',
  }[status] || 'bg-gray-100 text-gray-700')

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-gray-400 font-medium mb-0.5">Reports & Complaints › Contact Queries</p>
        <h1 className="text-xl font-black text-gray-800">Contact Queries</h1>
        <p className="text-sm text-gray-500 mt-1">Messages sent by citizens from the Contact Us page.</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-5">
          <h2 className="text-xl font-bold text-gray-800">CONTACT QUERIES INBOX</h2>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
              {queries.filter(q => q.status === 'unread').length} Unread
            </span>
            <button onClick={fetchQueries} className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-200 transition">Refresh</button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Loader2 className="animate-spin mr-2" size={24} /> Loading queries...
          </div>
        ) : queries.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <MessageSquare size={48} className="mx-auto mb-4 opacity-30" />
            <p>No contact queries yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {queries.map(query => (
              <div key={query._id} className={`border rounded-xl p-5 ${query.status === 'unread' ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0 border border-blue-200">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-bold text-gray-900">{query.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${badgeClass(query.status)}`}>{query.status}</span>
                        <span className="text-xs text-gray-400">{new Date(query.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-blue-600 mb-2">✉️ {query.email}</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{query.message}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {query.status !== 'replied' && (
                      <button onClick={() => handleStatus(query._id, 'replied')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 text-xs font-semibold rounded-lg hover:bg-green-200 transition">
                        <CheckCircle2 size={13} /> Reply
                      </button>
                    )}
                    {query.status === 'unread' && (
                      <button onClick={() => handleStatus(query._id, 'read')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-lg hover:bg-yellow-200 transition">
                        <Mail size={13} /> Read
                      </button>
                    )}
                    <button onClick={() => handleDelete(query._id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-200 transition">
                      <Trash2 size={13} /> Delete
                    </button>
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
