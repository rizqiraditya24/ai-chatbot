'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AdminPage() {
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editModal, setEditModal] = useState(null)
  const [editName, setEditName] = useState('')
  const [editRole, setEditRole] = useState('user')

  useEffect(() => {
    checkAdminAndLoad()
  }, [])

  const checkAdminAndLoad = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      router.push('/login')
      return
    }

    loadUsers()
  }

  const loadUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  const updateUserStatus = async (userId, status) => {
    await supabase
      .from('profiles')
      .update({ status })
      .eq('id', userId)
    loadUsers()
  }

  const deleteUser = async (userId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus user ini?')) return
    
    // Delete related data first
    await supabase.from('messages').delete().eq('user_id', userId)
    await supabase.from('ai_settings').delete().eq('user_id', userId)
    await supabase.from('profiles').delete().eq('id', userId)
    loadUsers()
  }

  const openEditModal = (user) => {
    setEditModal(user)
    setEditName(user.full_name)
    setEditRole(user.role)
  }

  const saveEdit = async () => {
    await supabase
      .from('profiles')
      .update({ full_name: editName, role: editRole })
      .eq('id', editModal.id)
    setEditModal(null)
    loadUsers()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const stats = {
    total: users.length,
    pending: users.filter(u => u.status === 'pending').length,
    approved: users.filter(u => u.status === 'approved').length,
    admins: users.filter(u => u.role === 'admin').length,
  }

  if (loading) {
    return <div className="full-center"><div className="loading-spinner"></div></div>
  }

  return (
    <div className="admin-page">
      {/* Header */}
      <header className="admin-header">
        <h1>👑 Admin Dashboard</h1>
        <button onClick={handleLogout} className="btn btn-secondary btn-sm">Keluar</button>
      </header>

      {/* Stats */}
      <div className="admin-stats">
        <div className="glass-card stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total User</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-value">{stats.approved}</div>
          <div className="stat-label">Aktif</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-value">{stats.admins}</div>
          <div className="stat-label">Admin</div>
        </div>
      </div>

      {/* Pending Users */}
      {stats.pending > 0 && (
        <>
          <h2 className="admin-section-title">⏳ Menunggu Persetujuan</h2>
          <div className="user-cards" style={{ marginBottom: '32px' }}>
            {users.filter(u => u.status === 'pending').map(user => (
              <div key={user.id} className="glass-card user-card">
                <div className="user-card-header">
                  <div className="user-card-info">
                    <h3>{user.full_name}</h3>
                    <p>{user.email}</p>
                  </div>
                  <span className="badge badge-pending">Pending</span>
                </div>
                <div className="user-card-actions">
                  <button onClick={() => updateUserStatus(user.id, 'approved')} className="btn btn-success btn-sm">
                    ✓ Setujui
                  </button>
                  <button onClick={() => updateUserStatus(user.id, 'rejected')} className="btn btn-danger btn-sm">
                    ✕ Tolak
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* All Users */}
      <h2 className="admin-section-title">👥 Semua User</h2>
      <div className="user-cards">
        {users.map(user => (
          <div key={user.id} className="glass-card user-card">
            <div className="user-card-header">
              <div className="user-card-info">
                <h3>{user.full_name}</h3>
                <p>{user.email}</p>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span className={`badge badge-${user.role}`}>{user.role}</span>
                <span className={`badge badge-${user.status}`}>{user.status}</span>
              </div>
            </div>
            <div className="user-card-actions">
              {user.status === 'pending' && (
                <button onClick={() => updateUserStatus(user.id, 'approved')} className="btn btn-success btn-sm">
                  ✓ Setujui
                </button>
              )}
              {user.status === 'rejected' && (
                <button onClick={() => updateUserStatus(user.id, 'approved')} className="btn btn-success btn-sm">
                  ✓ Setujui
                </button>
              )}
              <button onClick={() => openEditModal(user)} className="btn btn-secondary btn-sm">
                ✏️ Edit
              </button>
              <button onClick={() => deleteUser(user.id)} className="btn btn-danger btn-sm">
                🗑 Hapus
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div className="modal-overlay" onClick={() => setEditModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Edit User</h2>
            <div className="form-group">
              <label className="form-label">Nama</label>
              <input
                type="text"
                className="form-input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                className="form-input"
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="modal-actions">
              <button onClick={() => setEditModal(null)} className="btn btn-secondary btn-sm">Batal</button>
              <button onClick={saveEdit} className="btn btn-primary btn-sm">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
