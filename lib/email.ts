import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function sendInvoiceEmail(
  to: string,
  customerName: string,
  pdfBase64: string
) {
  await resend.emails.send({
    from: 'Coaching App <noreply@yourdomain.com>',
    to,
    subject: 'Deine Rechnung',
    html: `
      <p>Hallo ${customerName},</p>
      <p>anbei deine Rechnung.</p>
      <p>Viele Grüße<br/>Dein Coaching</p>
    `,
    attachments: [
      {
        filename: 'rechnung.pdf',
        content: pdfBase64.split(',')[1],
      },
    ],
  })
}