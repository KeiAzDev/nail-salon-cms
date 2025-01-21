// src/components/dashboard/AppointmentCalendar.tsx
'use client'

import { useState } from 'react'
import { format, addDays, startOfWeek, eachDayOfInterval } from 'date-fns'
import { ja } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { generateTimeSlots, BUSINESS_HOURS } from '@/lib/constants/appointment'
import { User } from '@prisma/client'
import { AppointmentWithDetails } from '@/types/appointment'
import { AppointmentDetailModal } from './AppointmentDetailModal'

interface AppointmentCalendarProps {
  appointments: AppointmentWithDetails[]
  staffMembers: User[]
  onSlotSelect: (date: Date, staffId: string) => void
}

export function AppointmentCalendar({
  appointments,
  staffMembers,
  onSlotSelect,
}: AppointmentCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedStaffId, setSelectedStaffId] = useState<string | 'all'>('all')
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null)

  // 週の日付を生成
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: addDays(weekStart, 6),
  })

  // 時間枠を生成
  const timeSlots = generateTimeSlots(selectedDate)

  // 予約枠の状態を確認
  const isSlotBooked = (date: Date, staffId: string): boolean => {
    const targetTime = format(date, 'yyyy-MM-dd HH:mm')
    return appointments.some((apt) => {
      const appointmentTime = format(new Date(apt.startTime), 'yyyy-MM-dd HH:mm')
      return apt.staffId === staffId && appointmentTime === targetTime
    })
  }

  const getAppointmentForSlot = (date: Date, staffId: string): AppointmentWithDetails | undefined => {
    const targetTime = format(date, 'yyyy-MM-dd HH:mm')
    return appointments.find((apt) => {
      const appointmentTime = format(new Date(apt.startTime), 'yyyy-MM-dd HH:mm')
      return apt.staffId === staffId && appointmentTime === targetTime
    })
  }

  // 予約のステータス変更ハンドラー
  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        throw new Error('ステータスの更新に失敗しました')
      }
    } catch (error) {
      console.error('Status update error:', error)
      alert('ステータスの更新に失敗しました')
    }
  }

  // 予約表示用の関数
  const renderAppointment = (appointment: AppointmentWithDetails) => {
    const statusColors = {
      SCHEDULED: 'bg-blue-100',
      CONFIRMED: 'bg-green-100',
      CANCELLED: 'bg-red-100',
      COMPLETED: 'bg-gray-100',
    }

    const customerName = appointment.customer 
      ? `${appointment.customer.lastName} ${appointment.customer.firstName}`
      : '顧客情報なし'

    return (
      <button
        onClick={() => setSelectedAppointment(appointment)}
        className={`w-full text-left p-1 rounded text-xs text-gray-800 ${
          statusColors[appointment.status as keyof typeof statusColors]
        }`}
      >
        {customerName}
      </button>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        {/* カレンダーヘッダー */}
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, -7))}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="font-medium text-gray-800">
              {format(weekStart, 'yyyy年M月d日', { locale: ja })} の週
            </span>
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, 7))}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          
          <select
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)}
            className="border rounded-md p-2 text-gray-800"
          >
            <option value="all">全てのスタッフ</option>
            {staffMembers.map((staff) => (
              <option key={staff.id} value={staff.id}>
                {staff.name}
              </option>
            ))}
          </select>
        </div>

        {/* カレンダーグリッド */}
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* 曜日ヘッダー */}
            <div className="grid grid-cols-8 bg-gray-50">
              <div className="p-4 border-b border-r font-medium text-gray-800">時間</div>
              {weekDays.map((date) => (
                <div
                  key={date.toString()}
                  className="p-4 border-b border-r font-medium text-center text-gray-800"
                >
                  {format(date, 'M/d (E)', { locale: ja })}
                </div>
              ))}
            </div>

            {/* タイムスロット */}
            {timeSlots.map((slot) => (
              <div key={slot.start.toString()} className="grid grid-cols-8">
                <div className="p-4 border-b border-r text-sm text-gray-800">
                  {format(slot.start, 'HH:mm')}
                </div>
                {weekDays.map((date) => {
                  const slotDate = new Date(
                    date.getFullYear(),
                    date.getMonth(),
                    date.getDate(),
                    slot.start.getHours(),
                    slot.start.getMinutes()
                  )

                  return (
                    <div
                      key={date.toString()}
                      className="p-2 border-b border-r min-h-[60px]"
                    >
                      {selectedStaffId === 'all' ? (
                        // 全スタッフ表示モード
                        <div className="space-y-1">
                          {staffMembers.map((staff) => {
                            const appointment = getAppointmentForSlot(slotDate, staff.id)
                            return appointment ? (
                              <div key={staff.id}>
                                {renderAppointment(appointment)}
                              </div>
                            ) : null
                          })}
                        </div>
                      ) : (
                        // 個別スタッフ表示モード
                        <div>
                          {isSlotBooked(slotDate, selectedStaffId) ? (
                            (() => {
                              const appointment = getAppointmentForSlot(slotDate, selectedStaffId)
                              return appointment ? renderAppointment(appointment) : null
                            })()
                          ) : (
                            <button
                              onClick={() => onSlotSelect(slotDate, selectedStaffId)}
                              className="w-full h-full text-gray-800 hover:bg-gray-50"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 予約詳細モーダル */}
      {selectedAppointment && (
  <AppointmentDetailModal
    appointment={selectedAppointment}
    onClose={() => setSelectedAppointment(null)}
  />
)}
    </>
  )
}