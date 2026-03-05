"use client"

import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import { Link as IntlLink } from "@/i18n/navigation"
import { VEREXLogo } from "@/components/ui/verrex-logo"
import {
  LogIn,
  UserPlus,
  Shield,
  BarChart3,
  FolderKanban,
  MessageSquare,
  ArrowRight,
} from "lucide-react"

const features = [
  { icon: FolderKanban, title: "Track Your Projects", description: "Real-time visibility into every stage from measurement to installation." },
  { icon: BarChart3, title: "Live Pipeline", description: "15-stage progress tracking from lead to closeout — always know where things stand." },
  { icon: MessageSquare, title: "Direct Communication", description: "Message your team, contractor, or sales rep directly within your project." },
  { icon: Shield, title: "Secure & Role-Based", description: "Each user sees only what they need. Your data is protected and private." },
]

export default function PortalWelcomePage() {
  const t = useTranslations("Navigation")

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/20 dark:to-indigo-950/30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.08),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.12),transparent_60%)]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-24">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <VEREXLogo variant="icon" size={64} />
            </motion.div>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
            VEREX <span className="text-blue-600 dark:text-blue-400">Portal</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10">
            Your secure hub for project tracking, appointments, orders, and communication — everything in one place.
          </p>

          {/* CTA Cards */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <IntlLink
                href="/portal/login"
                className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all duration-300"
              >
                <LogIn className="h-5 w-5" />
                Log In
                <ArrowRight className="h-4 w-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
              </IntlLink>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <IntlLink
                href="/portal/signup"
                className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-xl border border-white/40 dark:border-white/15 hover:bg-white/80 dark:hover:bg-white/15 text-slate-900 dark:text-white font-semibold text-lg shadow-lg shadow-black/5 hover:shadow-black/10 transition-all duration-300"
              >
                <UserPlus className="h-5 w-5" />
                Sign Up
                <ArrowRight className="h-4 w-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
              </IntlLink>
            </motion.div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
              className="p-6 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 hover:border-blue-400/30 dark:hover:border-blue-400/20 transition-all duration-300 group"
            >
              <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-500/25 transition-colors">
                <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Demo Accounts Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="max-w-2xl mx-auto p-6 rounded-2xl bg-amber-50/60 dark:bg-amber-500/5 backdrop-blur-xl border border-amber-200/50 dark:border-amber-500/15"
        >
          <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-400 mb-3 uppercase tracking-wider">
            Demo Accounts
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {[
              { role: "Admin", email: "admin@verex.ca" },
              { role: "Client", email: "client@demo.com" },
              { role: "Contractor", email: "contractor@demo.com" },
              { role: "Supplier", email: "supplier@demo.com" },
              { role: "Partner", email: "partner@homedepot.com" },
              { role: "Inspector", email: "inspector@demo.com" },
            ].map((account) => (
              <div key={account.role} className="flex items-center gap-2 text-amber-900 dark:text-amber-300/80">
                <span className="font-medium w-24">{account.role}:</span>
                <code className="text-xs bg-amber-100/60 dark:bg-amber-500/10 px-2 py-0.5 rounded">
                  {account.email}
                </code>
              </div>
            ))}
          </div>
          <p className="text-xs text-amber-700/70 dark:text-amber-400/50 mt-3">
            Password for all demo accounts: <code className="bg-amber-100/60 dark:bg-amber-500/10 px-1.5 py-0.5 rounded">[role]123</code>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
