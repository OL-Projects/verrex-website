"use client"

import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer"
import type { Invoice } from "@/types/portal"

const blue = "#1e3a8a"
const blueFaint = "#eff6ff"
const blueMed = "#93c5fd"
const gray = "#64748b"
const black = "#0f172a"

const s = StyleSheet.create({
  page: { padding: 40, fontSize: 9, fontFamily: "Helvetica", color: black },
  // Header
  header: { backgroundColor: blueFaint, padding: 20, marginHorizontal: -40, marginTop: -40, paddingHorizontal: 40, borderBottomWidth: 2, borderBottomColor: blueMed, marginBottom: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between" },
  companyName: { fontSize: 16, fontFamily: "Helvetica-Bold", color: blue, letterSpacing: 2, textTransform: "uppercase" as const },
  companyTag: { fontSize: 7, color: "#3b82f6", marginTop: 2, letterSpacing: 1 },
  companyInfo: { fontSize: 7.5, color: gray, marginTop: 8, lineHeight: 1.5 },
  invLabel: { fontSize: 7, color: gray, textAlign: "right" as const, letterSpacing: 2, textTransform: "uppercase" as const },
  invNumBox: { borderWidth: 1, borderColor: blueMed, borderRadius: 3, paddingHorizontal: 8, paddingVertical: 4, marginTop: 4, alignSelf: "flex-end" as const },
  invNum: { fontSize: 11, fontFamily: "Helvetica-Bold", color: blue },
  regNums: { fontSize: 6.5, color: gray, textAlign: "right" as const, marginTop: 6, lineHeight: 1.4 },
  // Billing
  billingRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0" },
  sectionLabel: { fontSize: 6.5, color: gray, letterSpacing: 1.5, textTransform: "uppercase" as const, marginBottom: 4, fontFamily: "Helvetica-Bold" },
  clientName: { fontSize: 10, fontFamily: "Helvetica-Bold", color: black },
  clientAddr: { fontSize: 8, color: gray, marginTop: 2 },
  dateGrid: { flexDirection: "row", gap: 16, flexWrap: "wrap" as const },
  dateItem: { textAlign: "right" as const },
  dateLabel: { fontSize: 6, color: gray, letterSpacing: 1, textTransform: "uppercase" as const },
  dateVal: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: black, marginTop: 1 },
  // Table
  tableHeader: { flexDirection: "row", borderBottomWidth: 1.5, borderBottomColor: blueMed, paddingBottom: 4, marginBottom: 2 },
  th: { fontSize: 7, fontFamily: "Helvetica-Bold", color: blue, letterSpacing: 1, textTransform: "uppercase" as const },
  tableRow: { flexDirection: "row", paddingVertical: 5, borderBottomWidth: 0.5, borderBottomColor: "#f1f5f9" },
  tableRowAlt: { backgroundColor: "#f8faff" },
  tdDesc: { flex: 1, fontSize: 8, color: "#334155" },
  tdQty: { width: 40, fontSize: 8, color: gray, textAlign: "center" as const },
  tdUnit: { width: 65, fontSize: 8, color: gray, textAlign: "right" as const, fontFamily: "Helvetica" },
  tdTotal: { width: 70, fontSize: 8, fontFamily: "Helvetica-Bold", color: black, textAlign: "right" as const },
  // Totals
  totalsWrap: { alignItems: "flex-end" as const, marginTop: 10 },
  totalsBox: { width: 200 },
  totalLine: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  totalLabel: { fontSize: 8, color: gray },
  totalVal: { fontSize: 8, fontFamily: "Helvetica", color: black },
  totalBoldLabel: { fontSize: 10, fontFamily: "Helvetica-Bold", color: black },
  totalBoldVal: { fontSize: 10, fontFamily: "Helvetica-Bold", color: black },
  balanceLine: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, paddingHorizontal: 6, backgroundColor: blueFaint, borderRadius: 3, marginTop: 2 },
  balanceLabel: { fontSize: 10, fontFamily: "Helvetica-Bold", color: blue },
  balanceVal: { fontSize: 10, fontFamily: "Helvetica-Bold", color: blue },
  divider: { height: 0.5, backgroundColor: blueMed, marginVertical: 3 },
  // Amount in words
  wordsBox: { borderWidth: 0.5, borderColor: blueMed, borderStyle: "dashed" as const, borderRadius: 3, padding: 6, marginTop: 10, marginBottom: 10 },
  wordsLabel: { fontSize: 6, color: gray, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: 2, fontFamily: "Helvetica-Bold" },
  wordsText: { fontSize: 8, color: "#334155", fontStyle: "italic" as const },
  // Signature
  sigRow: { flexDirection: "row", gap: 30, marginTop: 14, paddingTop: 10, borderTopWidth: 0.5, borderTopColor: "#e2e8f0" },
  sigBlock: { flex: 1 },
  sigLabel: { fontSize: 6.5, color: gray, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: 20, fontFamily: "Helvetica-Bold" },
  sigLine: { borderBottomWidth: 0.5, borderBottomColor: gray, marginBottom: 2 },
  sigSub: { fontSize: 6, color: gray },
  // Payment
  payBox: { backgroundColor: "#f8faff", padding: 10, borderTopWidth: 0.5, borderTopColor: "#e2e8f0", marginTop: 10 },
  payLabel: { fontSize: 6.5, color: gray, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: 4, fontFamily: "Helvetica-Bold" },
  payText: { fontSize: 7.5, color: gray, lineHeight: 1.5 },
  payBold: { fontFamily: "Helvetica-Bold", color: "#334155" },
  // Footer
  footer: { backgroundColor: blueFaint, padding: 10, marginHorizontal: -40, marginBottom: -40, paddingHorizontal: 40, borderTopWidth: 1.5, borderTopColor: blueMed, marginTop: 12, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 6, color: gray, lineHeight: 1.4 },
  footerSeal: { borderWidth: 0.5, borderColor: blueMed, borderRadius: 2, paddingHorizontal: 6, paddingVertical: 3 },
  footerSealText: { fontSize: 5, color: gray, textAlign: "center" as const, letterSpacing: 1 },
  // Notes
  notesBox: { marginTop: 8, paddingTop: 6, borderTopWidth: 0.5, borderTopColor: "#e2e8f0" },
  notesLabel: { fontSize: 6.5, color: gray, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: 2, fontFamily: "Helvetica-Bold" },
  notesText: { fontSize: 7.5, color: gray, lineHeight: 1.5 },
  // VOID
  voidWatermark: { position: "absolute" as const, top: 300, left: 80, fontSize: 80, fontFamily: "Helvetica-Bold", color: "#fecaca", opacity: 0.4, transform: "rotate(-30deg)" },
  // Paid stamp
  paidStamp: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#059669", marginTop: 6 },
  greenVal: { fontSize: 8, color: "#059669" },
})

function amountToWords(n: number): string {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"]
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]
  if (n === 0) return "Zero"
  const whole = Math.floor(n)
  const cents = Math.round((n - whole) * 100)
  const convert = (num: number): string => {
    if (num < 20) return ones[num]
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? "-" + ones[num % 10] : "")
    if (num < 1000) return ones[Math.floor(num / 100)] + " Hundred" + (num % 100 ? " " + convert(num % 100) : "")
    if (num < 1000000) return convert(Math.floor(num / 1000)) + " Thousand" + (num % 1000 ? " " + convert(num % 1000) : "")
    return convert(Math.floor(num / 1000000)) + " Million" + (num % 1000000 ? " " + convert(num % 1000000) : "")
  }
  return convert(whole) + ` and ${String(cents).padStart(2, "0")}/100 Dollars (CAD)`
}

function fmt(n: number) { return "$" + n.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }

export function InvoicePDFDocument({ invoice: inv }: { invoice: Invoice }) {
  return (
    <Document>
      <Page size="LETTER" style={s.page}>
        {inv.status === "void" && <Text style={s.voidWatermark}>VOID</Text>}

        {/* Header */}
        <View style={s.header}>
          <View style={s.headerRow}>
            <View>
              <Text style={s.companyName}>Verex Industries</Text>
              <Text style={s.companyTag}>PREMIUM WINDOWS & DOORS MANUFACTURER</Text>
              <Text style={s.companyInfo}>1234 Boulevard Industriel{"\n"}Montréal, QC H2X 3K6{"\n"}Tél: (514) 555-0100 · info@verexindustries.ca</Text>
            </View>
            <View>
              <Text style={s.invLabel}>Facture / Invoice</Text>
              <View style={s.invNumBox}><Text style={s.invNum}>{inv.invoiceNumber}</Text></View>
              <Text style={s.regNums}>GST/TPS: 123 456 789 RT0001{"\n"}QST/TVQ: 1234 5678 9012 TQ0001{"\n"}RBQ: 5678-9012-34</Text>
            </View>
          </View>
        </View>

        {/* Billing + Dates */}
        <View style={s.billingRow}>
          <View>
            <Text style={s.sectionLabel}>Billed To / Facturé à</Text>
            <Text style={s.clientName}>{inv.clientName}</Text>
            <Text style={s.clientAddr}>{inv.clientAddress}</Text>
            <Text style={s.clientAddr}>{inv.clientCity}</Text>
          </View>
          <View style={s.dateGrid}>
            <View style={s.dateItem}><Text style={s.dateLabel}>Issue Date</Text><Text style={s.dateVal}>{inv.issueDate}</Text></View>
            <View style={s.dateItem}><Text style={s.dateLabel}>Due Date</Text><Text style={s.dateVal}>{inv.dueDate}</Text></View>
            <View style={s.dateItem}><Text style={s.dateLabel}>Terms</Text><Text style={s.dateVal}>{inv.paymentTerms}</Text></View>
            <View style={s.dateItem}><Text style={s.dateLabel}>Status</Text><Text style={s.dateVal}>{inv.status.toUpperCase()}</Text></View>
          </View>
        </View>

        {/* Line Items */}
        <View style={s.tableHeader}>
          <Text style={[s.th, { flex: 1 }]}>Description</Text>
          <Text style={[s.th, { width: 40, textAlign: "center" }]}>Qty</Text>
          <Text style={[s.th, { width: 65, textAlign: "right" }]}>Unit Price</Text>
          <Text style={[s.th, { width: 70, textAlign: "right" }]}>Amount</Text>
        </View>
        {inv.items.map((item, i) => (
          <View key={i} style={[s.tableRow, i % 2 === 0 ? s.tableRowAlt : {}]}>
            <Text style={s.tdDesc}>{item.description}</Text>
            <Text style={s.tdQty}>{item.quantity}</Text>
            <Text style={s.tdUnit}>{fmt(item.unitPrice)}</Text>
            <Text style={s.tdTotal}>{fmt(item.total)}</Text>
          </View>
        ))}

        {/* Totals */}
        <View style={s.totalsWrap}>
          <View style={s.totalsBox}>
            <View style={s.totalLine}><Text style={s.totalLabel}>Subtotal</Text><Text style={s.totalVal}>{fmt(inv.subtotal)}</Text></View>
            <View style={s.totalLine}><Text style={s.totalLabel}>GST / TPS (5%)</Text><Text style={s.totalVal}>{fmt(inv.taxGST)}</Text></View>
            <View style={s.totalLine}><Text style={s.totalLabel}>QST / TVQ (9.975%)</Text><Text style={s.totalVal}>{fmt(inv.taxQST)}</Text></View>
            <View style={s.divider} />
            <View style={s.totalLine}><Text style={s.totalBoldLabel}>TOTAL</Text><Text style={s.totalBoldVal}>{fmt(inv.total)}</Text></View>
            {inv.depositPaid > 0 && (
              <>
                <View style={s.totalLine}><Text style={s.greenVal}>Deposit Applied</Text><Text style={s.greenVal}>−{fmt(inv.depositPaid)}</Text></View>
                <View style={s.divider} />
                <View style={s.balanceLine}><Text style={s.balanceLabel}>BALANCE DUE</Text><Text style={s.balanceVal}>{fmt(inv.balanceDue)}</Text></View>
              </>
            )}
          </View>
        </View>

        {/* Amount in words */}
        <View style={s.wordsBox}>
          <Text style={s.wordsLabel}>Amount in Words / Montant en lettres</Text>
          <Text style={s.wordsText}>{amountToWords(inv.balanceDue > 0 ? inv.balanceDue : inv.total)}</Text>
        </View>

        {/* Notes */}
        {inv.notes ? (
          <View style={s.notesBox}>
            <Text style={s.notesLabel}>Notes / Remarques</Text>
            <Text style={s.notesText}>{inv.notes}</Text>
          </View>
        ) : null}

        {/* Signature */}
        <View style={s.sigRow}>
          <View style={s.sigBlock}>
            <Text style={s.sigLabel}>Authorized Signature / Signature autorisée</Text>
            <View style={s.sigLine} />
            <Text style={s.sigSub}>Name / Date</Text>
          </View>
          <View style={s.sigBlock}>
            <Text style={s.sigLabel}>Client Acknowledgement</Text>
            <View style={s.sigLine} />
            <Text style={s.sigSub}>Signature / Date</Text>
          </View>
        </View>

        {/* Payment Info */}
        <View style={s.payBox}>
          <Text style={s.payLabel}>Payment Information / Modalités de paiement</Text>
          <Text style={s.payText}>Interac E-Transfer: <Text style={s.payBold}>payments@verexindustries.ca</Text></Text>
          <Text style={s.payText}>Cheque payable to: <Text style={s.payBold}>Verex Industries Inc.</Text></Text>
          <Text style={s.payText}>Reference: <Text style={s.payBold}>{inv.invoiceNumber}</Text></Text>
          {inv.paidDate && <Text style={s.paidStamp}>✓ PAID — {inv.paidDate}{inv.paidMethod ? ` via ${inv.paidMethod}` : ""}</Text>}
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <View>
            <Text style={s.footerText}>Verex Industries Inc. — Licensed Contractor (RBQ #5678-9012-34)</Text>
            <Text style={s.footerText}>GST/TPS: 123 456 789 RT0001 · QST/TVQ: 1234 5678 9012 TQ0001</Text>
            <Text style={s.footerText}>Energy Star® Certified · NFRC Rated · CSA Approved</Text>
          </View>
          <View style={s.footerSeal}>
            <Text style={s.footerSealText}>OFFICIAL DOCUMENT</Text>
            <Text style={s.footerSealText}>verexindustries.ca</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
