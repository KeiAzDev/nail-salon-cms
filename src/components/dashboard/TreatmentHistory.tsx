// src/components/dashboard/TreatmentHistory.tsx
'use client'

import { TreatmentHistory as TreatmentHistoryType } from '@prisma/client'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface TreatmentHistoryProps {
  history: TreatmentHistoryType[]
}

export function TreatmentHistory({ history }: TreatmentHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
        施術履歴がありません
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg divide-y">
      {history.map((treatment) => (
        <div key={treatment.id} className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500">
                {format(new Date(treatment.date), 'yyyy年M月d日', { locale: ja })}
              </p>
              <div className="mt-1 flex flex-wrap gap-2">
                {(treatment.services as { name: string; price: number }[]).map((service, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {service.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 使用製品 */}
          {treatment.products && treatment.products.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500">使用製品</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {(treatment.products as { name: string }[]).map((product, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {product.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* メモ */}
          {treatment.notes && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500">メモ</p>
              <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{treatment.notes}</p>
            </div>
          )}

          {/* 次回推奨メニュー */}
          {treatment.nextRecommendation && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500">次回推奨メニュー</p>
              <p className="mt-1 text-sm text-gray-900">{treatment.nextRecommendation}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}