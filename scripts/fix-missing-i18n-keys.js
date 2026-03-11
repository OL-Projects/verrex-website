const fs = require('fs');
const path = require('path');
const enPath = path.join(__dirname, '..', 'messages', 'en.json');
const frPath = path.join(__dirname, '..', 'messages', 'fr.json');
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const fr = JSON.parse(fs.readFileSync(frPath, 'utf8'));

function merge(target, source) {
  for (const key in source) {
    if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      merge(target[key], source[key]);
    } else if (target[key] === undefined) {
      target[key] = source[key];
    }
  }
}

// ─── NAVIGATION ──────────────────────────────────
merge(en, { Navigation: { portal: "Portal", portalLogin: "Portal Login" } });
merge(fr, { Navigation: { portal: "Portail", portalLogin: "Connexion Portail" } });

// ─── COMMON ──────────────────────────────────────
merge(en, { Common: { addPhotos: "Add Photos", attachFiles: "Attach Files", dragDropFiles: "Drag & drop files here, or use the buttons above", removeAll: "Remove all" } });
merge(fr, { Common: { addPhotos: "Ajouter des photos", attachFiles: "Joindre des fichiers", dragDropFiles: "Glissez-déposez des fichiers ici, ou utilisez les boutons ci-dessus", removeAll: "Tout supprimer" } });

// ─── HOMEPAGE ────────────────────────────────────
merge(en, { HomePage: {
  productCasement: "Casement Windows", productSliding: "Sliding Doors", productDoubleHung: "Double Hung",
  productStorefront: "Storefront", productCurtainWall: "Curtain Wall", productEntryDoors: "Entry Doors",
  toastQuoteSentTitle: "Quote Request Sent!", toastQuoteSentDesc: "We'll get back to you with an estimate.",
  toastQuoteFailTitle: "Failed to Send", toastQuoteFailDesc: "Please try again or call us.",
} });
merge(fr, { HomePage: {
  productCasement: "Fenêtres à battant", productSliding: "Portes coulissantes", productDoubleHung: "Fenêtres à guillotine",
  productStorefront: "Devanture", productCurtainWall: "Mur-rideau", productEntryDoors: "Portes d'entrée",
  toastQuoteSentTitle: "Demande de soumission envoyée !", toastQuoteSentDesc: "Nous vous répondrons avec une estimation.",
  toastQuoteFailTitle: "Échec de l'envoi", toastQuoteFailDesc: "Veuillez réessayer ou nous appeler.",
} });

// ─── CONTACT PAGE ────────────────────────────────
merge(en, { ContactPage: {
  reachUsDesc: "Reach us by phone, email, or visit our office. We're here to help with all your window and door needs.",
  sendMessage: "Send Us a Message",
  selectSubject: "Select a subject",
  subjectGeneral: "General Inquiry", subjectQuote: "Quote Request", subjectService: "Service Request",
  subjectSupport: "Technical Support", subjectOther: "Other",
  attachments: "Attachments",
  attachmentsDesc: "Add photos of your windows or relevant documents",
  firstName: "First Name", lastName: "Last Name",
  emailLabel: "Email Address", phonePlaceholder: "Phone Number",
  yourMessage: "Your Message", messagePlaceholder: "Tell us about your project, questions, or how we can help...",
  submitMessage: "Send Message", sending: "Sending...",
  successTitle: "Message Sent Successfully!",
  successDesc: "Thank you for reaching out. We'll get back to you within 24 business hours.",
  sendAnother: "Send Another Message",
  phoneTitle: "Phone", phoneDesc: "Call us for immediate assistance",
  emailTitle: "Email", emailDesc: "Send us a detailed inquiry",
  officeTitle: "Office", officeDesc: "Visit our showroom",
  businessHours: "Business Hours",
  processTitle: "Our Process",
  processDesc: "From first contact to project completion",
  processStepTitle1: "Free Consultation", processStepDesc1: "We discuss your needs and provide expert recommendations at no cost.",
  processStepTitle2: "On-Site Measurement", processStepDesc2: "Precise measurements taken at your location for perfect fit.",
  processStepTitle3: "Custom Quote", processStepDesc3: "Detailed, itemized quote with product recommendations.",
  processStepTitle4: "Installation", processStepDesc4: "Professional installation with minimal disruption.",
} });
merge(fr, { ContactPage: {
  reachUsDesc: "Contactez-nous par téléphone, courriel ou visitez notre bureau. Nous sommes là pour répondre à tous vos besoins en fenêtres et portes.",
  sendMessage: "Envoyez-nous un message",
  selectSubject: "Sélectionnez un sujet",
  subjectGeneral: "Demande générale", subjectQuote: "Demande de soumission", subjectService: "Demande de service",
  subjectSupport: "Support technique", subjectOther: "Autre",
  attachments: "Pièces jointes",
  attachmentsDesc: "Ajoutez des photos de vos fenêtres ou documents pertinents",
  firstName: "Prénom", lastName: "Nom de famille",
  emailLabel: "Adresse courriel", phonePlaceholder: "Numéro de téléphone",
  yourMessage: "Votre message", messagePlaceholder: "Parlez-nous de votre projet, vos questions ou comment nous pouvons vous aider...",
  submitMessage: "Envoyer le message", sending: "Envoi en cours...",
  successTitle: "Message envoyé avec succès !",
  successDesc: "Merci de nous avoir contactés. Nous vous répondrons dans les 24 heures ouvrables.",
  sendAnother: "Envoyer un autre message",
  phoneTitle: "Téléphone", phoneDesc: "Appelez-nous pour une assistance immédiate",
  emailTitle: "Courriel", emailDesc: "Envoyez-nous une demande détaillée",
  officeTitle: "Bureau", officeDesc: "Visitez notre salle d'exposition",
  businessHours: "Heures d'ouverture",
  processTitle: "Notre processus",
  processDesc: "Du premier contact à l'achèvement du projet",
  processStepTitle1: "Consultation gratuite", processStepDesc1: "Nous discutons de vos besoins et fournissons des recommandations d'experts sans frais.",
  processStepTitle2: "Mesure sur site", processStepDesc2: "Des mesures précises prises à votre emplacement pour un ajustement parfait.",
  processStepTitle3: "Soumission personnalisée", processStepDesc3: "Soumission détaillée et détaillée avec recommandations de produits.",
  processStepTitle4: "Installation", processStepDesc4: "Installation professionnelle avec un minimum de perturbation.",
} });

// ─── SERVICES PAGE ───────────────────────────────
merge(en, { ServicesPage: {
  processStep1Title: "Initial Consultation", processStep1Desc: "Free consultation to understand your needs, budget, and timeline. Available in-person or via video call.",
  processStep2Title: "On-Site Assessment", processStep2Desc: "Our certified technicians visit your location for precise measurements and site evaluation.",
  processStep3Title: "Custom Quote", processStep3Desc: "Receive a detailed, itemized quote with product recommendations and installation timeline.",
  processStep4Title: "Production & Delivery", processStep4Desc: "Your custom windows and doors are manufactured to exact specifications and delivered on schedule.",
  processStep5Title: "Professional Installation", processStep5Desc: "Our expert team installs everything to the highest standards with minimal disruption.",
  processStep6Title: "Quality Inspection", processStep6Desc: "Final walkthrough to ensure everything meets our quality standards and your expectations.",
  statProjectsCompleted: "Projects Completed", statYearsExperience: "Years of Experience",
  statOnTime: "On-Time Completion", statSatisfaction: "Satisfaction Guarantee",
  howWeWork: "How We Work", ourProcess: "Our Process",
  processDesc: "From first contact to project completion, here's how we deliver exceptional results.",
} });
merge(fr, { ServicesPage: {
  processStep1Title: "Consultation initiale", processStep1Desc: "Consultation gratuite pour comprendre vos besoins, votre budget et votre échéancier. Disponible en personne ou par appel vidéo.",
  processStep2Title: "Évaluation sur site", processStep2Desc: "Nos techniciens certifiés visitent votre emplacement pour des mesures précises et une évaluation du site.",
  processStep3Title: "Soumission personnalisée", processStep3Desc: "Recevez une soumission détaillée avec des recommandations de produits et un calendrier d'installation.",
  processStep4Title: "Production et livraison", processStep4Desc: "Vos fenêtres et portes sur mesure sont fabriquées selon des spécifications exactes et livrées dans les délais.",
  processStep5Title: "Installation professionnelle", processStep5Desc: "Notre équipe d'experts installe tout selon les normes les plus élevées avec un minimum de perturbation.",
  processStep6Title: "Inspection de qualité", processStep6Desc: "Visite finale pour s'assurer que tout répond à nos normes de qualité et à vos attentes.",
  statProjectsCompleted: "Projets réalisés", statYearsExperience: "Années d'expérience",
  statOnTime: "Livraison à temps", statSatisfaction: "Garantie de satisfaction",
  howWeWork: "Comment nous travaillons", ourProcess: "Notre processus",
  processDesc: "Du premier contact à l'achèvement du projet, voici comment nous offrons des résultats exceptionnels.",
} });

// ─── QUOTE PAGE ──────────────────────────────────
merge(en, { QuotePage: {
  step1: "Contact Info", step2: "Project Details", step3: "Additional Info", step4: "Review",
  toastSuccessTitle: "Quote Request Submitted!", toastSuccessDesc: "We'll review your details and get back to you shortly.",
  toastFailedTitle: "Submission Failed", toastFailedDesc: "Please try again or call us directly.",
  successTitle: "Quote Request Submitted!", successDesc: "Thank you! We've received your quote request. Our team will review your project details and get back to you within 24 hours.",
  quoteReference: "Quote Reference", submitAnother: "Submit Another Quote", backToHome: "Back to Home",
  contactInfo: "Please provide your contact information", projectDetails: "Tell us about your project",
  additionalInfo: "Any additional details for your quote", reviewTitle: "Review your information before submitting",
  firstName: "Full Name", email: "Email Address", phone: "Phone Number", address: "Address",
  projectType: "Project Type", typeResidential: "Residential", typeCommercial: "Commercial", typeIndustrial: "Industrial",
  projectScope: "Service Type", scopeInstallation: "Installation", scopeMeasurement: "Measurement",
  scopeInspection: "Inspection", scopeConsultation: "Consultation", scopeRepair: "Repair", scopeCustom: "Custom",
  additionalDetails: "Project Description", descriptionPlaceholder: "Describe your project requirements...",
  preferredDate: "Preferred Date", preferredTime: "Preferred Time",
  selectTime: "Select a time", timeMorning: "Morning (9AM-12PM)", timeAfternoon: "Afternoon (12PM-5PM)", timeEvening: "Evening (5PM-8PM)",
  budget: "Estimated Budget", budgetUnder1k: "Under $1,000", budget1kTo5k: "$1,000 - $5,000", budget5kTo15k: "$5,000 - $15,000", budget15kPlus: "$15,000+",
  uploadPhotos: "Upload Photos (Optional)", dragDropText: "Drag & drop photos here or click to browse", fileFormats: "JPG, PNG, HEIC up to 10MB each",
  reviewName: "Name:", reviewEmail: "Email:", reviewPhone: "Phone:", reviewAddress: "Address:",
  reviewProjectType: "Project Type:", reviewService: "Service:", reviewBudget: "Budget:", reviewPreferredDate: "Preferred Date:", reviewDescription: "Description:",
  back: "Back", next: "Next", sending: "Sending...", submitRequest: "Submit Quote Request",
  needHelp: "Need help? Call us at",
} });
merge(fr, { QuotePage: {
  step1: "Coordonnées", step2: "Détails du projet", step3: "Infos supplémentaires", step4: "Vérification",
  toastSuccessTitle: "Demande de soumission envoyée !", toastSuccessDesc: "Nous examinerons vos détails et vous répondrons rapidement.",
  toastFailedTitle: "Échec de la soumission", toastFailedDesc: "Veuillez réessayer ou nous appeler directement.",
  successTitle: "Demande de soumission envoyée !", successDesc: "Merci ! Nous avons reçu votre demande de soumission. Notre équipe examinera les détails de votre projet et vous répondra dans les 24 heures.",
  quoteReference: "Référence de soumission", submitAnother: "Soumettre une autre demande", backToHome: "Retour à l'accueil",
  contactInfo: "Veuillez fournir vos coordonnées", projectDetails: "Parlez-nous de votre projet",
  additionalInfo: "Détails supplémentaires pour votre soumission", reviewTitle: "Vérifiez vos informations avant de soumettre",
  firstName: "Nom complet", email: "Adresse courriel", phone: "Numéro de téléphone", address: "Adresse",
  projectType: "Type de projet", typeResidential: "Résidentiel", typeCommercial: "Commercial", typeIndustrial: "Industriel",
  projectScope: "Type de service", scopeInstallation: "Installation", scopeMeasurement: "Mesure",
  scopeInspection: "Inspection", scopeConsultation: "Consultation", scopeRepair: "Réparation", scopeCustom: "Sur mesure",
  additionalDetails: "Description du projet", descriptionPlaceholder: "Décrivez les exigences de votre projet...",
  preferredDate: "Date préférée", preferredTime: "Heure préférée",
  selectTime: "Sélectionnez une heure", timeMorning: "Matin (9h-12h)", timeAfternoon: "Après-midi (12h-17h)", timeEvening: "Soir (17h-20h)",
  budget: "Budget estimé", budgetUnder1k: "Moins de 1 000 $", budget1kTo5k: "1 000 $ - 5 000 $", budget5kTo15k: "5 000 $ - 15 000 $", budget15kPlus: "15 000 $ +",
  uploadPhotos: "Télécharger des photos (Optionnel)", dragDropText: "Glissez-déposez des photos ici ou cliquez pour parcourir", fileFormats: "JPG, PNG, HEIC jusqu'à 10 Mo chacun",
  reviewName: "Nom :", reviewEmail: "Courriel :", reviewPhone: "Téléphone :", reviewAddress: "Adresse :",
  reviewProjectType: "Type de projet :", reviewService: "Service :", reviewBudget: "Budget :", reviewPreferredDate: "Date préférée :", reviewDescription: "Description :",
  back: "Retour", next: "Suivant", sending: "Envoi en cours...", submitRequest: "Soumettre la demande",
  needHelp: "Besoin d'aide ? Appelez-nous au",
} });

fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + '\n', 'utf8');
fs.writeFileSync(frPath, JSON.stringify(fr, null, 2) + '\n', 'utf8');
console.log('✅ All missing i18n keys added!');
