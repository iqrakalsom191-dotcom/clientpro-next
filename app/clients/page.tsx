'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useApp } from '@/context/AppContext'
import Toast from '@/components/Toast'

type ClientForm = {
  name: string
  email: string
  phone: string
  service: string
  budget: string
  deadline: string
  status: 'Pending' | 'In Progress' | 'Done'
  notes: string
}

const emptyForm: ClientForm = {
  name: '', email: '', phone: '', service: '',
  budget: '', deadline: '', status: 'Pending', notes: ''
}

const statusColors: Record<string, { bg: string; text: string }> = {
  'Pending':     { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  'In Progress': { bg: 'bg-blue-100',   text: 'text-blue-700'   },
  'Done':        { bg: 'bg-green-100',  text: 'text-green-700'  },
}

export default function ClientsPage() {
  const { clients, addClient, deleteClient } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<ClientForm>(emptyForm)
  const [search, setSearch] = useState('')
  const [expandedNotes, setExpandedNotes] = useState<string[]>([])
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const closeToast = useCallback(() => setToast(null), [])

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) return
    addClient(form)
    setToast({ message: `${form.name} add ho gaya! ✅`, type: 'success' })
    setForm(emptyForm)
    setShowForm(false)
  }

  const handleDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault()
    if (confirm(`"${name}" ko delete karna chahte ho?`)) {
      deleteClient(id)
      setToast({ message: `${name} delete ho gaya!`, type: 'error' })
    }
  }

  const toggleNotes = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    setExpandedNotes(prev =>
      prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]
    )
  }

  const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200'
  const labelCls = 'block text-xs font-medium text-gray-600 mb-1'

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 md:ml-0 ml-12">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🧑‍💼 Clients</h1>
          <p className="text-sm text-gray-500 mt-1">{clients.length} client{clients.length !== 1 ? 's' : ''} total</p>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 w-56 transition-all duration-200"
          />
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
            style={{ backgroundColor: '#7c3aed' }}
          >
            {showForm ? 'Cancel' : '+ Add Client'}
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="glass rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">New Client</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Name *</label>
              <input className={inputCls} placeholder="Ali Hassan" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Email *</label>
              <input className={inputCls} type="email" placeholder="ali@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input className={inputCls} placeholder="0300-1234567" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Service / Project</label>
              <input className={inputCls} placeholder="Website Design" value={form.service} onChange={e => setForm({ ...form, service: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Budget (PKR)</label>
              <input className={inputCls} type="number" placeholder="50000" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Deadline</label>
              <input className={inputCls} type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select className={inputCls} value={form.status} onChange={e => setForm({ ...form, status: e.target.value as ClientForm['status'] })}>
                <option>Pending</option>
                <option>In Progress</option>
                <option>Done</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Notes</label>
              <textarea className={inputCls} rows={3} placeholder="Client ke baare mein kuch notes..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={handleSave} className="px-6 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-all duration-200" style={{ backgroundColor: '#7c3aed' }}>
              Save Client
            </button>
            <button onClick={() => { setForm(emptyForm); setShowForm(false) }} className="px-6 py-2 rounded-lg text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all duration-200">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="glass rounded-2xl p-16 text-center text-gray-400">
          <div className="text-5xl mb-4">🧑‍💼</div>
          <p className="text-base">{search ? 'Koi client nahi mila!' : 'Abhi koi client nahi! Pehla client add karo 🧑‍💼'}</p>
        </div>
      )}

      {/* Client Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(client => {
          const sc = statusColors[client.status] || statusColors['Pending']
          const notesOpen = expandedNotes.includes(client.id)
          return (
            <Link
              href={`/clients/${client.id}`}
              key={client.id}
              className="glass card-hover rounded-2xl p-5 flex flex-col gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0" style={{ backgroundColor: '#7c3aed' }}>
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 dark:text-white truncate">{client.name}</div>
                  <div className="text-xs text-gray-500 truncate">{client.email}</div>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${sc.bg} ${sc.text}`}>
                  {client.status}
                </span>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                {client.phone    && <div>📞 {client.phone}</div>}
                {client.service  && <div>🛠 {client.service}</div>}
                {client.budget   && <div>💰 PKR {Number(client.budget).toLocaleString()}</div>}
                {client.deadline && <div>📅 {client.deadline}</div>}
              </div>

              {client.notes && (
                <div>
                  <button onClick={e => toggleNotes(e, client.id)} className="text-xs font-medium text-purple-600 hover:underline">
                    {notesOpen ? '▲ Notes hide karo' : '▼ Notes dekho'}
                  </button>
                  {notesOpen && (
                    <p className="text-xs text-gray-600 mt-2 bg-gray-50 rounded-lg p-3">{client.notes}</p>
                  )}
                </div>
              )}

              <button
                onClick={e => handleDelete(e, client.id, client.name)}
                className="mt-auto text-xs text-red-500 border border-red-100 rounded-lg py-1.5 hover:bg-red-50 transition-all duration-200"
              >
                🗑 Delete
              </button>
              {client.phone && (
                <button
                  onClick={e => { e.preventDefault(); e.stopPropagation(); window.open(`https://wa.me/${client.phone.replace(/[^0-9]/g, "")}`, "_blank") }}
                  className="text-xs text-green-600 border border-green-100 rounded-lg py-1.5 hover:bg-green-50 transition-all duration-200 text-center"
                >
                  📱 WhatsApp
                </button>
              )}
              <button
                onClick={e => { e.preventDefault(); e.stopPropagation(); window.open(`mailto:${client.email}`, "_blank") }}
                className="text-xs text-blue-600 border border-blue-100 rounded-lg py-1.5 hover:bg-blue-50 transition-all duration-200 text-center"
              >
                📧 Email
              </button>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
