"use client"

import { useState } from "react"
import { Link as IntlLink } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Mail, CheckCircle2, Loader2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setError("")
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to send reset email")
      }
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#030712] p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="h-16 w-16 mx-auto bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Check Your Email</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-2">
              If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link.
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mb-4">The link expires in 1 hour.</p>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4 mb-6 text-left">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">Don&apos;t see the email?</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">Check your <strong>Spam</strong> or <strong>Junk</strong> folder — it may take a minute to arrive. If using Gmail, also check the <strong>Promotions</strong> tab.</p>
                </div>
              </div>
            </div>
            <IntlLink href="/portal/login">
              <Button variant="outline" className="gap-2"><ArrowLeft className="h-4 w-4" /> Back to Login</Button>
            </IntlLink>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#030712] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="h-14 w-14 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl">Forgot Password?</CardTitle>
          <CardDescription>Enter your email and we&apos;ll send you a reset link.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">{error}</div>
            )}
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required />
            </div>
            <Button type="submit" variant="primary" className="w-full" disabled={sending}>
              {sending ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</> : "Send Reset Link"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <IntlLink href="/portal/login" className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
            </IntlLink>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
