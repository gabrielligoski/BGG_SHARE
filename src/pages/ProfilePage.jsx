import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { Btn, Field, Card, Avatar, useToast } from '../components/UI'
import { useNavigate } from 'react-router-dom'

export default function ProfilePage() {
  const { profile, user, fetchProfile, signOut } = useAuth()
  const [name, setName] = useState(profile?.name || '')
  const [password, setPassword] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [loading, setLoading] = useState(false)
  const { show, Toast } = useToast()
  const navigate = useNavigate()

  async function updateProfile(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('profiles').update({ name }).eq('id', user.id)
    if (error) show(error.message, 'error')
    else { show('Profile updated!'); fetchProfile(user.id) }
    setLoading(false)
  }

  async function updatePassword(e) {
    e.preventDefault()
    if (password !== confirmPwd) { show('Passwords do not match', 'error'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) show(error.message, 'error')
    else { show('Password updated!'); setPassword(''); setConfirmPwd('') }
    setLoading(false)
  }

  return (
    <div className="animate-in" style={{ maxWidth: 520 }}>
      <Toast />
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', marginBottom: '28px' }}>My Profile</h1>

      <Card style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <Avatar name={profile?.name} url={profile?.avatar_url} size={60} />
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px' }}>{profile?.name}</div>
            <div style={{ color: 'var(--text3)', fontSize: '13px' }}>{user?.email}</div>
          </div>
        </div>
        <form onSubmit={updateProfile}>
          <Field label="Display Name">
            <input value={name} onChange={e => setName(e.target.value)} required />
          </Field>
          <Btn type="submit" loading={loading}>Update Name</Btn>
        </form>
      </Card>

      <Card>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', marginBottom: '16px' }}>Change Password</h3>
        <form onSubmit={updatePassword}>
          <Field label="New Password">
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required />
          </Field>
          <Field label="Confirm Password">
            <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} required />
          </Field>
          <Btn type="submit" loading={loading}>Update Password</Btn>
        </form>
      </Card>
    </div>
  )
}
