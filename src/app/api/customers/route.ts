// src/app/api/customers/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const data = await req.json()

    // 必須フィールドの検証
    if (!data.firstName || !data.lastName || !data.email || !data.phone) {
      return NextResponse.json(
        { message: '必須項目が入力されていません' },
        { status: 400 }
      )
    }

    // メールアドレスの重複チェック
    const existingCustomer = await prisma.customer.findUnique({
      where: {
        email: data.email,
      },
    })

    if (existingCustomer) {
      return NextResponse.json(
        { message: 'このメールアドレスは既に登録されています' },
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

    const customer = await prisma.customer.create({
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

    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error('Customer creation error:', error)
    return NextResponse.json(
      { message: '顧客の登録に失敗しました' },
      { status: 500 }
    )
  }
}