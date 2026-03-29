'use client'
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Password tidak cocok.')
      return
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter.')
      return
    }

    setLoading(true)

    try {
      // Register with Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      })

      if (authError) throw authError

      // Sign out after registration (must wait for approval)
      await supabase.auth.signOut()

      setSuccess(true)
    } catch (err) {
      if (err.message.includes('already registered')) {
        setError('Email sudah terdaftar. Silakan login.')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="landing-bg">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
        </div>
        <div className="glass-card auth-card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '12px' }}>Pendaftaran Berhasil!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '14px' }}>
              Akun Anda telah dibuat dengan sukses.
            </p>
            <div className="pending-notice" style={{ marginTop: '20px' }}>
              <h2>⏳ Menunggu Persetujuan</h2>
              <p>Akun Anda perlu disetujui oleh admin terlebih dahulu sebelum bisa digunakan. Silakan hubungi admin atau tunggu notifikasi.</p>
            </div>
            <Link href="/login" className="btn btn-primary" style={{ width: '100%', marginTop: '24px' }}>
              Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    )
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
          <h1>Daftar</h1>
          <p>Buat akun baru</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">Nama Lengkap</label>
            <input
              type="text"
              className="form-input"
              placeholder="Nama lengkap Anda"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
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
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Konfirmasi Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Ulangi password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Memproses...' : 'Daftar'}
          </button>
        </form>

        <div className="auth-footer">
          Sudah punya akun? <Link href="/login">Masuk</Link>
        </div>
      </div>
    </div>
  )
}
