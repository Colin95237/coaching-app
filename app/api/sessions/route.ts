import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateOutlookMeetingLink } from '../../../lib/meeting'
import { generateCalendarEvent } from '../../../lib/calendar'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select(`
        id,
        title,
        start_time,
        end_time,
        status,
        teams_link,
        customers (
          id,
          name,
          email
        )
      `)
      .order('start_time', { ascending: false })

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Fehler beim Laden der Sessions' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      customerId,
      title,
      startTime,
      endTime,
    } = body

    // 1️⃣ Session in DB speichern
    const { data: session, error } = await supabase
      .from('sessions')
      .insert([
        {
          customer_id: customerId,
          title,
          start_time: startTime,
          end_time: endTime,
          status: 'planned',
        },
      ])
      .select(`
        *,
        customer:customers(*)
      `)
      .single()

    if (error) throw error

    // 2️⃣ Outlook / Teams Meeting-Link
    const meetingLink = generateOutlookMeetingLink(
      new Date(session.start_time),
      new Date(session.end_time),
      `Coaching: ${session.title}`,
      `Coaching Session mit ${session.customer.name}`
    )

    // 3️⃣ ICS Kalenderdatei
    const icsContent = generateCalendarEvent(
      `Coaching: ${session.title}`,
      `Coaching Session mit ${session.customer.name}`,
      new Date(session.start_time),
      new Date(session.end_time)
    )

    // 4️⃣ Meeting-Link in Session speichern
    await supabase
      .from('sessions')
      .update({ teams_link: meetingLink })
      .eq('id', session.id)

    // 5️⃣ Response
    return NextResponse.json({
      session,
      meetingLink,
      icsContent,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Session konnte nicht erstellt werden' },
      { status: 500 }
    )
  }
}