'use client'

import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import Sidebar from '@/components/Sidebar'

const AUTH_PATHS = ['/login', '/signup']

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = AUTH_PATHS.includes(pathname)

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="app-wrapper">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  )
}
