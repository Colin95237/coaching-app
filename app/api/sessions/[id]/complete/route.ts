import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { createInvoicePDF } from '../../../../../lib/invoice'

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // --- 0. User prüfen ---
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Bitte einloggen.' },
        { status: 401 }
      )
    }

    // ✅ params korrekt auflösen
    const { id: sessionId } = await context.params

    // 1. Session auf completed setzen
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .update({ status: 'completed' })
      .eq('id', sessionId)
      .select(`
        *,
        customers (*)
      `)
      .single()

    if (sessionError) throw sessionError

    // 2. PDF erzeugen
    const pdf = createInvoicePDF(
      session,
      session.customers
    )

    // 3. PDF als Base64 zurückgeben
    const pdfBase64 = pdf.output('datauristring')

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
