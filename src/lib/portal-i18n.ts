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
  // ── Navigation / Layout ──
  nav: {
    dashboard: string; leads: string; projects: string; appointments: string
    measurements: string; estimates: string; contracts: string; orders: string
    messages: string; invoices: string; commissions: string; analytics: string
    timeline: string; settings: string; signOut: string
    // Groups
    overview: string; crm: string; operations: string; communication: string
    financialDocs: string; insights: string
    // Topbar
    notifications: string; noNotifications: string; profileSettings: string
    // Roles
    roles: { admin: string; client: string; contractor: string; supplier: string; partner: string; inspector: string }
  }
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
    signaturesTitle: string; acceptanceSignatures: string; signatureDisclaimer: string
    clientSig: string; repSig: string; clickToSign: string
    overrideGlobalRate: string; customInstallPrice: string
    exportPdf: string; sendEstimate: string; send: string; pdfPreview: string
    resetAll: string; undo: string; redo: string
    items: string; units: string; unit: string; exteriorView: string; exteriorDoor: string
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
    // ── Sidebar ──
    history: string; templates: string; saving: string; saved: string
    searchEstimates: string; searchTemplates: string
    noEstimatesYet: string; noTemplatesYet: string; noTemplatesDesc: string; noMatches: string
    templateName: string; apply: string; untitled: string; noClient: string; new_: string
    deleteEstimateConfirm: string; deleteTemplateConfirm: string; applyTemplateConfirm: string
    estimatesSaved: string; templatesSaved: string
    justNow: string; yesterday: string
    // ── Settings panel ──
    settingsTitle: string; headerSection: string; windowCardSection: string; doorCardSection: string
    pricingSection: string; measureSection: string; paymentSection: string; termsSection: string
    resetAllSettings: string
    // ── Misc page ──
    noEmail: string; resetConfirm: string; specialInstructions: string
    clientFields: string; shippingFields: string; documentStyle: string; accentColor: string
    fontSize: string; layout_: string; printPdf: string; paper: string; margins: string
    diagram: string; windowTypes: string; doorTypes: string; products: string
    customWindowTypes: string; customDoorTypes: string; customProducts: string
    exteriorColors: string; interiorColors: string; calculatedPriceLabel: string
    measUnit: string; showCalcPrice: string; colorsNote: string
    dimUnit: string; trimPricing: string; trimRateUnit: string
    flatTrimRate: string; colonialTrimRate: string
    showSection: string; sectionTitle: string; signatures: string; signatureDate: string
    defaultClauses: string; addPaymentStage: string; newPaymentStage: string
    paymentStagesDesc: string; ofTotal: string; remainder_: string; usesDepositPct: string
    moduleLabels: string; egressBadge: string; dimensions: string; exteriorLabel: string
    doubleTemperedRate: string; tripleTemperedRate: string
    name_: string; address_: string; city_: string; phone_: string; email_: string
    shipMethod: string; shipAddress: string; shipPhone: string
    company: string; to: string; subject: string
    // ── Glass Specifications ──
    glassSpecs: string; thermal: string; lowELabel: string; glassLabel: string
    argonLabel: string; typeLabel: string; finishLabel: string; screenLabel: string
    notIncluded: string
    // ── SVG labels ──
    inLabel: string; outLabel: string
    // ── Configurator ──
    customLayout: string; addPanel: string; removePanel: string; customizeLayout: string
    panelCount: string; panelsCount: string
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
  // ── Navigation / Layout ──
  nav: {
    dashboard: "Dashboard", leads: "Leads", projects: "Projects", appointments: "Appointments",
    measurements: "Measurements", estimates: "Estimates", contracts: "Contracts", orders: "Orders",
    messages: "Messages", invoices: "Invoices", commissions: "Commissions", analytics: "Analytics",
    timeline: "Timeline", settings: "Settings", signOut: "Sign Out",
    overview: "Overview", crm: "CRM", operations: "Operations", communication: "Communication",
    financialDocs: "Financial Documents", insights: "Insights",
    notifications: "Notifications", noNotifications: "No notifications", profileSettings: "Profile Settings",
    roles: { admin: "Admin / Sales", client: "Client", contractor: "Contractor", supplier: "Supplier", partner: "Partner", inspector: "Inspector" },
  },
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
    acceptanceSignatures: "Acceptance & Signatures",
    signatureDisclaimer: "By signing below, the client accepts the terms, specifications, and pricing outlined in this estimate.",
    clientSig: "Client Signature & Date", repSig: "Representative Signature & Date", clickToSign: "Click to sign",
    overrideGlobalRate: "Override global rate", customInstallPrice: "Custom install price",
    exportPdf: "Export PDF", sendEstimate: "Send Estimate", send: "Send", pdfPreview: "PDF Preview",
    resetAll: "Reset", undo: "Undo", redo: "Redo",
    items: "Items", units: "Units", unit: "Unit", exteriorView: "Exterior View", exteriorDoor: "Exterior — Door",
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
    // ── Sidebar ──
    history: "History", templates: "Templates", saving: "Saving…", saved: "Saved",
    searchEstimates: "Search estimates…", searchTemplates: "Search templates…",
    noEstimatesYet: "No estimates yet", noTemplatesYet: "No templates saved yet",
    noTemplatesDesc: "Save your estimate settings as a reusable template",
    noMatches: "No matches", templateName: "Template name…",
    apply: "Apply", untitled: "Untitled", noClient: "No client", new_: "New",
    deleteEstimateConfirm: "Delete this estimate?", deleteTemplateConfirm: "Delete this template?",
    applyTemplateConfirm: "Apply this template? Your current header, client & pricing info will be replaced. Window/door items stay unchanged.",
    estimatesSaved: "estimate(s) saved", templatesSaved: "template(s) saved",
    justNow: "Just now", yesterday: "Yesterday",
    // ── Settings panel ──
    settingsTitle: "Estimate Settings", headerSection: "Estimate Header",
    windowCardSection: "Window Card", doorCardSection: "Door Card",
    pricingSection: "Pricing Summary", measureSection: "Measurements & Trim",
    paymentSection: "Payment Stages", termsSection: "Terms & Conditions",
    resetAllSettings: "Reset All",
    // ── Misc page ──
    noEmail: "no email", resetConfirm: "Reset all data?", specialInstructions: "Special instructions…",
    clientFields: "Client Fields", shippingFields: "Shipping Fields",
    documentStyle: "Document Style", accentColor: "Accent Color",
    fontSize: "Font Size", layout_: "Layout", printPdf: "Print / PDF",
    paper: "Paper", margins: "Margins",
    diagram: "Diagram", windowTypes: "Window Types", doorTypes: "Door Types", products: "Products",
    customWindowTypes: "Custom Window Types", customDoorTypes: "Custom Door Types", customProducts: "Custom Products",
    exteriorColors: "Exterior Colors", interiorColors: "Interior Colors",
    calculatedPriceLabel: "Calculated Price", measUnit: "Measurement Unit",
    showCalcPrice: "Show Calculated Price",
    colorsNote: "Door colors share the same Exterior/Interior presets as windows. Edit them in the Window Card section above.",
    dimUnit: "Dimension Unit", trimPricing: "Trim Pricing", trimRateUnit: "Trim Rate Unit",
    flatTrimRate: "Flat Trim Rate", colonialTrimRate: "Colonial Trim Rate",
    showSection: "Show T&C Section", sectionTitle: "Section Title",
    signatures: "Signatures", signatureDate: "Signature Date",
    defaultClauses: "Default Clauses (for new estimates)",
    addPaymentStage: "+ Add Payment Stage", newPaymentStage: "New Payment Stage",
    paymentStagesDesc: "Configure the payment breakdown shown below the total. Stages with 0% auto-fill the remainder.",
    ofTotal: "% of total", remainder_: "(remainder)", usesDepositPct: "Uses deposit % set on each estimate",
    moduleLabels: "Module Labels", egressBadge: "Egress Badge",
    dimensions: "Dimensions", exteriorLabel: "Exterior Label",
    doubleTemperedRate: "Double Tempered Glass Rate", tripleTemperedRate: "Triple Tempered Glass Rate",
    name_: "Name", address_: "Address", city_: "City", phone_: "Phone", email_: "Email",
    shipMethod: "Ship Method", shipAddress: "Ship Address", shipPhone: "Ship Phone",
    company: "Company", to: "To", subject: "Subject",
    // ── Glass Specifications ──
    glassSpecs: "Glass Specifications", thermal: "Thermal", lowELabel: "Low-E", glassLabel: "Glass",
    argonLabel: "Argon", typeLabel: "Type", finishLabel: "Finish", screenLabel: "Screen",
    notIncluded: "Not Included",
    // ── SVG labels ──
    inLabel: "IN", outLabel: "OUT",
    // ── Configurator ──
    customLayout: "Custom Layout", addPanel: "+ Panel", removePanel: "Remove Panel",
    customizeLayout: "Customize Layout", panelCount: "panel", panelsCount: "panels",
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
  // ── Navigation / Layout ──
  nav: {
    dashboard: "Tableau de bord", leads: "Prospects", projects: "Projets", appointments: "Rendez-vous",
    measurements: "Mesures", estimates: "Soumissions", contracts: "Contrats", orders: "Commandes",
    messages: "Messages", invoices: "Factures", commissions: "Commissions", analytics: "Analytiques",
    timeline: "Chronologie", settings: "Paramètres", signOut: "Déconnexion",
    overview: "Aperçu", crm: "CRM", operations: "Opérations", communication: "Communication",
    financialDocs: "Documents financiers", insights: "Perspectives",
    notifications: "Notifications", noNotifications: "Aucune notification", profileSettings: "Paramètres du profil",
    roles: { admin: "Admin / Ventes", client: "Client", contractor: "Entrepreneur", supplier: "Fournisseur", partner: "Partenaire", inspector: "Inspecteur" },
  },
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
    acceptanceSignatures: "Acceptation et signatures",
    signatureDisclaimer: "En signant ci-dessous, le client accepte les conditions, spécifications et tarifs décrits dans cette soumission.",
    clientSig: "Signature du client et date", repSig: "Signature du représentant et date", clickToSign: "Cliquez pour signer",
    overrideGlobalRate: "Remplacer le taux global", customInstallPrice: "Prix d'installation personnalisé",
    exportPdf: "Exporter PDF", sendEstimate: "Envoyer la soumission", send: "Envoyer", pdfPreview: "Aperçu PDF",
    resetAll: "Réinitialiser", undo: "Annuler", redo: "Rétablir",
    items: "Articles", units: "Unités", unit: "Unité", exteriorView: "Vue extérieure", exteriorDoor: "Extérieur — Porte",
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
    // ── Sidebar ──
    history: "Historique", templates: "Modèles", saving: "Sauvegarde…", saved: "Sauvegardé",
    searchEstimates: "Rechercher des soumissions…", searchTemplates: "Rechercher des modèles…",
    noEstimatesYet: "Aucune soumission", noTemplatesYet: "Aucun modèle sauvegardé",
    noTemplatesDesc: "Sauvegardez vos paramètres comme modèle réutilisable",
    noMatches: "Aucun résultat", templateName: "Nom du modèle…",
    apply: "Appliquer", untitled: "Sans titre", noClient: "Aucun client", new_: "Nouveau",
    deleteEstimateConfirm: "Supprimer cette soumission ?", deleteTemplateConfirm: "Supprimer ce modèle ?",
    applyTemplateConfirm: "Appliquer ce modèle ? Vos informations d'en-tête, client et tarification seront remplacées. Les articles de fenêtres/portes restent inchangés.",
    estimatesSaved: "soumission(s) sauvegardée(s)", templatesSaved: "modèle(s) sauvegardé(s)",
    justNow: "À l'instant", yesterday: "Hier",
    // ── Settings panel ──
    settingsTitle: "Paramètres de soumission", headerSection: "En-tête de soumission",
    windowCardSection: "Carte de fenêtre", doorCardSection: "Carte de porte",
    pricingSection: "Résumé tarifaire", measureSection: "Mesures et moulures",
    paymentSection: "Étapes de paiement", termsSection: "Conditions générales",
    resetAllSettings: "Tout réinitialiser",
    // ── Misc page ──
    noEmail: "sans courriel", resetConfirm: "Réinitialiser toutes les données ?", specialInstructions: "Instructions spéciales…",
    clientFields: "Champs client", shippingFields: "Champs d'expédition",
    documentStyle: "Style du document", accentColor: "Couleur d'accent",
    fontSize: "Taille de police", layout_: "Disposition", printPdf: "Impression / PDF",
    paper: "Papier", margins: "Marges",
    diagram: "Diagramme", windowTypes: "Types de fenêtres", doorTypes: "Types de portes", products: "Produits",
    customWindowTypes: "Types de fenêtres personnalisés", customDoorTypes: "Types de portes personnalisés", customProducts: "Produits personnalisés",
    exteriorColors: "Couleurs extérieures", interiorColors: "Couleurs intérieures",
    calculatedPriceLabel: "Prix calculé", measUnit: "Unité de mesure",
    showCalcPrice: "Afficher le prix calculé",
    colorsNote: "Les couleurs de porte partagent les mêmes préréglages extérieur/intérieur que les fenêtres. Modifiez-les dans la section Carte de fenêtre ci-dessus.",
    dimUnit: "Unité de dimension", trimPricing: "Tarification des moulures", trimRateUnit: "Unité de taux de moulure",
    flatTrimRate: "Taux moulure plate", colonialTrimRate: "Taux moulure coloniale",
    showSection: "Afficher la section C.G.", sectionTitle: "Titre de section",
    signatures: "Signatures", signatureDate: "Date de signature",
    defaultClauses: "Clauses par défaut (pour nouvelles soumissions)",
    addPaymentStage: "+ Ajouter une étape", newPaymentStage: "Nouvelle étape de paiement",
    paymentStagesDesc: "Configurez la répartition des paiements affichée sous le total. Les étapes à 0 % remplissent automatiquement le solde.",
    ofTotal: "% du total", remainder_: "(restant)", usesDepositPct: "Utilise le % de dépôt défini sur chaque soumission",
    moduleLabels: "Étiquettes de modules", egressBadge: "Badge de sortie",
    dimensions: "Dimensions", exteriorLabel: "Étiquette extérieure",
    doubleTemperedRate: "Taux verre double trempé", tripleTemperedRate: "Taux verre triple trempé",
    name_: "Nom", address_: "Adresse", city_: "Ville", phone_: "Téléphone", email_: "Courriel",
    shipMethod: "Mode d'expédition", shipAddress: "Adresse d'expédition", shipPhone: "Téléphone d'expédition",
    company: "Entreprise", to: "À", subject: "Objet",
    // ── Glass Specifications ──
    glassSpecs: "Spécifications du verre", thermal: "Thermique", lowELabel: "Low-E", glassLabel: "Verre",
    argonLabel: "Argon", typeLabel: "Type", finishLabel: "Fini", screenLabel: "Moustiquaire",
    notIncluded: "Non inclus",
    // ── SVG labels ──
    inLabel: "INT", outLabel: "EXT",
    // ── Configurator ──
    customLayout: "Configuration personnalisée", addPanel: "+ Panneau", removePanel: "Retirer le panneau",
    customizeLayout: "Personnaliser", panelCount: "panneau", panelsCount: "panneaux",
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
