'use client'


export const dynamic = 'force-static'

import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
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
  progress?: number
  tasks?: { id: string; text: string; done: boolean }[]
}

const statusColors: Record<string, { bg: string; text: string }> = {
  'Pending':     { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  'In Progress': { bg: 'bg-blue-100',   text: 'text-blue-700'   },
  'Done':        { bg: 'bg-green-100',  text: 'text-green-700'  },
}

export default function ClientDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { clients, updateClient, deleteClient } = useApp()
  const [editing, setEditing] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const client = clients.find(c => c.id === id)

  const [form, setForm] = useState<ClientForm>({
    name:     client?.name     || '',
    email:    client?.email    || '',
    phone:    client?.phone    || '',
    service:  client?.service  || '',
    budget:   client?.budget   || '',
    deadline: client?.deadline || '',
    status:   client?.status   || 'Pending',
    notes:    client?.notes    || '',
  })

  if (!client) {
    return (
      <div className="text-center py-20 text-gray-400">
        <div className="text-5xl mb-4">😕</div>
        <p className="text-base mb-4">Client nahi mila!</p>
        <Link href="/clients" className="text-purple-600 font-semibold hover:underline">
          ← Clients pe wapas jao
        </Link>
      </div>
    )
  }

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) return
    updateClient(client.id, form)
    setEditing(false)
    setToast({ message: 'Client update ho gaya! ✅', type: 'success' })
  }

  const handleDelete = () => {
    if (confirm(`"${client.name}" ko delete karna chahte ho?`)) {
      deleteClient(client.id)
      router.push('/clients')
    }
  }

  const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200'
  const labelCls = 'block text-xs font-medium text-gray-600 mb-1'
  const sc = statusColors[client.status] || statusColors['Pending']

  return (
    <div className="max-w-3xl mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Back + Actions */}
      <div className="flex items-center justify-between mb-8 md:ml-0 ml-12">
        <Link href="/clients" className="text-sm text-purple-600 font-semibold hover:underline">
          ← Back to Clients
        </Link>
        <div className="flex gap-3">
          <button
            onClick={() => setEditing(!editing)}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
            style={{ backgroundColor: '#7c3aed' }}
          >
            {editing ? 'Cancel' : '✏️ Edit'}
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition-all duration-200"
          >
            🗑 Delete
          </button>
          {client.phone && (
            <a
              href={`https://wa.me/${client.phone.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-lg text-sm font-semibold text-green-600 border border-green-200 hover:bg-green-50 transition-all duration-200"
            >
              📱 WhatsApp
            </a>
          )}
          <a
            href={`mailto:${client.email}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-lg text-sm font-semibold text-blue-600 border border-blue-200 hover:bg-blue-50 transition-all duration-200"
          >
            📧 Email
          </a>
        </div>
      </div>

      {!editing ? (
        <div className="bg-white rounded-2xl shadow p-8 space-y-6">
          <div className="flex items-center gap-5">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0"
              style={{ backgroundColor: '#7c3aed' }}
            >
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${sc.bg} ${sc.text}`}>
                {client.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Email',    value: client.email,    icon: '📧' },
              { label: 'Phone',    value: client.phone,    icon: '📞' },
              { label: 'Service',  value: client.service,  icon: '🛠' },
              { label: 'Budget',   value: client.budget ? `PKR ${Number(client.budget).toLocaleString()}` : '', icon: '💰' },
              { label: 'Deadline', value: client.deadline, icon: '📅' },
            ].filter(f => f.value).map(({ label, value, icon }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs text-gray-400 mb-1">{icon} {label}</div>
                <div className="text-sm font-semibold text-gray-800">{value}</div>
              </div>
            ))}
          </div>

          {client.notes && (
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-xs text-gray-400 mb-2">📝 Notes</div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{client.notes}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">Client Edit Karo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Name *</label>
              <input className={inputCls} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Email *</label>
              <input className={inputCls} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input className={inputCls} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Service</label>
              <input className={inputCls} value={form.service} onChange={e => setForm({ ...form, service: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Budget (PKR)</label>
              <input className={inputCls} type="number" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} />
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
              <textarea className={inputCls} rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              className="px-6 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-all duration-200"
              style={{ backgroundColor: '#7c3aed' }}
            >
              Save Changes
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-6 py-2 rounded-lg text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export async function generateStaticParams() {
  return []
}
export const dynamicParams = false
