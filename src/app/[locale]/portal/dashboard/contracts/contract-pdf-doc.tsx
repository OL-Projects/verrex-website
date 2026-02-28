"use client"

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import type { Contract } from "@/types/portal"

const blue = "#1e3a5f"
const lightBlue = "#e8f0fe"
const midBlue = "#3b82f6"
const grey = "#64748b"
const dark = "#1e293b"

const s = StyleSheet.create({
  page: { padding: 40, fontSize: 9, fontFamily: "Helvetica", color: dark },
  header: { backgroundColor: lightBlue, padding: 20, marginBottom: 0, borderBottom: `2px solid ${midBlue}` },
  headerRow: { flexDirection: "row", justifyContent: "space-between" },
  companyName: { fontSize: 18, fontFamily: "Helvetica-Bold", color: blue, letterSpacing: 2 },
  subtitle: { fontSize: 7, color: grey, marginTop: 2, letterSpacing: 1 },
  companyInfo: { fontSize: 7.5, color: grey, marginTop: 10, lineHeight: 1.6 },
  contNumBox: { borderWidth: 1, borderColor: midBlue, borderRadius: 3, padding: "6 10", alignSelf: "flex-start" },
  contNumLabel: { fontSize: 7, color: grey, letterSpacing: 2, textAlign: "right" },
  contNum: { fontSize: 11, fontFamily: "Helvetica-Bold", color: blue, textAlign: "right", marginTop: 2 },
  regNums: { fontSize: 6.5, color: grey, marginTop: 8, textAlign: "right", lineHeight: 1.5 },
  section: { paddingHorizontal: 20, paddingVertical: 12 },
  sectionLabel: { fontSize: 7, fontFamily: "Helvetica-Bold", color: grey, letterSpacing: 1.5, marginBottom: 6 },
  partiesRow: { flexDirection: "row", gap: 20 },
  partyCol: { flex: 1 },
  partyLabel: { fontSize: 7, color: grey, letterSpacing: 1, marginBottom: 3 },
  partyName: { fontSize: 10, fontFamily: "Helvetica-Bold", color: dark },
  partyAddr: { fontSize: 8, color: grey, marginTop: 2, lineHeight: 1.4 },
  metaRow: { flexDirection: "row", gap: 15, marginTop: 10 },
  metaItem: { flex: 1 },
  metaLabel: { fontSize: 6.5, color: grey, letterSpacing: 1 },
  metaVal: { fontSize: 8, fontFamily: "Helvetica-Bold", color: dark, marginTop: 1 },
  tableHeader: { flexDirection: "row", borderBottomWidth: 1.5, borderBottomColor: midBlue, paddingBottom: 4, marginBottom: 2 },
  tableHeaderCell: { fontSize: 7, fontFamily: "Helvetica-Bold", color: blue, letterSpacing: 1 },
  tableRow: { flexDirection: "row", paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0" },
  tableRowAlt: { backgroundColor: "#f8fafd" },
  cellDesc: { flex: 5, fontSize: 8, color: dark, paddingRight: 6 },
  cellQty: { width: 30, fontSize: 8, color: dark, textAlign: "center" },
  cellSpec: { flex: 5, fontSize: 7.5, color: grey },
  totalBox: { backgroundColor: lightBlue, borderWidth: 1, borderColor: midBlue, borderRadius: 3, padding: "8 14", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 8 },
  totalLabel: { fontSize: 10, fontFamily: "Helvetica-Bold", color: blue },
  totalVal: { fontSize: 10, fontFamily: "Helvetica-Bold", color: blue },
  payRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 3, borderBottomWidth: 0.5, borderBottomColor: "#f1f5f9" },
  payMilestone: { fontSize: 8, color: dark, flex: 4 },
  payPct: { fontSize: 7.5, color: grey, width: 30, textAlign: "center" },
  payAmt: { fontSize: 8, fontFamily: "Helvetica-Bold", color: dark, width: 65, textAlign: "right" },
  payDate: { fontSize: 7, color: grey, width: 60, textAlign: "right" },
  payStatus: { fontSize: 7, fontFamily: "Helvetica-Bold", width: 40, textAlign: "right" },
  termsList: { paddingLeft: 6 },
  termItem: { fontSize: 7.5, color: grey, lineHeight: 1.6, marginBottom: 3 },
  notes: { fontSize: 8, color: grey, lineHeight: 1.5 },
  sigRow: { flexDirection: "row", gap: 40, marginTop: 6 },
  sigCol: { flex: 1 },
  sigLabel: { fontSize: 7, color: grey, letterSpacing: 1, marginBottom: 30 },
  sigLine: { borderBottomWidth: 0.5, borderBottomColor: "#94a3b8", marginBottom: 3 },
  sigName: { fontSize: 7, color: grey },
  footer: { backgroundColor: lightBlue, borderTopWidth: 1.5, borderTopColor: midBlue, padding: "8 20", marginTop: "auto" },
  footerText: { fontSize: 6, color: grey, lineHeight: 1.4 },
  divider: { borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0" },
})

const fmt = (n: number) => `$${n.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export function ContractPDFDocument({ contract: c }: { contract: Contract }) {
  return (
    <Document>
      <Page size="LETTER" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerRow}>
            <View>
              <Text style={s.companyName}>VEREX INDUSTRIES</Text>
              <Text style={s.subtitle}>CONTRAT DE SERVICE / SERVICE AGREEMENT</Text>
              <View style={s.companyInfo}>
                <Text>1234 Boulevard Industriel</Text>
                <Text>Montréal, QC H2X 3K6</Text>
                <Text>Tél: (514) 555-0100 · info@verexindustries.ca</Text>
              </View>
            </View>
            <View>
              <Text style={s.contNumLabel}>CONTRACT</Text>
              <View style={s.contNumBox}><Text style={s.contNum}>{c.contractNumber}</Text></View>
              <View style={s.regNums}>
                <Text>RBQ: 5678-9012-34</Text>
                <Text>GST/TPS: 123 456 789 RT0001</Text>
                <Text>QST/TVQ: 1234 5678 9012 TQ0001</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Parties */}
        <View style={s.section}>
          <View style={s.partiesRow}>
            <View style={s.partyCol}>
              <Text style={s.partyLabel}>CONTRACTOR / ENTREPRENEUR</Text>
              <Text style={s.partyName}>Verex Industries Inc.</Text>
              <Text style={s.partyAddr}>1234 Boulevard Industriel, Montréal, QC H2X 3K6</Text>
            </View>
            <View style={s.partyCol}>
              <Text style={s.partyLabel}>CLIENT</Text>
              <Text style={s.partyName}>{c.clientName}</Text>
              <Text style={s.partyAddr}>{c.clientAddress}{"\n"}{c.clientCity}</Text>
            </View>
          </View>
          <View style={s.metaRow}>
            <View style={s.metaItem}><Text style={s.metaLabel}>START DATE</Text><Text style={s.metaVal}>{c.startDate}</Text></View>
            <View style={s.metaItem}><Text style={s.metaLabel}>COMPLETION</Text><Text style={s.metaVal}>{c.completionDate}</Text></View>
            <View style={s.metaItem}><Text style={s.metaLabel}>WARRANTY</Text><Text style={s.metaVal}>{c.warrantyYears} Years</Text></View>
            <View style={s.metaItem}><Text style={s.metaLabel}>STATUS</Text><Text style={s.metaVal}>{c.status.toUpperCase()}{c.signedDate ? ` — ${c.signedDate}` : ""}</Text></View>
          </View>
        </View>
        <View style={s.divider} />

        {/* Scope */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>SCOPE OF WORK / ÉTENDUE DES TRAVAUX</Text>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { flex: 5 }]}>DESCRIPTION</Text>
            <Text style={[s.tableHeaderCell, { width: 30, textAlign: "center" }]}>QTY</Text>
            <Text style={[s.tableHeaderCell, { flex: 5 }]}>SPECIFICATIONS</Text>
          </View>
          {c.scopeItems.map((item, i) => (
            <View key={i} style={[s.tableRow, i % 2 === 0 ? s.tableRowAlt : {}]}>
              <Text style={s.cellDesc}>{item.description}</Text>
              <Text style={s.cellQty}>{item.quantity}</Text>
              <Text style={s.cellSpec}>{item.specifications}</Text>
            </View>
          ))}
        </View>

        {/* Total + Payment */}
        <View style={s.section}>
          <View style={s.totalBox}>
            <Text style={s.totalLabel}>TOTAL CONTRACT VALUE</Text>
            <Text style={s.totalVal}>{fmt(c.totalValue)}</Text>
          </View>
          <Text style={s.sectionLabel}>PAYMENT SCHEDULE / ÉCHÉANCIER DE PAIEMENT</Text>
          {c.paymentSchedule.map((p, i) => (
            <View key={i} style={s.payRow}>
              <Text style={s.payMilestone}>{p.status === "paid" ? "✓ " : "○ "}{p.milestone}</Text>
              <Text style={s.payPct}>{p.percentage}%</Text>
              <Text style={s.payAmt}>{fmt(p.amount)}</Text>
              <Text style={s.payDate}>{p.dueDate}</Text>
              <Text style={[s.payStatus, { color: p.status === "paid" ? "#16a34a" : "#d97706" }]}>{p.status.toUpperCase()}</Text>
            </View>
          ))}
        </View>
        <View style={s.divider} />

        {/* Terms */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>TERMS &amp; CONDITIONS / TERMES ET CONDITIONS</Text>
          <View style={s.termsList}>
            {c.terms.map((term, i) => (
              <Text key={i} style={s.termItem}>{i + 1}. {term}</Text>
            ))}
          </View>
        </View>

        {/* Notes */}
        {c.notes ? (
          <View style={s.section}>
            <Text style={s.sectionLabel}>NOTES / REMARQUES</Text>
            <Text style={s.notes}>{c.notes}</Text>
          </View>
        ) : null}

        {/* Signatures */}
        <View style={s.section}>
          <View style={s.sigRow}>
            <View style={s.sigCol}>
              <Text style={s.sigLabel}>CONTRACTOR / ENTREPRENEUR</Text>
              <View style={s.sigLine} />
              <Text style={s.sigName}>Verex Industries Inc. — Date</Text>
            </View>
            <View style={s.sigCol}>
              <Text style={s.sigLabel}>CLIENT</Text>
              <View style={s.sigLine} />
              <Text style={s.sigName}>{c.clientName} — Date</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>Verex Industries Inc. — Licensed Contractor (RBQ #5678-9012-34)</Text>
          <Text style={s.footerText}>GST/TPS: 123 456 789 RT0001 · QST/TVQ: 1234 5678 9012 TQ0001</Text>
          <Text style={s.footerText}>Governed by the Civil Code of Québec (CCQ Art. 2098–2129) · verexindustries.ca</Text>
        </View>
      </Page>
    </Document>
  )
}
