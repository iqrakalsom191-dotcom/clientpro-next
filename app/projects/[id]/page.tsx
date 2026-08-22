'use client'

export const dynamic = 'force-static'

import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Toast from '@/components/Toast'

type ProjectForm = {
  title: string
  client: string
  status: 'In Progress' | 'Completed' | 'On Hold'
  deadline: string
  budget: string
  progress: number
}

const statusColors: Record<string, { bg: string; text: string }> = {
  'In Progress': { bg: 'bg-blue-100',   text: 'text-blue-700'   },
  'Completed':   { bg: 'bg-green-100',  text: 'text-green-700'  },
  'On Hold':     { bg: 'bg-yellow-100', text: 'text-yellow-700' },
}

export default function ProjectDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { projects, clients, updateProject, deleteProject } = useApp()
  const [editing, setEditing] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [newTask, setNewTask] = useState('')

  const project = projects.find(p => p.id === id)

  const [form, setForm] = useState<ProjectForm>({
    title:    project?.title    || '',
    client:   project?.client   || '',
    status:   project?.status   || 'In Progress',
    deadline: project?.deadline || '',
    budget:   project?.budget   || '',
    progress: project?.progress || 0,
  })

  if (!project) {
    return (
      <div className="text-center py-20 text-gray-400">
        <div className="text-5xl mb-4">😕</div>
        <p className="text-base mb-4">Project nahi mila!</p>
        <Link href="/projects" className="text-purple-600 font-semibold hover:underline">
          ← Projects pe wapas jao
        </Link>
      </div>
    )
  }

  const tasks = project.tasks || []
  const doneTasks = tasks.filter((t: { id: string; text: string; done: boolean }) => t.done).length

  const handleSave = () => {
    if (!form.title.trim()) return
    updateProject(project.id, form)
    setEditing(false)
    setToast({ message: 'Project update ho gaya! ✅', type: 'success' })
  }

  const handleDelete = () => {
    if (confirm(`"${project.title}" ko delete karna chahte ho?`)) {
      deleteProject(project.id)
      router.push('/projects')
    }
  }

  const addTask = () => {
    if (!newTask.trim()) return
    const task = { id: Date.now().toString(), text: newTask, done: false }
    updateProject(project.id, { tasks: [...tasks, task] })
    setNewTask('')
  }

  const toggleTask = (taskId: string) => {
    const updated = tasks.map((t: { id: string; text: string; done: boolean }) => t.id === taskId ? { ...t, done: !t.done } : t)
    updateProject(project.id, { tasks: updated })
  }

  const deleteTask = (taskId: string) => {
    updateProject(project.id, { tasks: tasks.filter((t: { id: string; text: string; done: boolean }) => t.id !== taskId) })
  }

  const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200'
  const labelCls = 'block text-xs font-medium text-gray-600 mb-1'
  const sc = statusColors[project.status] || statusColors['In Progress']

  return (
    <div className="max-w-3xl mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Back + Actions */}
      <div className="flex items-center justify-between mb-8 md:ml-0 ml-12">
        <Link href="/projects" className="text-sm text-purple-600 font-semibold hover:underline">
          ← Back to Projects
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
        </div>
      </div>

      {/* Detail View */}
      {!editing ? (
        <div className="space-y-5">
          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow p-8 space-y-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0" style={{ backgroundColor: '#7c3aed' }}>
                📁
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${sc.bg} ${sc.text}`}>
                  {project.status}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>Progress</span>
                <span className="font-semibold" style={{ color: '#7c3aed' }}>{project.progress || 0}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-500"
                  style={{ width: `${project.progress || 0}%`, backgroundColor: '#7c3aed' }}
                />
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Client',   value: project.client,   icon: '🧑‍💼' },
                { label: 'Budget',   value: project.budget ? `PKR ${Number(project.budget).toLocaleString()}` : '', icon: '💰' },
                { label: 'Deadline', value: project.deadline, icon: '📅' },
              ].filter(f => f.value).map(({ label, value, icon }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-4">
                  <div className="text-xs text-gray-400 mb-1">{icon} {label}</div>
                  <div className="text-sm font-semibold text-gray-800">{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks Card */}
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-800">✅ Tasks</h2>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                {doneTasks}/{tasks.length} complete
              </span>
            </div>

            {/* Add Task */}
            <div className="flex gap-2 mb-4">
              <input
                className={inputCls}
                placeholder="Naya task likho..."
                value={newTask}
                onChange={e => setNewTask(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTask()}
              />
              <button
                onClick={addTask}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white flex-shrink-0 hover:opacity-90 transition-all duration-200"
                style={{ backgroundColor: '#7c3aed' }}
              >
                + Add
              </button>
            </div>

            {/* Task List */}
            {tasks.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Koi task nahi — upar se add karo!</p>
            ) : (
              <div className="space-y-2">
                {tasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200">
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => toggleTask(task.id)}
                      className="w-4 h-4 accent-purple-600 cursor-pointer"
                    />
                    <span className={`flex-1 text-sm ${task.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                      {task.text}
                    </span>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-xs text-red-400 hover:text-red-600 transition-all duration-200"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Edit Form */
        <div className="bg-white rounded-2xl shadow p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">Project Edit Karo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Project Title *</label>
              <input className={inputCls} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Client</label>
              <select className={inputCls} value={form.client} onChange={e => setForm({ ...form, client: e.target.value })}>
                <option value="">-- Client Select Karo --</option>
                {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
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
              <input className={inputCls} type="number" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Progress: {form.progress}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={form.progress}
                onChange={e => setForm({ ...form, progress: Number(e.target.value) })}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={handleSave} className="px-6 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-all duration-200" style={{ backgroundColor: '#7c3aed' }}>
              Save Changes
            </button>
            <button onClick={() => setEditing(false)} className="px-6 py-2 rounded-lg text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all duration-200">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

