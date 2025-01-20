// src/app/api/appointments/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { addMinutes } from 'date-fns'
import { BUSINESS_HOURS, SLOT_DURATION, TREATMENT_MENU } from '@/lib/constants/appointment'
import { addToGoogleCalendar } from '@/lib/google-calendar'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { customerId, staffId, date, startTime, menuIds, notes } = data

    // 基本バリデーション
    if (!customerId || !staffId || !date || !startTime || !menuIds?.length) {
      return NextResponse.json(
        { error: '必須項目が不足しています' },
        { status: 400 }
      )
    }

    // 顧客とスタッフの存在確認
    const [customer, staff] = await Promise.all([
      prisma.customer.findUnique({ where: { id: customerId } }),
      prisma.user.findUnique({ where: { id: staffId } })
    ])

    if (!customer || !staff) {
      return NextResponse.json(
        { error: '顧客またはスタッフが見つかりません' },
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

    // 選択されたメニューの確認と合計時間の計算
    interface Menu {
      id: number;
      name: string;
      duration: number;
      price: number;
    }

    interface AppointmentRequest {
      customerId: string;
      staffId: string;
      date: string;
      startTime: string;
      menuIds: string[];
      notes?: string;
    }

    const selectedMenus: Menu[] = menuIds.map((id: string) => TREATMENT_MENU.find((menu: Menu) => menu.id === Number(id)) as Menu)
    if (selectedMenus.some(menu => !menu)) {
      return NextResponse.json(
        { error: '無効なメニューが選択されています' },
        { status: 400 }
      )
    }

    const totalDuration = selectedMenus.reduce((sum, menu) => sum + (menu?.duration || 0), 0)
    const endTime = addMinutes(new Date(startTime), totalDuration)

    // 営業時間を超えていないかチェック
    const businessEndTime = new Date(startTime)
    businessEndTime.setHours(BUSINESS_HOURS.end.hour, 0, 0, 0)
    if (endTime > businessEndTime) {
      return NextResponse.json(
        { error: '予約時間が営業時間を超えています' },
        { status: 400 }
      )
    }

    // 重複予約チェック
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        staffId,
        status: { not: 'CANCELLED' },
        OR: [
          {
            AND: [
              { startTime: { lte: appointmentTime } },
              { endTime: { gt: appointmentTime } },
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

    // Google Calendarにイベントを追加
    let googleEventId = null
    try {
      const calendarEvent = await addToGoogleCalendar({
        startTime: appointmentTime,
        endTime,
        customerName: `${customer.lastName} ${customer.firstName}`,
        staffName: staff.name,
        services: selectedMenus.map(menu => menu?.name || '').filter(Boolean),
      })
      googleEventId = calendarEvent.id
    } catch (error) {
      console.error('Google Calendar error:', error)
      // Google Calendar連携のエラーはログに残すが、予約作成は継続する
    }

    // 予約作成
    const appointment = await prisma.appointment.create({
      data: {
        customerId,
        staffId,
        date: new Date(date),
        startTime: appointmentTime,
        endTime,
        status: 'SCHEDULED',
        services: { 
          menuIds,
          totalDuration,
          totalPrice: selectedMenus.reduce((sum, menu) => sum + (menu?.price || 0), 0)
        },
        notes,
        googleEventId,
      },
      include: {
        customer: true,
        staff: true,
      },
    })

    return NextResponse.json({
      ...appointment,
      message: googleEventId 
        ? '予約を作成しました' 
        : '予約を作成しましたが、Googleカレンダーとの連携に失敗しました',
    }, { 
      status: 201 
    })

  } catch (error) {
    console.error('Appointment creation error:', error)
    return NextResponse.json(
      { error: '予約の作成に失敗しました' },
      { status: 500 }
    )
  }
}