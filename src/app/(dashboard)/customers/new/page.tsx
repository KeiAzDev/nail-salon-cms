// src/app/(dashboard)/customers/new/page.tsx
import { Metadata } from 'next'
import { CustomerForm } from '@/components/forms/CustomerForm'

export const metadata: Metadata = {
  title: '新規顧客登録 | Nail Salon CMS',
  description: '新規顧客の登録',
}

export default function NewCustomerPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">新規顧客登録</h1>
      <div className="bg-white shadow rounded-lg">
        <CustomerForm />
      </div>
    </div>
  )
}