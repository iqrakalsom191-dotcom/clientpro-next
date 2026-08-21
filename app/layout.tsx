import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'
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
            <div className="app-wrapper">
              <Sidebar />
              <main className="main-content">
                {children}
              </main>
            </div>
          </AppProvider>
        </DarkModeProvider>
      </body>
    </html>
  )
}
