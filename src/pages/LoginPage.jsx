import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Btn, Field } from '../components/UI'

export default function LoginPage() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setSuccess('')
    setLoading(true)
    if (mode === 'login') {
      const { error } = await signIn(email, password)
      if (error) setError(error.message)
      else navigate('/')
    } else {
      if (!name.trim()) { setError('Name is required'); setLoading(false); return }
      const { error } = await signUp(email, password, name)
      if (error) setError(error.message)
      else setSuccess('Account created! Check your email to confirm.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', background: 'var(--bg)'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none'
      }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: `${200 + i * 80}px`, height: `${200 + i * 80}px`,
            borderRadius: '50%',
            border: '1px solid var(--border)',
            top: `${20 + i * 8}%`, left: `${10 + i * 12}%`,
            opacity: 0.3 - i * 0.04,
          }} />
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420, animation: 'fadeIn 0.5s ease' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--gold), var(--gold2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', color: '#1a1600', fontWeight: 900,
            margin: '0 auto 16px', boxShadow: '0 0 40px var(--gold-dim)'
          }}>⬡</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: 'var(--text)' }}>BoardVault</h1>
          <p style={{ color: 'var(--text3)', marginTop: '6px', fontSize: '14px' }}>Shared boardgame library</p>
        </div>

        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '28px',
          boxShadow: 'var(--shadow-lg)'
        }}>
          {/* Mode tabs */}
          <div style={{
            display: 'flex', background: 'var(--bg3)',
            borderRadius: 'var(--radius)', padding: '3px', marginBottom: '24px'
          }}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setSuccess('') }} style={{
                flex: 1, padding: '8px', borderRadius: '7px', border: 'none',
                background: mode === m ? 'var(--surface2)' : 'transparent',
                color: mode === m ? 'var(--text)' : 'var(--text3)',
                fontWeight: mode === m ? 600 : 400,
                cursor: 'pointer', fontSize: '14px', transition: 'all 0.15s',
                fontFamily: 'var(--font-body)'
              }}>
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <Field label="Your Name">
                <input type="text" placeholder="John Doe" value={name}
                  onChange={e => setName(e.target.value)} required />
              </Field>
            )}
            <Field label="Email">
              <input type="email" placeholder="you@example.com" value={email}
                onChange={e => setEmail(e.target.value)} required />
            </Field>
            <Field label="Password" error={error}>
              <input type="password" placeholder="Min. 6 characters" value={password}
                onChange={e => setPassword(e.target.value)} required minLength={6} />
            </Field>

            {success && (
              <div style={{
                background: '#27ae6022', border: '1px solid #27ae6055',
                borderRadius: 'var(--radius)', padding: '10px 14px',
                color: '#2ecc71', fontSize: '13px', marginBottom: '12px'
              }}>{success}</div>
            )}

            <Btn type="submit" loading={loading} size="lg" style={{ width: '100%', marginTop: '4px' }}>
              {mode === 'login' ? 'Sign In →' : 'Create Account →'}
            </Btn>
          </form>
        </div>
      </div>
    </div>
  )
}
