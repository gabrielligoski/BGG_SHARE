import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Avatar } from './UI'
import { useState } from 'react'

export default function Layout({ children }) {
  const { user, profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const nav = [
    { to: '/', label: 'Library', icon: '⬡' },
    { to: '/users', label: 'Members', icon: '◈' },
  ]

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: '#0f0e0bdd', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '0 24px',
          display: 'flex', alignItems: 'center', height: 60, gap: '32px'
        }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--gold), var(--gold2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', color: '#1a1600', fontWeight: 900
            }}>⬡</div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--text)', fontWeight: 700 }}>
              BoardVault
            </span>
          </Link>

          {/* Nav links */}
          {user && (
            <nav style={{ display: 'flex', gap: '4px', flex: 1 }}>
              {nav.map(item => (
                <Link key={item.to} to={item.to} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 14px', borderRadius: '8px',
                  fontSize: '14px', fontWeight: 500,
                  color: location.pathname === item.to ? 'var(--gold)' : 'var(--text2)',
                  background: location.pathname === item.to ? 'var(--gold-dim)' : 'transparent',
                  textDecoration: 'none', transition: 'all 0.15s'
                }}>
                  {item.icon} {item.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Right side */}
          {user && profile && (
            <div style={{ marginLeft: 'auto', position: 'relative' }}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: '10px', padding: '6px 12px 6px 6px',
                  cursor: 'pointer', color: 'var(--text2)'
                }}>
                <Avatar name={profile.name} url={profile.avatar_url} size={28} />
                <span style={{ fontSize: '13px', fontWeight: 500 }}>{profile.name}</span>
                <span style={{ fontSize: '10px' }}>▾</span>
              </button>
              {menuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: '100%', marginTop: '6px',
                  background: 'var(--bg2)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)', minWidth: '180px',
                  boxShadow: 'var(--shadow)', overflow: 'hidden', zIndex: 200
                }} onMouseLeave={() => setMenuOpen(false)}>
                  <Link to="/profile" onClick={() => setMenuOpen(false)} style={{
                    display: 'block', padding: '10px 16px', fontSize: '14px',
                    color: 'var(--text2)', textDecoration: 'none',
                    borderBottom: '1px solid var(--border)'
                  }}>⚙ Edit Profile</Link>
                  <button onClick={handleSignOut} style={{
                    display: 'block', width: '100%', padding: '10px 16px',
                    background: 'none', border: 'none', textAlign: 'left',
                    fontSize: '14px', color: 'var(--red)', cursor: 'pointer'
                  }}>→ Sign Out</button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Page content */}
      <main style={{ flex: 1, maxWidth: 1200, width: '100%', margin: '0 auto', padding: '32px 24px' }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)', padding: '20px 24px',
        textAlign: 'center', color: 'var(--text3)', fontSize: '12px'
      }}>
        BoardVault — Shared Game Library
      </footer>
    </div>
  )
}
