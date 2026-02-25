"use client"

import { motion } from "framer-motion"
import { PIPELINE_STAGES } from "@/types/portal"
import type { PipelineStage } from "@/types/portal"
import { CheckCircle2 } from "lucide-react"

interface PipelineStatusProps {
  currentStage: PipelineStage
  compact?: boolean
}

export function PipelineStatus({ currentStage, compact = false }: PipelineStatusProps) {
  const currentIndex = PIPELINE_STAGES.findIndex(s => s.key === currentStage)

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {PIPELINE_STAGES.map((stage, i) => (
          <div
            key={stage.key}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= currentIndex ? "bg-blue-500" : "bg-slate-200 dark:bg-slate-700"
            }`}
            title={stage.label}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Pipeline Progress</h4>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Stage {currentIndex + 1} of {PIPELINE_STAGES.length}
        </span>
      </div>
      <div className="space-y-1.5">
        {PIPELINE_STAGES.map((stage, i) => {
          const isComplete = i < currentIndex
          const isCurrent = i === currentIndex
          const isPending = i > currentIndex

          return (
            <motion.div
              key={stage.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm transition-all ${
                isCurrent
                  ? "bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20"
                  : isComplete
                  ? "opacity-70"
                  : "opacity-40"
              }`}
            >
              <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${
                isComplete ? "bg-green-500" : isCurrent ? "bg-blue-500" : "bg-slate-300 dark:bg-slate-600"
              }`}>
                {isComplete ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                ) : isCurrent ? (
                  <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-white/50" />
                )}
              </div>
              <span className={`text-xs font-medium ${
                isCurrent ? "text-blue-700 dark:text-blue-400" :
                isComplete ? "text-slate-600 dark:text-slate-400 line-through" :
                "text-slate-400 dark:text-slate-500"
              }`}>
                {stage.label}
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
