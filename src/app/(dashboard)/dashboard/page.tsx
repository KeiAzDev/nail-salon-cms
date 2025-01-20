// src/app/(dashboard)/customers/page.tsx
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { CustomerTable } from '@/components/dashboard/CustomerTable'
import { PlusCircle } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '顧客一覧 | Nail Salon CMS',
  description: '顧客情報の管理',
}

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">顧客一覧</h1>
        <Link
          href="/dashboard/customers/new"
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          新規顧客登録
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg">
        <CustomerTable customers={customers} />
      </div>
    </div>
  )
}