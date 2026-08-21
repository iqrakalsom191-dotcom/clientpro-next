'use client'

import { useState, useEffect, useRef } from 'react'
import { useApp } from '@/context/AppContext'
import { useRouter } from 'next/navigation'

export default function GlobalSearch() {
  const { clients, projects, invoices } = useApp()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); setQuery('') }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  const q = query.toLowerCase()

  const results = q.length < 2 ? [] : [
    ...clients.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q))
      .map(c => ({ label: c.name, sub: c.email, icon: '🧑‍💼', href: `/clients/${c.id}` })),
    ...projects.filter(p => p.title.toLowerCase().includes(q) || p.client.toLowerCase().includes(q))
      .map(p => ({ label: p.title, sub: p.client, icon: '📁', href: `/projects/${p.id}` })),
    ...invoices.filter(i => i.client.toLowerCase().includes(q) || i.number.toLowerCase().includes(q))
      .map(i => ({ label: i.number, sub: i.client, icon: '🧾', href: `/invoices/${i.id}` })),
  ].slice(0, 8)

  const go = (href: string) => {
    router.push(href)
    setOpen(false)
    setQuery('')
  }

  return (
    <>
      {/* Search Icon Button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200 text-sm"
      >
        🔍
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50" onClick={() => { setOpen(false); setQuery('') }} />

          {/* Search Box */}
          <div className="relative w-full max-w-lg bg-white dark:bg-[#1a1a2e] rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <span className="text-lg">🔍</span>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search clients, projects, invoices..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="flex-1 text-sm outline-none bg-transparent text-gray-800 dark:text-white placeholder-gray-400"
              />
              <button onClick={() => { setOpen(false); setQuery('') }} className="text-gray-400 hover:text-gray-600 text-xs">ESC</button>
            </div>

            {/* Results */}
            {results.length > 0 && (
              <div className="py-2 max-h-80 overflow-y-auto">
                {results.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => go(r.href)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-150 text-left"
                  >
                    <span className="text-lg">{r.icon}</span>
                    <div>
                      <div className="text-sm font-semibold text-gray-800 dark:text-white">{r.label}</div>
                      <div className="text-xs text-gray-400">{r.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {query.length >= 2 && results.length === 0 && (
              <div className="py-8 text-center text-gray-400 text-sm">Koi result nahi mila!</div>
            )}

            {query.length < 2 && (
              <div className="py-6 text-center text-gray-400 text-xs">Type karo search karne ke liye...</div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
