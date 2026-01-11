import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createInvoicePDF } from '@/lib/invoice'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  // ✅ WICHTIG: await cookies()
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  // 🔐 Auth prüfen
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized. Bitte einloggen.' },
      { status: 401 }
    )
  }

  const sessionId = params.id

  // 1. Session abschließen
  const { data: session, error } = await supabase
    .from('sessions')
    .update({ status: 'completed' })
    .eq('id', sessionId)
    .select(`
      *,
      customers (*)
    `)
    .single()

  if (error) {
    console.error(error)
    return NextResponse.json({ error: 'DB Fehler' }, { status: 500 })
  }

  // 2. Rechnung als PDF erzeugen
  const pdf = createInvoicePDF(session, session.customers)
  const pdfBase64 = pdf.output('datauristring')

  return NextResponse.json({
    success: true,
    pdf: pdfBase64,
  })
}