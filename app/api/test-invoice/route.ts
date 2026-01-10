import { createInvoicePDF } from '../../lib/invoice'

export async function GET() {
  const doc = createInvoicePDF()

  const pdfBuffer = doc.output('arraybuffer')

  return new Response(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="rechnung.pdf"',
    },
  })
}
