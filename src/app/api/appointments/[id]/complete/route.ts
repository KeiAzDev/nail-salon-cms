// src/app/api/appointments/[id]/complete/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { TREATMENT_MENU } from '@/lib/constants/appointment'

// 型定義
interface TreatmentService {
  id: number
  name: string
  price: number
}

interface TreatmentServices {
  menuIds: number[]
  completedServices: TreatmentService[]
}

interface TreatmentProducts {
  items: string[]
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json()
    const { services, products, nextRecommendation, notes } = data

    if (!services?.length) {
      return NextResponse.json(
        { error: '施術内容が選択されていません' },
        { status: 400 }
      )
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        staff: true,
      }
    })

    if (!appointment) {
      return NextResponse.json(
        { error: '予約が見つかりません' },
        { status: 404 }
      )
    }

    // メニューの存在確認
    interface Appointment {
      id: string
      customerId: string
      customer: object
      staff: object
    }

    interface TransactionResult {
      treatmentHistory: object
      updatedAppointment: object
    }

    const validMenus: boolean = services.every((id: number): boolean => 
      TREATMENT_MENU.some((menu: { id: number }) => menu.id === id)
    )

    if (!validMenus) {
      return NextResponse.json(
        { error: '無効なメニューが含まれています' },
        { status: 400 }
      )
    }

    // トランザクションで一括処理
    const result = await prisma.$transaction(async (tx) => {
      // 施術履歴の作成
      const treatmentHistory = await tx.treatmentHistory.create({
        data: {
          customerId: appointment.customerId,
          date: new Date(),
          services: JSON.stringify({
        menuIds: services,
        completedServices: services.map((id: number): TreatmentService => ({
          id,
          name: TREATMENT_MENU.find((menu: { id: number }) => menu.id === id)?.name || '',
          price: TREATMENT_MENU.find((menu: { id: number }) => menu.id === id)?.price || 0
        }))
          } as TreatmentServices),
          products: products ? JSON.stringify({ items: products.split('\n') } as TreatmentProducts) : null,
          nextRecommendation,
          notes,
          appointmentId: appointment.id
        }
      })

      // 予約のステータス更新
      const updatedAppointment = await tx.appointment.update({
        where: { id: params.id },
        data: {
          status: 'COMPLETED'
        },
        include: {
          customer: true,
          staff: true,
        }
      })

      return { treatmentHistory, updatedAppointment }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Treatment completion error:', error)
    return NextResponse.json(
      { error: '施術完了の記録に失敗しました' },
      { status: 500 }
    )
  }
}