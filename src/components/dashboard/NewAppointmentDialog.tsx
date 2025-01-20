// src/components/dashboard/NewAppointmentDialog.tsx
'use client'

import { useState, useEffect } from 'react'
import { User } from '@prisma/client'
import { Plus, Loader2 } from 'lucide-react'
import { TREATMENT_MENU } from '@/lib/constants/appointment'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { useRouter } from 'next/navigation'

interface NewAppointmentDialogProps {
  staffMembers: User[]
}

type Customer = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
}

export function NewAppointmentDialog({ 
  staffMembers 
}: NewAppointmentDialogProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [selectedStaffId, setSelectedStaffId] = useState('')
  const [selectedMenuIds, setSelectedMenuIds] = useState<number[]>([])
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  // 顧客検索の実装
  useEffect(() => {
    const searchCustomers = async () => {
      if (searchTerm.length < 2) {
        setSearchResults([])
        return
      }

      setLoading(true)
      try {
        const res = await fetch(`/api/customers/search?q=${encodeURIComponent(searchTerm)}`)
        if (!res.ok) throw new Error('検索に失敗しました')
        const data = await res.json()
        setSearchResults(data)
      } catch (error) {
        console.error('Customer search error:', error)
        setError('検索中にエラーが発生しました')
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(searchCustomers, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const totalAmount = selectedMenuIds
    .map(id => TREATMENT_MENU.find(menu => menu.id === id)?.price || 0)
    .reduce<number>((sum, price) => sum + price, 0)

  const resetForm = () => {
    setStep(1)
    setSearchTerm('')
    setSearchResults([])
    setSelectedCustomer(null)
    setSelectedDate('')
    setSelectedTime('')
    setSelectedStaffId('')
    setSelectedMenuIds([])
    setNotes('')
    setError(null)
  }

  const handleSubmit = async () => {
    if (!selectedCustomer || !selectedDate || !selectedTime || !selectedStaffId || !selectedMenuIds.length) {
      setError('必須項目を入力してください')
      return
    }

    setLoading(true)
    try {
      const startTime = new Date(`${selectedDate}T${selectedTime}`)
      
      const totalDuration = selectedMenuIds
        .map(id => TREATMENT_MENU.find(menu => menu.id === id)?.duration || 0)
        .reduce<number>((sum, duration) => sum + duration, 0)

      const endTime = new Date(startTime.getTime() + totalDuration * 60000)

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          staffId: selectedStaffId,
          date: selectedDate,
          startTime,
          endTime,
          menuIds: selectedMenuIds,
          notes,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '予約の作成に失敗しました')
      }

      setIsOpen(false)
      resetForm()
      router.refresh()
    } catch (error) {
      console.error('Appointment creation error:', error)
      setError(error instanceof Error ? error.message : '予約の作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
      >
        <Plus className="h-5 w-5 mr-2" />
        新規予約
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* ヘッダー */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">新規予約</h2>
                <button
                  onClick={() => {
                    setIsOpen(false)
                    resetForm()
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* エラーメッセージ */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md">
                  {error}
                </div>
              )}

              {/* プログレスバー */}
              <div className="mb-6">
                <div className="flex space-x-4 mb-4">
                  {[1, 2, 3].map((stepNum) => (
                    <div
                      key={stepNum}
                      className={`flex-1 h-2 rounded-full ${
                        step >= stepNum ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* ステップ1: 顧客検索 */}
              {step === 1 && (
                <div>
                  <h3 className="font-medium text-gray-800 mb-4">顧客検索</h3>
                  <input
                    type="text"
                    placeholder="顧客名、メールアドレス、電話番号で検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 border rounded-md mb-4 text-gray-800"
                  />

                  <div className="max-h-[40vh] overflow-y-auto mb-4">
                    {loading ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {searchResults.map((customer) => (
                          <button
                            key={customer.id}
                            onClick={() => {
                              setSelectedCustomer(customer)
                              setStep(2)
                            }}
                            className="text-left p-3 hover:bg-gray-50 border rounded-md"
                          >
                            <div className="font-medium text-gray-800">
                              {customer.lastName} {customer.firstName}
                            </div>
                            <div className="text-sm text-gray-500">{customer.email}</div>
                            <div className="text-sm text-gray-500">{customer.phone}</div>
                          </button>
                        ))}
                      </div>
                    ) : searchTerm.length >= 2 ? (
                      <div className="text-center py-4 text-gray-500">
                        該当する顧客が見つかりません
                      </div>
                    ) : null}
                  </div>
                </div>
              )}

              {/* ステップ2: 日時・スタッフ選択 */}
              {step === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      日付
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={format(new Date(), 'yyyy-MM-dd')}
                      className="w-full p-2 border rounded-md text-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      時間
                    </label>
                    <input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full p-2 border rounded-md text-gray-800"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      担当スタッフ
                    </label>
                    <select
                      value={selectedStaffId}
                      onChange={(e) => setSelectedStaffId(e.target.value)}
                      className="w-full p-2 border rounded-md text-gray-800"
                    >
                      <option value="">選択してください</option>
                      {staffMembers.map((staff) => (
                        <option key={staff.id} value={staff.id}>
                          {staff.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* ステップ3: メニュー選択と確認 */}
              {step === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <h3 className="font-medium text-gray-800 mb-2">施術メニュー</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {TREATMENT_MENU.map((menu) => (
                        <label
                          key={menu.id}
                          className="flex items-center p-2 border rounded-md cursor-pointer hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={selectedMenuIds.includes(menu.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedMenuIds([...selectedMenuIds, menu.id])
                              } else {
                                setSelectedMenuIds(
                                  selectedMenuIds.filter((id) => id !== menu.id)
                                )
                              }
                            }}
                            className="rounded mr-2"
                          />
                          <div className="flex-1">
                            <div className="text-gray-800">{menu.name}</div>
                            <div className="text-sm text-gray-500">
                              {menu.duration}分 - ¥{menu.price.toLocaleString()}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      メモ
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full p-2 border rounded-md text-gray-800"
                      rows={2}
                    />
                  </div>

                  {/* 予約内容の確認 */}
                  <div className="md:col-span-2 bg-gray-50 p-4 rounded-md">
                    <h4 className="font-medium text-gray-800 mb-2">予約内容の確認</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">顧客名</div>
                        <div className="text-gray-800">
                          {selectedCustomer?.lastName} {selectedCustomer?.firstName}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">日時</div>
                        <div className="text-gray-800">
                          {selectedDate &&
                            `${format(new Date(selectedDate), 'yyyy年M月d日(E)', {
                              locale: ja,
                            })} ${selectedTime}`}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">担当スタッフ</div>
                        <div className="text-gray-800">
                          {staffMembers.find((s) => s.id === selectedStaffId)?.name}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">合計金額</div>
                        <div className="text-gray-800">
                          ¥{totalAmount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* フッター */}
              <div className="mt-6 flex justify-between">
                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    戻る
                  </button>
                )}
                <button
                  onClick={() => {
                    if (step === 3) {
                      handleSubmit()
                    } else {
                      setStep(step + 1)
                    }
                  }}
                  disabled={loading || 
                    (step === 1 && !selectedCustomer) ||
                    (step === 2 && (!selectedDate || !selectedTime || !selectedStaffId)) ||
                    (step === 3 && !selectedMenuIds.length)
                }
                className="ml-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : step === 3 ? (
                    '予約を作成'
                  ) : (
                    '次へ'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}