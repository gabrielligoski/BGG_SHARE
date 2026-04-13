import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Btn, Card, Badge, Avatar, useToast } from '../components/UI'
import GameForm from '../components/GameForm'

const DICE = ['⚀','⚁','⚂','⚃','⚄','⚅']

export default function HomePage() {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterUser, setFilterUser] = useState('')
  const [users, setUsers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editGame, setEditGame] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const { show, Toast } = useToast()

  useEffect(() => { fetchGames(); fetchUsers() }, [])

  async function fetchGames() {
    setLoading(true)
    const { data, error } = await supabase
      .from('boardgames')
      .select(`*, housing:profiles!housing_user_id(id, name, avatar_url), ownership_shares(percentage, profiles(id, name, avatar_url))`)
      .order('created_at', { ascending: false })
    if (!error) setGames(data || [])
    setLoading(false)
  }

  async function fetchUsers() {
    const { data } = await supabase.from('profiles').select('*').order('name')
    setUsers(data || [])
  }

  async function deleteGame(id) {
    setDeleting(id)
    const { error } = await supabase.from('boardgames').delete().eq('id', id)
    if (error) show(error.message, 'error')
    else { show('Game removed'); fetchGames() }
    setDeleting(null)
  }

  const filtered = games.filter(g => {
    const matchSearch = !search || g.title.toLowerCase().includes(search.toLowerCase())
    const matchUser = !filterUser || g.housing_user_id === filterUser
    return matchSearch && matchUser
  })

  const totalValue = games.reduce((s, g) => s + (g.bought_price || 0), 0)

  return (
    <div className="animate-in">
      <Toast />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', color: 'var(--text)', lineHeight: 1.1 }}>
            Game Library
          </h1>
          <p style={{ color: 'var(--text3)', marginTop: '6px' }}>
            {games.length} game{games.length !== 1 ? 's' : ''} · Total value: R$ {totalValue.toFixed(2)}
          </p>
        </div>
        <Btn onClick={() => { setEditGame(null); setShowForm(true) }} size="lg">
          + Add Game
        </Btn>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <input
          placeholder="🔍  Search games..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 260 }}
        />
        <select value={filterUser} onChange={e => setFilterUser(e.target.value)} style={{ maxWidth: 200 }}>
          <option value="">All locations</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        {(search || filterUser) && (
          <Btn variant="ghost" size="sm" onClick={() => { setSearch(''); setFilterUser('') }}>Clear</Btn>
        )}
      </div>

      {/* Stats bar */}
      {users.length > 0 && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '28px', flexWrap: 'wrap' }}>
          {users.map(u => {
            const count = games.filter(g => g.housing_user_id === u.id).length
            return (
              <div key={u.id} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: '8px', padding: '6px 12px'
              }}>
                <Avatar name={u.name} url={u.avatar_url} size={22} />
                <span style={{ fontSize: '13px', color: 'var(--text2)' }}>{u.name}</span>
                <Badge color="gold">{count}</Badge>
              </div>
            )
          })}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>⬡</div>
          <p style={{ color: 'var(--text3)', fontSize: '16px' }}>
            {search || filterUser ? 'No games match your filters' : 'No games yet — add your first one!'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filtered.map((game, i) => (
            <GameCard
              key={game.id}
              game={game}
              index={i}
              onEdit={() => { setEditGame(game); setShowForm(true) }}
              onDelete={() => deleteGame(game.id)}
              deleting={deleting === game.id}
            />
          ))}
        </div>
      )}

      <GameForm
        open={showForm}
        onClose={() => setShowForm(false)}
        game={editGame}
        onSaved={fetchGames}
      />
    </div>
  )
}

function GameCard({ game, index, onEdit, onDelete, deleting }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const dice = DICE[index % 6]
  const shares = game.ownership_shares || []

  return (
    <Card style={{ padding: 0, overflow: 'hidden', animation: `fadeIn 0.4s ease ${index * 0.05}s both` }}>
      {/* Image */}
      <div style={{ position: 'relative', height: 160, background: 'var(--bg3)', overflow: 'hidden' }}>
        {game.image_url ? (
          <img src={game.image_url} alt={game.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{
            width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--bg3), var(--surface))',
            fontSize: 52, opacity: 0.4
          }}>{dice}</div>
        )}
        {/* Price badge */}
        <div style={{
          position: 'absolute', top: 10, right: 10,
          background: '#000000cc', borderRadius: 6, padding: '4px 8px',
          fontSize: '12px', color: 'var(--gold)', fontWeight: 600,
          backdropFilter: 'blur(8px)'
        }}>
          R$ {Number(game.bought_price || 0).toFixed(2)}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', marginBottom: '6px', color: 'var(--text)' }}>
          {game.title}
        </h3>
        {game.description && (
          <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '12px', lineHeight: 1.5,
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
          }}>{game.description}</p>
        )}

        {/* Housing */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text3)' }}>📦 Housed at:</span>
          {game.housing ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Avatar name={game.housing.name} url={game.housing.avatar_url} size={20} />
              <span style={{ fontSize: '13px', color: 'var(--text2)', fontWeight: 500 }}>{game.housing.name}</span>
            </div>
          ) : (
            <span style={{ fontSize: '13px', color: 'var(--text3)', fontStyle: 'italic' }}>Not set</span>
          )}
        </div>

        {/* Ownership shares */}
        {shares.length > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <div style={{
              display: 'flex', borderRadius: '6px', overflow: 'hidden', height: '6px', marginBottom: '6px'
            }}>
              {shares.map((s, i) => (
                <div key={i} style={{
                  width: `${s.percentage}%`, height: '100%',
                  background: `hsl(${(s.profiles?.name?.charCodeAt(0) * 37 || i * 60) % 360}, 60%, 55%)`,
                }} />
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {shares.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Avatar name={s.profiles?.name} size={16} />
                  <span style={{ fontSize: '11px', color: 'var(--text3)' }}>
                    {s.profiles?.name?.split(' ')[0]} {s.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
          <Btn variant="secondary" size="sm" onClick={onEdit} style={{ flex: 1 }}>✎ Edit</Btn>
          {confirmDelete ? (
            <>
              <Btn variant="danger" size="sm" loading={deleting} onClick={() => { onDelete(); setConfirmDelete(false) }}>Confirm</Btn>
              <Btn variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>No</Btn>
            </>
          ) : (
            <Btn variant="ghost" size="sm" onClick={() => setConfirmDelete(true)} style={{ color: 'var(--red)', borderColor: 'transparent' }}>✕</Btn>
          )}
        </div>
      </div>
    </Card>
  )
}
