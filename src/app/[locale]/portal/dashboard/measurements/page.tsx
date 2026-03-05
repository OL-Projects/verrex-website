"use client"

import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { mockMeasurements } from "@/lib/portal-data"
import { Ruler, MapPin, Camera, FileText, Maximize } from "lucide-react"

export default function MeasurementsPage() {
  const { data: session } = useSession()
  const measurements = mockMeasurements

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Measurements</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{measurements.length} measurement records</p>
      </motion.div>

      <div className="space-y-4">
        {measurements.map((m, idx) => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
            className="p-5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-purple-100 dark:bg-purple-500/15 flex items-center justify-center">
                  <Ruler className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{m.location}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{m.windowType.replace(/_/g, " ")} • Project {m.projectId}</p>
                </div>
              </div>
              <span className="text-xs text-slate-400">{m.measuredAt}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50/50 dark:bg-white/3">
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rough Opening</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  <Maximize className="h-3 w-3" />{m.widthRoughOpening}&quot; × {m.heightRoughOpening}&quot;
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Exact Size</p>
                <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{m.widthExact}&quot; × {m.heightExact}&quot;</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Color / Glass</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{m.color} / {m.glassType}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Grid / Hardware</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{m.gridStyle} / {m.hardware}</p>
              </div>
            </div>

            {m.notes && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 italic flex items-center gap-1">
                <FileText className="h-3 w-3" /> {m.notes}
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
