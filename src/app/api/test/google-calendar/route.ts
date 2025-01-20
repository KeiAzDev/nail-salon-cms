// src/app/api/test/google-calendar/route.ts
import { NextResponse } from 'next/server'
import { addToGoogleCalendar } from '@/lib/google-calendar'
import { addMinutes } from 'date-fns'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // カスタマーIDをURLから取得（例として指定のIDを使用）
    const customerId = '678e7c31cbb07d3b5896a2ba'

    // スタッフの作成（または取得）
    const staff = await prisma.user.upsert({
      where: { email: 'staff@example.com' },
      update: {
        role: 'STAFF' // 明示的にSTAFFロールを設定
      },
      create: {
        email: 'staff@example.com',
        name: 'テストスタッフ',
        password: 'test-password',
        role: 'STAFF'
      },
    })

    // 予約時間の設定
    const startTime = new Date()
    const endTime = addMinutes(startTime, 60)

    // Google Calendarにイベントを作成
    const calendarEvent = await addToGoogleCalendar({
      startTime,
      endTime,
      customerName: "テスト顧客",
      staffName: staff.name,
      services: ["テストメニュー"],
    })

    // データベースに予約を保存
    const appointment = await prisma.appointment.create({
      data: {
        date: startTime,
        startTime,
        endTime,
        status: 'SCHEDULED',
        customerId,        // 指定の顧客ID
        staffId: staff.id, // 作成したスタッフのID
        services: {
          menuIds: [1],
          totalDuration: 60,
          totalPrice: 6000
        },
        googleEventId: calendarEvent.id
      },
    })

    // 作成した予約を関連データと共に取得
    const createdAppointment = await prisma.appointment.findUnique({
      where: { id: appointment.id },
      include: {
        customer: true,
        staff: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'テスト予約を作成しました',
      calendarEvent,
      appointment: createdAppointment
    })

  } catch (error) {
    console.error('Test creation error:', error)
    return NextResponse.json({
      success: false,
      message: 'テスト予約の作成に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}