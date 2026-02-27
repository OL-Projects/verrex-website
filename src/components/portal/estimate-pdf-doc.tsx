"use client"

import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer"
import { EstimateWindowSVGPDF } from "./estimate-window-svg-pdf"
import {
  type EstimateState,
  WINDOW_TYPES, PRODUCTS, calcTotals, fmt,
  computeCalculatedPrice, getGlassRateForItem, GLASS_RATE_UNITS,
  type GlassRateUnit,
} from "@/lib/estimate-config"
import type { EstimateSettings } from "@/lib/estimate-hooks"

const s = StyleSheet.create({
  page: { padding: 40, fontSize: 9, fontFamily: "Helvetica", color: "#0f172a" },
  // Header
  hdr: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 3, borderBottomColor: "#1e293b", paddingBottom: 12, marginBottom: 16 },
  hdrLeft: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  logo: { height: 40, width: 40, objectFit: "contain" },
  coName: { fontSize: 22, fontWeight: "bold", letterSpacing: 2, fontFamily: "Helvetica-Bold" },
  coTag: { fontSize: 7, letterSpacing: 3, color: "#64748b" },
  coInfo: { fontSize: 7, color: "#94a3b8", marginTop: 2 },
  hdrRight: { textAlign: "right" },
  estLabel: { fontSize: 7, fontWeight: "bold", color: "#64748b", textTransform: "uppercase", letterSpacing: 2 },
  estNum: { fontSize: 16, fontWeight: "bold", fontFamily: "Helvetica-Bold" },
  estDate: { fontSize: 7, color: "#94a3b8" },
  // Client/Ship
  grid2: { flexDirection: "row", gap: 16, marginBottom: 20 },
  half: { flex: 1 },
  secLabel: { fontSize: 7, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 2, color: "#64748b", marginBottom: 4, fontFamily: "Helvetica-Bold" },
  val: { fontSize: 9, fontWeight: "bold", fontFamily: "Helvetica-Bold" },
  sub: { fontSize: 8, color: "#64748b" },
  // Room
  roomTitle: { fontSize: 8, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 4, borderBottomWidth: 2, borderBottomColor: "#1e293b", paddingBottom: 3, marginBottom: 8, fontFamily: "Helvetica-Bold" },
  // Item
  itemRow: { flexDirection: "row", gap: 10, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: "#1e293b", paddingLeft: 8 },
  itemRight: { flex: 1 },
  itemHeader: { flexDirection: "row", justifyContent: "space-between" },
  itemTitle: { fontSize: 9, fontWeight: "bold", fontFamily: "Helvetica-Bold" },
  itemType: { fontSize: 8, color: "#475569" },
  itemColors: { fontSize: 7, color: "#64748b" },
  itemNotes: { fontSize: 7, color: "#94a3b8", fontStyle: "italic", marginTop: 2 },
  itemPrice: { fontSize: 9, fontWeight: "bold", textAlign: "right", marginTop: 2, fontFamily: "Helvetica-Bold" },
  // Summary
  summaryBox: { borderTopWidth: 3, borderTopColor: "#1e293b", paddingTop: 10, marginTop: 10 },
  sumRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  sumBold: { fontWeight: "bold", fontFamily: "Helvetica-Bold" },
  sumSub: { color: "#475569", fontSize: 8 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", fontSize: 14, fontWeight: "bold", borderTopWidth: 2, borderTopColor: "#1e293b", paddingTop: 6, marginTop: 6, fontFamily: "Helvetica-Bold" },
  depositRow: { flexDirection: "row", justifyContent: "space-between", fontSize: 9, fontWeight: "bold", backgroundColor: "#f1f5f9", padding: "4 6", borderRadius: 4, marginTop: 6, fontFamily: "Helvetica-Bold" },
  // Terms
  termsBox: { marginTop: 16, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#e2e8f0" },
  termsTitle: { fontSize: 9, fontWeight: "bold", marginBottom: 4, fontFamily: "Helvetica-Bold" },
  termsLine: { fontSize: 6.5, color: "#64748b", marginBottom: 1 },
  // Signatures
  sigGrid: { flexDirection: "row", gap: 40, marginTop: 30 },
  sigBox: { flex: 1, borderBottomWidth: 1, borderBottomColor: "#1e293b", minHeight: 40 },
  sigImg: { height: 36, objectFit: "contain" },
  sigLabel: { fontSize: 7, marginTop: 2 },
  // Egress
  egress: { fontSize: 7, fontWeight: "bold", marginTop: 1 },
})

interface Props {
  est: EstimateState
  logo?: string
  sigs?: { client: string; rep: string }
  settings?: Partial<EstimateSettings>
}

// Default settings for glass pricing (used when settings prop not provided)
const defaultGlassSettings = {
  showCalculatedPrice: true,
  glassRateUnit: "sqin" as GlassRateUnit,
  doubleTemperedRate: 0.50,
  tripleTemperedRate: 0.75,
  doorShowCalculatedPrice: true,
  doorGlassRateUnit: "sqin" as GlassRateUnit,
  doorDoubleTemperedRate: 0.50,
  doorTripleTemperedRate: 0.75,
}

export function EstimatePDFDocument({ est, logo, sigs, settings }: Props) {
  const cfg = { ...defaultGlassSettings, ...settings }
  const t = calcTotals(est)
  let gi = 0

  return (
    <Document title={`${est.company.name} - Estimate ${est.estimateNumber}`} author={est.company.name}>
      <Page size="LETTER" style={s.page}>
        {/* Page number footer */}
        <Text style={{ position: "absolute", bottom: 20, left: 0, right: 0, textAlign: "center", fontSize: 7, color: "#94a3b8" }} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} fixed />
        {/* ── Header ── */}
        <View style={s.hdr}>
          <View style={s.hdrLeft}>
            {logo && <Image src={logo} style={s.logo} />}
            <View>
              <Text style={s.coName}>{est.company.name}</Text>
              <Text style={s.coTag}>{est.company.tagline}</Text>
              {est.company.phone && <Text style={s.coInfo}>{est.company.phone} • {est.company.website}</Text>}
              {est.company.address && <Text style={s.coInfo}>{est.company.address}, {est.company.city}</Text>}
            </View>
          </View>
          <View style={s.hdrRight}>
            <Text style={s.estLabel}>Estimate #</Text>
            <Text style={s.estNum}>{est.estimateNumber}</Text>
            <Text style={s.estDate}>Date: {est.date}{est.validUntil && ` • Valid: ${est.validUntil}`}</Text>
            {est.requiredBy && <Text style={s.estDate}>Required By: {est.requiredBy}</Text>}
          </View>
        </View>

        {/* ── Client / Ship ── */}
        <View style={s.grid2}>
          <View style={s.half}>
            <Text style={s.secLabel}>{est.soldToLabel}</Text>
            <Text style={s.val}>{est.clientName || "—"}</Text>
            <Text style={s.sub}>{est.clientAddress} {est.clientCity}</Text>
            <Text style={s.sub}>{est.clientPhone}</Text>
            <Text style={s.sub}>{est.clientEmail}</Text>
          </View>
          <View style={s.half}>
            <Text style={s.secLabel}>{est.shipToLabel}</Text>
            <Text style={s.val}>{est.shipMethod}</Text>
            <Text style={s.sub}>{est.shipAddress}</Text>
            <Text style={s.sub}>{est.shipPhone}</Text>
            <Text style={{ ...s.sub, marginTop: 6 }}>Rep: {est.repName || "—"}{est.repRef ? ` (${est.repRef})` : ""}</Text>
          </View>
        </View>

        {/* ── Rooms & Items ── */}
        {est.rooms.map(room => (
          <View key={room.id} style={{ marginBottom: 14 }}>
            <Text style={s.roomTitle}>{room.name}</Text>
            {room.items.map(item => {
              gi++
              const prod = PRODUCTS.find(p => p.id === item.product)
              const wt = WINDOW_TYPES[item.type]
              const hasCas = (wt?.modules || []).some(m => m.startsWith("CAS"))
              const egress = hasCas && item.height >= 24
              return (
                <View key={item.id} style={s.itemRow} wrap={false}>
                  <View style={{ width: 110, minHeight: 80, alignItems: "center", justifyContent: "center" }}>
                    <EstimateWindowSVGPDF width={item.width} height={item.height} type={item.type} />
                  </View>
                  <View style={s.itemRight}>
                    <View style={s.itemHeader}>
                      <Text style={s.itemTitle}>Item #{gi} — {prod?.tag || "STD"}</Text>
                      <Text style={{ fontSize: 8, fontWeight: "bold" }}>{item.customLabel}</Text>
                    </View>
                    <Text style={s.itemType}>{wt?.label || item.type} • {item.width}"W × {item.height}"H × {item.depth}"D</Text>
                    <Text style={s.itemColors}>Ext: {item.extColor} / Int: {item.intColor}</Text>
                    <Text style={{ ...s.egress, color: egress ? "#16a34a" : "#ef4444" }}>
                      EGRESS: {egress ? "Compliant ✓" : "Non-compliant"}
                    </Text>
                    {item.notes ? <Text style={s.itemNotes}>{item.notes}</Text> : null}
                    {(() => {
                      const glassInfo = getGlassRateForItem(item, cfg)
                      if (!glassInfo.show || glassInfo.rate <= 0) return null
                      const calcPrice = computeCalculatedPrice(item, glassInfo.rate, glassInfo.unit)
                      const unitLabel = GLASS_RATE_UNITS.find(u => u.id === glassInfo.unit)?.short || "/sq in"
                      return (
                        <Text style={{ fontSize: 7, color: "#059669", fontWeight: "bold", marginTop: 1, fontFamily: "Helvetica-Bold" }}>
                          Glass Calc: {fmt(calcPrice)} ({item.width}×{item.height} @ {fmt(glassInfo.rate)}{unitLabel})
                        </Text>
                      )
                    })()}
                    <Text style={s.itemPrice}>×{item.qty} — {fmt(item.qty * item.unitPrice)}</Text>
                  </View>
                </View>
              )
            })}
          </View>
        ))}

        {/* ── Summary ── */}
        <View style={s.summaryBox}>
          <View style={s.sumRow}><Text style={s.sumBold}>Products Subtotal</Text><Text style={s.sumBold}>{fmt(t.prodTotal)}</Text></View>
          <View style={s.sumRow}><Text style={s.sumSub}>Installation ({t.totalUnits} units)</Text><Text style={s.sumSub}>{fmt(t.install)}</Text></View>
          <View style={s.sumRow}><Text style={s.sumSub}>Delivery</Text><Text style={s.sumSub}>{fmt(t.delivery)}</Text></View>
          <View style={s.sumRow}><Text style={s.sumSub}>GST (5%)</Text><Text style={s.sumSub}>{fmt(t.gst)}</Text></View>
          <View style={s.sumRow}><Text style={s.sumSub}>QST (9.975%)</Text><Text style={s.sumSub}>{fmt(t.qst)}</Text></View>
          <View style={s.totalRow}><Text>TOTAL</Text><Text>{fmt(t.total)}</Text></View>
          <View style={s.depositRow}><Text>Deposit ({est.depositPct}%)</Text><Text>{fmt(t.deposit)}</Text></View>
        </View>

        {/* ── Terms ── */}
        <View style={s.termsBox}>
          <Text style={s.termsTitle}>Terms & Conditions</Text>
          {est.termsLines.map((l, i) => (
            <Text key={i} style={s.termsLine}>{i + 1}. {l}</Text>
          ))}
        </View>

        {/* ── Signatures ── */}
        <View style={s.sigGrid}>
          <View style={{ flex: 1 }}>
            <View style={s.sigBox}>
              {sigs?.client ? <Image src={sigs.client} style={s.sigImg} /> : null}
            </View>
            <Text style={s.sigLabel}>Client Signature & Date</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={s.sigBox}>
              {sigs?.rep ? <Image src={sigs.rep} style={s.sigImg} /> : null}
            </View>
            <Text style={s.sigLabel}>Representative Signature & Date</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
