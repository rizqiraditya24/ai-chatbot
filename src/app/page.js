'use client'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* Background Orbs */}
      <div className="landing-bg">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-logo">NexaChat</div>
        <div className="landing-nav-links">
          <Link href="/login" className="btn btn-secondary btn-sm">Masuk</Link>
          <Link href="/register" className="btn btn-primary btn-sm">Daftar</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-badge">✨ AI Chatbot Personal</div>
        <h1 className="hero-title">
          Asisten AI<br />
          <span className="gradient-text">Sesuai Keinginanmu</span>
        </h1>
        <p className="hero-subtitle">
          Buat chatbot AI dengan kepribadian unik. Beri nama, atur persona, dan mulai percakapan — sepenuhnya gratis.
        </p>
        <div className="hero-buttons">
          <Link href="/register" className="btn btn-primary btn-lg">
            🚀 Mulai Gratis
          </Link>
          <Link href="/login" className="btn btn-secondary btn-lg">
            Masuk
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="features-title">
          Fitur <span className="text-gradient">Unggulan</span>
        </h2>
        <div className="features-grid">
          <div className="glass-card feature-card">
            <div className="feature-icon">🎨</div>
            <h3>Personalisasi Penuh</h3>
            <p>Beri nama, atur kepribadian, dan pilih foto profil untuk AI-mu sendiri.</p>
          </div>
          <div className="glass-card feature-card">
            <div className="feature-icon">💬</div>
            <h3>Chat Real-time</h3>
            <p>Interface chat modern mirip WhatsApp dengan pengalaman percakapan yang natural.</p>
          </div>
          <div className="glass-card feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Privasi Terjamin</h3>
            <p>Setiap akun memiliki pengaturan AI masing-masing. Data percakapanmu aman.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
