"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Link as IntlLink } from "@/i18n/navigation"
import { ArrowLeft, Plus, User } from "lucide-react"

interface ClientOption {
  id: string
  name: string
  email: string
}

export default function NewProjectPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "admin"

  const [clients, setClients] = useState<ClientOption[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "residential",
    status: "pending",
    address: "",
    city: "",
    postalCode: "",
    clientId: "",
    totalValue: "",
    notes: "",
  })

  useEffect(() => {
    fetch("/api/admin/clients")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setClients(data)
      })
      .catch(console.error)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.clientId) return
    setSubmitting(true)

    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const project = await res.json()
        router.push(`/en/portal/dashboard/projects/${project.id}`)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  if (!isAdmin) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">Admin access required</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <IntlLink
          href="/portal/dashboard/projects"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 mb-3"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Projects
        </IntlLink>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Create New Project
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Fill in the project details below
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 space-y-4">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Project Info
          </h3>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="e.g. Lakeside Villa Window Replacement"
              className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Brief project description..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Project Type
              </label>
              <select
                value={form.type}
                onChange={(e) => update("type", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="industrial">Industrial</option>
                <option value="institutional">Institutional</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Estimated Value ($)
              </label>
              <input
                type="number"
                value={form.totalValue}
                onChange={(e) => update("totalValue", e.target.value)}
                placeholder="25000"
                className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>
        </div>

        {/* Client */}
        <div className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 space-y-4">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="h-4 w-4 text-blue-500" /> Client
          </h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Select Client *
            </label>
            <select
              required
              value={form.clientId}
              onChange={(e) => update("clientId", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
            >
              <option value="">Choose a client...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.email})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Location */}
        <div className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 space-y-4">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Location
          </h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Address
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              placeholder="123 Main St"
              className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                City
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                placeholder="Montreal"
                className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Postal Code
              </label>
              <input
                type="text"
                value={form.postalCode}
                onChange={(e) => update("postalCode", e.target.value)}
                placeholder="H9W 5Z6"
                className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <IntlLink
            href="/portal/dashboard/projects"
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
          >
            Cancel
          </IntlLink>
          <button
            type="submit"
            disabled={submitting || !form.title || !form.clientId}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            {submitting ? "Creating..." : "Create Project"}
          </button>
        </div>
      </form>
    </div>
  )
}
