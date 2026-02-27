"use client"

import { useState, useEffect, useCallback } from "react"
import { type CompanyInfo, defaultCompany, DEFAULT_EXT_COLORS, DEFAULT_INT_COLORS } from "./estimate-config"

// ── Generic localStorage helper ─────────────────
function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch { return fallback }
}
function writeLS<T>(key: string, val: T) {
  if (typeof window === "undefined") return
  try { localStorage.setItem(key, JSON.stringify(val)) } catch { /* quota */ }
}

// ── 1. Company Info (persisted) ─────────────────
const CO_KEY = "verrex_company_info"
export function useCompanyInfo() {
  const [info, setInfo] = useState<CompanyInfo>(() => readLS(CO_KEY, defaultCompany()))
  useEffect(() => { writeLS(CO_KEY, info) }, [info])
  const update = useCallback((patch: Partial<CompanyInfo>) => setInfo(p => ({ ...p, ...patch })), [])
  return { info, update, setInfo }
}

// ── 2. Color Presets (persisted) ────────────────
export interface ColorPreset { id: string; name: string; hex: string }
const EXT_KEY = "verrex_ext_colors"
const INT_KEY = "verrex_int_colors"

function defaultExtPresets(): ColorPreset[] {
  return DEFAULT_EXT_COLORS.map((n, i) => ({ id: `ext_${i}`, name: n, hex: n === "525 Black" ? "#000000" : n === "White" ? "#FFFFFF" : "#4A3728" }))
}
function defaultIntPresets(): ColorPreset[] {
  return DEFAULT_INT_COLORS.map((n, i) => ({ id: `int_${i}`, name: n, hex: "#FFFFFF" }))
}

export function useColorPresets() {
  const [ext, setExt] = useState<ColorPreset[]>(() => readLS(EXT_KEY, defaultExtPresets()))
  const [int_, setInt] = useState<ColorPreset[]>(() => readLS(INT_KEY, defaultIntPresets()))
  useEffect(() => { writeLS(EXT_KEY, ext) }, [ext])
  useEffect(() => { writeLS(INT_KEY, int_) }, [int_])

  const addExt = useCallback((name: string, hex: string) => {
    setExt(p => [...p, { id: `ext_${Date.now()}`, name, hex }])
  }, [])
  const removeExt = useCallback((id: string) => setExt(p => p.filter(c => c.id !== id)), [])
  const addInt = useCallback((name: string, hex: string) => {
    setInt(p => [...p, { id: `int_${Date.now()}`, name, hex }])
  }, [])
  const removeInt = useCallback((id: string) => setInt(p => p.filter(c => c.id !== id)), [])

  const extNames = ext.map(c => c.name)
  const intNames = int_.map(c => c.name)

  return { ext, int: int_, extNames, intNames, addExt, removeExt, addInt, removeInt, setExt, setInt }
}

// ── 3. Autocomplete Memory (persisted) ──────────
const AC_KEY = "verrex_autocomplete"
export function useAutocomplete() {
  const [store, setStore] = useState<Record<string, string[]>>(() => readLS(AC_KEY, {}))
  useEffect(() => { writeLS(AC_KEY, store) }, [store])

  /** Remember a value for a field key (e.g. "clientName"). Keeps last 10. */
  const remember = useCallback((field: string, value: string) => {
    if (!value || value.length < 2) return
    setStore(prev => {
      const existing = prev[field] || []
      if (existing.includes(value)) return prev
      return { ...prev, [field]: [value, ...existing].slice(0, 10) }
    })
  }, [])

  /** Get suggestions for a field key */
  const suggestions = useCallback((field: string): string[] => store[field] || [], [store])

  return { remember, suggestions }
}

// ── 4. Estimate Style / Customization ───────────
export interface EstimateStyle {
  accentColor: string
  fontSize: "sm" | "md" | "lg"
  layout: "compact" | "standard" | "detailed"
  cardSize: "sm" | "md" | "lg"
  showModuleLabels: boolean
  showEgressBadge: boolean
  showDimensions: boolean
  showExteriorLabel: boolean
  paperSize: "letter" | "legal" | "a4"
  orientation: "portrait" | "landscape"
  margins: number
  pdfQuality: "draft" | "standard" | "high"
}

function defaultStyle(): EstimateStyle {
  return {
    accentColor: "#1e293b", fontSize: "md", layout: "standard", cardSize: "md",
    showModuleLabels: true, showEgressBadge: true, showDimensions: true, showExteriorLabel: true,
    paperSize: "letter", orientation: "portrait", margins: 8, pdfQuality: "standard",
  }
}

const STYLE_KEY = "verrex_estimate_style"
export function useEstimateStyle() {
  const [style, setStyle] = useState<EstimateStyle>(() => readLS(STYLE_KEY, defaultStyle()))
  useEffect(() => { writeLS(STYLE_KEY, style) }, [style])
  const update = useCallback((patch: Partial<EstimateStyle>) => setStyle(p => ({ ...p, ...patch })), [])
  const reset = useCallback(() => setStyle(defaultStyle()), [])
  return { style, update, reset, setStyle }
}

// ── 5. Estimate Settings (field visibility, enabled types, etc.) ────
export interface EstimateSettings {
  // Header card
  showDate: boolean
  showValidUntil: boolean
  showRequiredBy: boolean
  showRepSection: boolean
  // Window card
  showDepth: boolean
  enabledWindowTypes: string[]
  enabledProducts: string[]
  // Door card
  enabledDoorTypes: string[]
  // Pricing summary
  showInstallation: boolean
  showDelivery: boolean
  showGST: boolean
  showQST: boolean
  showDeposit: boolean
  showTerms: boolean
}

function defaultSettings(): EstimateSettings {
  return {
    showDate: true,
    showValidUntil: true,
    showRequiredBy: true,
    showRepSection: true,
    showDepth: true,
    enabledWindowTypes: [
      "FIX", "TOP-HUNG", "SLIDER", "CAS-L", "CAS-R", "TT-L", "TT-R",
      "CAS-L+FIX", "FIX+CAS-R", "TT-L+FIX", "FIX+TT-R",
      "CAS-L+FIX+FIX", "FIX+FIX+FIX", "FIX+FIX+CAS-R", "CAS-L+FIX+FIX+FIX",
    ],
    enabledProducts: ["hybrid", "pvc", "pvc-slider"],
    enabledDoorTypes: [
      "SWING-L-IN", "SWING-R-IN", "SWING-L-OUT", "SWING-R-OUT", "SWING-FRENCH",
      "SLIDE-DOOR-2", "SLIDE-DOOR-3", "FOLD-2", "FOLD-4",
    ],
    showInstallation: true,
    showDelivery: true,
    showGST: true,
    showQST: true,
    showDeposit: true,
    showTerms: true,
  }
}

const SETTINGS_KEY = "verrex_estimate_settings"
export function useEstimateSettings() {
  const [settings, setSettings] = useState<EstimateSettings>(() => readLS(SETTINGS_KEY, defaultSettings()))
  useEffect(() => { writeLS(SETTINGS_KEY, settings) }, [settings])
  const update = useCallback((patch: Partial<EstimateSettings>) => setSettings(p => ({ ...p, ...patch })), [])
  const reset = useCallback(() => setSettings(defaultSettings()), [])

  const toggleWindowType = useCallback((key: string) => {
    setSettings(p => {
      const arr = p.enabledWindowTypes.includes(key)
        ? p.enabledWindowTypes.filter(k => k !== key)
        : [...p.enabledWindowTypes, key]
      return { ...p, enabledWindowTypes: arr }
    })
  }, [])

  const toggleDoorType = useCallback((key: string) => {
    setSettings(p => {
      const arr = p.enabledDoorTypes.includes(key)
        ? p.enabledDoorTypes.filter(k => k !== key)
        : [...p.enabledDoorTypes, key]
      return { ...p, enabledDoorTypes: arr }
    })
  }, [])

  const toggleProduct = useCallback((id: string) => {
    setSettings(p => {
      const arr = p.enabledProducts.includes(id)
        ? p.enabledProducts.filter(k => k !== id)
        : [...p.enabledProducts, id]
      return { ...p, enabledProducts: arr }
    })
  }, [])

  return { settings, update, reset, toggleWindowType, toggleDoorType, toggleProduct }
}

// ── 6. Logo (persisted base64) ──────────────────
const LOGO_KEY = "verrex_logo"
export function useLogo() {
  const [logo, setLogo] = useState<string>(() => readLS(LOGO_KEY, ""))
  useEffect(() => { writeLS(LOGO_KEY, logo) }, [logo])

  const uploadLogo = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = () => { if (typeof reader.result === "string") setLogo(reader.result) }
    reader.readAsDataURL(file)
  }, [])

  const clearLogo = useCallback(() => setLogo(""), [])
  return { logo, uploadLogo, clearLogo }
}
