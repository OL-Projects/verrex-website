"use client"

import { useLocale } from "next-intl"

/* ═══════════════════════════════════════════════
   Portal i18n — EN / FR translation dictionary
   Used by: Estimates, Contracts, Invoices + PDFs
   ═══════════════════════════════════════════════ */

export type PortalLocale = "en" | "fr"

export interface PortalT {
  // ── Common ──
  page: string; of: string; date: string; validUntil: string; requiredBy: string
  rep: string; reference: string; phone: string; email: string; address: string; city: string; website: string
  client: string; notes: string; qty: string; unitPrice: string; total: string; subtotal: string
  save: string; cancel: string; delete_: string; edit: string; create: string; duplicate: string
  search: string; filter: string; reset: string; close: string; send: string; download: string
  export_: string; preview: string; settings: string; addRoom: string; addWindow: string; addDoor: string
  remove: string; attach: string; clear: string; back: string; actions: string; status: string
  all: string; none: string; yes: string; no: string; ok: string; loading: string
  // ── Estimates ──
  est: {
    title: string; subtitle: string; estimateNum: string; creator: string
    soldTo: string; shipTo: string; pickup: string; delivery: string; representative: string
    roomName: string; addItem: string; window: string; door: string
    windowType: string; doorType: string; width: string; height: string; thickness: string; depth: string
    product: string; exterior: string; interior: string; customLabel: string
    hinge: string; swing: string; left: string; right: string; inSwing: string; outSwing: string
    open: string; perimeter: string
    egressCompliant: string; egressNonCompliant: string; egress: string
    trim: string; trimStyle: string; flat: string; colonial: string; trimOverride: string; trimCost: string
    installation: string; installOverride: string; installGlobalRate: string
    attachments: string; calculatedPrice: string
    productsSubtotal: string; installationUnits: string; deliveryLabel: string
    trimTotal: string; subtotalBeforeTax: string
    gst: string; qst: string; tps: string; tvq: string
    depositRequired: string; balanceRemaining: string; remainder: string
    termsTitle: string; addClause: string
    signaturesTitle: string; clientSig: string; repSig: string; clickToSign: string
    exportPdf: string; sendEstimate: string; pdfPreview: string
    resetAll: string; undo: string; redo: string
    items: string; units: string; exteriorView: string; exteriorDoor: string
    item: string; std: string
    pdfDownloaded: string; generatingPdf: string; attachPdf: string
    emailSubject: string; emailGreeting: string; emailIntro: string
    emailSummary: string; emailItems: string; emailPricing: string
    emailBeforeTax: string; emailTotal: string; emailDeposit: string
    emailAttached: string; emailQuestions: string; emailRegards: string
    copyEmailText: string; openEmailClient: string
    saveTemplate: string; loadTemplate: string
    newEstimate: string
    lightMode: string; darkMode: string
  }
  // ── Contracts ──
  ctr: {
    title: string; subtitle: string; contractNum: string
    parties: string; provider: string; clientLabel: string
    scope: string; description: string; lineItems: string
    paymentSchedule: string; milestone: string; amount: string; dueDate: string
    totalValue: string; paidAmount: string; balance: string
    termsTitle: string
    signaturesTitle: string; providerSig: string; clientSig: string
    status: { draft: string; sent: string; signed: string; active: string; completed: string; void_: string }
    newContract: string; viewContract: string; editContract: string
    confidential: string; pageFooter: string
  }
  // ── Invoices ──
  inv: {
    title: string; subtitle: string; invoiceNum: string
    billTo: string; issuedDate: string; dueDate: string; paymentTerms: string
    lineItems: string; description: string; quantity: string; rate: string; amount: string
    subtotal: string; tax: string; total: string; amountPaid: string; balanceDue: string
    status: { draft: string; sent: string; paid: string; overdue: string; void_: string }
    newInvoice: string; viewInvoice: string; editInvoice: string
    paymentInstructions: string; thankYou: string; pageFooter: string
    net15: string; net30: string; net60: string; dueOnReceipt: string
  }
}

const en: PortalT = {
  // ── Common ──
  page: "Page", of: "of", date: "Date", validUntil: "Valid Until", requiredBy: "Required By",
  rep: "Rep", reference: "Reference", phone: "Phone", email: "Email", address: "Address", city: "City", website: "Website",
  client: "Client", notes: "Notes", qty: "Qty", unitPrice: "Unit Price", total: "Total", subtotal: "Subtotal",
  save: "Save", cancel: "Cancel", delete_: "Delete", edit: "Edit", create: "Create", duplicate: "Duplicate",
  search: "Search", filter: "Filter", reset: "Reset", close: "Close", send: "Send", download: "Download",
  export_: "Export PDF", preview: "Preview", settings: "Settings", addRoom: "Add Room", addWindow: "Add Window", addDoor: "Add Door",
  remove: "Remove", attach: "Attach", clear: "Clear", back: "Back", actions: "Actions", status: "Status",
  all: "All", none: "None", yes: "Yes", no: "No", ok: "OK", loading: "Loading…",
  // ── Estimates ──
  est: {
    title: "Estimate Creator", subtitle: "Professional window & door estimates with live diagrams",
    estimateNum: "Estimate #", creator: "Estimate Creator",
    soldTo: "SOLD TO", shipTo: "SHIP TO", pickup: "PICKUP", delivery: "DELIVERY", representative: "Representative",
    roomName: "NEW ROOM", addItem: "+ Add Item",
    window: "Window", door: "Door",
    windowType: "Window Type", doorType: "Door Type",
    width: "Width", height: "Height", thickness: "Thickness", depth: "Depth",
    product: "Product", exterior: "Exterior", interior: "Interior", customLabel: "Custom Label",
    hinge: "Hinge", swing: "Swing", left: "Left", right: "Right", inSwing: "In", outSwing: "Out",
    open: "Open", perimeter: "Perimeter",
    egressCompliant: "Compliant ✓", egressNonCompliant: "Non-compliant", egress: "EGRESS",
    trim: "Trim", trimStyle: "Style", flat: "Flat", colonial: "Colonial", trimOverride: "Override $", trimCost: "Trim Cost",
    installation: "Installation", installOverride: "Override global rate", installGlobalRate: "/unit",
    attachments: "Attachments", calculatedPrice: "Calculated Price",
    productsSubtotal: "Products Subtotal", installationUnits: "Installation", deliveryLabel: "Delivery",
    trimTotal: "Trim Total", subtotalBeforeTax: "Subtotal Before Tax",
    gst: "GST", qst: "QST", tps: "TPS / GST", tvq: "TVQ / QST",
    depositRequired: "Deposit Required", balanceRemaining: "Balance Remaining", remainder: "remainder",
    termsTitle: "Terms & Conditions", addClause: "+ Add clause",
    signaturesTitle: "Acceptance & Signatures",
    clientSig: "Client Signature & Date", repSig: "Representative Signature & Date", clickToSign: "Click to sign",
    exportPdf: "Export PDF", sendEstimate: "Send Estimate", pdfPreview: "PDF Preview",
    resetAll: "Reset", undo: "Undo", redo: "Redo",
    items: "Items", units: "Units", exteriorView: "Exterior View", exteriorDoor: "Exterior — Door",
    item: "Item", std: "STD",
    pdfDownloaded: "PDF downloaded — please attach it to your outgoing email",
    generatingPdf: "Generating and downloading PDF…",
    attachPdf: "The detailed PDF estimate with diagrams is attached.",
    emailSubject: "Estimate", emailGreeting: "Dear", emailIntro: "Thank you for your interest. Please find your estimate details below.",
    emailSummary: "ESTIMATE SUMMARY", emailItems: "ITEMS", emailPricing: "PRICING",
    emailBeforeTax: "Before Tax", emailTotal: "TOTAL", emailDeposit: "Deposit",
    emailAttached: "📎 The detailed PDF estimate with diagrams is attached.",
    emailQuestions: "If you have any questions, please don't hesitate to reach out.",
    emailRegards: "Best regards,",
    copyEmailText: "Copy Email Text", openEmailClient: "Open Email Client",
    saveTemplate: "Save as Template", loadTemplate: "Load Template",
    newEstimate: "New Estimate",
    lightMode: "Light Mode", darkMode: "Dark Mode",
  },
  // ── Contracts ──
  ctr: {
    title: "Contracts", subtitle: "Manage your contracts",
    contractNum: "Contract #",
    parties: "Parties", provider: "Provider / Contractor", clientLabel: "Client / Customer",
    scope: "Scope of Work", description: "Description", lineItems: "Line Items",
    paymentSchedule: "Payment Schedule", milestone: "Milestone", amount: "Amount", dueDate: "Due Date",
    totalValue: "Total Value", paidAmount: "Amount Paid", balance: "Balance Remaining",
    termsTitle: "Terms & Conditions",
    signaturesTitle: "Signatures", providerSig: "Provider Signature", clientSig: "Client Signature",
    status: { draft: "Draft", sent: "Sent", signed: "Signed", active: "Active", completed: "Completed", void_: "Void" },
    newContract: "New Contract", viewContract: "View Contract", editContract: "Edit Contract",
    confidential: "CONFIDENTIAL", pageFooter: "This contract is legally binding upon signature by both parties.",
  },
  // ── Invoices ──
  inv: {
    title: "Invoices", subtitle: "Manage your invoices",
    invoiceNum: "Invoice #",
    billTo: "Bill To", issuedDate: "Issued", dueDate: "Due Date", paymentTerms: "Payment Terms",
    lineItems: "Line Items", description: "Description", quantity: "Qty", rate: "Rate", amount: "Amount",
    subtotal: "Subtotal", tax: "Tax", total: "Total", amountPaid: "Amount Paid", balanceDue: "Balance Due",
    status: { draft: "Draft", sent: "Sent", paid: "Paid", overdue: "Overdue", void_: "Void" },
    newInvoice: "New Invoice", viewInvoice: "View Invoice", editInvoice: "Edit Invoice",
    paymentInstructions: "Payment Instructions",
    thankYou: "Thank you for your business!",
    pageFooter: "Payment is due upon receipt unless otherwise stated.",
    net15: "Net 15", net30: "Net 30", net60: "Net 60", dueOnReceipt: "Due on Receipt",
  },
}

const fr: PortalT = {
  // ── Common ──
  page: "Page", of: "de", date: "Date", validUntil: "Valide jusqu'au", requiredBy: "Requis avant le",
  rep: "Représentant", reference: "Référence", phone: "Téléphone", email: "Courriel", address: "Adresse", city: "Ville", website: "Site web",
  client: "Client", notes: "Notes", qty: "Qté", unitPrice: "Prix unitaire", total: "Total", subtotal: "Sous-total",
  save: "Sauvegarder", cancel: "Annuler", delete_: "Supprimer", edit: "Modifier", create: "Créer", duplicate: "Dupliquer",
  search: "Rechercher", filter: "Filtrer", reset: "Réinitialiser", close: "Fermer", send: "Envoyer", download: "Télécharger",
  export_: "Exporter PDF", preview: "Aperçu", settings: "Paramètres", addRoom: "Ajouter une pièce", addWindow: "Ajouter fenêtre", addDoor: "Ajouter porte",
  remove: "Retirer", attach: "Joindre", clear: "Effacer", back: "Retour", actions: "Actions", status: "Statut",
  all: "Tous", none: "Aucun", yes: "Oui", no: "Non", ok: "OK", loading: "Chargement…",
  // ── Estimates ──
  est: {
    title: "Créateur de soumission", subtitle: "Soumissions professionnelles de fenêtres et portes avec diagrammes",
    estimateNum: "Soumission #", creator: "Créateur de soumission",
    soldTo: "VENDU À", shipTo: "LIVRÉ À", pickup: "RAMASSAGE", delivery: "LIVRAISON", representative: "Représentant",
    roomName: "NOUVELLE PIÈCE", addItem: "+ Ajouter un article",
    window: "Fenêtre", door: "Porte",
    windowType: "Type de fenêtre", doorType: "Type de porte",
    width: "Largeur", height: "Hauteur", thickness: "Épaisseur", depth: "Profondeur",
    product: "Produit", exterior: "Extérieur", interior: "Intérieur", customLabel: "Étiquette",
    hinge: "Charnière", swing: "Ouverture", left: "Gauche", right: "Droite", inSwing: "Intérieur", outSwing: "Extérieur",
    open: "Ouverture", perimeter: "Périmètre",
    egressCompliant: "Conforme ✓", egressNonCompliant: "Non conforme", egress: "SORTIE",
    trim: "Moulure", trimStyle: "Style", flat: "Plat", colonial: "Colonial", trimOverride: "Remplacer $", trimCost: "Coût moulure",
    installation: "Installation", installOverride: "Remplacer le taux global", installGlobalRate: "/unité",
    attachments: "Pièces jointes", calculatedPrice: "Prix calculé",
    productsSubtotal: "Sous-total produits", installationUnits: "Installation", deliveryLabel: "Livraison",
    trimTotal: "Total moulures", subtotalBeforeTax: "Sous-total avant taxes",
    gst: "TPS", qst: "TVQ", tps: "TPS", tvq: "TVQ",
    depositRequired: "Dépôt requis", balanceRemaining: "Solde restant", remainder: "restant",
    termsTitle: "Conditions générales", addClause: "+ Ajouter une clause",
    signaturesTitle: "Acceptation et signatures",
    clientSig: "Signature du client et date", repSig: "Signature du représentant et date", clickToSign: "Cliquez pour signer",
    exportPdf: "Exporter PDF", sendEstimate: "Envoyer la soumission", pdfPreview: "Aperçu PDF",
    resetAll: "Réinitialiser", undo: "Annuler", redo: "Rétablir",
    items: "Articles", units: "Unités", exteriorView: "Vue extérieure", exteriorDoor: "Extérieur — Porte",
    item: "Article", std: "STD",
    pdfDownloaded: "PDF téléchargé — veuillez le joindre à votre courriel",
    generatingPdf: "Génération et téléchargement du PDF…",
    attachPdf: "La soumission détaillée en PDF avec diagrammes est jointe.",
    emailSubject: "Soumission", emailGreeting: "Bonjour", emailIntro: "Merci de votre intérêt. Veuillez trouver ci-dessous les détails de votre soumission.",
    emailSummary: "RÉSUMÉ DE LA SOUMISSION", emailItems: "ARTICLES", emailPricing: "TARIFICATION",
    emailBeforeTax: "Avant taxes", emailTotal: "TOTAL", emailDeposit: "Dépôt",
    emailAttached: "📎 La soumission détaillée en PDF avec diagrammes est jointe.",
    emailQuestions: "Si vous avez des questions, n'hésitez pas à nous contacter.",
    emailRegards: "Cordialement,",
    copyEmailText: "Copier le texte du courriel", openEmailClient: "Ouvrir le client de courriel",
    saveTemplate: "Sauvegarder comme modèle", loadTemplate: "Charger un modèle",
    newEstimate: "Nouvelle soumission",
    lightMode: "Mode clair", darkMode: "Mode sombre",
  },
  // ── Contracts ──
  ctr: {
    title: "Contrats", subtitle: "Gérer vos contrats",
    contractNum: "Contrat #",
    parties: "Parties", provider: "Fournisseur / Entrepreneur", clientLabel: "Client / Acheteur",
    scope: "Portée des travaux", description: "Description", lineItems: "Postes",
    paymentSchedule: "Calendrier de paiement", milestone: "Étape", amount: "Montant", dueDate: "Date d'échéance",
    totalValue: "Valeur totale", paidAmount: "Montant payé", balance: "Solde restant",
    termsTitle: "Conditions générales",
    signaturesTitle: "Signatures", providerSig: "Signature du fournisseur", clientSig: "Signature du client",
    status: { draft: "Brouillon", sent: "Envoyé", signed: "Signé", active: "Actif", completed: "Terminé", void_: "Nul" },
    newContract: "Nouveau contrat", viewContract: "Voir le contrat", editContract: "Modifier le contrat",
    confidential: "CONFIDENTIEL", pageFooter: "Ce contrat est juridiquement contraignant dès sa signature par les deux parties.",
  },
  // ── Invoices ──
  inv: {
    title: "Factures", subtitle: "Gérer vos factures",
    invoiceNum: "Facture #",
    billTo: "Facturer à", issuedDate: "Émise le", dueDate: "Date d'échéance", paymentTerms: "Modalités de paiement",
    lineItems: "Postes", description: "Description", quantity: "Qté", rate: "Tarif", amount: "Montant",
    subtotal: "Sous-total", tax: "Taxes", total: "Total", amountPaid: "Montant payé", balanceDue: "Solde dû",
    status: { draft: "Brouillon", sent: "Envoyée", paid: "Payée", overdue: "En retard", void_: "Nulle" },
    newInvoice: "Nouvelle facture", viewInvoice: "Voir la facture", editInvoice: "Modifier la facture",
    paymentInstructions: "Instructions de paiement",
    thankYou: "Merci pour votre confiance !",
    pageFooter: "Le paiement est exigible à la réception, sauf indication contraire.",
    net15: "Net 15", net30: "Net 30", net60: "Net 60", dueOnReceipt: "Payable à la réception",
  },
}

const translations: Record<string, PortalT> = { en, fr }

/** Hook — returns portal translations for current locale */
export function usePortalT(): PortalT {
  const locale = useLocale()
  return translations[locale] ?? translations.en
}

/** Direct getter — for PDF documents (no hooks, pass locale explicitly) */
export function getPortalT(locale: string): PortalT {
  return translations[locale] ?? translations.en
}
