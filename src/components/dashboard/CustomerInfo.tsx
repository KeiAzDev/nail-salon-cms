// src/components/dashboard/CustomerInfo.tsx
'use client'

import { Customer } from '@prisma/client'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Mail, Phone, Calendar, AlertCircle } from 'lucide-react'

interface CustomerInfoProps {
  customer: Customer
}

export function CustomerInfo({ customer }: CustomerInfoProps) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">基本情報</h3>
      
      <div className="space-y-4">
        {/* メールアドレス */}
        <div className="flex items-start">
          <Mail className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-500">メールアドレス</p>
            <p className="text-sm text-gray-900">{customer.email}</p>
          </div>
        </div>

        {/* 電話番号 */}
        <div className="flex items-start">
          <Phone className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-500">電話番号</p>
            <p className="text-sm text-gray-900">{customer.phone}</p>
          </div>
        </div>

        {/* 生年月日 */}
        {customer.dateOfBirth && (
          <div className="flex items-start">
            <Calendar className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-500">生年月日</p>
              <p className="text-sm text-gray-900">
                {format(new Date(customer.dateOfBirth), 'yyyy年M月d日', { locale: ja })}
              </p>
            </div>
          </div>
        )}

        {/* 健康情報 */}
        {customer.healthInfo && (
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-500">健康情報</p>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">
                {typeof customer.healthInfo === 'object'
                  ? (customer.healthInfo as { text: string }).text
                  : String(customer.healthInfo)}
              </p>
            </div>
          </div>
        )}

        {/* メモ */}
        {customer.notes && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium text-gray-500 mb-2">メモ</p>
            <p className="text-sm text-gray-900 whitespace-pre-wrap">{customer.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}