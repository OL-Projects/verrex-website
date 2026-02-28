"use client"

import { useState } from "react"
import { usePortalStore } from "@/lib/portal-store"
import { Plus, Trash2, CheckCircle2 } from "lucide-react"
import type { Invoice, InvoiceItem } from "@/types/portal"

interface Props {
  onClose: () => void
  editInvoice?: Invoice | null
}

const GST_RATE = 0.05
const QST_RATE = 0.09975
const TERMS = ["Due on Receipt", "Net 15", "Net 30", "Net 45", "Net 60"]

export default function InvoiceForm({ onClose, editInvoice }: Props) {
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

  const fmt = (n: number) => `$${n.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const inputCls = "w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/30 focus:outline-none"

  if (submitted) return (
    <div className="h-full flex flex-col items-center justify-center gap-3">
      <CheckCircle2 className="h-12 w-12 text-green-500" />
      <p className="text-lg font-semibold text-slate-900 dark:text-white">{isEdit ? "Invoice Updated!" : "Invoice Created!"}</p>
    </div>
  )

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">{isEdit ? "Edit Invoice" : "New Invoice"}</h2>
        <button onClick={onClose} className="text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium">Cancel</button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="max-w-xl mx-auto space-y-4">
        {/* Link Lead */}
        {!isEdit && (
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Link to Lead</label>
            <select value={selectedLead} onChange={e => handleLeadSelect(e.target.value)} className={inputCls}>
              <option value="">— Manual entry —</option>
              {store.leads.map(l => <option key={l.id} value={l.id}>{l.clientName} — {l.address}</option>)}
            </select>
          </div>
        )}

        {/* Client Info */}
        <div className="grid grid-cols-1 gap-3">
          <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Client Name *</label><input value={clientName} onChange={e => setClientName(e.target.value)} className={inputCls} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Address</label><input value={clientAddress} onChange={e => setClientAddress(e.target.value)} className={inputCls} /></div>
            <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">City/Province</label><input value={clientCity} onChange={e => setClientCity(e.target.value)} className={inputCls} /></div>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-3 gap-2">
          <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Issue Date *</label><input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} className={inputCls} /></div>
          <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Due Date *</label><input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={inputCls} /></div>
          <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Terms</label><select value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} className={inputCls}>{TERMS.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
        </div>

        {/* Line Items */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Line Items</label>
            <button onClick={addItem} className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-700 font-medium"><Plus className="h-3 w-3" />Add</button>
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-1.5 text-[8px] font-bold text-slate-400 uppercase tracking-widest px-0.5">
              <div className="col-span-5">Desc</div><div className="col-span-2 text-center">Qty</div><div className="col-span-2 text-center">Unit</div><div className="col-span-2 text-right">Total</div><div className="col-span-1" />
            </div>
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-1.5 items-center">
                <input value={item.description} onChange={e => updateItem(i, "description", e.target.value)} placeholder="Description" className="col-span-5 h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] text-slate-900 dark:text-white" />
                <input type="number" value={item.quantity || ""} onChange={e => updateItem(i, "quantity", Number(e.target.value))} className="col-span-2 h-8 px-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] text-center text-slate-900 dark:text-white" />
                <input type="number" value={item.unitPrice || ""} onChange={e => updateItem(i, "unitPrice", Number(e.target.value))} className="col-span-2 h-8 px-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] text-center text-slate-900 dark:text-white" />
                <div className="col-span-2 text-right text-[11px] font-mono font-semibold text-slate-900 dark:text-white">{fmt(item.total)}</div>
                <button onClick={() => removeItem(i)} className="col-span-1 flex justify-center text-slate-400 hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
          <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400"><span>Subtotal</span><span className="font-mono">{fmt(subtotal)}</span></div>
          <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400"><span>GST 5%</span><span className="font-mono">{fmt(taxGST)}</span></div>
          <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400"><span>QST 9.975%</span><span className="font-mono">{fmt(taxQST)}</span></div>
          <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-700 pt-1.5"><span>TOTAL</span><span className="font-mono">{fmt(total)}</span></div>
        </div>

        {/* Deposit + Notes */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Deposit Paid</label>
            <input type="number" value={depositPaid || ""} onChange={e => setDepositPaid(Number(e.target.value))} placeholder="0.00" className={inputCls} />
            {depositPaid > 0 && <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-1 font-mono">Balance: {fmt(balanceDue)}</p>}
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Payment terms..." className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] text-slate-900 dark:text-white resize-none" />
          </div>
        </div>

        <button onClick={handleSubmit} disabled={!isValid} className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${isValid ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25" : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"}`}>
          {isEdit ? "Save Changes" : "Create Invoice"}
        </button>
        </div>
      </div>
    </div>
  )
}
