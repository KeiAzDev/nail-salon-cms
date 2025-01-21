// src/app/api/appointments/[id]/status/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json()
    const { status } = data

    if (!status || !['SCHEDULED', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].includes(status)) {
      return NextResponse.json(
        { error: '無効なステータスです' },
        { status: 400 }
      )
    }

    const appointment = await prisma.appointment.update({
      where: { id: params.id },
      data: { status },
      include: {
        customer: true,
        staff: true,
      }
    })

    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Status update error:', error)
    return NextResponse.json(
      { error: 'ステータスの更新に失敗しました' },
      { status: 500 }
    )
  }
}