// src/app/(dashboard)/appointments/page.tsx
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { AppointmentCalendarWrapper } from '@/components/dashboard/AppointmentCalendarWrapper'

export const metadata: Metadata = {
  title: '予約管理 | Nail Salon CMS',
  description: '予約の管理',
}

export default async function AppointmentsPage() {
  // スタッフ一覧を取得
  const staffMembers = await prisma.user.findMany({
    where: {
      role: 'STAFF',
    },
    orderBy: {
      name: 'asc',
    },
  })

  // 今週の予約を取得
  const appointments = await prisma.appointment.findMany({
    where: {
      date: {
        gte: new Date(),
      },
    },
    include: {
      staff: true,
      customer: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: {
      date: 'asc',
    },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">予約管理</h1>
      </div>

      <AppointmentCalendarWrapper 
        initialAppointments={appointments}
        initialStaffMembers={staffMembers}
      />
    </div>
  )
}