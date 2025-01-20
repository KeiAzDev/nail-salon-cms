// src/components/dashboard/NewAppointmentDialog.tsx
'use client'

import { useState } from 'react'
import { User } from '@prisma/client'
import { Plus } from 'lucide-react'
import { TREATMENT_MENU } from '@/lib/constants/appointment'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface NewAppointmentDialogProps {
  staffMembers: User[]
}

export function NewAppointmentDialog({ staffMembers }: NewAppointmentDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedStaffId, setSelectedStaffId] = useState('')
  const [selectedMenu, setSelectedMenu] = useState<number[]>([])
  const [step, setStep] = useState(1) // 1: 顧客検索, 2: 日時・スタッフ選択, 3: メニュー選択

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // 予約作成処理をここに実装
    } catch (error) {
      console.error('Error creating appointment:', error)
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">新規予約</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

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

              {step === 1 && (
                <div>
                  <h3 className="font-medium mb-4">顧客検索</h3>
                  <input
                    type="text"
                    placeholder="顧客名で検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                  {/* 顧客検索結果表示部分はここに実装 */}
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => setStep(2)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md"
                    >
                      次へ
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h3 className="font-medium mb-4">日時・スタッフ選択</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        日付
                      </label>
                      <input
                        type="date"
                        value={format(selectedDate, 'yyyy-MM-dd')}
                        onChange={(e) => setSelectedDate(new Date(e.target.value))}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        スタッフ
                      </label>
                      <select
                        value={selectedStaffId}
                        onChange={(e) => setSelectedStaffId(e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">スタッフを選択</option>
                        {staffMembers.map((staff) => (
                          <option key={staff.id} value={staff.id}>
                            {staff.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between">
                    <button
                      onClick={() => setStep(1)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      戻る
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md"
                    >
                      次へ
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h3 className="font-medium mb-4">メニュー選択</h3>
                  <div className="space-y-2">
                    {TREATMENT_MENU.map((menu) => (
                      <label
                        key={menu.id}
                        className="flex items-center space-x-2 p-2 border rounded-md cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMenu.includes(menu.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMenu([...selectedMenu, menu.id])
                            } else {
                              setSelectedMenu(selectedMenu.filter((id) => id !== menu.id))
                            }
                          }}
                          className="rounded"
                        />
                        <span>{menu.name}</span>
                        <span className="text-gray-500">
                          {menu.duration}分 - ¥{menu.price.toLocaleString()}
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-between">
                    <button
                      onClick={() => setStep(2)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      戻る
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:opacity-50"
                    >
                      {loading ? '予約作成中...' : '予約を作成'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}