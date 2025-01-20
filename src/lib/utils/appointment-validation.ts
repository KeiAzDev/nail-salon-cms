// src/lib/utils/appointment-validation.ts
import { BUSINESS_HOURS, SLOT_DURATION, TREATMENT_MENU } from '@/lib/constants/appointment'
import { prisma } from '@/lib/prisma'
import { addMinutes, isWithinInterval, setHours, setMinutes } from 'date-fns'

export async function validateAppointmentTime(
  date: Date,
  staffId: string,
  selectedMenuIds: number[]
) {
  const errors: string[] = []

  // 営業時間内かチェック
  const businessStart = setMinutes(
    setHours(date, BUSINESS_HOURS.start.hour),
    BUSINESS_HOURS.start.minute
  )
  const businessEnd = setMinutes(
    setHours(date, BUSINESS_HOURS.end.hour),
    BUSINESS_HOURS.end.minute
  )

  if (
    !isWithinInterval(date, {
      start: businessStart,
      end: businessEnd,
    })
  ) {
    errors.push('指定された時間は営業時間外です')
  }

  // 施術時間の計算
  const totalDuration = selectedMenuIds
    .map((id) => TREATMENT_MENU.find((menu) => menu.id === id)?.duration || 0)
    .reduce<number>((sum, duration) => sum + duration, 0)

  const endTime = addMinutes(date, totalDuration)

  // 営業時間を超えていないかチェック
  if (endTime > businessEnd) {
    errors.push('施術時間が営業時間を超えています')
  }

  // 重複予約チェック
  const existingAppointment = await prisma.appointment.findFirst({
    where: {
      staffId,
      OR: [
        {
          AND: [
            { startTime: { lte: date } },
            { endTime: { gt: date } },
          ],
        },
        {
          AND: [
            { startTime: { lt: endTime } },
            { endTime: { gte: endTime } },
          ],
        },
      ],
    },
  })

  if (existingAppointment) {
    errors.push('指定された時間には既に予約が入っています')
  }

  return {
    isValid: errors.length === 0,
    errors,
    totalDuration,
    endTime,
  }
}

export function validateCustomerFields(data: {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
}) {
  const errors: string[] = []

  if (!data.firstName?.trim()) {
    errors.push('名を入力してください')
  }
  if (!data.lastName?.trim()) {
    errors.push('姓を入力してください')
  }
  if (!data.email?.trim()) {
    errors.push('メールアドレスを入力してください')
  }
  if (!data.phone?.trim()) {
    errors.push('電話番号を入力してください')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}