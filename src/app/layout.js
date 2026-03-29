import './globals.css'

export const metadata = {
  title: 'NexaChat — AI Chatbot Platform',
  description: 'Platform chatbot AI personal yang bisa dikustomisasi. Buat asisten AI dengan kepribadian unik sesuai keinginanmu.',
  keywords: 'AI chatbot, personal assistant, customizable AI',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
