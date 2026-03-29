# 🚀 Panduan Setup NexaChat — AI Chatbot Platform

Panduan lengkap untuk mengatur dan menjalankan NexaChat, dari awal hingga deploy ke Vercel. **Semua gratis!**

---

## 📋 Prasyarat

- **Node.js** (versi 18+) — [Download di sini](https://nodejs.org)
- **Akun GitHub** — untuk deploy ke Vercel
- **Akun Supabase** (gratis) — database & auth
- **Google Gemini API Key** (gratis) — untuk AI

---

## Langkah 1: Setup Supabase (Database & Auth)

### 1.1 Buat Project Supabase
1. Buka [supabase.com](https://supabase.com) dan klik **Start your project**
2. Login dengan GitHub
3. Klik **New Project**
4. Isi:
   - **Name**: `nexachat`
   - **Database Password**: (buat password, simpan baik-baik)
   - **Region**: pilih yang terdekat (contoh: Southeast Asia)
5. Klik **Create new project** dan tunggu beberapa menit

### 1.2 Jalankan SQL Migration
1. Di dashboard Supabase, buka menu **SQL Editor** (ikon database di sidebar kiri)
2. Klik **New Query**
3. Copy-paste **seluruh isi** file `supabase-setup.sql` dari project ini
4. Klik **Run** (tombol hijau)
5. Pastikan tidak ada error

### 1.3 Konfigurasi Auth
1. Di sidebar Supabase, buka **Authentication** > **Providers**
2. Pastikan **Email** provider sudah **Enabled**
3. Di **Authentication** > **Settings**:
   - **Disable email confirmations** (untuk development):
     - Matikan "Enable email confirmations" agar user bisa langsung login setelah register

### 1.4 Buat Storage Bucket (Opsional — untuk avatar)
1. Di sidebar, buka **Storage**
2. Klik **New Bucket**
3. Nama: `avatars`
4. Centang **Public bucket**
5. Klik **Create bucket**

### 1.5 Catat API Keys
1. Buka **Settings** > **API** di sidebar
2. Catat:
   - **Project URL** → contoh: `https://xxxx.supabase.co`
   - **anon (public) key** → string panjang yang dimulai dengan `eyJ...`

---

## Langkah 2: Dapatkan Google Gemini API Key (Gratis)

1. Buka [Google AI Studio](https://aistudio.google.com/apikey)
2. Login dengan akun Google
3. Klik **Create API Key**
4. Pilih project atau buat baru
5. Copy API key yang muncul
6. **Simpan baik-baik!**

> **Catatan**: Free tier Gemini memberikan 15 request per menit dan 1.500 request per hari. Cukup untuk penggunaan personal!

---

## Langkah 3: Konfigurasi Environment Variables

1. Di folder project, buat file `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...YOUR_ANON_KEY
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

2. Ganti `YOUR_PROJECT_ID`, `YOUR_ANON_KEY`, dan `YOUR_GEMINI_API_KEY` dengan nilai sebenarnya

---

## Langkah 4: Jalankan di Lokal

```bash
# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## Langkah 5: Buat Admin Pertama

1. Buka website dan **Daftar** (register) dengan akun yang ingin dijadikan admin
2. Buka **Supabase SQL Editor** dan jalankan:

```sql
UPDATE profiles 
SET role = 'admin', status = 'approved' 
WHERE email = 'EMAIL_ANDA@email.com';
```

3. Ganti `EMAIL_ANDA@email.com` dengan email yang baru saja didaftarkan
4. Sekarang login kembali — Anda akan masuk ke **Admin Dashboard**!

---

## Langkah 6: Deploy ke Vercel (Gratis)

### 6.1 Push ke GitHub
1. Buat repository baru di GitHub
2. Push project:

```bash
git init
git add .
git commit -m "Initial commit: NexaChat AI Chatbot"
git branch -M main
git remote add origin https://github.com/USERNAME/ai-chatbot.git
git push -u origin main
```

### 6.2 Deploy di Vercel
1. Buka [vercel.com](https://vercel.com) dan login dengan GitHub
2. Klik **Add New** > **Project**
3. Import repository `ai-chatbot`
4. Di **Environment Variables**, tambahkan:
   - `NEXT_PUBLIC_SUPABASE_URL` = URL Supabase Anda
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Anon key Supabase
   - `GEMINI_API_KEY` = API key Gemini
5. Klik **Deploy**
6. Tunggu beberapa menit — website Anda siap! 🎉

---

## 🔧 Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Login gagal | Pastikan email confirmation dimatikan di Supabase Auth settings |
| AI tidak merespons | Cek `GEMINI_API_KEY` di `.env.local` atau Vercel env vars |
| Avatar tidak muncul | Pastikan bucket `avatars` dibuat dan bersifat public |
| RLS error | Jalankan ulang `supabase-setup.sql` di SQL Editor |
| "Supabase env not set" | Cek `.env.local` — nama variabel harus tepat |

---

## 📱 Fitur Utama

- ✅ **Landing Page** — desain modern dengan glassmorphism
- ✅ **Login & Register** — dengan sistem persetujuan admin
- ✅ **Admin Dashboard** — kelola user (approve/edit/hapus)
- ✅ **Chat WhatsApp-like** — interface chat real-time dengan AI
- ✅ **Pengaturan AI** — nama, personalitas, foto profil (per akun)
- ✅ **Mobile-First** — responsif di semua perangkat
- ✅ **100% Gratis** — Supabase free tier + Gemini free tier + Vercel free tier
