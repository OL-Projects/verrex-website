import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = "VEREX Portal <onboarding@resend.dev>"
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://verex.ca"

export async function sendWelcomeEmail(to: string, name: string) {
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: "Welcome to VEREX Portal",
      html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
  <div style="background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%);padding:32px;text-align:center">
    <h1 style="color:#fff;margin:0;font-size:28px;letter-spacing:1px">VEREX</h1>
    <p style="color:#93c5fd;margin:8px 0 0;font-size:13px">Premium Windows & Doors</p>
  </div>
  <div style="padding:32px">
    <h2 style="color:#1e293b;margin:0 0 16px;font-size:22px">Welcome, ${name}!</h2>
    <p style="color:#475569;line-height:1.6;margin:0 0 16px">Your VEREX Portal account has been created successfully. You can now access your dashboard to track projects, request quotes, and communicate with our team.</p>
    <div style="text-align:center;margin:24px 0">
      <a href="${BASE_URL}/en/portal/login" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">Log In to Your Portal</a>
    </div>
    <p style="color:#94a3b8;font-size:13px;margin:24px 0 0;border-top:1px solid #e2e8f0;padding-top:16px">If you didn't create this account, please ignore this email or contact us at <a href="mailto:admin@verex.ca" style="color:#2563eb">admin@verex.ca</a>.</p>
  </div>
  <div style="background:#f8fafc;padding:16px 32px;text-align:center;border-top:1px solid #e2e8f0">
    <p style="color:#94a3b8;font-size:12px;margin:0">© ${new Date().getFullYear()} VEREX Industries — Premium Windows & Doors</p>
  </div>
</div>
</body></html>`
    })
    console.log("✅ Welcome email sent to", to)
  } catch (err) {
    console.error("❌ Failed to send welcome email:", err)
  }
}

export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const resetUrl = `${BASE_URL}/en/portal/reset-password?token=${token}`
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: "Reset Your VEREX Portal Password",
      html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
  <div style="background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%);padding:32px;text-align:center">
    <h1 style="color:#fff;margin:0;font-size:28px;letter-spacing:1px">VEREX</h1>
    <p style="color:#93c5fd;margin:8px 0 0;font-size:13px">Password Reset Request</p>
  </div>
  <div style="padding:32px">
    <h2 style="color:#1e293b;margin:0 0 16px;font-size:22px">Hi ${name},</h2>
    <p style="color:#475569;line-height:1.6;margin:0 0 16px">We received a request to reset your password. Click the button below to create a new password. This link expires in <strong>1 hour</strong>.</p>
    <div style="text-align:center;margin:24px 0">
      <a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">Reset Password</a>
    </div>
    <p style="color:#94a3b8;font-size:13px;margin:16px 0 0">If the button doesn't work, copy this link:<br><a href="${resetUrl}" style="color:#2563eb;word-break:break-all">${resetUrl}</a></p>
    <p style="color:#ef4444;font-size:13px;margin:16px 0 0;padding:12px;background:#fef2f2;border-radius:8px">⚠️ If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
  </div>
  <div style="background:#f8fafc;padding:16px 32px;text-align:center;border-top:1px solid #e2e8f0">
    <p style="color:#94a3b8;font-size:12px;margin:0">© ${new Date().getFullYear()} VEREX Industries — Premium Windows & Doors</p>
  </div>
</div>
</body></html>`
    })
    console.log("✅ Password reset email sent to", to)
  } catch (err) {
    console.error("❌ Failed to send reset email:", err)
  }
}

export async function sendPasswordChangedEmail(to: string, name: string) {
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: "Your VEREX Portal Password Was Changed",
      html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
  <div style="background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%);padding:32px;text-align:center">
    <h1 style="color:#fff;margin:0;font-size:28px;letter-spacing:1px">VEREX</h1>
    <p style="color:#93c5fd;margin:8px 0 0;font-size:13px">Security Notification</p>
  </div>
  <div style="padding:32px">
    <h2 style="color:#1e293b;margin:0 0 16px;font-size:22px">Hi ${name},</h2>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:0 0 16px">
      <p style="color:#166534;margin:0;font-size:14px">✅ Your password has been successfully changed.</p>
    </div>
    <p style="color:#475569;line-height:1.6;margin:0 0 16px">You can now log in to your VEREX Portal with your new password.</p>
    <p style="color:#ef4444;font-size:13px;margin:16px 0 0;padding:12px;background:#fef2f2;border-radius:8px">⚠️ If you did not make this change, please contact us immediately at <a href="mailto:admin@verex.ca" style="color:#2563eb">admin@verex.ca</a> or call us directly.</p>
  </div>
  <div style="background:#f8fafc;padding:16px 32px;text-align:center;border-top:1px solid #e2e8f0">
    <p style="color:#94a3b8;font-size:12px;margin:0">© ${new Date().getFullYear()} VEREX Industries — Premium Windows & Doors</p>
  </div>
</div>
</body></html>`
    })
    console.log("✅ Password changed email sent to", to)
  } catch (err) {
    console.error("❌ Failed to send password changed email:", err)
  }
}
