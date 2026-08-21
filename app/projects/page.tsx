'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useApp } from '@/context/AppContext'
import Toast from '@/components/Toast'

type ProjectForm = {
  title: string
  client: string
  status: 'In Progress' | 'Completed' | 'On Hold'
  deadline: string
  budget: string
}

const emptyForm: ProjectForm = {
  title: '', client: '', status: 'In Progress', deadline: '', budget: ''
}

const statusColors: Record<string, { bg: string; text: string }> = {
  'In Progress': { bg: 'bg-blue-100',   text: 'text-blue-700'   },
  'Completed':   { bg: 'bg-green-100',  text: 'text-green-700'  },
  'On Hold':     { bg: 'bg-yellow-100', text: 'text-yellow-700' },
}

export default function ProjectsPage() {
  const { projects, clients, addProject, deleteProject } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<ProjectForm>(emptyForm)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const closeToast = useCallback(() => setToast(null), [])

  const filtered = projects.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.client.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = () => {
    if (!form.title.trim()) return
    addProject(form)
    setToast({ message: `"${form.title}" add ho gaya! ✅`, type: 'success' })
    setForm(emptyForm)
    setShowForm(false)
  }

  const handleDelete = (e: React.MouseEvent, id: string, title: string) => {
    e.preventDefault()
    if (confirm(`"${title}" ko delete karna chahte ho?`)) {
      deleteProject(id)
      setToast({ message: `"${title}" delete ho gaya!`, type: 'error' })
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📁 Projects</h1>
          <p className="text-sm text-gray-500 mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 w-56 transition-all duration-200"
          />
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
            style={{ backgroundColor: '#7c3aed' }}
          >
            {showForm ? 'Cancel' : '+ Add Project'}
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="glass rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">New Project</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Project Title *</label>
              <input className={inputCls} placeholder="Website Redesign" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Client</label>
              <select className={inputCls} value={form.client} onChange={e => setForm({ ...form, client: e.target.value })}>
                <option value="">-- Client Select Karo --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select className={inputCls} value={form.status} onChange={e => setForm({ ...form, status: e.target.value as ProjectForm['status'] })}>
                <option>In Progress</option>
                <option>Completed</option>
                <option>On Hold</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Deadline</label>
              <input className={inputCls} type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Budget (PKR)</label>
              <input className={inputCls} type="number" placeholder="50000" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={handleSave} className="px-6 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-all duration-200" style={{ backgroundColor: '#7c3aed' }}>
              Save Project
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
          <div className="text-5xl mb-4">📁</div>
          <p className="text-base">{search ? 'Koi project nahi mila!' : 'Koi project nahi! Pehle clients add karo 📁'}</p>
        </div>
      )}

      {/* Project Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(project => {
          const sc = statusColors[project.status] || statusColors['In Progress']
          return (
            <Link
              href={`/projects/${project.id}`}
              key={project.id}
              className="glass card-hover rounded-2xl p-5 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="font-semibold text-gray-900 dark:text-white">{project.title}</div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${sc.bg} ${sc.text}`}>
                  {project.status}
                </span>
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                {project.client   && <div>🧑‍💼 {project.client}</div>}
                {project.budget   && <div>💰 PKR {Number(project.budget).toLocaleString()}</div>}
                {project.deadline && <div>📅 {project.deadline}</div>}
                {typeof project.progress === 'number' && (
                  <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                    <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${project.progress}%`, backgroundColor: '#7c3aed' }} />
                  </div>
                )}
              </div>
              <button
                onClick={e => handleDelete(e, project.id, project.title)}
                className="mt-auto text-xs text-red-500 border border-red-100 rounded-lg py-1.5 hover:bg-red-50 transition-all duration-200"
              >
                🗑 Delete
              </button>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
