import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import {
  sendContactConfirmationEmail,
  sendQuoteConfirmationEmail,
  sendAppointmentConfirmationEmail,
  sendQuickQuoteConfirmationEmail,
} from "@/lib/email";

const resend = new Resend(process.env.RESEND_API_KEY);
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
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 24px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 22px;">📩 New Contact Form Submission</h1>
      </div>
      <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #64748b; width: 140px;">Name</td><td style="padding: 8px 0; font-weight: 600;">${data.name}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Email</td><td style="padding: 8px 0;"><a href="mailto:${data.email}" style="color: #2563eb;">${data.email}</a></td></tr>
          ${data.phone ? `<tr><td style="padding: 8px 0; color: #64748b;">Phone</td><td style="padding: 8px 0;"><a href="tel:${data.phone}" style="color: #2563eb;">${data.phone}</a></td></tr>` : ""}
          ${data.subject ? `<tr><td style="padding: 8px 0; color: #64748b;">Subject</td><td style="padding: 8px 0; text-transform: capitalize;">${data.subject}</td></tr>` : ""}
          ${data.contactMethod ? `<tr><td style="padding: 8px 0; color: #64748b;">Preferred Contact</td><td style="padding: 8px 0; text-transform: capitalize;">${data.contactMethod}</td></tr>` : ""}
        </table>
        ${data.message ? `
          <div style="margin-top: 16px; padding: 16px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
            <p style="margin: 0 0 8px; color: #64748b; font-size: 13px; font-weight: 600;">Message:</p>
            <p style="margin: 0; white-space: pre-wrap;">${data.message}</p>
          </div>
        ` : ""}
        <p style="margin-top: 20px; font-size: 12px; color: #94a3b8;">Sent from VEREX website contact form</p>
      </div>
    </div>
  `;
}

function buildQuoteEmail(data: QuoteData): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #7c3aed, #a855f7); padding: 24px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 22px;">📋 New Quote Request</h1>
      </div>
      <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
        <h3 style="margin: 0 0 12px; color: #1e293b;">Contact Information</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #64748b; width: 140px;">Name</td><td style="padding: 8px 0; font-weight: 600;">${data.name}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Email</td><td style="padding: 8px 0;"><a href="mailto:${data.email}" style="color: #2563eb;">${data.email}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Phone</td><td style="padding: 8px 0;"><a href="tel:${data.phone}" style="color: #2563eb;">${data.phone}</a></td></tr>
          ${data.address ? `<tr><td style="padding: 8px 0; color: #64748b;">Address</td><td style="padding: 8px 0;">${data.address}</td></tr>` : ""}
        </table>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
        <h3 style="margin: 0 0 12px; color: #1e293b;">Project Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${data.projectType ? `<tr><td style="padding: 8px 0; color: #64748b; width: 140px;">Project Type</td><td style="padding: 8px 0; text-transform: capitalize; font-weight: 600;">${data.projectType}</td></tr>` : ""}
          ${data.serviceType ? `<tr><td style="padding: 8px 0; color: #64748b;">Service</td><td style="padding: 8px 0; text-transform: capitalize;">${data.serviceType}</td></tr>` : ""}
          ${data.budget ? `<tr><td style="padding: 8px 0; color: #64748b;">Budget</td><td style="padding: 8px 0;">${data.budget}</td></tr>` : ""}
          ${data.preferredDate ? `<tr><td style="padding: 8px 0; color: #64748b;">Preferred Date</td><td style="padding: 8px 0;">${data.preferredDate}</td></tr>` : ""}
          ${data.preferredTime ? `<tr><td style="padding: 8px 0; color: #64748b;">Preferred Time</td><td style="padding: 8px 0; text-transform: capitalize;">${data.preferredTime}</td></tr>` : ""}
        </table>
        ${data.description ? `
          <div style="margin-top: 16px; padding: 16px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
            <p style="margin: 0 0 8px; color: #64748b; font-size: 13px; font-weight: 600;">Description:</p>
            <p style="margin: 0; white-space: pre-wrap;">${data.description}</p>
          </div>
        ` : ""}
        <p style="margin-top: 20px; font-size: 12px; color: #94a3b8;">Sent from VEREX website quote form</p>
      </div>
    </div>
  `;
}

function buildAppointmentEmail(data: AppointmentData): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 24px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 22px;">📅 New Appointment Booking</h1>
      </div>
      <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
        ${data.appointmentType ? `
          <div style="margin-bottom: 16px; padding: 12px 16px; background: #ecfdf5; border-radius: 8px; border: 1px solid #a7f3d0;">
            <p style="margin: 0; font-weight: 600; color: #065f46; text-transform: capitalize;">🏷️ ${data.appointmentType.replace(/-/g, " ")}</p>
          </div>
        ` : ""}
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #64748b; width: 140px;">Name</td><td style="padding: 8px 0; font-weight: 600;">${data.name}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Email</td><td style="padding: 8px 0;"><a href="mailto:${data.email}" style="color: #2563eb;">${data.email}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Phone</td><td style="padding: 8px 0;"><a href="tel:${data.phone}" style="color: #2563eb;">${data.phone}</a></td></tr>
          ${data.location ? `<tr><td style="padding: 8px 0; color: #64748b;">Location</td><td style="padding: 8px 0;">${data.location}</td></tr>` : ""}
          ${data.date ? `<tr><td style="padding: 8px 0; color: #64748b;">Date</td><td style="padding: 8px 0; font-weight: 600;">${data.date}</td></tr>` : ""}
          ${data.time ? `<tr><td style="padding: 8px 0; color: #64748b;">Time</td><td style="padding: 8px 0; font-weight: 600;">${data.time}</td></tr>` : ""}
        </table>
        ${data.notes ? `
          <div style="margin-top: 16px; padding: 16px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
            <p style="margin: 0 0 8px; color: #64748b; font-size: 13px; font-weight: 600;">Notes:</p>
            <p style="margin: 0; white-space: pre-wrap;">${data.notes}</p>
          </div>
        ` : ""}
        <p style="margin-top: 20px; font-size: 12px; color: #94a3b8;">Sent from VEREX website appointment form</p>
      </div>
    </div>
  `;
}

function buildQuickQuoteEmail(data: QuickQuoteData): string {
  const productList = data.products?.length
    ? data.products.map((p) => `<li style="padding: 4px 0;">${p}</li>`).join("")
    : "<li>None selected</li>";
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #0369a1, #0ea5e9); padding: 24px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 22px;">⚡ Quick Quote Request</h1>
      </div>
      <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #64748b; width: 140px;">Name</td><td style="padding: 8px 0; font-weight: 600;">${data.name}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Email</td><td style="padding: 8px 0;"><a href="mailto:${data.email}" style="color: #2563eb;">${data.email}</a></td></tr>
          ${data.phone ? `<tr><td style="padding: 8px 0; color: #64748b;">Phone</td><td style="padding: 8px 0;"><a href="tel:${data.phone}" style="color: #2563eb;">${data.phone}</a></td></tr>` : ""}
          ${data.city ? `<tr><td style="padding: 8px 0; color: #64748b;">City</td><td style="padding: 8px 0;">${data.city}</td></tr>` : ""}
          ${data.postalCode ? `<tr><td style="padding: 8px 0; color: #64748b;">Postal Code</td><td style="padding: 8px 0;">${data.postalCode}</td></tr>` : ""}
          ${data.quantity ? `<tr><td style="padding: 8px 0; color: #64748b;">Quantity</td><td style="padding: 8px 0;">${data.quantity} units</td></tr>` : ""}
        </table>
        <div style="margin-top: 16px; padding: 16px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
          <p style="margin: 0 0 8px; color: #64748b; font-size: 13px; font-weight: 600;">Products Interested In:</p>
          <ul style="margin: 0; padding-left: 20px;">${productList}</ul>
        </div>
        <p style="margin-top: 20px; font-size: 12px; color: #94a3b8;">Sent from VEREX website homepage quick quote</p>
      </div>
    </div>
  `;
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

    const { error } = await resend.emails.send({
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
