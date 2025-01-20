// src/app/api/admin/create/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

export async function POST(req: Request) {
  try {
    // 本番環境では実行できないようにする
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'This route is only available in development' },
        { status: 403 }
      )
    }

    const adminUser = await prisma.user.findFirst({
      where: {
        role: 'ADMIN',
      },
    })

    // 管理者が既に存在する場合は作成しない
    if (adminUser) {
      return NextResponse.json(
        { message: 'Admin user already exists' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash('admin123', 12)

    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        name: '管理者',
        password: hashedPassword,
        role: 'ADMIN',
      },
    })

    return NextResponse.json(
      {
        message: 'Admin user created successfully',
        email: admin.email,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating admin:', error)
    return NextResponse.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    )
  }
}