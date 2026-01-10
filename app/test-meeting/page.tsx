'use client'

import { generateOutlookMeetingLink } from '../lib/meeting'

export default function TestMeeting() {
  const meetingLink = generateOutlookMeetingLink(
    new Date('2026-01-10T10:00:00'),
    new Date('2026-01-10T11:00:00'),
    'Coaching Session',
    'Coaching mit Anna Schmidt'
  )

  return (
    <div className="p-6 space-y-4">
      <a
        href={meetingLink}
        target="_blank"
        className="inline-block bg-purple-600 text-white px-4 py-2 rounded"
      >
        Outlook / Teams Meeting erstellen
      </a>

      <p className="text-sm text-gray-600 break-all">
        {meetingLink}
      </p>
    </div>
  )
}