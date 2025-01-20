// src/components/dashboard/AppointmentCalendar.tsx
'use client'

import { useState } from 'react'
import { format, addDays, startOfWeek, eachDayOfInterval } from 'date-fns'
import { ja } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { generateTimeSlots, BUSINESS_HOURS } from '@/lib/constants/appointment'
import { Appointment, User } from '@prisma/client'

type AppointmentWithStaff = Appointment & {
  staff: User
  customer: {
    firstName: string
    lastName: string
  }
}

interface AppointmentCalendarProps {
  appointments: AppointmentWithStaff[]
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

  // 週の日付を生成
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: addDays(weekStart, 6),
  })

  // 時間枠を生成
  const timeSlots = generateTimeSlots(selectedDate)

  // 予約枠の状態を確認
  const isSlotBooked = (date: Date, staffId: string) => {
    return appointments.some(
      (apt) =>
        apt.staffId === staffId &&
        format(new Date(apt.startTime), 'yyyy-MM-dd HH:mm') ===
          format(date, 'yyyy-MM-dd HH:mm')
    )
  }

  const getAppointmentForSlot = (date: Date, staffId: string) => {
    return appointments.find(
      (apt) =>
        apt.staffId === staffId &&
        format(new Date(apt.startTime), 'yyyy-MM-dd HH:mm') ===
          format(date, 'yyyy-MM-dd HH:mm')
    )
  }

  return (
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
          <span className="font-medium">
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
          className="border rounded-md p-2"
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
            <div className="p-4 border-b border-r font-medium">時間</div>
            {weekDays.map((date) => (
              <div
                key={date.toString()}
                className="p-4 border-b border-r font-medium text-center"
              >
                {format(date, 'M/d (E)', { locale: ja })}
              </div>
            ))}
          </div>

          {/* タイムスロット */}
          {timeSlots.map((slot) => (
            <div key={slot.start.toString()} className="grid grid-cols-8">
              <div className="p-4 border-b border-r text-sm">
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
                            <div
                              key={staff.id}
                              className="text-xs p-1 bg-blue-100 rounded"
                            >
                              {staff.name}: {appointment.customer.lastName}{' '}
                              {appointment.customer.firstName}
                            </div>
                          ) : null
                        })}
                      </div>
                    ) : (
                      // 個別スタッフ表示モード
                      <button
                        onClick={() => onSlotSelect(slotDate, selectedStaffId)}
                        className={`w-full h-full ${
                          isSlotBooked(slotDate, selectedStaffId)
                            ? 'bg-blue-100'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {getAppointmentForSlot(slotDate, selectedStaffId)?.customer.lastName}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}