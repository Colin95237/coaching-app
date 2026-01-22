import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { createInvoicePDF } from '@/lib/invoice'
import { sendInvoiceEmail } from '@/lib/email'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params

    // 1. Session abschließen + Kunde laden
    const { data: session, error } = await supabase
      .from('sessions')
      .update({ status: 'completed' })
      .eq('id', sessionId)
      .select(`*, customers (*)`)
      .single()

    if (error || !session || !session.customers) {
      return NextResponse.json(
        { error: 'Session oder Kunde nicht gefunden' },
        { status: 404 }
      )
    }

    // 2. PDF erzeugen
    const pdf = createInvoicePDF(session, session.customers)
    const pdfBase64 = pdf.output('datauristring')

    // 3. E-Mail senden (BEST EFFORT)
    sendInvoiceEmail(
      session.customers.email,
      session.customers.name,
      pdfBase64
    ).catch((err) => {
      console.error('E-Mail konnte nicht gesendet werden:', err)
    })

    // 4. Erfolg zurückgeben
    return NextResponse.json({
      success: true,
      pdf: pdfBase64,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Fehler beim Abschließen der Session' },
      { status: 500 }
    )
  }
}