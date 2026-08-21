'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type DarkModeContextType = {
  isDark: boolean
  toggle: () => void
}

const DarkModeContext = createContext<DarkModeContextType | null>(null)

export function DarkModeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('cp_darkmode')
    if (saved === 'true') {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggle = () => {
    setIsDark(prev => {
      const next = !prev
      localStorage.setItem('cp_darkmode', String(next))
      if (next) document.documentElement.classList.add('dark')
      else document.documentElement.classList.remove('dark')
      return next
    })
  }

  return (
    <DarkModeContext.Provider value={{ isDark, toggle }}>
      {children}
    </DarkModeContext.Provider>
  )
}

export function useDarkMode() {
  const ctx = useContext(DarkModeContext)
  if (!ctx) throw new Error('useDarkMode must be used within DarkModeProvider')
  return ctx
}
