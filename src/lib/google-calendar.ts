// src/lib/google-calendar.ts
import { google } from 'googleapis'
import { JWT } from 'google-auth-library'

const SCOPES = ['https://www.googleapis.com/auth/calendar']

const getGoogleCalendarClient = () => {
  const auth = new JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: SCOPES,
  })

  return google.calendar({ version: 'v3', auth })
}

interface EventOptions {
  startTime: Date
  endTime: Date
  customerName: string
  staffName: string
  services: string[]
  status?: string
}

export const updateGoogleCalendarEvent = async (
  eventId: string,
  options: EventOptions
) => {
  try {
    const calendar = getGoogleCalendarClient()

    const event = {
      summary: `${options.customerName}様 - ネイル予約`,
      description: `担当: ${options.staffName}\nメニュー: ${options.services.join(
        ', '
      )}${options.status ? `\nステータス: ${options.status}` : ''}`,
      start: {
        dateTime: options.startTime.toISOString(),
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: options.endTime.toISOString(),
        timeZone: 'Asia/Tokyo',
      },
    }

    const response = await calendar.events.update({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId: eventId,
      requestBody: event,
    })

    return response.data
  } catch (error) {
    console.error('Google Calendar update error:', error)
    throw new Error('Failed to update event in Google Calendar')
  }
}

export const deleteFromGoogleCalendar = async (eventId: string) => {
  try {
    const calendar = getGoogleCalendarClient()
    await calendar.events.delete({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId: eventId,
    })
  } catch (error) {
    console.error('Google Calendar deletion error:', error)
    throw new Error('Failed to delete event from Google Calendar')
  }
}