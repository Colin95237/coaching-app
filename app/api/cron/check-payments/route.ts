// app/api/cron/check-payments/route.ts
import { supabase } from '../../../lib/supabase'
import { NextResponse } from 'next/server'

// Optional: E-Mail Funktion
async function sendPaymentReminder(
  email: string,
  name: string,
  invoiceNr: string,
  amount: number
) {
  console.log(`Reminder an ${email} für Rechnung ${invoiceNr} über ${amount} €`)
  // Hier später Resend API aufrufen
}

// Edge runtime aktivieren
export const runtime = 'edge'

export async function GET(request: Request) {
  // Einfacher Schutz: Secret in Header prüfen
  const cronSecret = request.headers.get('x-cron-secret')
  if (cronSecret !== process.env.CRON_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    // 1️⃣ Überfällige Rechnungen finden
    const { data: overdueInvoices, error } = await supabase
      .from('invoices')
      .select(`
        *,
        session:sessions(
          *,
          customer:customers(*)
        )
      `)
      .lt('due_date', new Date().toISOString())
      .eq('status', 'sent')

    if (error) throw error

    // 2️⃣ Rechnungen als überfällig markieren & optional Reminder senden
    for (const invoice of overdueInvoices || []) {
      await supabase
        .from('invoices')
        .update({
          status: 'overdue',
          reminder_sent_at: new Date().toISOString()
        })
        .eq('id', invoice.id)

      await sendPaymentReminder(
        invoice.session.customer.email,
        invoice.session.customer.name,
        `INV-${invoice.id.slice(0, 8)}`,
        invoice.amount
      )
    }

    return NextResponse.json({
      checked: overdueInvoices?.length || 0,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
