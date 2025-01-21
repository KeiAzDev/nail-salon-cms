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

interface ServiceData {
  menuIds: number[]
  totalDuration?: number
  totalPrice?: number
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

  // サービスデータのパース処理
  const getServiceData = (services: string | null): ServiceData | null => {
    if (!services) return null;
    try {
      const parsed = JSON.parse(services);
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.menuIds)) {
        return parsed as ServiceData;
      }
    } catch (e) {
      console.error('Error parsing services:', e);
    }
    return null;
  };

  const services = getServiceData(appointment.services as string);
  const [selectedMenuIds, setSelectedMenuIds] = useState<number[]>(
    services?.menuIds || []
  );

  const selectedMenus = services?.menuIds?.map(
    id => TREATMENT_MENU.find(menu => menu.id === id)
  ).filter(Boolean) || [];

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
  const handleUpdateAppointment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)
      const date = formData.get('date') as string
      const time = formData.get('time') as string
      const notes = formData.get('notes') as string

      if (!date || !time || selectedMenuIds.length === 0) {
        throw new Error('必須項目が入力されていません')
      }

      const res = await fetch(`/api/appointments/${appointment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date,
          startTime: time,
          menuIds: selectedMenuIds,
          notes,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '予約の更新に失敗しました')
      }

      router.refresh()
      setShowEditForm(false)
    } catch (error) {
      console.error('Appointment update error:', error)
      setError(error instanceof Error ? error.message : '予約の更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  // 施術完了ハンドラー
  const handleCompleteTreatment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)
      const completedServices = formData.getAll('completed_services').map(String)
      if (completedServices.length === 0) {
        throw new Error('施術内容を選択してください')
      }

      const res = await fetch(`/api/appointments/${appointment.id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          services: completedServices,
          products: formData.get('products'),
          nextRecommendation: formData.get('nextRecommendation'),
          notes: formData.get('notes'),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '施術完了の記録に失敗しました')
      }

      router.refresh()
      setShowTreatmentForm(false)
    } catch (error) {
      console.error('Treatment completion error:', error)
      setError(error instanceof Error ? error.message : '施術完了の記録に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  // 合計金額の計算
  const totalAmount = selectedMenus.reduce((sum, menu) => sum + (menu?.price || 0), 0)

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

            {/* 予約変更フォーム */}
            {showEditForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-medium text-gray-800">予約内容の変更</h3>
                      <button 
                        onClick={() => setShowEditForm(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <form onSubmit={handleUpdateAppointment} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">日付</label>
                          <input
                            type="date"
                            name="date"
                            className="mt-1 block w-full border rounded-md shadow-sm p-2 text-gray-800"
                            defaultValue={format(new Date(appointment.date), 'yyyy-MM-dd')}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">時間</label>
                          <input
                            type="time"
                            name="time"
                            className="mt-1 block w-full border rounded-md shadow-sm p-2 text-gray-800"
                            defaultValue={format(new Date(appointment.startTime), 'HH:mm')}
                          />
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">施術メニュー</h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {TREATMENT_MENU.map((menu) => (
                            <label
                              key={menu.id}
                              className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                            >
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={selectedMenuIds.includes(menu.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedMenuIds([...selectedMenuIds, menu.id])
                                    } else {
                                      setSelectedMenuIds(
                                        selectedMenuIds.filter(id => id !== menu.id)
                                      )
                                    }
                                  }}
                                  className="rounded border-gray-300"
                                />
                                <span className="ml-2 text-gray-800">{menu.name}</span>
                              </div>
                              <span className="text-gray-800">
                                {menu.duration}分 - ¥{menu.price.toLocaleString()}
                              </span>
                            </label>
                          ))}
                        </div>

                        <div className="mt-4 pt-4 border-t">
                          <div className="flex justify-end">
                            <div className="text-right">
                              <span className="text-gray-700">合計金額: </span>
                              <span className="text-lg font-medium text-gray-800">
                                ¥{selectedMenuIds.reduce((sum, id) => {
                                  const menu = TREATMENT_MENU.find(m => m.id === id)
                                  return sum + (menu?.price || 0)
                                }, 0).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">メモ</label>
                        <textarea
                          name="notes"
                          className="mt-1 block w-full border rounded-md shadow-sm p-2 text-gray-800"
                          rows={3}
                          defaultValue={appointment.notes || ''}
                        />
                      </div>

                      <div className="mt-6 flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setShowEditForm(false)}
                          className="px-4 py-2 text-gray-600"
                        >
                          キャンセル
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                          変更を保存
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* 施術完了フォーム */}
            {showTreatmentForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-medium text-gray-800">施術完了の記録</h3>
                      <button 
                        onClick={() => setShowTreatmentForm(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <form onSubmit={handleCompleteTreatment} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">実施した施術</label>
                        <div className="mt-2 space-y-2">
                          {selectedMenus.map((menu) => (
                            <div key={menu?.id} className="flex items-center">
                              <input 
                                type="checkbox" 
                                name="completed_services" 
                                value={menu?.id}
                                defaultChecked 
                                className="rounded" 
                              />
                              <span className="ml-2 text-gray-800">{menu?.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">使用製品</label>
                        <textarea
                          name="products"
                          className="mt-1 block w-full border rounded-md shadow-sm p-2 text-gray-800"
                          rows={2}
                          placeholder="使用した製品を入力してください"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">次回推奨メニュー</label>
                        <textarea
                          name="nextRecommendation"
                          className="mt-1 block w-full border rounded-md shadow-sm p-2 text-gray-800"
                          rows={2}
                          placeholder="次回おすすめのメニューを入力してください"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">特記事項/メモ</label>
                        <textarea
                          name="notes"
                          className="mt-1 block w-full border rounded-md shadow-sm p-2 text-gray-800"
                          rows={3}
                          placeholder="特記事項があれば入力してください"
                        />
                      </div>

                      <div className="mt-6 flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setShowTreatmentForm(false)}
                          className="px-4 py-2 text-gray-600"
                        >
                          キャンセル
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                          完了を記録
                        </button>
                      </div>
                    </form>
                  </div>
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