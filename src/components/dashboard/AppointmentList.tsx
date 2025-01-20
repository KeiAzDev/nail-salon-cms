// src/components/dashboard/AppointmentList.tsx
'use client'

import { Appointment, User } from '@prisma/client'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

type AppointmentWithStaff = Appointment & {
  staff: User
}

interface AppointmentListProps {
  appointments: AppointmentWithStaff[]
}

const statusMap = {
  SCHEDULED: { text: '予約済み', class: 'bg-blue-100 text-blue-800' },
  CONFIRMED: { text: '確認済み', class: 'bg-green-100 text-green-800' },
  CANCELLED: { text: 'キャンセル', class: 'bg-red-100 text-red-800' },
  COMPLETED: { text: '完了', class: 'bg-gray-100 text-gray-800' },
}

export function AppointmentList({ appointments }: AppointmentListProps) {
  if (appointments.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
        予約がありません
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg divide-y">
      {appointments.map((appointment) => (
        <div key={appointment.id} className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm text-gray-900">
                {format(new Date(appointment.date), 'yyyy年M月d日(E)', { locale: ja })}
              </div>
              <div className="mt-1 text-sm text-gray-500">
                {format(new Date(appointment.startTime), 'HH:mm')} - 
                {format(new Date(appointment.endTime), 'HH:mm')}
              </div>
              <div className="mt-2 text-sm text-gray-500">
                担当: {appointment.staff.name}
              </div>
            </div>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                statusMap[appointment.status].class
              }`}
            >
              {statusMap[appointment.status].text}
            </span>
          </div>
          
          {appointment.notes && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500">メモ</p>
              <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                {appointment.notes}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}