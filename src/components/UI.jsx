import { useState } from 'react'

export function Btn({ children, variant = 'primary', size = 'md', loading, disabled, onClick, type = 'button', style }) {
  const styles = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: '8px', border: 'none', cursor: disabled || loading ? 'not-allowed' : 'pointer',
    fontFamily: 'var(--font-body)', fontWeight: 500, borderRadius: 'var(--radius)',
    transition: 'all 0.18s ease', opacity: disabled ? 0.5 : 1,
    padding: size === 'sm' ? '7px 14px' : size === 'lg' ? '14px 28px' : '10px 20px',
    fontSize: size === 'sm' ? '13px' : size === 'lg' ? '16px' : '14px',
    ...(variant === 'primary' ? {
      background: 'linear-gradient(135deg, var(--gold), var(--gold2))',
      color: '#1a1600',
    } : variant === 'ghost' ? {
      background: 'transparent', color: 'var(--text2)',
      border: '1px solid var(--border)',
    } : variant === 'danger' ? {
      background: 'var(--red)', color: '#fff',
    } : {
      background: 'var(--surface2)', color: 'var(--text)',
    }),
    ...style
  }

  return (
    <button type={type} style={styles} disabled={disabled || loading} onClick={onClick}
      onMouseEnter={e => { if (!disabled && !loading) e.currentTarget.style.filter = 'brightness(1.1)' }}
      onMouseLeave={e => { e.currentTarget.style.filter = '' }}>
      {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : children}
    </button>
  )
}

export function Card({ children, style, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: 'var(--bg2)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'border-color 0.2s, transform 0.2s',
      ...style
    }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.transform = 'translateY(-2px)' } }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = '' }}>
      {children}
    </div>
  )
}

export function Modal({ open, onClose, title, children, width = 520 }) {
  if (!open) return null
  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000000cc', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: width,
        maxHeight: '90vh', overflow: 'auto', padding: '28px',
        animation: 'fadeIn 0.2s ease', boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--text)' }}>{title}</h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer',
            fontSize: '22px', lineHeight: 1, padding: '4px'
          }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Field({ label, error, children, hint }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      {label && <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text2)', fontWeight: 500 }}>{label}</label>}
      {children}
      {hint && <p style={{ marginTop: '4px', fontSize: '12px', color: 'var(--text3)' }}>{hint}</p>}
      {error && <p style={{ marginTop: '4px', fontSize: '12px', color: 'var(--red)' }}>{error}</p>}
    </div>
  )
}

export function Toast({ message, type = 'success', onClose }) {
  if (!message) return null
  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px', zIndex: 2000,
      background: type === 'error' ? 'var(--red)' : '#1a3a1f',
      border: `1px solid ${type === 'error' ? '#e74c3c' : 'var(--green)'}`,
      color: '#fff', borderRadius: 'var(--radius)', padding: '12px 20px',
      display: 'flex', alignItems: 'center', gap: '12px',
      boxShadow: 'var(--shadow)', animation: 'fadeIn 0.2s ease',
      maxWidth: '360px', fontSize: '14px'
    }}>
      <span>{type === 'error' ? '✕' : '✓'}</span>
      <span>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#ffffff80', cursor: 'pointer', marginLeft: 'auto' }}>✕</button>
    </div>
  )
}

export function Avatar({ name, url, size = 36 }) {
  const initials = name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'
  const hue = name ? (name.charCodeAt(0) * 37) % 360 : 0
  return url ? (
    <img src={url} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} />
  ) : (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `hsl(${hue}, 50%, 30%)`,
      border: `1px solid hsl(${hue}, 50%, 50%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 600, color: `hsl(${hue}, 80%, 85%)`,
      flexShrink: 0, fontFamily: 'var(--font-body)'
    }}>{initials}</div>
  )
}

export function Badge({ children, color = 'gold' }) {
  const colors = {
    gold: { bg: 'var(--gold-dim)', color: 'var(--gold2)', border: '#c9a84c55' },
    green: { bg: '#27ae6022', color: '#2ecc71', border: '#27ae6055' },
    red: { bg: '#c0392b22', color: '#e74c3c', border: '#c0392b55' },
    blue: { bg: '#2980b922', color: '#5dade2', border: '#2980b955' },
  }
  const c = colors[color] || colors.gold
  return (
    <span style={{
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      borderRadius: '6px', padding: '2px 8px', fontSize: '12px', fontWeight: 500
    }}>{children}</span>
  )
}

export function Divider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      {label && <span style={{ fontSize: '12px', color: 'var(--text3)' }}>{label}</span>}
      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = useState(null)
  const show = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }
  const ToastComp = () => toast ? <Toast {...toast} onClose={() => setToast(null)} /> : null
  return { show, Toast: ToastComp }
}
