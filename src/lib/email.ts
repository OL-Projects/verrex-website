import { Resend } from "resend"

// Lazy initialization to avoid crashing during build if key is missing
let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY
    if (!key) {
      console.warn("⚠️ RESEND_API_KEY not set — emails will not be sent")
      // Return a stub that won't crash but logs warnings
      return { emails: { send: async () => { console.warn("⚠️ Email not sent (no API key)"); return { id: "stub" } } } } as unknown as Resend
    }
    _resend = new Resend(key)
  }
  return _resend
}
const FROM_PORTAL = "VEREX Portal <portal@verex.ca>"
const FROM_NOREPLY = "VEREX <noreply@verex.ca>"
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.verex.ca"
const COMPANY = {
  name: "VEREX Industries Inc.",
  address: "135 Evergreen Dr., Beaconsfield, QC",
  phone: "(514) 992-4080",
  email: "admin@verex.ca",
  website: "www.verex.ca",
}

// ─── Icon Badge Helper (replaces emojis) ────────────────────
function iconBadge(symbol: string, bgColor: string, textColor: string): string {
  return `<div style="display:inline-block;background:${bgColor};border-radius:50%;width:56px;height:56px;line-height:56px;text-align:center">
    <span style="color:${textColor};font-size:24px;font-weight:700;font-family:Georgia,serif">${symbol}</span>
  </div>`
}

// ─── Shared Email Layout ────────────────────────────────────
function emailLayout(content: string, preheader: string): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>VEREX</title>
  <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
  <style>
    body,table,td{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif}
    body{margin:0;padding:0;width:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#f1f5f9}
    img{border:0;height:auto;line-height:100%;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic}
    table{border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0}
    a{color:#2563eb;text-decoration:none}
    @media only screen and (max-width:600px){.container{width:100%!important;padding:16px!important}}
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif">
  <div style="display:none;font-size:1px;color:#f1f5f9;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden">${preheader}</div>
  
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:32px 16px">
    <tr>
      <td align="center">
        <table role="presentation" class="container" width="580" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06)">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f2847 0%,#1e3a5f 40%,#2563eb 100%);padding:36px 40px;text-align:center">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;background:rgba(255,255,255,0.12);border-radius:12px;padding:10px 24px;margin-bottom:12px">
                      <span style="color:#ffffff;font-size:32px;font-weight:800;letter-spacing:3px">VEREX</span>
                    </div>
                    <p style="color:#93c5fd;margin:0;font-size:13px;letter-spacing:1.5px;text-transform:uppercase">Premium Windows &amp; Doors</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:36px 40px 24px">${content}</td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:0 40px 32px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-top:1px solid #e2e8f0;padding-top:24px">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:12px;color:#94a3b8;line-height:1.6">
                          <p style="margin:0 0 4px"><strong style="color:#64748b">${COMPANY.name}</strong></p>
                          <p style="margin:0 0 4px">${COMPANY.address}</p>
                          <p style="margin:0 0 4px">
                            <a href="tel:${COMPANY.phone}" style="color:#94a3b8;text-decoration:none">${COMPANY.phone}</a>
                            &nbsp;&middot;&nbsp;
                            <a href="mailto:${COMPANY.email}" style="color:#94a3b8;text-decoration:none">${COMPANY.email}</a>
                          </p>
                          <p style="margin:0 0 12px"><a href="${BASE_URL}" style="color:#2563eb">${COMPANY.website}</a></p>
                          <p style="margin:0;color:#cbd5e1;font-size:11px">&copy; ${new Date().getFullYear()} ${COMPANY.name} &mdash; All rights reserved.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ─── CTA Button Helper ──────────────────────────────────────
function ctaButton(text: string, url: string, color = "#2563eb"): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto">
    <tr>
      <td align="center" style="background:${color};border-radius:10px">
        <!--[if mso]><i style="letter-spacing:32px;mso-font-width:-100%;mso-text-raise:24pt">&nbsp;</i><![endif]-->
        <a href="${url}" target="_blank" style="display:inline-block;background:${color};color:#ffffff;padding:14px 36px;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.3px;mso-padding-alt:0">${text}</a>
        <!--[if mso]><i style="letter-spacing:32px;mso-font-width:-100%">&nbsp;</i><![endif]-->
      </td>
    </tr>
  </table>`
}

// ─── Shared Headers for Deliverability ──────────────────────
function getDeliverabilityHeaders() {
  return {
    "X-Entity-Ref-ID": `verex-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    "List-Unsubscribe": `<mailto:unsubscribe@verex.ca?subject=unsubscribe>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  }
}

// ═══════════════════════════════════════════════════════════
// WELCOME EMAIL
// ═══════════════════════════════════════════════════════════
export async function sendWelcomeEmail(to: string, name: string) {
  const firstName = name.split(" ")[0]
  const preheader = `Welcome to VEREX Portal, ${firstName} — your account is ready.`

  const content = `
    <h1 style="color:#0f172a;margin:0 0 8px;font-size:26px;font-weight:800">Welcome to VEREX Portal</h1>
    <p style="color:#64748b;margin:0 0 24px;font-size:15px">Hello ${firstName}, your account is ready to go.</p>
    
    <div style="background:linear-gradient(135deg,#eff6ff,#f0f9ff);border:1px solid #bfdbfe;border-radius:12px;padding:24px;margin:0 0 24px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:0 0 12px">
            <span style="display:inline-block;background:#2563eb;color:#fff;width:28px;height:28px;border-radius:50%;text-align:center;line-height:28px;font-size:14px;font-weight:700;margin-right:12px;vertical-align:middle">1</span>
            <span style="color:#1e293b;font-size:14px;font-weight:600;vertical-align:middle">Track your projects in real-time</span>
          </td>
        </tr>
        <tr>
          <td style="padding:0 0 12px">
            <span style="display:inline-block;background:#2563eb;color:#fff;width:28px;height:28px;border-radius:50%;text-align:center;line-height:28px;font-size:14px;font-weight:700;margin-right:12px;vertical-align:middle">2</span>
            <span style="color:#1e293b;font-size:14px;font-weight:600;vertical-align:middle">Request quotes and estimates online</span>
          </td>
        </tr>
        <tr>
          <td style="padding:0">
            <span style="display:inline-block;background:#2563eb;color:#fff;width:28px;height:28px;border-radius:50%;text-align:center;line-height:28px;font-size:14px;font-weight:700;margin-right:12px;vertical-align:middle">3</span>
            <span style="color:#1e293b;font-size:14px;font-weight:600;vertical-align:middle">Communicate directly with our team</span>
          </td>
        </tr>
      </table>
    </div>

    ${ctaButton("Log In to Your Portal", `${BASE_URL}/en/portal/login`)}

    <p style="color:#94a3b8;font-size:13px;line-height:1.5;margin:0;text-align:center">If you did not create this account, you can safely ignore this email or <a href="mailto:${COMPANY.email}" style="color:#2563eb">contact us</a>.</p>
  `

  const text = `Welcome to VEREX Portal, ${firstName}!\n\nYour account has been created successfully.\n\nLog in at: ${BASE_URL}/en/portal/login\n\nWith your portal account you can:\n- Track your projects in real-time\n- Request quotes and estimates online\n- Communicate directly with our team\n\n${COMPANY.name}\n${COMPANY.address}\n${COMPANY.phone}`

  const result = await getResend().emails.send({
    from: FROM_PORTAL,
    to,
    subject: `Welcome to VEREX Portal, ${firstName}`,
    html: emailLayout(content, preheader),
    text,
    replyTo: COMPANY.email,
    headers: getDeliverabilityHeaders(),
  })
  console.log("Welcome email sent:", to, result.data?.id)
}

// ═══════════════════════════════════════════════════════════
// PASSWORD RESET EMAIL
// ═══════════════════════════════════════════════════════════
export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const firstName = name.split(" ")[0]
  const resetUrl = `${BASE_URL}/en/portal/reset-password?token=${token}`
  const preheader = `Reset your VEREX Portal password — this link expires in 1 hour.`

  const content = `
    <div style="text-align:center;margin:0 0 24px">
      ${iconBadge("&oplus;", "#fef3c7", "#d97706")}
    </div>
    
    <h1 style="color:#0f172a;margin:0 0 8px;font-size:24px;font-weight:800;text-align:center">Password Reset Request</h1>
    <p style="color:#64748b;margin:0 0 24px;font-size:15px;text-align:center;line-height:1.6">Hi ${firstName}, we received a request to reset your VEREX Portal password. Click the button below to create a new one.</p>

    ${ctaButton("Reset My Password", resetUrl)}

    <div style="background:#fefce8;border:1px solid #fde68a;border-radius:10px;padding:16px 20px;margin:0 0 20px">
      <p style="margin:0;color:#92400e;font-size:13px;line-height:1.5"><strong>This link expires in 1 hour.</strong> If you did not request this reset, no action is needed &mdash; your password remains unchanged.</p>
    </div>

    <p style="color:#94a3b8;font-size:12px;margin:0;line-height:1.5;word-break:break-all">If the button does not work, copy this link into your browser:<br><a href="${resetUrl}" style="color:#2563eb;font-size:12px">${resetUrl}</a></p>
  `

  const text = `Password Reset Request\n\nHi ${firstName},\n\nWe received a request to reset your VEREX Portal password.\n\nReset your password: ${resetUrl}\n\nThis link expires in 1 hour. If you did not request this, no action is needed.\n\n${COMPANY.name}\n${COMPANY.phone}`

  const result = await getResend().emails.send({
    from: FROM_NOREPLY,
    to,
    subject: "VEREX Portal — Password Reset",
    html: emailLayout(content, preheader),
    text,
    replyTo: COMPANY.email,
    headers: getDeliverabilityHeaders(),
  })
  console.log("Reset email sent:", to, result.data?.id)
}

// ═══════════════════════════════════════════════════════════
// PASSWORD CHANGED CONFIRMATION
// ═══════════════════════════════════════════════════════════
export async function sendPasswordChangedEmail(to: string, name: string) {
  const firstName = name.split(" ")[0]
  const preheader = `Your VEREX Portal password was successfully changed.`

  const content = `
    <div style="text-align:center;margin:0 0 24px">
      ${iconBadge("&check;", "#dcfce7", "#16a34a")}
    </div>

    <h1 style="color:#0f172a;margin:0 0 8px;font-size:24px;font-weight:800;text-align:center">Password Changed</h1>
    <p style="color:#64748b;margin:0 0 24px;font-size:15px;text-align:center;line-height:1.6">Hi ${firstName}, your VEREX Portal password has been successfully updated.</p>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px 24px;margin:0 0 24px;text-align:center">
      <p style="margin:0;color:#166534;font-size:15px;font-weight:600">Your account is secure</p>
      <p style="margin:8px 0 0;color:#15803d;font-size:13px">You can now log in with your new password.</p>
    </div>

    ${ctaButton("Log In Now", `${BASE_URL}/en/portal/login`, "#059669")}

    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:16px 20px;margin:0">
      <p style="margin:0;color:#991b1b;font-size:13px;line-height:1.5"><strong>Did not make this change?</strong> Contact us immediately at <a href="mailto:${COMPANY.email}" style="color:#dc2626;font-weight:600">${COMPANY.email}</a> or call <a href="tel:${COMPANY.phone}" style="color:#dc2626;font-weight:600">${COMPANY.phone}</a>.</p>
    </div>
  `

  const text = `Password Changed Successfully\n\nHi ${firstName},\n\nYour VEREX Portal password has been successfully updated.\n\nLog in at: ${BASE_URL}/en/portal/login\n\nIf you did not make this change, contact us immediately at ${COMPANY.email} or call ${COMPANY.phone}.\n\n${COMPANY.name}\n${COMPANY.address}`

  const result = await getResend().emails.send({
    from: FROM_NOREPLY,
    to,
    subject: "VEREX Portal — Password Changed",
    html: emailLayout(content, preheader),
    text,
    replyTo: COMPANY.email,
    headers: getDeliverabilityHeaders(),
  })
  console.log("Password changed email sent:", to, result.data?.id)
}

// ═══════════════════════════════════════════════════════════
// CONTACT FORM CONFIRMATION (to user)
// ═══════════════════════════════════════════════════════════
export async function sendContactConfirmationEmail(to: string, name: string, subject?: string) {
  const firstName = name.split(" ")[0]
  const preheader = `Thank you for contacting VEREX, ${firstName} — we'll respond within 24 hours.`

  const content = `
    <div style="text-align:center;margin:0 0 24px">
      ${iconBadge("&hearts;", "#dbeafe", "#2563eb")}
    </div>

    <h1 style="color:#0f172a;margin:0 0 8px;font-size:24px;font-weight:800;text-align:center">We Received Your Message</h1>
    <p style="color:#64748b;margin:0 0 24px;font-size:15px;text-align:center;line-height:1.6">Hi ${firstName}, thank you for reaching out to VEREX. Our team has received your ${subject ? `inquiry about <strong>${subject}</strong>` : "message"} and will get back to you shortly.</p>

    <div style="background:linear-gradient(135deg,#eff6ff,#f0f9ff);border:1px solid #bfdbfe;border-radius:12px;padding:24px;margin:0 0 24px;text-align:center">
      <p style="margin:0 0 4px;color:#1e40af;font-size:16px;font-weight:700">Expected Response Time</p>
      <p style="margin:0;color:#3b82f6;font-size:14px">Within 24 business hours</p>
    </div>

    <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 24px;text-align:center">In the meantime, feel free to explore our product catalog or request a free estimate online.</p>

    ${ctaButton("Explore Our Products", `${BASE_URL}/en/products`)}

    <p style="color:#94a3b8;font-size:13px;line-height:1.5;margin:0;text-align:center">Need immediate assistance? Call us at <a href="tel:${COMPANY.phone}" style="color:#2563eb;font-weight:600">${COMPANY.phone}</a></p>
  `

  const text = `Thank you for contacting VEREX, ${firstName}!\n\nWe received your ${subject || "message"} and will respond within 24 business hours.\n\nIn the meantime, explore our products at ${BASE_URL}/en/products\n\nNeed immediate help? Call ${COMPANY.phone}\n\n${COMPANY.name}\n${COMPANY.address}`

  const result = await getResend().emails.send({
    from: FROM_NOREPLY,
    to,
    subject: `VEREX — We received your message, ${firstName}`,
    html: emailLayout(content, preheader),
    text,
    replyTo: COMPANY.email,
    headers: getDeliverabilityHeaders(),
  })
  console.log("Contact confirmation sent:", to, result.data?.id)
}

// ═══════════════════════════════════════════════════════════
// QUOTE REQUEST CONFIRMATION (to user)
// ═══════════════════════════════════════════════════════════
export async function sendQuoteConfirmationEmail(to: string, name: string, projectType?: string) {
  const firstName = name.split(" ")[0]
  const preheader = `Your quote request has been received, ${firstName} — our team is preparing your estimate.`

  const content = `
    <div style="text-align:center;margin:0 0 24px">
      ${iconBadge("&equiv;", "#f3e8ff", "#7c3aed")}
    </div>

    <h1 style="color:#0f172a;margin:0 0 8px;font-size:24px;font-weight:800;text-align:center">Quote Request Received</h1>
    <p style="color:#64748b;margin:0 0 24px;font-size:15px;text-align:center;line-height:1.6">Hi ${firstName}, thank you for your interest in VEREX premium windows and doors. We've received your ${projectType ? `<strong>${projectType}</strong> ` : ""}quote request.</p>

    <div style="background:linear-gradient(135deg,#faf5ff,#f5f3ff);border:1px solid #ddd6fe;border-radius:12px;padding:24px;margin:0 0 24px">
      <h3 style="margin:0 0 16px;color:#5b21b6;font-size:15px;font-weight:700">What happens next?</h3>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:0 0 12px">
            <span style="display:inline-block;background:#7c3aed;color:#fff;width:24px;height:24px;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;margin-right:12px;vertical-align:middle">1</span>
            <span style="color:#1e293b;font-size:14px;vertical-align:middle">Our team reviews your project details</span>
          </td>
        </tr>
        <tr>
          <td style="padding:0 0 12px">
            <span style="display:inline-block;background:#7c3aed;color:#fff;width:24px;height:24px;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;margin-right:12px;vertical-align:middle">2</span>
            <span style="color:#1e293b;font-size:14px;vertical-align:middle">We prepare a detailed, customized quote</span>
          </td>
        </tr>
        <tr>
          <td style="padding:0">
            <span style="display:inline-block;background:#7c3aed;color:#fff;width:24px;height:24px;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;margin-right:12px;vertical-align:middle">3</span>
            <span style="color:#1e293b;font-size:14px;vertical-align:middle">You receive your quote within 1–2 business days</span>
          </td>
        </tr>
      </table>
    </div>

    ${ctaButton("View Our Window Types", `${BASE_URL}/en/products`, "#7c3aed")}

    <p style="color:#94a3b8;font-size:13px;line-height:1.5;margin:0;text-align:center">Questions? Call us at <a href="tel:${COMPANY.phone}" style="color:#2563eb;font-weight:600">${COMPANY.phone}</a> or reply to this email.</p>
  `

  const text = `Quote Request Received!\n\nHi ${firstName},\n\nThank you for your ${projectType || ""} quote request. Here's what happens next:\n\n1. Our team reviews your project details\n2. We prepare a detailed, customized quote\n3. You receive your quote within 1-2 business days\n\nView our products: ${BASE_URL}/en/products\n\nQuestions? Call ${COMPANY.phone}\n\n${COMPANY.name}\n${COMPANY.address}`

  const result = await getResend().emails.send({
    from: FROM_NOREPLY,
    to,
    subject: `VEREX — Your quote request has been received`,
    html: emailLayout(content, preheader),
    text,
    replyTo: COMPANY.email,
    headers: getDeliverabilityHeaders(),
  })
  console.log("Quote confirmation sent:", to, result.data?.id)
}

// ═══════════════════════════════════════════════════════════
// APPOINTMENT CONFIRMATION (to user)
// ═══════════════════════════════════════════════════════════
export async function sendAppointmentConfirmationEmail(
  to: string, name: string, details: { type?: string; date?: string; time?: string; location?: string }
) {
  const firstName = name.split(" ")[0]
  const preheader = `Your appointment with VEREX is confirmed, ${firstName}.`
  const aptType = details.type?.replace(/-/g, " ") || "consultation"

  const content = `
    <div style="text-align:center;margin:0 0 24px">
      ${iconBadge("&squ;", "#dcfce7", "#059669")}
    </div>

    <h1 style="color:#0f172a;margin:0 0 8px;font-size:24px;font-weight:800;text-align:center">Appointment Confirmed</h1>
    <p style="color:#64748b;margin:0 0 24px;font-size:15px;text-align:center;line-height:1.6">Hi ${firstName}, your <strong style="text-transform:capitalize">${aptType}</strong> appointment request has been received.</p>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:24px;margin:0 0 24px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${details.type ? `<tr><td style="padding:6px 0;color:#64748b;font-size:13px;width:110px">Type</td><td style="padding:6px 0;color:#166534;font-weight:600;font-size:14px;text-transform:capitalize">${aptType}</td></tr>` : ""}
        ${details.date ? `<tr><td style="padding:6px 0;color:#64748b;font-size:13px">Date</td><td style="padding:6px 0;color:#166534;font-weight:600;font-size:14px">${details.date}</td></tr>` : ""}
        ${details.time ? `<tr><td style="padding:6px 0;color:#64748b;font-size:13px">Time</td><td style="padding:6px 0;color:#166534;font-weight:600;font-size:14px">${details.time}</td></tr>` : ""}
        ${details.location ? `<tr><td style="padding:6px 0;color:#64748b;font-size:13px">Location</td><td style="padding:6px 0;color:#166534;font-weight:600;font-size:14px">${details.location}</td></tr>` : ""}
      </table>
    </div>

    <div style="background:#fefce8;border:1px solid #fde68a;border-radius:10px;padding:16px 20px;margin:0 0 24px">
      <p style="margin:0;color:#92400e;font-size:13px;line-height:1.5">A member of our team will confirm the exact time and may reach out to finalize details. Please keep your phone available.</p>
    </div>

    ${ctaButton("Visit VEREX Website", `${BASE_URL}`, "#059669")}

    <p style="color:#94a3b8;font-size:13px;line-height:1.5;margin:0;text-align:center">Need to reschedule? Call <a href="tel:${COMPANY.phone}" style="color:#2563eb;font-weight:600">${COMPANY.phone}</a> or email <a href="mailto:${COMPANY.email}" style="color:#2563eb">${COMPANY.email}</a></p>
  `

  const text = `Appointment Confirmed!\n\nHi ${firstName},\n\nYour ${aptType} appointment has been received.\n\n${details.date ? `Date: ${details.date}\n` : ""}${details.time ? `Time: ${details.time}\n` : ""}${details.location ? `Location: ${details.location}\n` : ""}\nOur team will confirm the exact time and may reach out to finalize details.\n\nNeed to reschedule? Call ${COMPANY.phone}\n\n${COMPANY.name}\n${COMPANY.address}`

  const result = await getResend().emails.send({
    from: FROM_NOREPLY,
    to,
    subject: `VEREX — Appointment confirmed, ${firstName}`,
    html: emailLayout(content, preheader),
    text,
    replyTo: COMPANY.email,
    headers: getDeliverabilityHeaders(),
  })
  console.log("Appointment confirmation sent:", to, result.data?.id)
}

// ═══════════════════════════════════════════════════════════
// QUICK QUOTE CONFIRMATION (to user)
// ═══════════════════════════════════════════════════════════
export async function sendQuickQuoteConfirmationEmail(to: string, name: string, products?: string[]) {
  const firstName = name.split(" ")[0]
  const preheader = `Your quick quote request is being processed, ${firstName}.`

  const productHtml = products?.length
    ? products.map(p => `<li style="padding:3px 0;color:#1e293b;font-size:14px">${p}</li>`).join("")
    : ""

  const content = `
    <div style="text-align:center;margin:0 0 24px">
      ${iconBadge("&raquo;", "#e0f2fe", "#0369a1")}
    </div>

    <h1 style="color:#0f172a;margin:0 0 8px;font-size:24px;font-weight:800;text-align:center">Quick Quote Received</h1>
    <p style="color:#64748b;margin:0 0 24px;font-size:15px;text-align:center;line-height:1.6">Hi ${firstName}, we've received your quick quote request and our team will review it promptly.</p>

    ${productHtml ? `
    <div style="background:linear-gradient(135deg,#f0f9ff,#e0f2fe);border:1px solid #bae6fd;border-radius:12px;padding:24px;margin:0 0 24px">
      <p style="margin:0 0 12px;color:#0c4a6e;font-size:14px;font-weight:700">Products you're interested in:</p>
      <ul style="margin:0;padding-left:20px">${productHtml}</ul>
    </div>
    ` : ""}

    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px 24px;margin:0 0 24px;text-align:center">
      <p style="margin:0 0 4px;color:#0369a1;font-size:16px;font-weight:700">Expect a response within</p>
      <p style="margin:0;color:#0ea5e9;font-size:14px">1 business day</p>
    </div>

    ${ctaButton("Browse Full Catalog", `${BASE_URL}/en/products`, "#0369a1")}

    <p style="color:#94a3b8;font-size:13px;line-height:1.5;margin:0;text-align:center">Questions? Call <a href="tel:${COMPANY.phone}" style="color:#2563eb;font-weight:600">${COMPANY.phone}</a></p>
  `

  const text = `Quick Quote Received!\n\nHi ${firstName},\n\nWe've received your quick quote request and will respond within 1 business day.\n\n${products?.length ? `Products: ${products.join(", ")}\n\n` : ""}Browse our catalog: ${BASE_URL}/en/products\n\nQuestions? Call ${COMPANY.phone}\n\n${COMPANY.name}\n${COMPANY.address}`

  const result = await getResend().emails.send({
    from: FROM_NOREPLY,
    to,
    subject: `VEREX — Quick quote request received`,
    html: emailLayout(content, preheader),
    text,
    replyTo: COMPANY.email,
    headers: getDeliverabilityHeaders(),
  })
  console.log("Quick quote confirmation sent:", to, result.data?.id)
}
