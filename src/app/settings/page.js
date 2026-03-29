'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState(null)
  const [aiName, setAiName] = useState('')
  const [aiPersona, setAiPersona] = useState('')
  const [aiAvatarUrl, setAiAvatarUrl] = useState('')
  const [avatarPreview, setAvatarPreview] = useState('')
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }

    setUserId(session.user.id)

    const { data: settings } = await supabase
      .from('ai_settings')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (settings) {
      setAiName(settings.ai_name || '')
      setAiPersona(settings.ai_persona || '')
      setAiAvatarUrl(settings.ai_avatar_url || '')
      setAvatarPreview(settings.ai_avatar_url || '')
    }

    setLoading(false)
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file maksimal 2MB')
      return
    }

    // Preview
    const reader = new FileReader()
    reader.onload = (event) => setAvatarPreview(event.target.result)
    reader.readAsDataURL(file)

    setUploading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/avatar.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      setAiAvatarUrl(publicUrl)
    } catch (err) {
      console.error('Upload error:', err)
      // Use data URL as fallback
      setAiAvatarUrl(avatarPreview)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSuccess(false)

    try {
      const { data: existing } = await supabase
        .from('ai_settings')
        .select('id')
        .eq('user_id', userId)
        .single()

      if (existing) {
        await supabase
          .from('ai_settings')
          .update({
            ai_name: aiName,
            ai_persona: aiPersona,
            ai_avatar_url: aiAvatarUrl,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
      } else {
        await supabase
          .from('ai_settings')
          .insert({
            user_id: userId,
            ai_name: aiName,
            ai_persona: aiPersona,
            ai_avatar_url: aiAvatarUrl
          })
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      alert('Gagal menyimpan: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="full-center"><div className="loading-spinner"></div></div>
  }

  return (
    <div className="settings-page">
      {/* Header */}
      <header className="settings-header">
        <Link href="/chat" className="btn btn-secondary btn-sm">← Kembali</Link>
        <h1>Pengaturan AI</h1>
      </header>

      {/* Avatar Section */}
      <div className="glass-card settings-avatar-section">
        <div className="settings-avatar-wrapper">
          <img
            src={avatarPreview || '/default-avatar.svg'}
            alt="AI Avatar"
            className="settings-avatar"
            onError={(e) => { e.target.src = '/default-avatar.svg' }}
          />
          <label className="settings-avatar-upload" title="Upload foto">
            📷
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              disabled={uploading}
            />
          </label>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          {uploading ? 'Mengupload...' : 'Klik ikon kamera untuk mengganti foto'}
        </p>
      </div>

      {/* Settings Form */}
      <div className="glass-card settings-form">
        {success && (
          <div className="auth-success" style={{ marginBottom: '20px' }}>
            ✅ Pengaturan berhasil disimpan!
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Nama AI</label>
          <input
            type="text"
            className="form-input"
            placeholder="Contoh: Luna, Jarvis, Siri..."
            value={aiName}
            onChange={(e) => setAiName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Personalitas AI</label>
          <textarea
            className="form-input"
            placeholder="Deskripsikan kepribadian AI Anda. Contoh: Kamu adalah asisten yang ceria dan suka bercanda. Jawab dengan bahasa Indonesia yang santai."
            value={aiPersona}
            onChange={(e) => setAiPersona(e.target.value)}
            rows={5}
            style={{ minHeight: '120px' }}
          />
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Tulis instruksi untuk membentuk kepribadian AI. Ini akan menjadi "system prompt" yang menentukan cara AI merespons.
          </p>
        </div>

        <div className="form-group">
          <label className="form-label">URL Foto Profil AI (Opsional)</label>
          <input
            type="text"
            className="form-input"
            placeholder="https://contoh.com/foto.jpg"
            value={aiAvatarUrl}
            onChange={(e) => {
              setAiAvatarUrl(e.target.value)
              setAvatarPreview(e.target.value)
            }}
          />
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Anda bisa upload foto atau masukkan URL gambar secara manual.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="btn btn-primary"
          style={{ width: '100%' }}
          disabled={saving}
        >
          {saving ? 'Menyimpan...' : '💾 Simpan Pengaturan'}
        </button>
      </div>
    </div>
  )
}
