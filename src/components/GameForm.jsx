import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Modal, Btn, Field, useToast } from './UI'

export default function GameForm({ open, onClose, game, onSaved }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [boughtPrice, setBoughtPrice] = useState('')
  const [housingUserId, setHousingUserId] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [shares, setShares] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const { show, Toast } = useToast()

  useEffect(() => {
    fetchUsers()
    if (game) {
      setTitle(game.title || '')
      setDescription(game.description || '')
      setBoughtPrice(game.bought_price || '')
      setHousingUserId(game.housing_user_id || '')
      setImagePreview(game.image_url || '')
      fetchShares(game.id)
    } else {
      resetForm()
    }
  }, [game, open])

  async function fetchUsers() {
    const { data } = await supabase.from('profiles').select('*').order('name')
    setUsers(data || [])
    if (!game && data?.length) {
      setShares(data.map(u => ({ user_id: u.id, name: u.name, percentage: 0 })))
    }
  }

  async function fetchShares(gameId) {
    const { data } = await supabase.from('ownership_shares').select('*, profiles(name)').eq('boardgame_id', gameId)
    const { data: users } = await supabase.from('profiles').select('*').order('name')
    if (users) {
      setShares(users.map(u => {
        const existing = data?.find(s => s.user_id === u.id)
        return { user_id: u.id, name: u.name, percentage: existing?.percentage || 0 }
      }))
    }
  }

  function resetForm() {
    setTitle(''); setDescription(''); setBoughtPrice('')
    setHousingUserId(''); setImageFile(null); setImagePreview('')
    setShares([])
  }

  function handleImageChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function updateShare(userId, val) {
    setShares(prev => prev.map(s => s.user_id === userId ? { ...s, percentage: Number(val) } : s))
  }

  const totalPct = shares.reduce((s, x) => s + (Number(x.percentage) || 0), 0)

  async function uploadImage() {
    if (!imageFile) return null
    const ext = imageFile.name.split('.').pop()
    const path = `games/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('game-images').upload(path, imageFile)
    if (error) throw error
    const { data } = supabase.storage.from('game-images').getPublicUrl(path)
    return data.publicUrl
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (totalPct !== 100 && shares.some(s => s.percentage > 0)) {
      if (totalPct !== 0) { show('Ownership percentages must add up to 100%', 'error'); return }
    }
    setLoading(true)
    try {
      let imageUrl = game?.image_url || null
      if (imageFile) imageUrl = await uploadImage()

      const payload = {
        title, description,
        bought_price: parseFloat(boughtPrice) || 0,
        housing_user_id: housingUserId || null,
        image_url: imageUrl,
        updated_at: new Date().toISOString()
      }

      let gameId = game?.id
      if (game) {
        await supabase.from('boardgames').update(payload).eq('id', game.id)
      } else {
        const { data, error } = await supabase.from('boardgames').insert(payload).select().single()
        if (error) throw error
        gameId = data.id
      }

      // Update shares
      await supabase.from('ownership_shares').delete().eq('boardgame_id', gameId)
      const validShares = shares.filter(s => s.percentage > 0)
      if (validShares.length) {
        await supabase.from('ownership_shares').insert(
          validShares.map(s => ({ boardgame_id: gameId, user_id: s.user_id, percentage: s.percentage }))
        )
      }

      // Log housing change
      if (housingUserId) {
        await supabase.from('housing_history').insert({ boardgame_id: gameId, user_id: housingUserId })
      }

      show(game ? 'Game updated!' : 'Game added!')
      onSaved()
      onClose()
    } catch (err) {
      show(err.message, 'error')
    }
    setLoading(false)
  }

  return (
    <>
      <Toast />
      <Modal open={open} onClose={onClose} title={game ? 'Edit Game' : 'Add Game'} width={580}>
        <form onSubmit={handleSubmit}>
          {/* Image upload */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', color: 'var(--text2)', fontWeight: 500, display: 'block', marginBottom: '8px' }}>Game Image</label>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              {imagePreview && (
                <img src={imagePreview} alt="preview" style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border)' }} />
              )}
              <label style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                width: 80, height: 80, border: '1.5px dashed var(--border)', borderRadius: 8,
                cursor: 'pointer', color: 'var(--text3)', fontSize: '12px', gap: 4,
                transition: 'border-color 0.2s'
              }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                <span style={{ fontSize: 22 }}>⊕</span>
                <span>{imagePreview ? 'Change' : 'Upload'}</span>
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
              </label>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Field label="Title" style={{ gridColumn: '1 / -1' }}>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Pandemic, Catan..." required />
            </Field>
            <Field label="Description" style={{ gridColumn: '1 / -1' }}>
              <textarea value={description} onChange={e => setDescription(e.target.value)}
                rows={2} placeholder="Brief description..." style={{ resize: 'vertical' }} />
            </Field>
            <Field label="Purchase Price (R$)">
              <input type="number" step="0.01" min="0" value={boughtPrice}
                onChange={e => setBoughtPrice(e.target.value)} placeholder="0.00" />
            </Field>
            <Field label="Currently Housed At">
              <select value={housingUserId} onChange={e => setHousingUserId(e.target.value)}>
                <option value="">— Not set —</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </Field>
          </div>

          {/* Ownership shares */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text2)', fontWeight: 500 }}>Ownership Shares</label>
              <span style={{
                fontSize: '12px', fontWeight: 600,
                color: totalPct === 100 ? 'var(--green)' : totalPct > 100 ? 'var(--red)' : 'var(--text3)'
              }}>{totalPct}% / 100%</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {shares.map(s => (
                <div key={s.user_id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ flex: 1, fontSize: '14px', color: 'var(--text2)' }}>{s.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input type="range" min={0} max={100} value={s.percentage}
                      onChange={e => updateShare(s.user_id, e.target.value)}
                      style={{ width: 100, accentColor: 'var(--gold)' }} />
                    <input type="number" min={0} max={100} value={s.percentage}
                      onChange={e => updateShare(s.user_id, e.target.value)}
                      style={{ width: 56, textAlign: 'center', padding: '6px 8px' }} />
                    <span style={{ fontSize: '13px', color: 'var(--text3)', width: 12 }}>%</span>
                  </div>
                </div>
              ))}
            </div>
            {shares.length === 0 && <p style={{ fontSize: '13px', color: 'var(--text3)' }}>Add members first to set ownership</p>}
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
            <Btn type="submit" loading={loading}>{game ? 'Save Changes' : 'Add Game'}</Btn>
          </div>
        </form>
      </Modal>
    </>
  )
}
