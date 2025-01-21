// src/components/dashboard/AppointmentDetailModal.tsx
'use client'

import { AppointmentStatus, AppointmentWithDetails } from '@/types/appointment'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { X, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TREATMENT_MENU } from '@/lib/constants/appointment'

interface AppointmentDetailModalProps {
  appointment: AppointmentWithDetails
  onClose: () => void
}

export function AppointmentDetailModal({ 
  appointment, 
  onClose 
}: AppointmentDetailModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showTreatmentForm, setShowTreatmentForm] = useState(false)

  // 予約削除ハンドラー
  const handleDelete = async () => {
    if (!confirm('この予約を削除してもよろしいですか？\n※この操作は取り消せません。')) {
      return
    }
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/appointments/${appointment.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('予約の削除に失敗しました')
      }

      router.refresh()
      onClose()
    } catch (error) {
      console.error('Appointment deletion error:', error)
      setError('予約の削除に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  // 予約更新ハンドラー
  const handleUpdateAppointment = async () => {
    // 実装予定
  }

  // 施術完了ハンドラー
  const handleCompleteTreatment = async () => {
    // 実装予定
  }

  // 選択されたメニューの情報を取得
  const services = appointment.services as { menuIds: number[] } | null
  const selectedMenus = services?.menuIds.map(
    id => TREATMENT_MENU.find(menu => menu.id === id)
  ).filter(Boolean) || []

  // 合計金額の計算
  const totalAmount = selectedMenus.reduce((sum, menu) => sum + (menu?.price || 0), 0)

  // 編集フォーム
  const EditForm = () => (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">予約内容の変更</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">日付</label>
          <input
            type="date"
            className="mt-1 block w-full border rounded-md shadow-sm p-2 text-gray-800"
            defaultValue={format(new Date(appointment.date), 'yyyy-MM-dd')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">時間</label>
          <input
            type="time"
            className="mt-1 block w-full border rounded-md shadow-sm p-2 text-gray-800"
            defaultValue={format(new Date(appointment.startTime), 'HH:mm')}
          />
        </div>
      </div>
    </div>
  )

  // 施術完了フォーム
  const TreatmentForm = () => (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">施術内容の記録</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700">実施した施術</label>
        <div className="mt-2 space-y-2">
          {selectedMenus.map((menu) => (
            <div key={menu?.id} className="flex items-center">
              <input type="checkbox" className="rounded" defaultChecked />
              <span className="ml-2 text-gray-800">{menu?.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">使用製品</label>
        <textarea
          className="mt-1 block w-full border rounded-md shadow-sm p-2 text-gray-800"
          rows={2}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">次回推奨メニュー</label>
        <textarea
          className="mt-1 block w-full border rounded-md shadow-sm p-2 text-gray-800"
          rows={2}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">特記事項/メモ</label>
        <textarea
          className="mt-1 block w-full border rounded-md shadow-sm p-2 text-gray-800"
          rows={3}
        />
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="p-6">
          {/* ヘッダー */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">予約詳細</h2>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* 予約情報 */}
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
                    <div key={menu?.id} className="flex justify-between text-gray-800">
                      <span>{menu?.name}</span>
                      <span>¥{menu?.price.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between font-medium text-gray-800">
                      <span>合計</span>
                      <span>¥{totalAmount.toLocaleString()}</span>
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
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">
                    {appointment.notes}
                  </p>
                </div>
              </div>
            )}

            {/* フォームの条件付き表示 */}
            {showEditForm && (
              <div className="mt-6">
                <EditForm />
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowEditForm(false)}
                    className="px-4 py-2 text-gray-600"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleUpdateAppointment}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md"
                  >
                    変更を保存
                  </button>
                </div>
              </div>
            )}

            {showTreatmentForm && (
              <div className="mt-6">
                <TreatmentForm />
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowTreatmentForm(false)}
                    className="px-4 py-2 text-gray-600"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleCompleteTreatment}
                    className="px-4 py-2 bg-green-600 text-white rounded-md"
                  >
                    完了を記録
                  </button>
                </div>
              </div>
            )}

            {/* 操作ボタン */}
            <div className="flex justify-end items-center space-x-4 pt-4 border-t">
              {!showEditForm && !showTreatmentForm && (
                <>
                  {/* 予約の変更ボタン */}
                  <button
                    onClick={() => setShowEditForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    disabled={loading}
                  >
                    予約を変更
                  </button>

                  {/* 削除ボタン */}
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                    disabled={loading}
                  >
                    予約を削除
                  </button>

                  {/* 完了ボタン */}
                  <button
                    onClick={() => setShowTreatmentForm(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    disabled={loading}
                  >
                    施術完了
                  </button>
                </>
              )}

              {loading && <Loader2 className="h-5 w-5 animate-spin text-gray-400" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}