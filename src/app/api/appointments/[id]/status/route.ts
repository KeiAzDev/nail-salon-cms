// src/app/api/appointments/[id]/route.ts
import { prisma } from '@/lib/prisma'
import { deleteFromGoogleCalendar } from '@/lib/google-calendar'
import { NextResponse } from 'next/server'
import { AppointmentStatus } from '@/types/appointment'
import { Prisma } from '@prisma/client'

interface DeleteRequestBody {
  googleEventId?: string
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // IDの形式チェック
    if (!id || typeof id !== 'string' || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { error: '無効なIDです' },
        { status: 400 }
      )
    }

    // まず予約データを取得
    const appointment = await prisma.appointment.findUnique({
      where: { id }
    })

    if (!appointment) {
      return NextResponse.json(
        { error: '予約が見つかりません' },
        { status: 404 }
      )
    }

    // Google Calendarからイベントを削除
    if (appointment.googleEventId) {
      try {
        await deleteFromGoogleCalendar(appointment.googleEventId)
      } catch (error) {
        console.error('Google Calendar deletion error:', error)
        // Google Calendarの削除に失敗しても処理は続行
      }
    }

    // データベースから予約を削除
    await prisma.appointment.delete({
      where: { id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: 'データベースエラーが発生しました' },
        { status: 500 }
      )
    }
    console.error('Appointment deletion error:', error)
    return NextResponse.json(
      { error: '予約の削除に失敗しました' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { status } = await req.json() as { status: AppointmentStatus }

    // バリデーション
    if (!status || !['SCHEDULED', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].includes(status)) {
      return NextResponse.json(
        { error: '無効なステータスです' },
        { status: 400 }
      )
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status },
      include: {
        customer: true,
        staff: true,
      },
    })

    return NextResponse.json(appointment)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: 'データベースエラーが発生しました' },
        { status: 500 }
      )
    }
    console.error('Status update error:', error)
    return NextResponse.json(
      { error: 'ステータスの更新に失敗しました' },
      { status: 500 }
    )
  }
}