'use client'

import { generateCalendarEvent } from '../../lib/calendar'

export default function TestCalendar() {
  function downloadICS() {
    const icsContent = generateCalendarEvent(
      'Coaching Session',
      'Coaching mit Anna Schmidt',
      new Date('2026-01-10T10:00:00'),
      new Date('2026-01-10T11:00:00')
    )

    const blob = new Blob([icsContent], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = 'coaching-termin.ics'
    a.click()

    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6">
      <button
        onClick={downloadICS}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Termin zum Kalender hinzufügen
      </button>
    </div>
  )
}