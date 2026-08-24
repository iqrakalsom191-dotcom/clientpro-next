import { Inter } from 'next/font/google'
import './globals.css'
import AppShell from '@/components/AppShell'
import { AppProvider } from '@/context/AppContext'
import { DarkModeProvider } from '@/context/DarkModeContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'ClientPro Pro',
  description: 'Client & Project Manager',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DarkModeProvider>
          <AppProvider>
            <AppShell>{children}</AppShell>
          </AppProvider>
        </DarkModeProvider>
      </body>
    </html>
  )
}
