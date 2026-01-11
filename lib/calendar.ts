export function generateCalendarEvent(
  title: string,
  description: string,
  start: Date,
  end: Date,
  location: string = 'Online Coaching'
) {
  // Datum ins iCal-Format bringen (UTC)
  const formatDate = (date: Date) =>
    date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Coaching App//DE',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@coaching-app.de`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(start)}`,
    `DTEND:${formatDate(end)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n')

  return icsContent
}