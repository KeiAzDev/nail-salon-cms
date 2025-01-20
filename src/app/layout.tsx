// src/app/layout.tsx
import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/providers/auth-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Nail Salon CMS',
  description: 'Customer Management System for Nail Salon',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body cz-shortcut-listen="true" className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}