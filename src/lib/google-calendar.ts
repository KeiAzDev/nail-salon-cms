// src/lib/google-calendar.ts
import { google } from 'googleapis'
import { JWT } from 'google-auth-library'

const SCOPES = ['https://www.googleapis.com/auth/calendar']

// 秘密鍵の処理を改善
const getPrivateKey = () => {
  const key = process.env.GOOGLE_PRIVATE_KEY
  if (!key) throw new Error('GOOGLE_PRIVATE_KEY is not set')
  
  // 秘密鍵の形式を確認し、必要に応じて修正
  if (key.includes('\\n')) {
    return key.replace(/\\n/g, '\n')
  }
  return key
}

const credentials = {
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  private_key: getPrivateKey(),
  calendar_id: process.env.GOOGLE_CALENDAR_ID,
}

export const getGoogleCalendarClient = () => {
  if (!credentials.client_email || !credentials.private_key || !credentials.calendar_id) {
    throw new Error('Missing required Google Calendar credentials')
  }

  try {
    const auth = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: SCOPES,
    })

    return google.calendar({ version: 'v3', auth })
  } catch (error) {
    console.error('Google Calendar client creation error:', error)
    throw error
  }
}

export const addToGoogleCalendar = async (appointment: {
  startTime: Date
  endTime: Date
  customerName: string
  staffName: string
  services: string[]
}) => {
  try {
    const calendar = getGoogleCalendarClient()

    const event = {
      summary: `${appointment.customerName}様 - ネイル予約`,
      description: `担当: ${appointment.staffName}\nメニュー: ${appointment.services.join(
        ', '
      )}`,
      start: {
        dateTime: appointment.startTime.toISOString(),
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: appointment.endTime.toISOString(),
        timeZone: 'Asia/Tokyo',
      },
    }

    console.log('Creating calendar event with:', {
      calendarId: credentials.calendar_id,
      event,
    })

    const response = await calendar.events.insert({
      calendarId: credentials.calendar_id,
      requestBody: event,
    })

    return response.data
  } catch (error) {
    console.error('Google Calendar error:', error)
    throw new Error('Failed to add event to Google Calendar')
  }
}