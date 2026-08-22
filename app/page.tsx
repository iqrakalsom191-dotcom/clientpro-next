'use client'

import { useState, useEffect } from 'react'

import { useApp } from '@/context/AppContext'
import { StatCardSkeleton } from '@/components/Skeleton'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function Dashboard() {
  const { clients, projects, invoices } = useApp()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 500)
    return () => clearTimeout(timer)
  }, [])

  // Stat cards
  const totalPaid = invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + Number(i.amount), 0)
  const avgProgress = projects.length ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length) : 0

  const cards = [
    { label: 'Total Clients',   value: clients.length,                      icon: '🧑‍💼', color: '#7c3aed' },
    { label: 'Total Projects',  value: projects.length,                     icon: '📁',   color: '#2563eb' },
    { label: 'Invoices Sent',   value: invoices.length,                     icon: '🧾',   color: '#059669' },
    { label: 'Total Paid',      value: `PKR ${totalPaid.toLocaleString()}`, icon: '💰',   color: '#d97706' },
    { label: 'Avg Progress',    value: `${avgProgress}%`,                   icon: '📈',   color: '#7c3aed' },
  ]

  // Monthly revenue — last 6 months
  const now = new Date()
  const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    const month = d.getMonth()
    const year = d.getFullYear()
    const total = invoices
      .filter(inv => {
        if (inv.status !== 'Paid' || !inv.date) return false
        const id = new Date(inv.date)
        return id.getMonth() === month && id.getFullYear() === year
      })
      .reduce((sum, inv) => sum + Number(inv.amount), 0)
    return { month: MONTHS[month], total }
  })

  // Project status pie
  const statusCount = {
    'In Progress': projects.filter(p => p.status === 'In Progress').length,
    'Completed':   projects.filter(p => p.status === 'Completed').length,
    'On Hold':     projects.filter(p => p.status === 'On Hold').length,
  }
  const pieData = [
    { name: 'In Progress', value: statusCount['In Progress'], color: '#2563eb' },
    { name: 'Completed',   value: statusCount['Completed'],   color: '#059669' },
    { name: 'On Hold',     value: statusCount['On Hold'],     color: '#d97706' },
  ].filter(d => d.value > 0)

  // Upcoming deadlines — next 7 days
  const today = new Date(); today.setHours(0,0,0,0)
  const in7 = new Date(today); in7.setDate(today.getDate() + 7)

  type DeadlineItem = { name: string; date: Date; type: string }
  const deadlines: DeadlineItem[] = []

  clients.forEach(c => {
    if (!c.deadline) return
    const d = new Date(c.deadline)
    if (d >= today && d <= in7) deadlines.push({ name: c.name, date: d, type: 'Client' })
  })
  projects.forEach(p => {
    if (!p.deadline) return
    const d = new Date(p.deadline)
    if (d >= today && d <= in7) deadlines.push({ name: p.title, date: d, type: 'Project' })
  })
  deadlines.sort((a, b) => a.date.getTime() - b.date.getTime())

  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)

  const deadlineColor = (date: Date) => {
    if (date.toDateString() === today.toDateString())     return { bg: 'bg-red-50',    text: 'text-red-600',    label: 'Today' }
    if (date.toDateString() === tomorrow.toDateString())  return { bg: 'bg-orange-50', text: 'text-orange-600', label: 'Tomorrow' }
    return { bg: 'bg-yellow-50', text: 'text-yellow-600', label: date.toLocaleDateString('en-PK', { weekday: 'short', day: 'numeric', month: 'short' }) }
  }

  // Top clients by revenue
  const clientRevenue = clients.map(c => ({
    name: c.name,
    total: invoices.filter(i => i.client === c.name && i.status === 'Paid').reduce((sum, i) => sum + Number(i.amount), 0)
  })).sort((a, b) => b.total - a.total).slice(0, 5)

  const maxRevenue = clientRevenue[0]?.total || 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:ml-0 ml-12">
        <h1 className="text-3xl font-extrabold gradient-text">Welcome to ClientPro Pro 👋</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Here's what's happening with your business today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {loaded ? cards.map(({ label, value, icon, color }) => (
          <div key={label} className="glass card-hover rounded-2xl p-5" style={{ borderLeft: `4px solid ${color}` }}>
            <div className="text-3xl mb-3">{icon}</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
          </div>
        )) : cards.map((_, i) => <StatCardSkeleton key={i} />)}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-base font-bold text-gray-800 dark:text-white mb-4">💰 Monthly Revenue (Last 6 Months)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyRevenue} barSize={32}>
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [`PKR ${Number(v).toLocaleString()}`, 'Revenue']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="total" fill="#7c3aed" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-base font-bold text-gray-800 dark:text-white mb-4">📁 Project Status</h2>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Koi project nahi!</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Legend iconType="circle" iconSize={8} formatter={(value) => <span style={{ fontSize: '12px', color: '#6b7280' }}>{value}</span>} />
                <Tooltip formatter={(v) => [v, 'Projects']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-base font-bold text-gray-800 dark:text-white mb-4">📅 Upcoming Deadlines (7 Days)</h2>
          {deadlines.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">Koi deadline nahi 🎉</div>
          ) : (
            <div className="space-y-3">
              {deadlines.map((d, i) => {
                const dc = deadlineColor(d.date)
                return (
                  <div key={i} className={`flex items-center justify-between px-4 py-3 rounded-xl ${dc.bg}`}>
                    <div>
                      <div className={`text-sm font-semibold ${dc.text}`}>{d.name}</div>
                      <div className="text-xs text-gray-400">{d.type}</div>
                    </div>
                    <span className={`text-xs font-bold ${dc.text}`}>{dc.label}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Top Clients */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-base font-bold text-gray-800 dark:text-white mb-4">🏆 Top Clients by Revenue</h2>
          {clientRevenue.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">Koi paid invoice nahi!</div>
          ) : (
            <div className="space-y-4">
              {clientRevenue.map((c, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-gray-700">{c.name}</span>
                    <span className="text-gray-500">PKR {c.total.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${(c.total / maxRevenue) * 100}%`, backgroundColor: '#7c3aed' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
