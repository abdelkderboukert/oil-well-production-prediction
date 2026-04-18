import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PETROAI — Intelligent Oil Well Production',
  description: 'AI-powered oil well production optimization and real-time analytics platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
