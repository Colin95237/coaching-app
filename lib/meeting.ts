export function generateOutlookMeetingLink(
  startTime: Date,
  endTime: Date,
  subject: string,
  description?: string,
  online: boolean = true
) {
  // Outlook erwartet UTC-Zeit im speziellen Format
  const formatDate = (date: Date) =>
    date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

  let url = 'https://outlook.office.com/calendar/0/deeplink/compose?'
  url += 'path=/calendar/action/compose&'
  url += 'rru=addevent&'
  url += `subject=${encodeURIComponent(subject)}&`
  url += `startdt=${formatDate(startTime)}&`
  url += `enddt=${formatDate(endTime)}&`

  if (description) {
    url += `body=${encodeURIComponent(description)}&`
  }

  if (online) {
    url += 'online=true'
  }

  return url
}