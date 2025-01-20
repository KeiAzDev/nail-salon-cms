// src/types/appointment.ts
import { Appointment, User } from '@prisma/client'

export type AppointmentWithDetails = Appointment & {
  staff: User
  customer: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
}