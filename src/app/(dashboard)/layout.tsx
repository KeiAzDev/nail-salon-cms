// src/app/(dashboard)/layout.tsx
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import Sidebar from '@/components/dashboard/Sidebar'
import Header from '@/components/dashboard/Header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen">
        {/* サイドバー */}
        <Sidebar />
        
        {/* メインコンテンツ */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header user={session.user} />
          <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}