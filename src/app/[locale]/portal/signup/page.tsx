"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { motion } from "framer-motion"
import { Link as IntlLink } from "@/i18n/navigation"
import { VEREXLogo } from "@/components/ui/verrex-logo"
import { Button } from "@/components/ui/button"
import {
  UserPlus, Mail, Lock, User, Phone, Eye, EyeOff,
  ArrowLeft, CheckCircle2, Building2, Wrench, Truck,
  Handshake, AlertCircle, Loader2,
} from "lucide-react"

type RoleOption = {
  value: string; label: string; description: string
  icon: React.ComponentType<{ className?: string }>; selfSignup: boolean
}

const roleOptions: RoleOption[] = [
  { value: "client", label: "Homeowner / Client", description: "Track your window & door projects", icon: Building2, selfSignup: true },
  { value: "contractor", label: "Contractor / Installer", description: "Manage assigned jobs & measurements", icon: Wrench, selfSignup: false },
  { value: "supplier", label: "Supplier", description: "Handle orders & production updates", icon: Truck, selfSignup: false },
  { value: "partner", label: "Partner", description: "View leads, pipeline & commissions", icon: Handshake, selfSignup: false },
]

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<"role" | "form" | "success">("role")
  const [selectedRole, setSelectedRole] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role)
    const option = roleOptions.find(r => r.value === role)
    if (option?.selfSignup) {
      setStep("form")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/portal/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role: selectedRole || "client" }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Registration failed. Please try again.")
        setLoading(false)
        return
      }

      // Success — redirect to login with email pre-filled
      setStep("success")
      setTimeout(() => {
        router.push(`/portal/login?registered=true&email=${encodeURIComponent(formData.email)}`)
      }, 2000)
    } catch {
      setError("Network error. Please check your connection and try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-12">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/20 dark:to-indigo-950/30" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-lg">
        <IntlLink href="/portal" className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Portal
        </IntlLink>

        <div className="p-8 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-xl">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4"><VEREXLogo variant="icon" size={48} /></div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {step === "success" ? "Account Created!" : "Create Account"}
            </h1>
            {step === "form" && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Signing up as <span className="font-medium text-blue-600 dark:text-blue-400">Homeowner / Client</span>
              </p>
            )}
          </div>

          {/* Step 1: Role Selection */}
          {step === "role" && (
            <div className="space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-400 text-center mb-6">Select your account type to get started</p>
              {roleOptions.map((option) => (
                <motion.button key={option.value} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  onClick={() => handleRoleSelect(option.value)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left cursor-pointer ${
                    selectedRole === option.value ? "border-blue-500 bg-blue-50/50 dark:bg-blue-500/10" : "border-slate-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/30 bg-white/30 dark:bg-white/5"
                  }`}>
                  <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center shrink-0">
                    <option.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 dark:text-white text-sm">{option.label}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{option.description}</div>
                  </div>
                  {!option.selfSignup && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 font-medium">Invite Only</span>
                  )}
                </motion.button>
              ))}
              {selectedRole && !roleOptions.find(r => r.value === selectedRole)?.selfSignup && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/15 text-sm text-amber-800 dark:text-amber-300">
                  <p className="font-medium mb-1">This role requires admin approval</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400/70">Contact your VEREX representative or email admin@verex.ca to request access.</p>
                </motion.div>
              )}
              <div className="pt-4 text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Already have an account?{" "}
                  <IntlLink href="/portal/login" className="font-medium text-blue-600 dark:text-blue-400">Log In</IntlLink>
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Registration Form */}
          {step === "form" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                </motion.div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" required minLength={2}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="you@example.com" required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone <span className="text-slate-400">(optional)</span></label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="(514) 555-0000"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password * <span className="text-slate-400 text-xs">(min 8 characters)</span></label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input type={showPassword ? "text" : "password"} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder="Min. 8 characters" required minLength={8}
                    className="w-full pl-10 pr-12 py-2.5 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
              <button type="button" onClick={() => { setStep("role"); setError("") }} className="w-full text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                ← Back to role selection
              </button>
            </form>
          )}

          {/* Step 3: Success — auto-redirecting */}
          {step === "success" && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Account Created!</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Your account has been created as <span className="font-medium text-blue-600 dark:text-blue-400">{formData.email}</span>
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" /> Redirecting to login...
              </div>
            </motion.div>
          )}
        </div>

      </motion.div>
    </div>
  )
}
