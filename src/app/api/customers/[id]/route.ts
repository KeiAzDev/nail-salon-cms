// src/app/api/customers/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json()

    // 必須フィールドの検証
    if (!data.firstName || !data.lastName || !data.email || !data.phone) {
      return NextResponse.json(
        { message: '必須項目が入力されていません' },
        { status: 400 }
      )
    }

    // メールアドレスの重複チェック（自分自身は除外）
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        email: data.email,
        NOT: {
          id: params.id
        }
      },
    })

    if (existingCustomer) {
      return NextResponse.json(
        { message: 'このメールアドレスは既に使用されています' },
        { status: 400 }
      )
    }

    // 日付データの処理
    if (data.dateOfBirth) {
      data.dateOfBirth = new Date(data.dateOfBirth)
    }

    // 健康情報をJSONとして保存
    if (data.healthInfo) {
      try {
        data.healthInfo = JSON.parse(data.healthInfo)
      } catch {
        data.healthInfo = { text: data.healthInfo }
      }
    }

    const customer = await prisma.customer.update({
      where: { id: params.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth || null,
        notes: data.notes || null,
        healthInfo: data.healthInfo || null,
      },
    })

    return NextResponse.json(customer)
  } catch (error) {
    console.error('Customer update error:', error)
    return NextResponse.json(
      { message: '顧客情報の更新に失敗しました' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.customer.delete({
      where: { id: params.id },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Customer deletion error:', error)
    return NextResponse.json(
      { message: '顧客の削除に失敗しました' },
      { status: 500 }
    )
  }
}