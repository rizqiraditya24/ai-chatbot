'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) throw authError

      // Check profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, status')
        .eq('id', data.user.id)
        .single()

      if (!profile) {
        setError('Profil tidak ditemukan. Hubungi admin.')
        await supabase.auth.signOut()
        return
      }

      if (profile.status === 'pending') {
        setError('Akun Anda belum disetujui oleh admin. Silakan tunggu persetujuan.')
        await supabase.auth.signOut()
        return
      }

      if (profile.status === 'rejected') {
        setError('Akun Anda ditolak oleh admin. Hubungi admin untuk informasi lebih lanjut.')
        await supabase.auth.signOut()
        return
      }

      // Redirect based on role
      if (profile.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/chat')
      }
    } catch (err) {
      setError(err.message === 'Invalid login credentials' 
        ? 'Email atau password salah.' 
        : err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="landing-bg">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
      </div>
      <div className="glass-card auth-card">
        <div className="auth-header">
          <Link href="/" className="landing-logo" style={{ fontSize: '24px', display: 'block', marginBottom: '16px' }}>NexaChat</Link>
          <h1>Masuk</h1>
          <p>Masuk ke akun Anda</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <div className="auth-footer">
          Belum punya akun? <Link href="/register">Daftar sekarang</Link>
        </div>
      </div>
    </div>
  )
}
