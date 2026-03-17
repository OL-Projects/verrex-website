import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import {
  emailLayout,
  sendContactConfirmationEmail,
  sendQuoteConfirmationEmail,
  sendAppointmentConfirmationEmail,
  sendQuickQuoteConfirmationEmail,
} from "@/lib/email";

// Lazy init to avoid build crash when API key is missing locally
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is required");
    _resend = new Resend(key);
  }
  return _resend;
}
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@verex.ca";

type FormType = "contact" | "quote" | "appointment" | "quick-quote";

interface ContactData {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message?: string;
  contactMethod?: string;
}

interface QuoteData {
  name: string;
  email: string;
  phone: string;
  address?: string;
  projectType?: string;
  serviceType?: string;
  description?: string;
  preferredDate?: string;
  preferredTime?: string;
  budget?: string;
}

interface AppointmentData {
  name: string;
  email: string;
  phone: string;
  location?: string;
  appointmentType?: string;
  date?: string;
  time?: string;
  notes?: string;
}

interface QuickQuoteData {
  name: string;
  email: string;
  phone?: string;
  city?: string;
  postalCode?: string;
  products?: string[];
  quantity?: string;
}

function buildContactEmail(data: ContactData): string {
  const content = `
    <h1 style="color:#0f172a;margin:0 0 8px;font-size:24px;font-weight:800">New Contact Form Submission</h1>
    <p style="color:#64748b;margin:0 0 24px;font-size:15px">A visitor submitted the contact form on verex.ca</p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin:0 0 24px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:8px 0;color:#64748b;font-size:13px;width:140px">Name</td><td style="padding:8px 0;color:#1e293b;font-weight:600;font-size:14px">${data.name}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;font-size:13px">Email</td><td style="padding:8px 0"><a href="mailto:${data.email}" style="color:#2563eb;font-weight:600;font-size:14px">${data.email}</a></td></tr>
        ${data.phone ? `<tr><td style="padding:8px 0;color:#64748b;font-size:13px">Phone</td><td style="padding:8px 0"><a href="tel:${data.phone}" style="color:#2563eb;font-size:14px">${data.phone}</a></td></tr>` : ""}
        ${data.subject ? `<tr><td style="padding:8px 0;color:#64748b;font-size:13px">Subject</td><td style="padding:8px 0;color:#1e293b;font-size:14px;text-transform:capitalize">${data.subject}</td></tr>` : ""}
        ${data.contactMethod ? `<tr><td style="padding:8px 0;color:#64748b;font-size:13px">Preferred Contact</td><td style="padding:8px 0;color:#1e293b;font-size:14px;text-transform:capitalize">${data.contactMethod}</td></tr>` : ""}
      </table>
    </div>
    ${data.message ? `
    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px 24px;margin:0 0 24px">
      <p style="margin:0 0 8px;color:#475569;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px">Message</p>
      <p style="margin:0;color:#1e293b;font-size:14px;line-height:1.6;white-space:pre-wrap">${data.message}</p>
    </div>` : ""}
    <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center">Sent from VEREX website contact form</p>
  `;
  return emailLayout(content, `New contact from ${data.name} — ${data.subject || "General Inquiry"}`);
}

function buildQuoteEmail(data: QuoteData): string {
  const content = `
    <h1 style="color:#0f172a;margin:0 0 8px;font-size:24px;font-weight:800">New Quote Request</h1>
    <p style="color:#64748b;margin:0 0 24px;font-size:15px">A visitor submitted a quote request on verex.ca</p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin:0 0 16px">
      <p style="margin:0 0 12px;color:#475569;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px">Contact Information</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:8px 0;color:#64748b;font-size:13px;width:140px">Name</td><td style="padding:8px 0;color:#1e293b;font-weight:600;font-size:14px">${data.name}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;font-size:13px">Email</td><td style="padding:8px 0"><a href="mailto:${data.email}" style="color:#2563eb;font-weight:600;font-size:14px">${data.email}</a></td></tr>
        <tr><td style="padding:8px 0;color:#64748b;font-size:13px">Phone</td><td style="padding:8px 0"><a href="tel:${data.phone}" style="color:#2563eb;font-size:14px">${data.phone}</a></td></tr>
        ${data.address ? `<tr><td style="padding:8px 0;color:#64748b;font-size:13px">Address</td><td style="padding:8px 0;color:#1e293b;font-size:14px">${data.address}</td></tr>` : ""}
      </table>
    </div>
    <div style="background:linear-gradient(135deg,#faf5ff,#f5f3ff);border:1px solid #ddd6fe;border-radius:12px;padding:24px;margin:0 0 24px">
      <p style="margin:0 0 12px;color:#5b21b6;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px">Project Details</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${data.projectType ? `<tr><td style="padding:8px 0;color:#64748b;font-size:13px;width:140px">Project Type</td><td style="padding:8px 0;color:#5b21b6;font-weight:600;font-size:14px;text-transform:capitalize">${data.projectType}</td></tr>` : ""}
        ${data.serviceType ? `<tr><td style="padding:8px 0;color:#64748b;font-size:13px">Service</td><td style="padding:8px 0;color:#1e293b;font-size:14px;text-transform:capitalize">${data.serviceType}</td></tr>` : ""}
        ${data.budget ? `<tr><td style="padding:8px 0;color:#64748b;font-size:13px">Budget</td><td style="padding:8px 0;color:#1e293b;font-size:14px">${data.budget}</td></tr>` : ""}
        ${data.preferredDate ? `<tr><td style="padding:8px 0;color:#64748b;font-size:13px">Preferred Date</td><td style="padding:8px 0;color:#1e293b;font-size:14px">${data.preferredDate}</td></tr>` : ""}
        ${data.preferredTime ? `<tr><td style="padding:8px 0;color:#64748b;font-size:13px">Preferred Time</td><td style="padding:8px 0;color:#1e293b;font-size:14px;text-transform:capitalize">${data.preferredTime}</td></tr>` : ""}
      </table>
    </div>
    ${data.description ? `
    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px 24px;margin:0 0 24px">
      <p style="margin:0 0 8px;color:#475569;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px">Description</p>
      <p style="margin:0;color:#1e293b;font-size:14px;line-height:1.6;white-space:pre-wrap">${data.description}</p>
    </div>` : ""}
    <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center">Sent from VEREX website quote form</p>
  `;
  return emailLayout(content, `New quote request from ${data.name} — ${data.projectType || "Unspecified"}`);
}

function buildAppointmentEmail(data: AppointmentData): string {
  const aptType = data.appointmentType?.replace(/-/g, " ") || "consultation";
  const content = `
    <h1 style="color:#0f172a;margin:0 0 8px;font-size:24px;font-weight:800">New Appointment Booking</h1>
    <p style="color:#64748b;margin:0 0 24px;font-size:15px">A visitor booked an appointment on verex.ca</p>
    ${data.appointmentType ? `
    <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:10px;padding:14px 20px;margin:0 0 20px;text-align:center">
      <span style="color:#065f46;font-size:15px;font-weight:700;text-transform:capitalize">${aptType}</span>
    </div>` : ""}
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin:0 0 24px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:8px 0;color:#64748b;font-size:13px;width:140px">Name</td><td style="padding:8px 0;color:#1e293b;font-weight:600;font-size:14px">${data.name}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;font-size:13px">Email</td><td style="padding:8px 0"><a href="mailto:${data.email}" style="color:#2563eb;font-weight:600;font-size:14px">${data.email}</a></td></tr>
        <tr><td style="padding:8px 0;color:#64748b;font-size:13px">Phone</td><td style="padding:8px 0"><a href="tel:${data.phone}" style="color:#2563eb;font-size:14px">${data.phone}</a></td></tr>
        ${data.location ? `<tr><td style="padding:8px 0;color:#64748b;font-size:13px">Location</td><td style="padding:8px 0;color:#1e293b;font-size:14px">${data.location}</td></tr>` : ""}
        ${data.date ? `<tr><td style="padding:8px 0;color:#64748b;font-size:13px">Date</td><td style="padding:8px 0;color:#1e293b;font-weight:600;font-size:14px">${data.date}</td></tr>` : ""}
        ${data.time ? `<tr><td style="padding:8px 0;color:#64748b;font-size:13px">Time</td><td style="padding:8px 0;color:#1e293b;font-weight:600;font-size:14px">${data.time}</td></tr>` : ""}
      </table>
    </div>
    ${data.notes ? `
    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px 24px;margin:0 0 24px">
      <p style="margin:0 0 8px;color:#475569;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px">Notes</p>
      <p style="margin:0;color:#1e293b;font-size:14px;line-height:1.6;white-space:pre-wrap">${data.notes}</p>
    </div>` : ""}
    <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center">Sent from VEREX website appointment form</p>
  `;
  return emailLayout(content, `New appointment from ${data.name} — ${aptType}`);
}

function buildQuickQuoteEmail(data: QuickQuoteData): string {
  const productList = data.products?.length
    ? data.products.map((p) => `<li style="padding:4px 0;color:#1e293b;font-size:14px">${p}</li>`).join("")
    : "<li style='color:#94a3b8'>None selected</li>";
  const content = `
    <h1 style="color:#0f172a;margin:0 0 8px;font-size:24px;font-weight:800">Quick Quote Request</h1>
    <p style="color:#64748b;margin:0 0 24px;font-size:15px">A visitor submitted a quick quote from the homepage</p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin:0 0 20px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:8px 0;color:#64748b;font-size:13px;width:140px">Name</td><td style="padding:8px 0;color:#1e293b;font-weight:600;font-size:14px">${data.name}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;font-size:13px">Email</td><td style="padding:8px 0"><a href="mailto:${data.email}" style="color:#2563eb;font-weight:600;font-size:14px">${data.email}</a></td></tr>
        ${data.phone ? `<tr><td style="padding:8px 0;color:#64748b;font-size:13px">Phone</td><td style="padding:8px 0"><a href="tel:${data.phone}" style="color:#2563eb;font-size:14px">${data.phone}</a></td></tr>` : ""}
        ${data.city ? `<tr><td style="padding:8px 0;color:#64748b;font-size:13px">City</td><td style="padding:8px 0;color:#1e293b;font-size:14px">${data.city}</td></tr>` : ""}
        ${data.postalCode ? `<tr><td style="padding:8px 0;color:#64748b;font-size:13px">Postal Code</td><td style="padding:8px 0;color:#1e293b;font-size:14px">${data.postalCode}</td></tr>` : ""}
        ${data.quantity ? `<tr><td style="padding:8px 0;color:#64748b;font-size:13px">Quantity</td><td style="padding:8px 0;color:#1e293b;font-size:14px">${data.quantity} units</td></tr>` : ""}
      </table>
    </div>
    <div style="background:linear-gradient(135deg,#f0f9ff,#e0f2fe);border:1px solid #bae6fd;border-radius:12px;padding:20px 24px;margin:0 0 24px">
      <p style="margin:0 0 12px;color:#0c4a6e;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px">Products Interested In</p>
      <ul style="margin:0;padding-left:20px">${productList}</ul>
    </div>
    <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center">Sent from VEREX website homepage quick quote</p>
  `;
  return emailLayout(content, `Quick quote from ${data.name}`);
}

function getSubjectLine(type: FormType, data: Record<string, unknown>): string {
  const name = (data.name as string) || (data.email as string) || "Anonymous";
  switch (type) {
    case "contact":
      return `New Contact: ${name} — ${(data.subject as string) || "General Inquiry"}`;
    case "quote":
      return `New Quote Request: ${name} — ${(data.projectType as string) || "Unspecified"}`;
    case "appointment":
      return `New Appointment: ${name} — ${((data.appointmentType as string) || "").replace(/-/g, " ")}`;
    case "quick-quote":
      return `Quick Quote: ${name}`;
    default:
      return `New Form Submission from VEREX Website`;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, ...data } = body as { type: FormType } & Record<string, unknown>;

    if (!type || !data.email) {
      return NextResponse.json(
        { error: "Missing required fields: type, email" },
        { status: 400 }
      );
    }

    let html: string;
    switch (type) {
      case "contact":
        html = buildContactEmail(data as unknown as ContactData);
        break;
      case "quote":
        html = buildQuoteEmail(data as unknown as QuoteData);
        break;
      case "appointment":
        html = buildAppointmentEmail(data as unknown as AppointmentData);
        break;
      case "quick-quote":
        html = buildQuickQuoteEmail(data as unknown as QuickQuoteData);
        break;
      default:
        return NextResponse.json({ error: "Invalid form type" }, { status: 400 });
    }

    const { error } = await getResend().emails.send({
      from: "VEREX Website <noreply@verex.ca>",
      to: [ADMIN_EMAIL],
      subject: getSubjectLine(type, data),
      html,
      replyTo: data.email as string,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email. Please try again." },
        { status: 500 }
      );
    }

    // Save as Lead in database (non-blocking)
    const leadType = type === "quick-quote" ? "quick_quote" : type;
    prisma.lead.create({
      data: {
        name: (data.name as string) || "Unknown",
        email: data.email as string,
        phone: (data.phone as string) || null,
        source: "website",
        type: leadType,
        subject: (data.subject as string) || null,
        message: (data.message as string) || (data.description as string) || null,
        projectType: (data.projectType as string) || null,
        budget: (data.budget as string) || null,
        address: (data.address as string) || (data.location as string) || null,
        metadata: JSON.stringify(data),
      },
    }).catch((err: unknown) => console.error("Lead capture error:", err));

    // Send confirmation email to the user (non-blocking)
    const userName = (data.name as string) || "Customer";
    const userEmail = data.email as string;
    switch (type) {
      case "contact":
        sendContactConfirmationEmail(userEmail, userName, data.subject as string | undefined).catch(console.error);
        break;
      case "quote":
        sendQuoteConfirmationEmail(userEmail, userName, data.projectType as string | undefined).catch(console.error);
        break;
      case "appointment":
        sendAppointmentConfirmationEmail(userEmail, userName, {
          type: data.appointmentType as string | undefined,
          date: data.date as string | undefined,
          time: data.time as string | undefined,
          location: data.location as string | undefined,
        }).catch(console.error);
        break;
      case "quick-quote":
        sendQuickQuoteConfirmationEmail(userEmail, userName, data.products as string[] | undefined).catch(console.error);
        break;
    }

    return NextResponse.json({ success: true, message: "Email sent successfully" });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
