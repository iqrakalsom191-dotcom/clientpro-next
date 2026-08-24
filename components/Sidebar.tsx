'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useDarkMode } from '@/context/DarkModeContext'
import { useApp } from '@/context/AppContext'

const navItems = [
  { href: '/',         label: 'Dashboard', icon: '📊' },
  { href: '/clients',  label: 'Clients',   icon: '🧑‍💼' },
  { href: '/projects', label: 'Projects',  icon: '📁' },
  { href: '/invoices', label: 'Invoices',  icon: '🧾' },
  { href: '/settings', label: 'Settings',  icon: '⚙️' },
]

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { isDark, toggle } = useDarkMode()
  const { logout } = useApp()

  const close = () => setIsOpen(false)

  return (
    <>
      {/* Hamburger — mobile only */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-[60] w-10 h-10 rounded-lg text-white flex items-center justify-center text-xl shadow-lg"
        style={{ backgroundColor: '#7c3aed' }}
      >
        ☰
      </button>

      {/* Overlay — mobile only */}
      {isOpen && (
        <div
          onClick={close}
          className="md:hidden fixed inset-0 z-[70] bg-black/60"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static top-0 left-0 h-full md:h-auto
          w-60 min-h-screen flex flex-col py-6
          z-[80] transition-transform duration-300 ease-in-out
          sidebar-gradient
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Logo + Close button */}
        <div className="px-6 pb-8 flex items-center justify-between">
          <div>
            <h1 className="text-white text-lg font-bold">
              <span style={{ color: '#c4b5fd' }}>Client</span>Pro Pro
            </h1>
            <p className="text-purple-300 text-xs mt-1">Project Manager</p>
          </div>
          <button
            onClick={close}
            className="md:hidden text-white text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1">
          {navItems.map(({ href, label, icon }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                onClick={close}
                className={`
                  flex items-center gap-3 px-6 py-3 text-sm font-medium
                  transition-all duration-200 mr-4 rounded-r-xl
                  ${isActive
                    ? 'text-white bg-white/20'
                    : 'text-purple-200 hover:text-white hover:bg-white/10'
                  }
                `}
              >
                <span className="text-lg">{icon}</span>
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 pt-4 border-t border-white/10 space-y-3">
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-lg text-purple-200 hover:text-white hover:bg-white/10 transition-all"
              title="Toggle Dark Mode"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <span className="text-purple-300 text-xs">v1.0</span>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium text-red-300 bg-red-500/10 hover:text-white hover:bg-red-500/20 border border-red-500/20 transition-all"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>
    </>
  )
}
