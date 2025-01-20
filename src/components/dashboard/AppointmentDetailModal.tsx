// src/components/dashboard/AppointmentDetailModal.tsx
'use client'

import { Appointment, User } from '@prisma/client'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { X } from 'lucide-react'
import { TREATMENT_MENU } from '@/lib/constants/appointment'
import { AppointmentWithDetails } from '@/types/appointment'

// Removed local declaration of AppointmentWithDetails to avoid conflict with imported type

interface AppointmentDetailModalProps {
  appointment: AppointmentWithDetails
  onClose: () => void
  onStatusChange: (appointmentId: string, newStatus: string) => void
}

const statusColors = {
  SCHEDULED: 'bg-blue-100 text-blue-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
}

const statusLabels = {
  SCHEDULED: '予約済み',
  CONFIRMED: '確認済み',
  CANCELLED: 'キャンセル',
  COMPLETED: '完了',
}

export function AppointmentDetailModal({
  appointment,
  onClose,
  onStatusChange,
}: AppointmentDetailModalProps) {
  // 予約に含まれるメニューの取得
  const services = appointment.services as { menuIds: number[] } | null
  const selectedMenus = services?.menuIds.map(
    id => TREATMENT_MENU.find(menu => menu.id === id)
  ).filter(Boolean) || []

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-semibold text-gray-900">予約詳細</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6 space-y-6">
            {/* 基本情報 */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">予約情報</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm text-gray-800">
                  日時: {format(new Date(appointment.date), 'yyyy年M月d日(E)', { locale: ja })}
                </p>
                <p className="text-sm text-gray-800">
                  時間: {format(new Date(appointment.startTime), 'HH:mm')} - 
                  {format(new Date(appointment.endTime), 'HH:mm')}
                </p>
                <p className="text-sm text-gray-800">
                  担当: {appointment.staff.name}
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-800">ステータス:</span>
                  <select
                    value={appointment.status}
                    onChange={(e) => onStatusChange(appointment.id, e.target.value)}
                    className={`text-sm rounded-full px-2 py-1 ${
                      statusColors[appointment.status as keyof typeof statusColors]
                    }`}
                  >
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 顧客情報 */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">顧客情報</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm text-gray-800">
                  名前: {appointment.customer.lastName} {appointment.customer.firstName}
                </p>
                <p className="text-sm text-gray-800">
                  メール: {appointment.customer.email}
                </p>
                <p className="text-sm text-gray-800">
                  電話: {appointment.customer.phone}
                </p>
              </div>
            </div>

            {/* 施術メニュー */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">施術メニュー</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2">
                  {selectedMenus.map((menu) => (
                    <div key={menu?.id} className="flex justify-between text-sm text-gray-800">
                      <span>{menu?.name}</span>
                      <span>¥{menu?.price.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between font-medium">
                      <span>合計</span>
                      <span>
                        ¥{selectedMenus.reduce((sum, menu) => sum + (menu?.price || 0), 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* メモ */}
            {appointment.notes && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">メモ</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{appointment.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}