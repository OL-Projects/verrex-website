"use client"

import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer"
import { EstimateWindowSVGPDF } from "./estimate-window-svg-pdf"
import {
  type EstimateState,
  type GlassPricingSettings,
  type TrimRateSettings,
  WINDOW_TYPES, PRODUCTS, calcTotals, fmt, getEffectiveUnitPrice, isDoorType,
  perimeterInches, perimeterFeet, getItemTrimCost, getItemInstallCost, getItemDescription,
} from "@/lib/estimate-config"

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
  glassSettings?: GlassPricingSettings
  gstRate?: number
  qstRate?: number
  showInstallation?: boolean
  showDelivery?: boolean
  showGST?: boolean
  showQST?: boolean
}

export function EstimatePDFDocument({ est, logo, sigs, glassSettings, gstRate = 5, qstRate = 9.975, showInstallation = true, showDelivery = true, showGST = true, showQST = true }: Props) {
  const t = calcTotals(est, gstRate, qstRate, glassSettings, { showInstallation, showDelivery, showGST, showQST })
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
                    <EstimateWindowSVGPDF width={item.width} height={item.height} type={item.type} flipH={item.hingeLeft ?? false} swingIn={item.swingInside ?? true} />
                  </View>
                  <View style={s.itemRight}>
                    <View style={s.itemHeader}>
                      <Text style={s.itemTitle}>Item #{gi} — {prod?.tag || "STD"}</Text>
                      <Text style={{ fontSize: 8, fontWeight: "bold" }}>{item.customLabel}</Text>
                    </View>
                    <Text style={s.itemType}>{wt?.label || item.type} • {item.width}"W × {item.height}"H × {item.depth}"D</Text>
                    <Text style={s.itemColors}>Ext: {item.extColor} / Int: {item.intColor}</Text>
                    <Text style={{ fontSize: 8.5, color: "#0f172a", fontWeight: "bold", fontFamily: "Helvetica-Bold", marginBottom: 1, backgroundColor: "#f1f5f9", padding: "2 4", borderRadius: 2 }}>
                      {getItemDescription(item.type, item.hingeLeft ?? false, item.swingInside ?? true)}
                      {(item.trimInstall) ? ` • Trim: ${(item.trimStyle ?? "flat").charAt(0).toUpperCase() + (item.trimStyle ?? "flat").slice(1)}` : ""}
                    </Text>
                    <Text style={{ fontSize: 7, color: "#94a3b8" }}>
                      Perimeter: {perimeterInches(item.width, item.height)}" ({perimeterFeet(item.width, item.height).toFixed(1)} ft)
                    </Text>
                    <Text style={{ ...s.egress, color: egress ? "#16a34a" : "#ef4444" }}>
                      EGRESS: {egress ? "Compliant ✓" : "Non-compliant"}
                    </Text>
                    {item.notes ? <Text style={s.itemNotes}>{item.notes}</Text> : null}
                    <Text style={s.itemPrice}>×{item.qty} — {fmt(item.qty * getEffectiveUnitPrice(item, glassSettings))}</Text>
                  </View>
                </View>
              )
            })}
          </View>
        ))}

        {/* ── Summary ── */}
        <View style={s.summaryBox}>
          <View style={s.sumRow}><Text style={s.sumBold}>Products Subtotal</Text><Text style={s.sumBold}>{fmt(t.prodTotal)}</Text></View>
          {showInstallation && <View style={s.sumRow}><Text style={s.sumSub}>Installation ({t.totalUnits} units)</Text><Text style={s.sumSub}>{fmt(t.install)}</Text></View>}
          {showDelivery && <View style={s.sumRow}><Text style={s.sumSub}>Delivery</Text><Text style={s.sumSub}>{fmt(t.delivery)}</Text></View>}
          {(t.trimTotal ?? 0) > 0 && <View style={s.sumRow}><Text style={{ ...s.sumSub, color: "#ea580c" }}>Trim Total</Text><Text style={{ ...s.sumSub, color: "#ea580c" }}>{fmt(t.trimTotal)}</Text></View>}
          {showGST && <View style={s.sumRow}><Text style={s.sumSub}>GST ({gstRate}%)</Text><Text style={s.sumSub}>{fmt(t.gst)}</Text></View>}
          {showQST && <View style={s.sumRow}><Text style={s.sumSub}>QST ({qstRate}%)</Text><Text style={s.sumSub}>{fmt(t.qst)}</Text></View>}
          <View style={s.totalRow}><Text>TOTAL</Text><Text>{fmt(t.total)}</Text></View>
          <View style={s.depositRow}><Text>Deposit Required ({est.depositPct}%)</Text><Text>{fmt(t.deposit)}</Text></View>
          <View style={{ ...s.depositRow, backgroundColor: "#fff7ed", marginTop: 2 }}><Text style={{ color: "#9a3412" }}>Balance Remaining</Text><Text style={{ color: "#9a3412" }}>{fmt(t.total - t.deposit)}</Text></View>
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
