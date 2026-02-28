"use client"

import { useState } from "react"
import { usePortalStore } from "@/lib/portal-store"
import { Plus, Trash2, CheckCircle2 } from "lucide-react"
import type { Contract, ContractScopeItem, ContractPayment } from "@/types/portal"

interface Props { onClose: () => void; editContract?: Contract | null }

const DEFAULT_TERMS = [
  "All work shall conform to the Quebec Building Code (CCQ) and National Building Code of Canada.",
  "The Contractor holds a valid RBQ licence (#5678-9012-34) and carries comprehensive liability insurance.",
  "The Client authorizes the Contractor to perform all described work at the above address.",
  "Changes to the scope of work must be documented in writing and signed by both parties before execution.",
  "The Contractor warrants all installation work for a period of 5 years from completion date.",
  "Manufacturer product warranties apply separately and are transferred to the Client upon installation.",
  "Either party may cancel this contract within 10 business days of signing without penalty (Consumer Protection Act, s.59).",
  "Force majeure events (acts of God, pandemics, supply chain disruptions) may extend timelines without liability.",
  "Disputes shall be resolved through mediation before any legal proceedings, governed by the laws of Quebec.",
  "All prices include applicable GST/TPS (5%) and QST/TVQ (9.975%).",
]

export default function ContractForm({ onClose, editContract }: Props) {
  const store = usePortalStore()
  const isEdit = !!editContract

  const [clientName, setClientName] = useState(editContract?.clientName || "")
  const [clientAddress, setClientAddress] = useState(editContract?.clientAddress || "")
  const [clientCity, setClientCity] = useState(editContract?.clientCity || "")
  const [totalValue, setTotalValue] = useState(editContract?.totalValue || 0)
  const [startDate, setStartDate] = useState(editContract?.startDate || "")
  const [completionDate, setCompletionDate] = useState(editContract?.completionDate || "")
  const [warrantyYears, setWarrantyYears] = useState(editContract?.warrantyYears || 5)
  const [notes, setNotes] = useState(editContract?.notes || "")
  const [scopeItems, setScopeItems] = useState<ContractScopeItem[]>(editContract?.scopeItems || [{ description: "", quantity: 1, specifications: "" }])
  const [payments, setPayments] = useState<ContractPayment[]>(editContract?.paymentSchedule || [
    { milestone: "Contract Signing — Deposit", percentage: 30, amount: 0, dueDate: "", status: "pending" as const },
    { milestone: "Installation Completion", percentage: 70, amount: 0, dueDate: "", status: "pending" as const },
  ])
  const [submitted, setSubmitted] = useState(false)

  const updateScope = (i: number, field: keyof ContractScopeItem, val: string | number) => {
    setScopeItems(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s))
  }
  const addScope = () => setScopeItems(prev => [...prev, { description: "", quantity: 1, specifications: "" }])
  const removeScope = (i: number) => setScopeItems(prev => prev.filter((_, idx) => idx !== i))

  const updatePayment = (i: number, field: keyof ContractPayment, val: string | number) => {
    setPayments(prev => prev.map((p, idx) => {
      if (idx !== i) return p
      const updated = { ...p, [field]: val }
      if (field === "percentage") updated.amount = Math.round(totalValue * (Number(val) / 100) * 100) / 100
      return updated
    }))
  }
  const addPayment = () => setPayments(prev => [...prev, { milestone: "", percentage: 0, amount: 0, dueDate: "", status: "pending" as const }])
  const removePayment = (i: number) => setPayments(prev => prev.filter((_, idx) => idx !== i))

  // Recalculate amounts when total changes
  const recalcPayments = () => {
    setPayments(prev => prev.map(p => ({ ...p, amount: Math.round(totalValue * (p.percentage / 100) * 100) / 100 })))
  }

  const isValid = clientName.trim() && scopeItems.length > 0 && scopeItems.every(s => s.description.trim()) && totalValue > 0 && startDate && completionDate

  const handleSubmit = () => {
    if (!isValid) return
    const num = `CONT-VEREX-${new Date().getFullYear()}-${String(store.contracts.length + 1).padStart(4, "0")}`
    const finalPayments = payments.map(p => ({ ...p, amount: Math.round(totalValue * (p.percentage / 100) * 100) / 100 }))
    if (isEdit && editContract) {
      store.updateContract(editContract.id, { clientName, clientAddress, clientCity, scopeItems, totalValue, paymentSchedule: finalPayments, startDate, completionDate, warrantyYears, notes })
    } else {
      store.createContract({ contractNumber: num, projectId: "", clientName, clientAddress, clientCity, scopeItems, totalValue, paymentSchedule: finalPayments, startDate, completionDate, warrantyYears, terms: DEFAULT_TERMS, status: "draft", notes })
    }
    setSubmitted(true)
    setTimeout(() => { setSubmitted(false); onClose() }, 1000)
  }

  const fmt = (n: number) => `$${n.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const inputCls = "w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/30 focus:outline-none"

  if (submitted) return (
    <div className="h-full flex flex-col items-center justify-center gap-3">
      <CheckCircle2 className="h-12 w-12 text-green-500" />
      <p className="text-lg font-semibold text-slate-900 dark:text-white">{isEdit ? "Contract Updated!" : "Contract Created!"}</p>
    </div>
  )

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">{isEdit ? "Edit Contract" : "New Contract"}</h2>
        <button onClick={onClose} className="text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium">Cancel</button>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <div className="max-w-xl mx-auto space-y-4">
        {/* Client */}
        <div className="grid grid-cols-1 gap-3">
          <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Client Name *</label><input value={clientName} onChange={e => setClientName(e.target.value)} className={inputCls} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Address</label><input value={clientAddress} onChange={e => setClientAddress(e.target.value)} className={inputCls} /></div>
            <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">City/Province</label><input value={clientCity} onChange={e => setClientCity(e.target.value)} className={inputCls} /></div>
          </div>
        </div>

        {/* Dates + Value */}
        <div className="grid grid-cols-4 gap-2">
          <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Start Date *</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputCls} /></div>
          <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Completion *</label><input type="date" value={completionDate} onChange={e => setCompletionDate(e.target.value)} className={inputCls} /></div>
          <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Warranty (Yrs)</label><input type="number" value={warrantyYears} onChange={e => setWarrantyYears(Number(e.target.value))} className={inputCls} /></div>
          <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Total Value *</label><input type="number" value={totalValue || ""} onChange={e => { setTotalValue(Number(e.target.value)); setTimeout(recalcPayments, 0) }} placeholder="0.00" className={inputCls} /></div>
        </div>

        {/* Scope Items */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scope of Work</label>
            <button onClick={addScope} className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-700 font-medium"><Plus className="h-3 w-3" />Add</button>
          </div>
          <div className="space-y-2">
            {scopeItems.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-1.5 items-start">
                <input value={item.description} onChange={e => updateScope(i, "description", e.target.value)} placeholder="Description" className="col-span-5 h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] text-slate-900 dark:text-white" />
                <input type="number" value={item.quantity || ""} onChange={e => updateScope(i, "quantity", Number(e.target.value))} className="col-span-1 h-8 px-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] text-center text-slate-900 dark:text-white" />
                <input value={item.specifications} onChange={e => updateScope(i, "specifications", e.target.value)} placeholder="Specs (dimensions, color, etc.)" className="col-span-5 h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] text-slate-900 dark:text-white" />
                <button onClick={() => removeScope(i)} className="col-span-1 flex justify-center mt-1.5 text-slate-400 hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Schedule */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Schedule</label>
            <button onClick={addPayment} className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-700 font-medium"><Plus className="h-3 w-3" />Add</button>
          </div>
          <div className="space-y-2">
            {payments.map((p, i) => (
              <div key={i} className="grid grid-cols-12 gap-1.5 items-center">
                <input value={p.milestone} onChange={e => updatePayment(i, "milestone", e.target.value)} placeholder="Milestone" className="col-span-5 h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] text-slate-900 dark:text-white" />
                <input type="number" value={p.percentage || ""} onChange={e => updatePayment(i, "percentage", Number(e.target.value))} placeholder="%" className="col-span-2 h-8 px-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] text-center text-slate-900 dark:text-white" />
                <div className="col-span-2 text-[11px] font-mono text-slate-600 dark:text-slate-400 text-center">{fmt(Math.round(totalValue * (p.percentage / 100) * 100) / 100)}</div>
                <input type="date" value={p.dueDate} onChange={e => updatePayment(i, "dueDate", e.target.value)} className="col-span-2 h-8 px-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] text-slate-900 dark:text-white" />
                <button onClick={() => removePayment(i)} className="col-span-1 flex justify-center text-slate-400 hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
          {totalValue > 0 && (
            <p className="text-[10px] text-slate-400 mt-1">Total: {payments.reduce((s, p) => s + p.percentage, 0)}% = {fmt(payments.reduce((s, p) => s + Math.round(totalValue * (p.percentage / 100) * 100) / 100, 0))}</p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Additional notes..." className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] text-slate-900 dark:text-white resize-none" />
        </div>

        <button onClick={handleSubmit} disabled={!isValid} className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${isValid ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25" : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"}`}>
          {isEdit ? "Save Changes" : "Create Contract"}
        </button>
        </div>
      </div>
    </div>
  )
}
