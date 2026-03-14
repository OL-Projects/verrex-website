"use client"

import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  change?: number // percentage change
  icon: LucideIcon
  color?: "blue" | "green" | "amber" | "purple" | "red" | "cyan"
  delay?: number
}

const colorMap = {
  blue: "bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400",
  green: "bg-green-100 dark:bg-green-500/15 text-green-600 dark:text-green-400",
  amber: "bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400",
  purple: "bg-purple-100 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400",
  red: "bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400",
  cyan: "bg-cyan-100 dark:bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
}

export function StatsCard({ title, value, change, icon: Icon, color = "blue", delay = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="p-4 rounded-lg bg-white dark:bg-[rgba(22,23,29,0.85)] border border-slate-200 dark:border-[rgba(255,255,255,0.07)] shadow-sm hover:border-blue-400/20 dark:hover:border-[rgba(107,170,255,0.15)] transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`h-10 w-10 rounded-xl ${colorMap[color]} flex items-center justify-center`}>
          <Icon className="h-5 w-5" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            change > 0 ? "text-green-600 dark:text-green-400" :
            change < 0 ? "text-red-600 dark:text-red-400" :
            "text-slate-400"
          }`}>
            {change > 0 ? <TrendingUp className="h-3 w-3" /> :
             change < 0 ? <TrendingDown className="h-3 w-3" /> :
             <Minus className="h-3 w-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">
        {value}
      </p>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
        {title}
      </p>
    </motion.div>
  )
}
