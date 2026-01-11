import jsPDF from 'jspdf' // PDF per Javascript erzeugen

export function createInvoicePDF(session: any, customer: any) { // gibt PDF-Dokument zurück
  const doc = new jsPDF() // Standard A4 210mm breit, 297mm hoch

  // Seitentitel
  doc.setFontSize(20)
  doc.text('RECHNUNG', 105, 20, { align: 'center' })

  // Rechnungsdaten
  doc.setFontSize(12)
  doc.text(`Rechnungsnummer: INV-${session.id.slice(0, 8)}`, 20, 40)
  doc.text(`Datum: ${new Date().toLocaleDateString('de-DE')}`, 20, 50)

  // Kundendaten
  doc.text('Kunde:', 20, 70)
  doc.text(customer.name, 20, 80)
  doc.text(customer.email, 20, 90)

  // Leistung
  doc.text('Leistung:', 20, 110)
  doc.text(session.title, 20, 120)

  // Preis (MVP: fix)
  doc.text('Betrag: 100,00 €', 20, 140)
  doc.text('MwSt (19%): 19,00 €', 20, 150)
  doc.text('Gesamt: 119,00 €', 20, 160)

  return doc
}