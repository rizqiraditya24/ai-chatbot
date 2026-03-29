import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { message, persona, aiName, history } = await request.json()

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { reply: '⚠️ API key Gemini belum dikonfigurasi. Silakan cek file .env.local dan tambahkan GEMINI_API_KEY.' },
        { status: 200 }
      )
    }

    // Build conversation history for Gemini
    const systemInstruction = `IDENTITAS AI:
Nama Anda: ${aiName || 'AI Assistant'}
Karakter/Sifat Anda: ${persona || 'Kamu adalah asisten AI yang ramah dan membantu.'}

PERATURAN PENTING:
1. Anda HARUS selalu mengadopsi Nama dan Karakter di atas sepenuhnya dalam setiap balasan.
2. JANGAN PERNAH menyebut diri Anda sebagai "AI Assistant" atau program komputer (kecuali nama Anda diset demikian). Identitas Anda murni sebagai "${aiName || 'AI Assistant'}".
3. Gunakan gaya bahasa yang sangat sesuai dengan Karakter/Sifat yang diberikan.`

    const contents = []

    // Add history
    if (history && history.length > 0) {
      for (const msg of history) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        })
      }
    }

    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    })

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemInstruction }]
          },
          contents,
          generationConfig: {
            temperature: 0.8,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 2048,
          }
        })
      }
    )

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      console.error('Gemini API error:', errData)
      const errorMsg = errData.error?.message || 'Pastikan API key valid dan kuota masih tersedia.'
      return NextResponse.json(
        { reply: `⚠️ Gagal menghubungi AI: ${errorMsg}` },
        { status: 200 }
      )
    }

    const data = await response.json()
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Maaf, saya tidak bisa merespons saat ini.'

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { reply: '⚠️ Terjadi kesalahan server. Silakan coba lagi.' },
      { status: 200 }
    )
  }
}
