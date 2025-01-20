// src/app/(dashboard)/customers/[id]/edit/page.tsx
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { CustomerForm } from '@/components/forms/CustomerForm'
import { notFound } from 'next/navigation'

interface EditCustomerPageProps {
  params: {
    id: string
  }
}

export const metadata: Metadata = {
  title: '顧客情報編集 | Nail Salon CMS',
  description: '顧客情報の編集',
}

export default async function EditCustomerPage({ params }: EditCustomerPageProps) {
  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
  })

  if (!customer) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">顧客情報編集</h1>
      <div className="bg-white shadow rounded-lg">
        <CustomerForm customer={customer} isEditing />
      </div>
    </div>
  )
}