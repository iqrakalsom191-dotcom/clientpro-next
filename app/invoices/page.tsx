'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useApp } from '@/context/AppContext'
import Toast from '@/components/Toast'
import confetti from 'canvas-confetti'

type InvoiceForm = {
  client: string
  project: string
  amount: string
  status: 'Paid' | 'Unpaid' | 'Overdue'
  date: string
}

const emptyForm: InvoiceForm = {
  client: '', project: '', amount: '', status: 'Unpaid', date: ''
}

const statusColors: Record<string, { bg: string; text: string }> = {
  'Paid':    { bg: 'bg-green-100', text: 'text-green-700' },
  'Unpaid':  { bg: 'bg-blue-100',  text: 'text-blue-700'  },
  'Overdue': { bg: 'bg-red-100',   text: 'text-red-700'   },
}

export default function InvoicesPage() {
  const { invoices, clients, projects, addInvoice, deleteInvoice, updateInvoice } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<InvoiceForm>(emptyForm)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const closeToast = useCallback(() => setToast(null), [])

  const filtered = invoices.filter(i =>
    i.client.toLowerCase().includes(search.toLowerCase()) ||
    i.number.toLowerCase().includes(search.toLowerCase())
  )

  const totalPaid = invoices
    .filter(i => i.status === 'Paid')
    .reduce((sum, i) => sum + Number(i.amount), 0)

  const clientProjects = projects.filter(p => p.client === form.client)

  const handleSave = () => {
    if (!form.client.trim()) return
    addInvoice(form)
    setToast({ message: 'Invoice add ho gaya! ✅', type: 'success' })
    setForm(emptyForm)
    setShowForm(false)
  }

  const handleDelete = (e: React.MouseEvent, id: string, number: string) => {
    e.preventDefault()
    if (confirm(`"${number}" ko delete karna chahte ho?`)) {
      deleteInvoice(id)
      setToast({ message: `${number} delete ho gaya!`, type: 'error' })
    }
  }

  const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200'
  const labelCls = 'block text-xs font-medium text-gray-600 mb-1'

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 md:ml-0 ml-12">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🧾 Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">
            {invoices.length} invoice{invoices.length !== 1 ? 's' : ''} • 💰 Total Paid: PKR {totalPaid.toLocaleString()}
          </p>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search invoices..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 w-56 transition-all duration-200"
          />
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
            style={{ backgroundColor: '#7c3aed' }}
          >
            {showForm ? 'Cancel' : '+ Add Invoice'}
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="glass rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">New Invoice</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Client *</label>
              <select className={inputCls} value={form.client} onChange={e => setForm({ ...form, client: e.target.value, project: '' })}>
                <option value="">-- Client Select Karo --</option>
                {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Project</label>
              <select className={inputCls} value={form.project} onChange={e => setForm({ ...form, project: e.target.value })} disabled={!form.client}>
                <option value="">-- Project Select Karo --</option>
                {clientProjects.map(p => <option key={p.id} value={p.title}>{p.title}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Amount (PKR)</label>
              <input className={inputCls} type="number" placeholder="50000" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select className={inputCls} value={form.status} onChange={e => setForm({ ...form, status: e.target.value as InvoiceForm['status'] })}>
                <option>Unpaid</option>
                <option>Paid</option>
                <option>Overdue</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Date</label>
              <input className={inputCls} type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={handleSave} className="px-6 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-all duration-200" style={{ backgroundColor: '#7c3aed' }}>
              Save Invoice
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
          <div className="text-5xl mb-4">🧾</div>
          <p className="text-base">{search ? 'Koi invoice nahi mila!' : 'Koi invoice nahi! Pehla invoice banao 🧾'}</p>
        </div>
      )}

      {/* Invoice Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(invoice => {
          const sc = statusColors[invoice.status] || statusColors['Unpaid']
          return (
            <Link
              href={`/invoices/${invoice.id}`}
              key={invoice.id}
              className="glass card-hover rounded-2xl p-5 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">{invoice.number}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">{invoice.client}</div>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${sc.bg} ${sc.text}`}>
                  {invoice.status}
                </span>
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                {invoice.project && <div>📁 {invoice.project}</div>}
                {invoice.amount  && <div>💰 PKR {Number(invoice.amount).toLocaleString()}</div>}
                {invoice.date    && <div>📅 {invoice.date}</div>}
              </div>
              <button
                onClick={e => handleDelete(e, invoice.id, invoice.number)}
                className="mt-auto text-xs text-red-500 border border-red-100 rounded-lg py-1.5 hover:bg-red-50 transition-all duration-200"
              >
                🗑 Delete
              </button>
              {invoice.status !== 'Paid' && (
                <button
                  onClick={e => { e.preventDefault(); confetti({ particleCount: 100, spread: 70, colors: ['#7c3aed', '#f59e0b', '#ffffff'] }); updateInvoice(invoice.id, { status: 'Paid' }); setToast({ message: `${invoice.number} paid mark ho gaya! u2705`, type: 'success' }) }}
                  className="text-xs text-green-600 border border-green-100 rounded-lg py-1.5 hover:bg-green-50 transition-all duration-200"
                >
                  ✅ Mark as Paid
                </button>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
