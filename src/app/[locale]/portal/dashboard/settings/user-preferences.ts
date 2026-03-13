// User Preferences — persistent localStorage keyed by user ID

export interface NotificationPrefs {
  emailEnabled: boolean
  portalEnabled: boolean
  appointmentReminders: boolean
  orderUpdates: boolean
  invoiceAlerts: boolean
  leadAlerts: boolean
  systemAnnouncements: boolean
  reminderTiming: "15min" | "30min" | "1hr" | "1day"
}

export interface AppearancePrefs {
  theme: "system" | "light" | "dark"
  language: "en" | "fr"
  dateFormat: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD"
  timeFormat: "12h" | "24h"
  compactMode: boolean
}

export interface UserPreferences {
  profilePhoto: string // base64 data URL
  jobTitle: string
  bio: string
  address: string
  city: string
  postalCode: string
  notifications: NotificationPrefs
  appearance: AppearancePrefs
}

const DEFAULTS: UserPreferences = {
  profilePhoto: "",
  jobTitle: "",
  bio: "",
  address: "",
  city: "",
  postalCode: "",
  notifications: {
    emailEnabled: true,
    portalEnabled: true,
    appointmentReminders: true,
    orderUpdates: true,
    invoiceAlerts: true,
    leadAlerts: false,
    systemAnnouncements: true,
    reminderTiming: "30min",
  },
  appearance: {
    theme: "system",
    language: "en",
    dateFormat: "YYYY-MM-DD",
    timeFormat: "24h",
    compactMode: false,
  },
}

function storageKey(userId: string) {
  return `verrex_prefs_${userId}`
}

export function loadPreferences(userId: string): UserPreferences {
  if (typeof window === "undefined") return DEFAULTS
  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (!raw) return DEFAULTS
    return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return DEFAULTS
  }
}

export function savePreferences(userId: string, prefs: UserPreferences) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(prefs))
  } catch { /* quota exceeded — silently fail */ }
}

export const NOTIFICATION_PRESETS: Record<string, { label: string; desc: string; overrides: Partial<NotificationPrefs> }> = {
  all: { label: "All On", desc: "Get every notification", overrides: { emailEnabled: true, portalEnabled: true, appointmentReminders: true, orderUpdates: true, invoiceAlerts: true, leadAlerts: true, systemAnnouncements: true } },
  essential: { label: "Essential", desc: "Appointments & invoices only", overrides: { emailEnabled: true, portalEnabled: true, appointmentReminders: true, orderUpdates: false, invoiceAlerts: true, leadAlerts: false, systemAnnouncements: false } },
  minimal: { label: "Minimal", desc: "Portal only, no email", overrides: { emailEnabled: false, portalEnabled: true, appointmentReminders: true, orderUpdates: false, invoiceAlerts: false, leadAlerts: false, systemAnnouncements: false } },
  silent: { label: "Silent", desc: "All notifications off", overrides: { emailEnabled: false, portalEnabled: false, appointmentReminders: false, orderUpdates: false, invoiceAlerts: false, leadAlerts: false, systemAnnouncements: false } },
}
