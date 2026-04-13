import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Btn, Card, Modal, Field, Avatar, Badge, useToast } from '../components/UI'
import { useAuth } from '../hooks/useAuth'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [gameStats, setGameStats] = useState({})
  const { user: authUser } = useAuth()
  const { show, Toast } = useToast()

  useEffect(() => { fetchUsers() }, [])

  async function fetchUsers() {
    setLoading(true)
    const { data: profiles } = await supabase.from('profiles').select('*').order('name')
    const { data: games } = await supabase.from('boardgames').select('housing_user_id')
    const { data: shares } = await supabase.from('ownership_shares').select('user_id, percentage')

    const stats = {}
    if (profiles) {
      for (const p of profiles) {
        stats[p.id] = {
          housing: (games || []).filter(g => g.housing_user_id === p.id).length,
          shares: (shares || []).filter(s => s.user_id === p.id),
        }
        stats[p.id].totalOwned = stats[p.id].shares.reduce((s, x) => s + x.percentage, 0)
      }
    }
    setGameStats(stats)
    setUsers(profiles || [])
    setLoading(false)
  }

  return (
    <div className="animate-in">
      <Toast />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '36px' }}>Members</h1>
          <p style={{ color: 'var(--text3)', marginTop: '6px' }}>{users.length} member{users.length !== 1 ? 's' : ''} in the library</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {users.map((u, i) => {
            const stats = gameStats[u.id] || {}
            const isMe = u.id === authUser?.id
            return (
              <Card key={u.id} style={{ animation: `fadeIn 0.4s ease ${i * 0.07}s both` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                  <Avatar name={u.name} url={u.avatar_url} size={50} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {u.name}
                      </h3>
                      {isMe && <Badge color="gold">You</Badge>}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                  <StatBox label="Housed" value={stats.housing || 0} icon="📦" />
                  <StatBox label="Shared" value={stats.shares?.length || 0} icon="🎲" />
                </div>

                {isMe && (
                  <Btn variant="ghost" size="sm" style={{ width: '100%' }}
                    onClick={() => { setEditUser(u); setShowForm(true) }}>
                    ✎ Edit My Profile
                  </Btn>
                )}
              </Card>
            )
          })}
        </div>
      )}

      <UserForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditUser(null) }}
        user={editUser}
        onSaved={() => { fetchUsers(); show('Profile updated!') }}
      />
    </div>
  )
}

function StatBox({ label, value, icon }) {
  return (
    <div style={{
      background: 'var(--bg3)', borderRadius: 8, padding: '10px 12px',
      textAlign: 'center', border: '1px solid var(--border)'
    }}>
      <div style={{ fontSize: 18, marginBottom: 2 }}>{icon}</div>
      <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--gold)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: 2 }}>{label}</div>
    </div>
  )
}

function UserForm({ open, onClose, user, onSaved }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) setName(user.name || '')
  }, [user])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required'); return }
    setLoading(true); setError('')
    const { error } = await supabase.from('profiles').update({ name }).eq('id', user.id)
    if (error) setError(error.message)
    else { onSaved(); onClose() }
    setLoading(false)
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Profile" width={420}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <Avatar name={user?.name} url={user?.avatar_url} size={64} />
        </div>
        <Field label="Display Name" error={error}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required />
        </Field>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn type="submit" loading={loading}>Save</Btn>
        </div>
      </form>
    </Modal>
  )
}
