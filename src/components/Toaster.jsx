// src/components/Toaster.jsx
import { createContext, useCallback, useContext, useState } from 'react'

const ToastCtx = createContext(null)

export function ToasterProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const add = useCallback((toast) => {
    const id = toast.id || Math.random().toString(36).slice(2)
    const t = {
      id,
      title: toast.title || '',
      message: toast.message || '',
      variant: toast.variant || 'info', // 'info' | 'success' | 'danger' | 'warn'
      timeout: typeof toast.timeout === 'number' ? toast.timeout : 3000
    }
    setToasts(prev => [...prev, t])
    if (t.timeout) {
      setTimeout(() => {
        setToasts(prev => prev.filter(x => x.id !== id))
      }, t.timeout)
    }
  }, [])

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const api = {
    toast: (message, opts = {}) => add({ message, ...opts }),
    success: (message, opts = {}) => add({ message, variant: 'success', ...opts }),
    error: (message, opts = {}) => add({ message, variant: 'danger', ...opts }),
    info: (message, opts = {}) => add({ message, variant: 'info', ...opts }),
    warn: (message, opts = {}) => add({ message, variant: 'warn', ...opts }),
  }

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="toast-viewport" role="status" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.variant}`}>
            <div className="toast-body">
              {t.title ? <div className="toast-title">{t.title}</div> : null}
              <div className="toast-message">{t.message}</div>
            </div>
            <button
              className="toast-close"
              aria-label="Close"
              onClick={() => remove(t.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast must be used within <ToasterProvider>')
  return ctx
}
