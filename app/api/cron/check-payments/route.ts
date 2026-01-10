'use server'
import { supabase } from '../../../lib/supabase'

// Optional: E-Mail Funktion
async function sendPaymentReminder(email: string, name: string, invoiceNr: string, amount: number) {
  console.log(`Reminder an ${email} für Rechnung ${invoiceNr} über ${amount} €`)
  // Hier später Resend API aufrufen
}

export async function GET(request: Request) {
  // Einfacher Schutz: Secret in Header
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
      .eq('status', 'sent') // nur offene Rechnungen

    if (error) throw error

    // 2️⃣ Rechnungen als überfällig markieren & Erinnerung senden
    for (const invoice of overdueInvoices || []) {
      await supabase
        .from('invoices')
        .update({
          status: 'overdue',
          reminder_sent_at: new Date().toISOString()
        })
        .eq('id', invoice.id)

      // Optional: E-Mail an Kunden
      await sendPaymentReminder(
        invoice.session.customer.email,
        invoice.session.customer.name,
        `INV-${invoice.id.slice(0, 8)}`,
        invoice.amount
      )
    }

    return new Response(JSON.stringify({
      checked: overdueInvoices?.length || 0,
      timestamp: new Date().toISOString()
    }))
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 })
  }
}