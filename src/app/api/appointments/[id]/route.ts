// src/app/api/appointments/[id]/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { TREATMENT_MENU } from '@/lib/constants/appointment'

interface AppointmentServices {
  menuIds: number[]
  totalDuration: number
  totalPrice: number
}

interface AppointmentMenu {
  id: number
  duration: number
  price: number
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json()
    const { date, startTime, menuIds, notes } = data

    // 存在チェックと入力バリデーション
    if (!date || !startTime || !menuIds?.length) {
      return NextResponse.json(
        { error: '必要な情報が不足しています' },
        { status: 400 }
      )
    }

    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        staff: true,
      }
    })

    if (!existingAppointment) {
      return NextResponse.json(
        { error: '予約が見つかりません' },
        { status: 404 }
      )
    }

    // メニューの存在確認
    const validMenus: boolean = menuIds.every((id: number): boolean => 
      TREATMENT_MENU.some((menu: AppointmentMenu) => menu.id === id)
    )

    if (!validMenus) {
      return NextResponse.json(
        { error: '無効なメニューが含まれています' },
        { status: 400 }
      )
    }

    const totalDuration = menuIds.reduce((sum: number, id: number): number => {
      const menu = TREATMENT_MENU.find((m: AppointmentMenu) => m.id === id)
      return sum + (menu?.duration || 0)
    }, 0)

    const startDateTime = new Date(`${date}T${startTime}`)
    const endDateTime = new Date(startDateTime.getTime() + totalDuration * 60000)

    // データベースの更新
    const updatedAppointment = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        date: startDateTime,
        startTime: startDateTime,
        endTime: endDateTime,
        services: JSON.stringify({
          menuIds,
          totalDuration,
          totalPrice: menuIds.reduce((sum: number, id: number): number => {
            const menu = TREATMENT_MENU.find((m: AppointmentMenu) => m.id === id)
            return sum + (menu?.price || 0)
          }, 0)
        } as AppointmentServices),
        notes
      }
    })

    return NextResponse.json(updatedAppointment)
  } catch (error) {
    console.error('Appointment update error:', error)
    return NextResponse.json(
      { error: '予約の更新に失敗しました' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 予約を削除
    await prisma.appointment.delete({
      where: { id: params.id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Appointment deletion error:', error)
    return NextResponse.json(
      { error: '予約の削除に失敗しました' },
      { status: 500 }
    )
  }
}