"use client"

import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer"
import { EstimateWindowSVGPDF } from "./estimate-window-svg-pdf"
import {
  type EstimateState,
  type GlassPricingSettings,
  type TrimRateSettings,
  type PaymentStageConfig,
  WINDOW_TYPES, PRODUCTS, calcTotals, fmt, getEffectiveUnitPrice, isDoorType,
  perimeterInches, perimeterFeet, getItemTrimCost, getItemInstallCost, getItemDescription, describeCustomLayout, tl,
} from "@/lib/estimate-config"
import { getPortalT } from "@/lib/portal-i18n"

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
  paymentStages?: PaymentStageConfig[]
  locale?: string
}

export function EstimatePDFDocument({ est, logo, sigs, glassSettings, gstRate = 5, qstRate = 9.975, showInstallation = true, showDelivery = true, showGST = true, showQST = true, paymentStages, locale = "en" }: Props) {
  const t = calcTotals(est, gstRate, qstRate, glassSettings, { showInstallation, showDelivery, showGST, showQST })
  const L = getPortalT(locale)
  let gi = 0

  return (
    <Document title={`${est.company.name} - ${L.est.estimateNum} ${est.estimateNumber}`} author={est.company.name}>
      <Page size="LETTER" style={s.page}>
        {/* Page number footer */}
        <Text style={{ position: "absolute", bottom: 20, left: 0, right: 0, textAlign: "center", fontSize: 7, color: "#94a3b8" }} render={({ pageNumber, totalPages }) => `${L.page} ${pageNumber} ${L.of} ${totalPages}`} fixed />
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
            <Text style={s.estLabel}>{L.est.estimateNum}</Text>
            <Text style={s.estNum}>{est.estimateNumber}</Text>
            <Text style={s.estDate}>{L.date}: {est.date}{est.validUntil && ` • ${L.validUntil}: ${est.validUntil}`}</Text>
            {est.requiredBy && <Text style={s.estDate}>{L.requiredBy}: {est.requiredBy}</Text>}
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
            <Text style={{ ...s.sub, marginTop: 6 }}>{L.rep}: {est.repName || "—"}{est.repRef ? ` (${est.repRef})` : ""}</Text>
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
                    <EstimateWindowSVGPDF width={item.width} height={item.height} type={item.type} flipH={item.hingeLeft ?? false} swingIn={item.swingInside ?? true} locale={locale} customModules={item.customModules} />
                  </View>
                  <View style={s.itemRight}>
                    <View style={s.itemHeader}>
                      <Text style={s.itemTitle}>{L.est.item} #{gi} — {prod?.tag || L.est.std}</Text>
                      <Text style={{ fontSize: 8, fontWeight: "bold" }}>{item.customLabel}</Text>
                    </View>
                    <Text style={s.itemType}>{wt?.label || item.type} • {item.width}"W × {item.height}"H × {item.depth}"D</Text>
                    <Text style={s.itemColors}>{L.est.exterior}: {item.extColor} / {L.est.interior}: {item.intColor}</Text>
                    {!isDoorType(item.type) && (
                    <View style={{ backgroundColor: "#f0f9ff", borderWidth: 0.5, borderColor: "#bae6fd", borderRadius: 3, padding: "3 5", marginBottom: 3 }}>
                      <Text style={{ fontSize: 6, fontWeight: "bold", fontFamily: "Helvetica-Bold", color: "#0369a1", marginBottom: 2 }}>{L.est.glassSpecs.toUpperCase()}</Text>
                      <Text style={{ fontSize: 6.5, color: "#334155" }}>{L.est.thermal}: {item.thermal || "Double"}  •  {L.est.lowELabel}: {item.lowE || "1 Side"}  •  {L.est.glassLabel}: {item.glassThickness || "5mm"}</Text>
                      <Text style={{ fontSize: 6.5, color: "#334155" }}>{L.est.argonLabel}: {item.argonGas || "18mm"}  •  {L.est.typeLabel}: {item.glassType || "Ultra Clear"}  •  {L.est.finishLabel}: {item.glassFinish || "Clear"}</Text>
                      <Text style={{ fontSize: 6.5, color: "#334155" }}>{L.est.screenLabel}: {item.screen || L.est.notIncluded}</Text>
                    </View>
                    )}
                    <Text style={{ fontSize: 8.5, color: item.customModules?.length ? "#6d28d9" : "#0f172a", fontWeight: "bold", fontFamily: "Helvetica-Bold", marginBottom: 1, backgroundColor: item.customModules?.length ? "#f5f3ff" : "#f1f5f9", padding: "2 4", borderRadius: 2 }}>
                      {item.customModules?.length
                        ? describeCustomLayout(item.customModules, item.hingeLeft ?? false, item.swingInside ?? true)
                        : getItemDescription(item.type, item.hingeLeft ?? false, item.swingInside ?? true)}
                      {(item.trimInstall) ? ` • ${L.est.trim}: ${(item.trimStyle ?? "flat") === "colonial" ? L.est.colonial : L.est.flat}` : ""}
                    </Text>
                    <Text style={{ fontSize: 7, color: "#94a3b8" }}>
                      {L.est.perimeter}: {perimeterInches(item.width, item.height)}" ({perimeterFeet(item.width, item.height).toFixed(1)} ft)
                    </Text>
                    <Text style={{ ...s.egress, color: egress ? "#16a34a" : "#ef4444" }}>
                      {L.est.egress}: {egress ? L.est.egressCompliant : L.est.egressNonCompliant}
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
          <View style={s.sumRow}><Text style={s.sumBold}>{L.est.productsSubtotal}</Text><Text style={s.sumBold}>{fmt(t.prodTotal)}</Text></View>
          {showInstallation && <View style={s.sumRow}><Text style={s.sumSub}>{L.est.installationUnits} ({t.totalUnits} {L.est.units.toLowerCase()})</Text><Text style={s.sumSub}>{fmt(t.install)}</Text></View>}
          {showDelivery && <View style={s.sumRow}><Text style={s.sumSub}>{L.est.deliveryLabel}</Text><Text style={s.sumSub}>{fmt(t.delivery)}</Text></View>}
          {(t.trimTotal ?? 0) > 0 && <View style={s.sumRow}><Text style={{ ...s.sumSub, color: "#ea580c" }}>{L.est.trimTotal}</Text><Text style={{ ...s.sumSub, color: "#ea580c" }}>{fmt(t.trimTotal)}</Text></View>}
          {showGST && <View style={s.sumRow}><Text style={s.sumSub}>{L.est.tps} ({gstRate}%)</Text><Text style={s.sumSub}>{fmt(t.gst)}</Text></View>}
          {showQST && <View style={s.sumRow}><Text style={s.sumSub}>{L.est.tvq} ({qstRate}%)</Text><Text style={s.sumSub}>{fmt(t.qst)}</Text></View>}
          <View style={s.totalRow}><Text>TOTAL</Text><Text>{fmt(t.total)}</Text></View>
          {/* Dynamic payment stages */}
          {(() => {
            const stages = (paymentStages ?? []).filter(st => st.show)
            if (stages.length === 0) {
              return (
                <>
                  <View style={s.depositRow}><Text>{L.est.depositRequired} ({est.depositPct}%)</Text><Text>{fmt(t.deposit)}</Text></View>
                  <View style={{ ...s.depositRow, backgroundColor: "#fff7ed", marginTop: 2 }}><Text style={{ color: "#9a3412" }}>{L.est.balanceRemaining}</Text><Text style={{ color: "#9a3412" }}>{fmt(t.total - t.deposit)}</Text></View>
                </>
              )
            }
            let usedPct = 0
            return stages.map((st, si) => {
              const isDeposit = st.id === "deposit"
              const pct = isDeposit ? est.depositPct : st.pct
              const isRemainder = pct === 0 && !isDeposit
              let amount: number
              if (isRemainder) { amount = t.total * (1 - usedPct / 100) } else { amount = t.total * (pct / 100); usedPct += pct }
              const bg = si === 0 ? "#f1f5f9" : si % 2 === 1 ? "#fff7ed" : "#f0fdf4"
              const color = si === 0 ? "#0f172a" : si % 2 === 1 ? "#9a3412" : "#166534"
              return (
                <View key={st.id} style={{ ...s.depositRow, backgroundColor: bg, marginTop: si === 0 ? 6 : 2 }}>
                  <Text style={{ color }}>{st.label}{isDeposit ? ` (${est.depositPct}%)` : isRemainder ? "" : pct > 0 ? ` (${pct}%)` : ""}</Text>
                  <Text style={{ color }}>{fmt(amount)}</Text>
                </View>
              )
            })
          })()}
        </View>

        {/* ── Terms ── */}
        <View style={s.termsBox}>
          <Text style={s.termsTitle}>{L.est.termsTitle}</Text>
          {(est.termsText || "").split("\n").map((line, i) => (
            <Text key={i} style={s.termsLine}>{line}</Text>
          ))}
        </View>

        {/* ── Signatures ── */}
        <View style={s.sigGrid}>
          <View style={{ flex: 1 }}>
            <View style={s.sigBox}>
              {sigs?.client ? <Image src={sigs.client} style={s.sigImg} /> : null}
            </View>
            <Text style={s.sigLabel}>{L.est.clientSig}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={s.sigBox}>
              {sigs?.rep ? <Image src={sigs.rep} style={s.sigImg} /> : null}
            </View>
            <Text style={s.sigLabel}>{L.est.repSig}</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
