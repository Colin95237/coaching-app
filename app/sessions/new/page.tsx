'use client'

import { useState } from 'react'

export default function NewSessionPage() {
  const [result, setResult] = useState<any>(null)

  async function createSession() {
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: 'bed94c8b-402e-4647-9468-02098a9585fa',
        title: 'Business Coaching',
        startTime: '2026-01-10T10:00:00',
        endTime: '2026-01-10T11:00:00',
      }),
    })

    const data = await res.json()
    setResult(data)
  }

  function downloadICS() {
    const blob = new Blob([result.icsContent], {
      type: 'text/calendar',
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'termin.ics'
    a.click()
  }

  return (
    <div className="p-6 space-y-4">
      <button
        onClick={createSession}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Session erstellen
      </button>

      {result && (
        <div className="space-y-2">
          <a
            href={result.meetingLink}
            target="_blank"
            className="text-blue-600 underline block"
          >
            Outlook / Teams Meeting öffnen
          </a>

          <button
            onClick={downloadICS}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Kalenderdatei (.ics) herunterladen
          </button>
        </div>
      )}
    </div>
  )
}