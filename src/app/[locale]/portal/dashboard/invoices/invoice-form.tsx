"use client"

import { useState } from "react"
import { usePortalStore } from "@/lib/portal-store"
import { X, Plus, Trash2, CheckCircle2 } from "lucide-react"
import type { Invoice, InvoiceItem } from "@/types/portal"

interface Props {
  open: boolean
  onClose: () => void
  editInvoice?: Invoice | null
}

const GST_RATE = 0.05
const QST_RATE = 0.09975
const TERMS = ["Due on Receipt", "Net 15", "Net 30", "Net 45", "Net 60"]

export default function InvoiceForm({ open, onClose, editInvoice }: Props) {
  const store = usePortalStore()
  const isEdit = !!editInvoice

  const [clientName, setClientName] = useState(editInvoice?.clientName || "")
  const [clientAddress, setClientAddress] = useState(editInvoice?.clientAddress || "")
  const [clientCity, setClientCity] = useState(editInvoice?.clientCity || "")
  const [selectedLead, setSelectedLead] = useState("")
  const [issueDate, setIssueDate] = useState(editInvoice?.issueDate || new Date().toISOString().split("T")[0])
  const [dueDate, setDueDate] = useState(editInvoice?.dueDate || "")
  const [paymentTerms, setPaymentTerms] = useState(editInvoice?.paymentTerms || "Net 30")
  const [depositPaid, setDepositPaid] = useState(editInvoice?.depositPaid || 0)
  const [notes, setNotes] = useState(editInvoice?.notes || "")
  const [items, setItems] = useState<InvoiceItem[]>(editInvoice?.items || [{ description: "", quantity: 1, unitPrice: 0, total: 0 }])
  const [submitted, setSubmitted] = useState(false)

  const handleLeadSelect = (leadId: string) => {
    setSelectedLead(leadId)
    const lead = store.leads.find(l => l.id === leadId)
    if (lead) { setClientName(lead.clientName); setClientAddress(lead.address); setClientCity(lead.city) }
  }

  const updateItem = (idx: number, field: keyof InvoiceItem, val: string | number) => {
    setItems(prev => prev.map((it, i) => {
      if (i !== idx) return it
      const updated = { ...it, [field]: val }
      if (field === "quantity" || field === "unitPrice") updated.total = Number(updated.quantity) * Number(updated.unitPrice)
      return updated
    }))
  }
  const addItem = () => setItems(prev => [...prev, { description: "", quantity: 1, unitPrice: 0, total: 0 }])
  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx))

  const subtotal = items.reduce((s, it) => s + it.total, 0)
  const taxGST = Math.round(subtotal * GST_RATE * 100) / 100
  const taxQST = Math.round(subtotal * QST_RATE * 100) / 100
  const tax = taxGST + taxQST
  const total = subtotal + tax
  const balanceDue = total - depositPaid

  const isValid = clientName.trim() && items.length > 0 && items.every(it => it.description.trim() && it.total > 0) && dueDate

  const handleSubmit = () => {
    if (!isValid) return
    const invNum = `INV-VEREX-${new Date().getFullYear()}-${String(store.invoices.length + 1).padStart(4, "0")}`
    if (isEdit && editInvoice) {
      store.updateInvoice(editInvoice.id, { clientName, clientAddress, clientCity, items, subtotal, taxGST, taxQST, tax, total, depositPaid, balanceDue, issueDate, dueDate, paymentTerms, notes })
    } else {
      store.createInvoice({ invoiceNumber: invNum, projectId: selectedLead ? (store.leads.find(l => l.id === selectedLead)?.projectId || "") : "", clientId: "", clientName, clientAddress, clientCity, items, subtotal, taxGST, taxQST, tax, total, depositPaid, balanceDue, status: "draft", issueDate, dueDate, paymentTerms, notes })
    }
    setSubmitted(true)
    setTimeout(() => { setSubmitted(false); onClose() }, 1000)
  }

  if (!open) return null
  const fmt = (n: number) => `$${n.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const inputCls = "w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl h-full bg-white dark:bg-slate-900 shadow-2xl overflow-y-auto" style={{ animation: "slideInRight 0.3s ease-out forwards" }}>
        <style>{`@keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>

        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{isEdit ? "Edit Invoice" : "New Invoice"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"><X className="h-5 w-5" /></button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3"><CheckCircle2 className="h-12 w-12 text-green-500" /><p className="text-lg font-semibold text-slate-900 dark:text-white">{isEdit ? "Invoice Updated!" : "Invoice Created!"}</p></div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Link Lead */}
            {!isEdit && (
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Link to Lead (optional)</label>
                <select value={selectedLead} onChange={e => handleLeadSelect(e.target.value)} className={inputCls}>
                  <option value="">— Manual entry —</option>
                  {store.leads.map(l => <option key={l.id} value={l.id}>{l.clientName} — {l.address}</option>)}
                </select>
              </div>
            )}

            {/* Client Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1"><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Client *</label><input value={clientName} onChange={e => setClientName(e.target.value)} className={inputCls} /></div>
              <div className="sm:col-span-1"><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Address</label><input value={clientAddress} onChange={e => setClientAddress(e.target.value)} className={inputCls} /></div>
              <div className="sm:col-span-1"><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">City/Province</label><input value={clientCity} onChange={e => setClientCity(e.target.value)} className={inputCls} /></div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-3 gap-3">
              <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Issue Date *</label><input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} className={inputCls} /></div>
              <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Due Date *</label><input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={inputCls} /></div>
              <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Terms</label><select value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} className={inputCls}>{TERMS.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            </div>

            {/* Line Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Line Items</label>
                <button onClick={addItem} className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-700 font-medium"><Plus className="h-3 w-3" />Add Item</button>
              </div>
              <div className="space-y-2">
                {/* Table header */}
                <div className="grid grid-cols-12 gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">
                  <div className="col-span-5">Description</div>
                  <div className="col-span-2 text-center">Qty</div>
                  <div className="col-span-2 text-center">Unit $</div>
                  <div className="col-span-2 text-right">Total</div>
                  <div className="col-span-1"></div>
                </div>
                {items.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <input value={item.description} onChange={e => updateItem(i, "description", e.target.value)} placeholder="Description" className="col-span-5 h-9 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white" />
                    <input type="number" value={item.quantity || ""} onChange={e => updateItem(i, "quantity", Number(e.target.value))} className="col-span-2 h-9 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-center text-slate-900 dark:text-white" />
                    <input type="number" value={item.unitPrice || ""} onChange={e => updateItem(i, "unitPrice", Number(e.target.value))} className="col-span-2 h-9 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-center text-slate-900 dark:text-white" />
                    <div className="col-span-2 text-right text-xs font-mono font-semibold text-slate-900 dark:text-white">{fmt(item.total)}</div>
                    <button onClick={() => removeItem(i)} className="col-span-1 flex justify-center text-slate-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals Preview */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400"><span>Subtotal</span><span className="font-mono">{fmt(subtotal)}</span></div>
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400"><span>GST (5%)</span><span className="font-mono">{fmt(taxGST)}</span></div>
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400"><span>QST (9.975%)</span><span className="font-mono">{fmt(taxQST)}</span></div>
                <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white border-t border-slate-300 dark:border-slate-600 pt-2"><span>TOTAL</span><span className="font-mono">{fmt(total)}</span></div>
              </div>
            </div>

            {/* Deposit */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Deposit Already Paid</label>
              <input type="number" value={depositPaid || ""} onChange={e => setDepositPaid(Number(e.target.value))} placeholder="0.00" className={inputCls} />
              {depositPaid > 0 && <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-mono">Balance Due: {fmt(balanceDue)}</p>}
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Notes / Payment Instructions</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Payment instructions, special terms..." className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white resize-none" />
            </div>

            <button onClick={handleSubmit} disabled={!isValid} className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${isValid ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25" : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"}`}>
              {isEdit ? "Save Changes" : "Create Invoice"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
