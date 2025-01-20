// src/app/(dashboard)/customers/[id]/page.tsx
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Pencil } from 'lucide-react'
import Link from 'next/link'
import { CustomerInfo } from '@/components/dashboard/CustomerInfo'
import { TreatmentHistory } from '@/components/dashboard/TreatmentHistory'
import { AppointmentList } from '@/components/dashboard/AppointmentList'

interface CustomerDetailPageProps {
  params: {
    id: string
  }
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    include: {
      treatmentHistory: {
        orderBy: { date: 'desc' },
      },
      appointments: {
        where: {
          date: {
            gte: new Date(),
          }
        },
        include: {
          staff: true,
        },
        orderBy: {
          date: 'asc',
        }
      }
    }
  })

  if (!customer) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          {customer.lastName} {customer.firstName}
        </h1>
        <Link
          href={`/customers/${customer.id}/edit`}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <Pencil className="h-4 w-4 mr-2" />
          編集
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 顧客基本情報 */}
        <div className="lg:col-span-1">
          <CustomerInfo customer={customer} />
        </div>

        {/* 予約と施術履歴 */}
        <div className="lg:col-span-2 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">予約情報</h2>
            <AppointmentList appointments={customer.appointments} />
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">施術履歴</h2>
            <TreatmentHistory history={customer.treatmentHistory} />
          </section>
        </div>
      </div>
    </div>
  )
}