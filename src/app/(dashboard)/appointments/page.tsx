// src/app/(dashboard)/appointments/page.tsx
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { AppointmentCalendarWrapper } from '@/components/dashboard/AppointmentCalendarWrapper'
import { NewAppointmentDialog } from '@/components/dashboard/NewAppointmentDialog'
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns'

export const metadata: Metadata = {
  title: '予約管理 | Nail Salon CMS',
  description: '予約の管理',
}

export default async function AppointmentsPage() {
  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 })

  // スタッフ一覧を取得
  const staffMembers = await prisma.user.findMany({
    where: {
      role: 'STAFF',
    },
    orderBy: {
      name: 'asc',
    },
  })

  // 週単位で予約を取得
  const appointments = await prisma.appointment.findMany({
    where: {
      startTime: {
        gte: startOfDay(weekStart),
        lte: endOfDay(weekEnd),
      },
    },
    include: {
      staff: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        }
      }
    },
    orderBy: {
      startTime: 'asc',
    }
  })

  console.log('Fetched appointments:', appointments)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">予約管理</h1>
        <NewAppointmentDialog staffMembers={staffMembers} />
      </div>

      <AppointmentCalendarWrapper
        initialAppointments={appointments}
        initialStaffMembers={staffMembers}
      />
    </div>
  )
}