// src/app/api/appointments/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { addMinutes } from 'date-fns'
import { BUSINESS_HOURS, SLOT_DURATION } from '@/lib/constants/appointment'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { customerId, staffId, date, startTime, menuIds } = data

    // バリデーション
    if (!customerId || !staffId || !date || !startTime || !menuIds?.length) {
      return NextResponse.json(
        { error: '必須項目が不足しています' },
        { status: 400 }
      )
    }

    // 営業時間内かチェック
    const appointmentTime = new Date(startTime)
    const hours = appointmentTime.getHours()
    const minutes = appointmentTime.getMinutes()
    
    if (
      hours < BUSINESS_HOURS.start.hour ||
      (hours === BUSINESS_HOURS.start.hour && minutes < BUSINESS_HOURS.start.minute) ||
      hours >= BUSINESS_HOURS.end.hour
    ) {
      return NextResponse.json(
        { error: '指定された時間は営業時間外です' },
        { status: 400 }
      )
    }

    // 重複予約チェック
    const endTime = addMinutes(new Date(startTime), SLOT_DURATION)
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        staffId,
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
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
      return NextResponse.json(
        { error: '指定された時間には既に予約が入っています' },
        { status: 400 }
      )
    }

    // 予約作成
    const appointment = await prisma.appointment.create({
      data: {
        customerId,
        staffId,
        date: new Date(date),
        startTime: new Date(startTime),
        endTime,
        status: 'SCHEDULED',
        services: { menuIds }, // オブジェクトとして保存
      },
      include: {
        customer: true,
        staff: true,
      },
    })

    return NextResponse.json(appointment, { status: 201 })
  } catch (error) {
    console.error('Appointment creation error:', error)
    return NextResponse.json(
      { error: '予約の作成に失敗しました' },
      { status: 500 }
    )
  }
}