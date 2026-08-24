'use client'

import { useState, useEffect, useCallback, FormEvent } from 'react'
import { useApp } from '@/context/AppContext'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import Toast from '@/components/Toast'

const supabase = createBrowserSupabaseClient()

const CURRENCIES = ['PKR', 'USD', 'EUR', 'GBP', 'AED'] as const
type Currency = typeof CURRENCIES[number]

export default function SettingsPage() {
  const { user, logout } = useApp()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const closeToast = useCallback(() => setToast(null), [])

  // Profile
  const [displayName, setDisplayName] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  // Preferences
  const [currency, setCurrency] = useState<Currency>('PKR')
  const [appName, setAppName] = useState('ClientPro Pro')
  const [savingPrefs, setSavingPrefs] = useState(false)

  // Password
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [updatingPassword, setUpdatingPassword] = useState(false)

  const [deletingAccount, setDeletingAccount] = useState(false)

  useEffect(() => {
    setDisplayName((user?.user_metadata as { display_name?: string } | undefined)?.display_name ?? '')
  }, [user])

  useEffect(() => {
    const storedCurrency = localStorage.getItem('currency')
    const storedAppName = localStorage.getItem('appName')
    if (storedCurrency && (CURRENCIES as readonly string[]).includes(storedCurrency)) {
      setCurrency(storedCurrency as Currency)
    }
    if (storedAppName) setAppName(storedAppName)
  }, [])

  const inputCls = 'w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm disabled:opacity-50'
  const labelCls = 'block text-sm font-medium text-purple-200 mb-1.5'

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    const { error } = await supabase.auth.updateUser({
      data: { display_name: displayName },
    })
    setSavingProfile(false)
    setToast(
      error
        ? { message: error.message, type: 'error' }
        : { message: 'Profile saved! ✅', type: 'success' }
    )
  }

  const handleSavePreferences = (e: FormEvent) => {
    e.preventDefault()
    setSavingPrefs(true)
    localStorage.setItem('currency', currency)
    localStorage.setItem('appName', appName)
    setSavingPrefs(false)
    setToast({ message: 'Preferences saved! ✅', type: 'success' })
  }

  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault()

    if (newPassword.length < 6) {
      setToast({ message: 'New password must be at least 6 characters.', type: 'error' })
      return
    }
    if (newPassword !== confirmPassword) {
      setToast({ message: 'New passwords do not match.', type: 'error' })
      return
    }
    if (!user?.email) {
      setToast({ message: 'Could not verify current user.', type: 'error' })
      return
    }

    setUpdatingPassword(true)

    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    })

    if (reauthError) {
      setUpdatingPassword(false)
      setToast({ message: 'Current password is incorrect.', type: 'error' })
      return
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setUpdatingPassword(false)

    if (error) {
      setToast({ message: error.message, type: 'error' })
      return
    }

    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setToast({ message: 'Password updated! ✅', type: 'success' })
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return
    if (!confirm('This will permanently delete all your data. Type-confirm to proceed?')) return

    setDeletingAccount(true)
    const { error } = await supabase.rpc('delete_user')
    setDeletingAccount(false)

    if (error) {
      setToast({ message: error.message || 'Could not delete account.', type: 'error' })
      return
    }

    await logout()
  }

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

      <div className="mb-8 md:ml-0 ml-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">⚙️ Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account and app preferences</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* User Profile */}
        <form onSubmit={handleSaveProfile} className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">👤 User Profile</h2>

          <div>
            <label className={labelCls}>Display Name</label>
            <input
              className={inputCls}
              placeholder="Your name"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
            />
          </div>

          <div>
            <label className={labelCls}>Email</label>
            <input className={inputCls} value={user?.email ?? ''} disabled readOnly />
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="px-6 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-all duration-200 disabled:opacity-60"
            style={{ backgroundColor: '#7c3aed' }}
          >
            {savingProfile ? 'Saving…' : 'Save Profile'}
          </button>
        </form>

        {/* App Preferences */}
        <form onSubmit={handleSavePreferences} className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">🎛️ App Preferences</h2>

          <div>
            <label className={labelCls}>Currency</label>
            <select
              className={inputCls}
              value={currency}
              onChange={e => setCurrency(e.target.value as Currency)}
            >
              {CURRENCIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>App Name</label>
            <input
              className={inputCls}
              placeholder="ClientPro Pro"
              value={appName}
              onChange={e => setAppName(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={savingPrefs}
            className="px-6 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-all duration-200 disabled:opacity-60"
            style={{ backgroundColor: '#7c3aed' }}
          >
            {savingPrefs ? 'Saving…' : 'Save Preferences'}
          </button>
        </form>

        {/* Change Password */}
        <form onSubmit={handleUpdatePassword} className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">🔒 Change Password</h2>

          <div>
            <label className={labelCls}>Current Password</label>
            <input
              type="password"
              className={inputCls}
              placeholder="••••••••"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
            />
          </div>

          <div>
            <label className={labelCls}>New Password</label>
            <input
              type="password"
              className={inputCls}
              placeholder="••••••••"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
          </div>

          <div>
            <label className={labelCls}>Confirm New Password</label>
            <input
              type="password"
              className={inputCls}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={updatingPassword}
            className="px-6 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-all duration-200 disabled:opacity-60"
            style={{ backgroundColor: '#7c3aed' }}
          >
            {updatingPassword ? 'Updating…' : 'Update Password'}
          </button>
        </form>

        {/* Danger Zone */}
        <div className="glass rounded-2xl p-6 space-y-4 border border-red-500/30">
          <h2 className="text-lg font-semibold text-red-400 mb-1">⚠️ Danger Zone</h2>
          <p className="text-sm text-gray-500">
            Deleting your account is permanent and cannot be undone. All your clients,
            projects, and invoices will be lost.
          </p>
          <button
            onClick={handleDeleteAccount}
            disabled={deletingAccount}
            className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-all duration-200 disabled:opacity-60"
          >
            {deletingAccount ? 'Deleting…' : '🗑 Delete Account'}
          </button>
        </div>
      </div>
    </div>
  )
}
