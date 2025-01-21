// src/types/appointment.ts
import { Appointment, User } from '@prisma/client'

export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'

export type AppointmentWithDetails = Appointment & {
  staff: {
    id: string
    name: string
    email: string
  }
  customer: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
  }
}