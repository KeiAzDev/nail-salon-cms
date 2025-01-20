// src/lib/constants/appointment.ts
import { addMinutes, setHours, setMinutes } from 'date-fns'

export const BUSINESS_HOURS = {
  start: { hour: 9, minute: 0 }, // 営業開始: 9:00
  end: { hour: 19, minute: 0 },  // 営業終了: 19:00
}

export const SLOT_DURATION = 60 // 1枠60分

// 予約枠の生成
export function generateTimeSlots(date: Date) {
  const slots = []
  let currentTime = setMinutes(setHours(date, BUSINESS_HOURS.start.hour), BUSINESS_HOURS.start.minute)
  const endTime = setMinutes(setHours(date, BUSINESS_HOURS.end.hour), BUSINESS_HOURS.end.minute)

  while (currentTime < endTime) {
    slots.push({
      start: new Date(currentTime),
      end: new Date(addMinutes(currentTime, SLOT_DURATION))
    })
    currentTime = addMinutes(currentTime, SLOT_DURATION)
  }

  return slots
}

// 施術メニューの定義
export const TREATMENT_MENU = [
  { id: 1, name: 'ジェルネイル', duration: 60, price: 6000 },
  { id: 2, name: 'ネイルケア', duration: 30, price: 3000 },
  { id: 3, name: 'ネイルオフ', duration: 30, price: 2000 },
  { id: 4, name: 'フットネイル', duration: 90, price: 7000 },
] as const

// 予約ステータスの定義
export const APPOINTMENT_STATUS = {
  SCHEDULED: '予約済み',
  CONFIRMED: '確認済み',
  CANCELLED: 'キャンセル',
  COMPLETED: '完了',
} as const