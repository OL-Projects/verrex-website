"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Brain, Key, CheckCircle2, XCircle, Loader2, Eye, EyeOff, Zap, Camera, MessageSquare, Save, Trash2, ExternalLink } from "lucide-react"

const C = {
  card: "rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 p-6",
  lbl: "block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5",
  inp: "w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 transition",
  sel: "w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 transition appearance-none",
  btn: "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition",
}

const SK = "vx_ai_config"

interface AIConfig {
  provider: "openai" | "openrouter"
  apiKey: string
  model: string
}

const OPENAI_MODELS = [
  { id: "gpt-4o", label: "GPT-4o (Recommended — Vision + Text)" },
  { id: "gpt-4o-mini", label: "GPT-4o Mini (Faster, cheaper)" },
  { id: "gpt-4-turbo", label: "GPT-4 Turbo" },
]

const OPENROUTER_MODELS = [
  { id: "openai/gpt-4o", label: "OpenAI GPT-4o (via OpenRouter)" },
  { id: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
  { id: "google/gemini-flash-1.5", label: "Gemini Flash 1.5" },
  { id: "meta-llama/llama-3.1-70b-instruct", label: "Llama 3.1 70B" },
]

const DEFAULT_CONFIG: AIConfig = { provider: "openai", apiKey: "", model: "gpt-4o" }

export default function AISettingsPage() {
  const [config, setConfig] = useState<AIConfig>(DEFAULT_CONFIG)
  const [showKey, setShowKey] = useState(false)
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [testMsg, setTestMsg] = useState("")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    try {
      const d = localStorage.getItem(SK)
      if (d) setConfig(JSON.parse(d))
    } catch {}
  }, [])

  const save = useCallback(() => {
    localStorage.setItem(SK, JSON.stringify(config))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [config])

  const clear = useCallback(() => {
    if (!confirm("Remove AI configuration?")) return
    localStorage.removeItem(SK)
    setConfig(DEFAULT_CONFIG)
    setTestStatus("idle")
  }, [])

  const testConnection = useCallback(async () => {
    if (!config.apiKey.trim()) { setTestStatus("error"); setTestMsg("API key is empty"); return }
    setTestStatus("testing"); setTestMsg("")
    try {
      const baseUrl = config.provider === "openai" ? "https://api.openai.com/v1" : "https://openrouter.ai/api/v1"
      const res = await fetch(`${baseUrl}/models`, {
        headers: { Authorization: `Bearer ${config.apiKey}` },
      })
      if (res.ok) { setTestStatus("success"); setTestMsg("Connected successfully!") }
      else { setTestStatus("error"); setTestMsg(`Error ${res.status}: ${res.statusText}`) }
    } catch (e: any) { setTestStatus("error"); setTestMsg(e.message || "Connection failed") }
  }, [config])

  const models = config.provider === "openai" ? OPENAI_MODELS : OPENROUTER_MODELS

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
          <Brain className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AI Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Configure AI providers to power portal features</p>
        </div>
      </motion.div>

      {/* Provider Selection */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={C.card}>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Provider</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {([
            { id: "openai" as const, name: "OpenAI", desc: "GPT-4o Vision — best for photo recognition", color: "from-green-500 to-emerald-600", badge: "Recommended" },
            { id: "openrouter" as const, name: "OpenRouter", desc: "200+ models via one API key", color: "from-blue-500 to-indigo-600", badge: null },
          ]).map(p => (
            <button key={p.id} onClick={() => setConfig(c => ({ ...c, provider: p.id, model: p.id === "openai" ? "gpt-4o" : "openai/gpt-4o" }))}
              className={`text-left p-4 rounded-xl border-2 transition-all ${config.provider === p.id ? "border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 ring-2 ring-blue-400/30" : "border-slate-200 dark:border-white/10 hover:border-blue-300"}`}>
              <div className="flex items-center gap-2 mb-1">
                <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${p.color} flex items-center justify-center`}>
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{p.name}</span>
                {p.badge && <span className="text-[9px] font-bold bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">{p.badge}</span>}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{p.desc}</p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* API Key & Model */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={C.card}>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Configuration</h2>
        <div className="space-y-4">
          <div>
            <label className={C.lbl}>API Key</label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type={showKey ? "text" : "password"} value={config.apiKey}
                onChange={e => setConfig(c => ({ ...c, apiKey: e.target.value }))}
                className={`${C.inp} pl-10 pr-10 font-mono text-xs`}
                placeholder={config.provider === "openai" ? "sk-..." : "sk-or-..."} />
              <button onClick={() => setShowKey(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Get key from {config.provider === "openai"
                ? <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline inline-flex items-center gap-0.5">platform.openai.com <ExternalLink className="h-2.5 w-2.5" /></a>
                : <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline inline-flex items-center gap-0.5">openrouter.ai/keys <ExternalLink className="h-2.5 w-2.5" /></a>
              }
            </p>
          </div>
          <div>
            <label className={C.lbl}>Model</label>
            <select value={config.model} onChange={e => setConfig(c => ({ ...c, model: e.target.value }))} className={C.sel}>
              {models.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>
          {/* Test + Save */}
          <div className="flex gap-3 pt-2">
            <button onClick={testConnection} disabled={testStatus === "testing"}
              className={`${C.btn} ${testStatus === "success" ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 text-emerald-700" : testStatus === "error" ? "bg-red-50 dark:bg-red-500/10 border-red-300 text-red-700" : "border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5"}`}>
              {testStatus === "testing" ? <Loader2 className="h-4 w-4 animate-spin" /> : testStatus === "success" ? <CheckCircle2 className="h-4 w-4" /> : testStatus === "error" ? <XCircle className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
              Test Connection
            </button>
            <button onClick={save} className={`${C.btn} bg-blue-600 text-white border-blue-700 hover:bg-blue-700`}>
              <Save className="h-4 w-4" /> {saved ? "Saved ✓" : "Save"}
            </button>
            <button onClick={clear} className={`${C.btn} border-slate-200 dark:border-white/10 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/5`}>
              <Trash2 className="h-4 w-4" /> Clear
            </button>
          </div>
          {testMsg && <p className={`text-xs font-medium ${testStatus === "success" ? "text-emerald-600" : "text-red-600"}`}>{testMsg}</p>}
        </div>
      </motion.div>

      {/* Powered Features */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={C.card}>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Powered Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/3 border border-slate-200/50 dark:border-white/5">
            <Camera className="h-5 w-5 text-purple-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Measurements — Photo Analysis</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Upload façade photos → AI detects windows, doors, and positions → auto-suggests placements on 3D building</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/3 border border-slate-200/50 dark:border-white/5">
            <MessageSquare className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Messages — AI Replies</p>
              <p className="text-[11px] text-slate-500 mt-0.5">AI-powered reply suggestions for client messages, appointment confirmations, and follow-ups</p>
              <span className="text-[9px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded-full mt-1 inline-block">Coming Soon</span>
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/10">
          <p className="text-[11px] text-amber-800 dark:text-amber-300">
            <strong>Privacy:</strong> API keys are stored locally in your browser. Images sent for analysis are processed by the selected provider and are not stored by Verex.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
