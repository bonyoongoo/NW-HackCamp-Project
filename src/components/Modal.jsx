// src/components/Modal.jsx
import { useEffect } from 'react'

export default function Modal({ open, onClose, title, children, wide=false }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', onKey)
    // lock scroll
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modal-backdrop" onClick={(e) => {
      if (e.target === e.currentTarget) onClose?.()
    }}>
      <div className={`modal-panel ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={title || 'Dialog'}>
        {title ? <div className="modal-title">{title}</div> : null}
        <div className="modal-body">
          {children}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
