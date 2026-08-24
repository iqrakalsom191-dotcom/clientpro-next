'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
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
  loading: boolean
  user: User | null
  authLoading: boolean
  login: (email: string, password: string) => Promise<{ error: string | null }>
  signup: (email: string, password: string) => Promise<{ error: string | null }>
  logout: () => Promise<void>
  addClient: (client: Omit<Client, 'id'>) => Promise<void>
  deleteClient: (id: string) => Promise<void>
  updateClient: (id: string, data: Omit<Client, 'id'>) => Promise<void>
  addProject: (project: Omit<Project, 'id'>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  updateProject: (id: string, data: Partial<Project>) => Promise<void>
  addInvoice: (invoice: Omit<Invoice, 'id' | 'number'>) => Promise<void>
  deleteInvoice: (id: string) => Promise<void>
  updateInvoice: (id: string, data: Partial<Invoice>) => Promise<void>
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setAuthLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) {
      return
    }

    async function fetchAll() {
      setLoading(true)
      const [{ data: clientsData }, { data: projectsData }, { data: invoicesData }] =
        await Promise.all([
          supabase.from('clients').select('*').order('created_at', { ascending: false }),
          supabase.from('projects').select('*').order('created_at', { ascending: false }),
          supabase.from('invoices').select('*').order('created_at', { ascending: false }),
        ])
      if (clientsData) setClients(clientsData.map(mapClient))
      if (projectsData) setProjects(projectsData.map(mapProject))
      if (invoicesData) setInvoices(invoicesData.map(mapInvoice))
      setLoading(false)
    }
    fetchAll()
  }, [user])

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    router.push('/')
    router.refresh()
    return { error: null }
  }

  const signup = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: error.message }
    router.push('/')
    router.refresh()
    return { error: null }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setClients([])
    setProjects([])
    setInvoices([])
    router.push('/login')
    router.refresh()
  }

  function mapClient(row: Record<string, unknown>): Client {
    return {
      id: row.id as string,
      name: row.name as string,
      email: (row.email as string) ?? '',
      phone: (row.phone as string) ?? '',
      service: (row.service as string) ?? '',
      budget: (row.budget as string) ?? '',
      progress: (row.progress as number) ?? 0,
      tasks: (row.tasks as Client['tasks']) ?? [],
      deadline: (row.deadline as string) ?? '',
      status: (row.status as Client['status']) ?? 'Pending',
      notes: (row.notes as string) ?? '',
    }
  }

  function mapProject(row: Record<string, unknown>): Project {
    return {
      id: row.id as string,
      title: (row.name as string) ?? '',
      client: (row.client as string) ?? '',
      status: (row.status as Project['status']) ?? 'In Progress',
      deadline: (row.deadline as string) ?? '',
      budget: String(row.budget ?? ''),
      progress: (row.progress as number) ?? 0,
      tasks: (row.tasks as Project['tasks']) ?? [],
    }
  }

  function mapInvoice(row: Record<string, unknown>): Invoice {
    return {
      id: row.id as string,
      number: (row.invoice_number as string) ?? '',
      client: (row.client as string) ?? '',
      project: (row.project as string) ?? '',
      amount: String(row.amount ?? ''),
      status: (row.status as Invoice['status']) ?? 'Unpaid',
      date: (row.due_date as string) ?? '',
    }
  }

  const addClient = async (client: Omit<Client, 'id'>) => {
    const { data, error } = await supabase.from('clients').insert([{
      name: client.name,
      email: client.email,
      phone: client.phone,
      service: client.service,
      budget: client.budget,
      progress: client.progress ?? 0,
      tasks: client.tasks ?? [],
      deadline: client.deadline || null,
      status: client.status,
      notes: client.notes,
    }]).select().single()
    if (!error && data) setClients(prev => [mapClient(data), ...prev])
  }

  const updateClient = async (id: string, data: Omit<Client, 'id'>) => {
    const { error } = await supabase.from('clients').update({
      name: data.name,
      email: data.email,
      phone: data.phone,
      service: data.service,
      budget: data.budget,
      progress: data.progress ?? 0,
      tasks: data.tasks ?? [],
      deadline: data.deadline || null,
      status: data.status,
      notes: data.notes,
    }).eq('id', id)
    if (!error) setClients(prev => prev.map(c => c.id === id ? { ...c, ...data } : c))
  }

  const deleteClient = async (id: string) => {
    const { error } = await supabase.from('clients').delete().eq('id', id)
    if (!error) setClients(prev => prev.filter(c => c.id !== id))
  }

  const addProject = async (project: Omit<Project, 'id'>) => {
    const { data, error } = await supabase.from('projects').insert([{
      name: project.title,
      client: project.client,
      status: project.status,
      deadline: project.deadline || null,
      budget: project.budget,
      progress: project.progress ?? 0,
      tasks: project.tasks ?? [],
    }]).select().single()
    if (!error && data) setProjects(prev => [mapProject(data), ...prev])
  }

  const updateProject = async (id: string, data: Partial<Project>) => {
    const { error } = await supabase.from('projects').update({
      name: data.title,
      client: data.client,
      status: data.status,
      deadline: data.deadline || null,
      budget: data.budget,
      progress: data.progress,
      tasks: data.tasks,
    }).eq('id', id)
    if (!error) setProjects(prev => prev.map(p => p.id === id ? { ...p, ...data } : p))
  }

  const deleteProject = async (id: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (!error) setProjects(prev => prev.filter(p => p.id !== id))
  }

  const addInvoice = async (invoice: Omit<Invoice, 'id' | 'number'>) => {
    const number = `INV-${String(invoices.length + 1).padStart(3, '0')}`
    const { data, error } = await supabase.from('invoices').insert([{
      invoice_number: number,
      client: invoice.client,
      project: invoice.project,
      amount: invoice.amount,
      status: invoice.status,
      due_date: invoice.date || null,
    }]).select().single()
    if (!error && data) setInvoices(prev => [mapInvoice(data), ...prev])
  }

  const updateInvoice = async (id: string, data: Partial<Invoice>) => {
    const { error } = await supabase.from('invoices').update({
      client: data.client,
      project: data.project,
      amount: data.amount,
      status: data.status,
      due_date: data.date || null,
    }).eq('id', id)
    if (!error) setInvoices(prev => prev.map(i => i.id === id ? { ...i, ...data } : i))
  }

  const deleteInvoice = async (id: string) => {
    const { error } = await supabase.from('invoices').delete().eq('id', id)
    if (!error) setInvoices(prev => prev.filter(i => i.id !== id))
  }

  return (
    <AppContext.Provider value={{
      clients, projects, invoices, loading,
      user, authLoading, login, signup, logout,
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
