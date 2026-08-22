'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Client = {
  id: string
  name: string
  email: string
  phone: string
  service: string
  budget: string
  progress?: number
  tasks?: { id: string; text: string; done: boolean }[]
  deadline: string
  status: 'Pending' | 'In Progress' | 'Done'
  notes: string
}

type Project = {
  id: string
  title: string
  client: string
  status: 'In Progress' | 'Completed' | 'On Hold'
  deadline: string
  budget: string
  progress?: number
  tasks?: { id: string; text: string; done: boolean }[]
}

type Invoice = {
  id: string
  number: string
  client: string
  project: string
  amount: string
  status: 'Paid' | 'Unpaid' | 'Overdue'
  date: string
}

type AppContextType = {
  clients: Client[]
  projects: Project[]
  invoices: Invoice[]
  addClient: (client: Omit<Client, 'id'>) => void
  deleteClient: (id: string) => void
  updateClient: (id: string, data: Omit<Client, "id">) => void
  addProject: (project: Omit<Project, 'id'>) => void
  deleteProject: (id: string) => void
  updateProject: (id: string, data: Partial<Project>) => void
  addInvoice: (invoice: Omit<Invoice, 'id' | 'number'>) => void
  deleteInvoice: (id: string) => void
  updateInvoice: (id: string, data: Partial<Invoice>) => void
}

const AppContext = createContext<AppContextType | null>(null)

function loadFromStorage<T>(key: string): T[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loaded, setLoaded] = useState(false)

  // Load from localStorage once on mount
  useEffect(() => {
    setClients(loadFromStorage<Client>('cp_clients'))
    setProjects(loadFromStorage<Project>('cp_projects'))
    setInvoices(loadFromStorage<Invoice>('cp_invoices'))
    setLoaded(true)
  }, [])

  // Save to localStorage on change (only after initial load)
  useEffect(() => {
    if (!loaded) return
    localStorage.setItem('cp_clients', JSON.stringify(clients))
  }, [clients, loaded])

  useEffect(() => {
    if (!loaded) return
    localStorage.setItem('cp_projects', JSON.stringify(projects))
  }, [projects, loaded])

  useEffect(() => {
    if (!loaded) return
    localStorage.setItem('cp_invoices', JSON.stringify(invoices))
  }, [invoices, loaded])

  const addClient = (client: Omit<Client, 'id'>) => {
    setClients(prev => [...prev, { ...client, id: Date.now().toString() }])
  }

  const updateClient = (id: string, data: Omit<Client, "id">) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...data } : c))
  }

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id))
  }

  const addProject = (project: Omit<Project, 'id'>) => {
    setProjects(prev => [...prev, { ...project, id: Date.now().toString(), progress: 0, tasks: [] }])
  }

  const updateProject = (id: string, data: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...data } : p))
  }

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  const addInvoice = (invoice: Omit<Invoice, 'id' | 'number'>) => {
    setInvoices(prev => {
      const number = `INV-${String(prev.length + 1).padStart(3, '0')}`
      return [...prev, { ...invoice, id: Date.now().toString(), number }]
    })
  }

  const updateInvoice = (id: string, data: Partial<Invoice>) => {
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, ...data } : i))
  }

  const deleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(i => i.id !== id))
  }

  return (
    <AppContext.Provider value={{
      clients, projects, invoices,
      addClient, deleteClient, updateClient,
      addProject, deleteProject, updateProject,
      addInvoice, deleteInvoice, updateInvoice,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}
