// src/components/dashboard/AppointmentCalendarWrapper.tsx
'use client'

import { useState } from 'react'
import { AppointmentCalendar } from './AppointmentCalendar'
import { Appointment, User } from '@prisma/client'

type AppointmentWithDetails = Appointment & {
  staff: User
  customer: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
}

interface AppointmentCalendarWrapperProps {
  initialAppointments: AppointmentWithDetails[]
  initialStaffMembers: User[]
}

export function AppointmentCalendarWrapper({
  initialAppointments,
  initialStaffMembers,
}: AppointmentCalendarWrapperProps) {
  const [appointments] = useState<AppointmentWithDetails[]>(initialAppointments)
  const [staffMembers] = useState<User[]>(initialStaffMembers)

  const handleSlotSelect = async (date: Date, staffId: string) => {
    console.log('Selected slot:', { date, staffId })
    // ここに予約作成のロジックを実装
  }

  return (
    <AppointmentCalendar
      appointments={appointments}
      staffMembers={staffMembers}
      onSlotSelect={handleSlotSelect}
    />
  )
}