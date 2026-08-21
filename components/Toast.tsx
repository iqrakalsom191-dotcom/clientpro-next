'use client'

import { useEffect } from 'react'

type ToastProps = {
  message: string
  type: 'success' | 'error'
  onClose: () => void
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      style={{ zIndex: 9999 }}
      className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-semibold flex items-center gap-3 transition-all duration-300 ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
      }`}
    >
      <span>{type === 'success' ? '✅' : '🗑'}</span>
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">✕</button>
    </div>
  )
}
