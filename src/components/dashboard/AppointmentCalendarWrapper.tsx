// src/components/dashboard/AppointmentCalendarWrapper.tsx
'use client'

import { useState } from 'react'
import { AppointmentCalendar } from './AppointmentCalendar'
import { useRouter } from 'next/navigation'
import { User } from '@prisma/client'
import { AppointmentWithDetails } from '@/types/appointment'

interface AppointmentCalendarWrapperProps {
  initialAppointments: AppointmentWithDetails[]
  initialStaffMembers: User[]
}

export function AppointmentCalendarWrapper({
  initialAppointments,
  initialStaffMembers,
}: AppointmentCalendarWrapperProps) {
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>(initialAppointments)
  const [staffMembers] = useState<User[]>(initialStaffMembers)
  const router = useRouter()

  const handleSlotSelect = async (date: Date, staffId: string) => {
    console.log('Selected slot:', { date, staffId })
  }

  return (
    <AppointmentCalendar
      appointments={appointments}
      staffMembers={staffMembers}
      onSlotSelect={handleSlotSelect}
    />
  )
}