'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ChatPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [aiSettings, setAiSettings] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [loading, setLoading] = useState(true)
  const [needsApproval, setNeedsApproval] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    checkAuthAndLoad()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const checkAuthAndLoad = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (!profile) { router.push('/login'); return }

    // Check if user is approved
    if (profile.status !== 'approved') {
      setNeedsApproval(true)
      setLoading(false)
      return
    }

    setUser(profile)

    // Load AI settings
    const { data: settings } = await supabase
      .from('ai_settings')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    setAiSettings(settings || { ai_name: 'AI Assistant', ai_persona: '', ai_avatar_url: null })

    // Load messages
    const { data: msgs } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: true })

    setMessages(msgs || [])
    setLoading(false)
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text || isTyping) return

    setInput('')

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    // Add user message to UI
    const userMsg = {
      id: 'temp-' + Date.now(),
      role: 'user',
      content: text,
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMsg])

    // Save user message
    await supabase.from('messages').insert({
      user_id: user.id,
      role: 'user',
      content: text
    })

    // Call AI API
    setIsTyping(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          persona: aiSettings?.ai_persona || '',
          aiName: aiSettings?.ai_name || 'AI Assistant',
          history: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      })

      const data = await res.json()

      const aiMsg = {
        id: 'ai-' + Date.now(),
        role: 'assistant',
        content: data.reply || 'Maaf, saya tidak bisa memproses permintaan Anda saat ini.',
        created_at: new Date().toISOString()
      }

      setMessages(prev => [...prev, aiMsg])

      // Save AI message
      await supabase.from('messages').insert({
        user_id: user.id,
        role: 'assistant',
        content: aiMsg.content
      })
    } catch (err) {
      const errorMsg = {
        id: 'err-' + Date.now(),
        role: 'assistant',
        content: '⚠️ Terjadi kesalahan saat menghubungi AI. Pastikan API key sudah dikonfigurasi dengan benar.',
        created_at: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTextareaInput = (e) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  const clearChat = async () => {
    if (!confirm('Hapus semua riwayat chat?')) return
    await supabase.from('messages').delete().eq('user_id', user.id)
    setMessages([])
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return <div className="full-center"><div className="loading-spinner"></div></div>
  }

  // Show pending approval page
  if (needsApproval) {
    return (
      <div className="auth-page">
        <div className="landing-bg">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
        </div>
        <div className="glass-card auth-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '12px' }}>Menunggu Persetujuan</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
            Akun Anda sedang menunggu persetujuan admin. Anda akan bisa mengakses chat setelah akun disetujui.
          </p>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%' }}>
            Kembali ke Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-page">
      {/* Top Bar */}
      <div className="chat-topbar">
        <img
          src={aiSettings?.ai_avatar_url || '/default-avatar.svg'}
          alt={aiSettings?.ai_name}
          className="chat-avatar"
          onError={(e) => { e.target.src = '/default-avatar.svg' }}
        />
        <div className="chat-topbar-info">
          <h2>{aiSettings?.ai_name || 'AI Assistant'}</h2>
          <p>{isTyping ? 'mengetik...' : 'online'}</p>
        </div>
        <div className="chat-topbar-actions">
          <button onClick={clearChat} className="btn btn-secondary btn-sm" title="Hapus Chat">
            🗑
          </button>
          <Link href="/settings" className="btn btn-secondary btn-sm" title="Pengaturan">
            ⚙️
          </Link>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm" title="Keluar">
            🚪
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-chat">
            <div className="empty-icon">💬</div>
            <h3>Mulai Percakapan</h3>
            <p>Kirim pesan pertamamu ke {aiSettings?.ai_name || 'AI Assistant'}</p>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`message message-${msg.role === 'user' ? 'user' : 'ai'}`}>
              <div>{msg.content}</div>
              <div className="message-time">{formatTime(msg.created_at)}</div>
            </div>
          ))
        )}

        {isTyping && (
          <div className="typing-indicator">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="chat-input-area">
        <textarea
          ref={textareaRef}
          className="chat-input"
          placeholder="Ketik pesan..."
          value={input}
          onChange={handleTextareaInput}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button
          className="chat-send-btn"
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
        >
          ➤
        </button>
      </div>
    </div>
  )
}
