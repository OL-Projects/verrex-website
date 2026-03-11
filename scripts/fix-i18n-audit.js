/**
 * Comprehensive i18n audit fix — adds all missing translation keys
 * for Contact, Quote, Services, Home pages + FileUpload + Header components
 */
const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, '..', 'messages', 'en.json');
const frPath = path.join(__dirname, '..', 'messages', 'fr.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const fr = JSON.parse(fs.readFileSync(frPath, 'utf8'));

// ─── CONTACT PAGE ────────────────────────────────────────
const contactEN = {
  getInTouchDesc: "Reach us by phone, email, or visit our office. We're here to help with all your window and door needs.",
  phoneLabel: "Phone",
  emailLabel: "Email",
  addressLabel: "Address",
  liveChat: "Live Chat",
  comingSoon: "Coming Soon",
  videoCall: "Video Call",
  bookOnline: "Book Online",
  selectSubject: "Select a subject",
  subjectGeneral: "General Inquiry",
  subjectQuote: "Quote Request",
  subjectInstallation: "Installation Question",
  subjectSupport: "Support",
  subjectPartnership: "Partnership",
  attachments: "Attachments",
  attachmentsDesc: "Add photos of your windows or relevant documents",
  preferredContact: "Preferred Contact Method",
  contactEmail: "Email",
  contactPhone: "Phone",
  contactEither: "Either",
  sending: "Sending...",
  toastFailedTitle: "Failed to Send",
  toastFailedDesc: "Please try again or call us directly.",
  loading: "Loading...",
};

const contactFR = {
  getInTouchDesc: "Rejoignez-nous par téléphone, courriel ou visitez notre bureau. Nous sommes là pour vous aider avec tous vos besoins en fenêtres et portes.",
  phoneLabel: "Téléphone",
  emailLabel: "Courriel",
  addressLabel: "Adresse",
  liveChat: "Clavardage",
  comingSoon: "Bientôt disponible",
  videoCall: "Appel vidéo",
  bookOnline: "Réserver en ligne",
  selectSubject: "Sélectionnez un sujet",
  subjectGeneral: "Demande générale",
  subjectQuote: "Demande de soumission",
  subjectInstallation: "Question d'installation",
  subjectSupport: "Soutien technique",
  subjectPartnership: "Partenariat",
  attachments: "Pièces jointes",
  attachmentsDesc: "Ajoutez des photos de vos fenêtres ou des documents pertinents",
  preferredContact: "Méthode de contact préférée",
  contactEmail: "Courriel",
  contactPhone: "Téléphone",
  contactEither: "Les deux",
  sending: "Envoi en cours...",
  toastFailedTitle: "Échec de l'envoi",
  toastFailedDesc: "Veuillez réessayer ou nous appeler directement.",
  loading: "Chargement...",
};

Object.assign(en.ContactPage, contactEN);
Object.assign(fr.ContactPage, contactFR);

// ─── QUOTE PAGE ──────────────────────────────────────────
const quoteEN = {
  toastSuccessTitle: "Quote Request Sent!",
  toastSuccessDesc: "We'll prepare your quote and get back to you shortly.",
  toastFailedTitle: "Failed to Send",
  toastFailedDesc: "Please try again or call us directly.",
  quoteReference: "Quote Reference",
  preferredDate: "Preferred Date",
  preferredTime: "Preferred Time",
  selectTime: "Select time",
  timeMorning: "Morning (9AM-12PM)",
  timeAfternoon: "Afternoon (12PM-4PM)",
  timeEvening: "Evening (4PM-6PM)",
  budgetUnder1k: "Under $1,000",
  budget1kTo5k: "$1,000-$5,000",
  budget5kTo15k: "$5,000-$15,000",
  budget15kPlus: "$15,000+",
  uploadPhotos: "Upload Photos/Blueprints (Optional)",
  dragDropText: "Drag & drop files here, or click to browse",
  fileFormats: "JPG, PNG, PDF up to 10MB",
  reviewName: "Name:",
  reviewEmail: "Email:",
  reviewPhone: "Phone:",
  reviewAddress: "Address:",
  reviewProjectType: "Project Type:",
  reviewService: "Service:",
  reviewBudget: "Budget:",
  reviewPreferredDate: "Preferred Date:",
  reviewDescription: "Description:",
  sending: "Sending...",
  needHelp: "Need immediate assistance? Call us at",
  typeResidential: "Residential",
  typeCommercial: "Commercial",
  typeIndustrial: "Industrial",
  scopeInstallation: "Installation",
  scopeMeasurement: "Measurement",
  scopeInspection: "Inspection",
  scopeConsultation: "Consultation",
  scopeRepair: "Repair",
  scopeCustom: "Custom",
  descriptionPlaceholder: "Describe your project, including the number of windows/doors, sizes if known, and any special requirements...",
};

const quoteFR = {
  toastSuccessTitle: "Demande de soumission envoyée!",
  toastSuccessDesc: "Nous préparerons votre soumission et vous recontacterons sous peu.",
  toastFailedTitle: "Échec de l'envoi",
  toastFailedDesc: "Veuillez réessayer ou nous appeler directement.",
  quoteReference: "Référence de soumission",
  preferredDate: "Date préférée",
  preferredTime: "Heure préférée",
  selectTime: "Sélectionnez l'heure",
  timeMorning: "Matin (9h-12h)",
  timeAfternoon: "Après-midi (12h-16h)",
  timeEvening: "Soir (16h-18h)",
  budgetUnder1k: "Moins de 1 000 $",
  budget1kTo5k: "1 000 $ - 5 000 $",
  budget5kTo15k: "5 000 $ - 15 000 $",
  budget15kPlus: "15 000 $ et plus",
  uploadPhotos: "Téléverser des photos/plans (Optionnel)",
  dragDropText: "Glissez-déposez vos fichiers ici, ou cliquez pour parcourir",
  fileFormats: "JPG, PNG, PDF jusqu'à 10 Mo",
  reviewName: "Nom :",
  reviewEmail: "Courriel :",
  reviewPhone: "Téléphone :",
  reviewAddress: "Adresse :",
  reviewProjectType: "Type de projet :",
  reviewService: "Service :",
  reviewBudget: "Budget :",
  reviewPreferredDate: "Date préférée :",
  reviewDescription: "Description :",
  sending: "Envoi en cours...",
  needHelp: "Besoin d'aide immédiate? Appelez-nous au",
  typeResidential: "Résidentiel",
  typeCommercial: "Commercial",
  typeIndustrial: "Industriel",
  scopeInstallation: "Installation",
  scopeMeasurement: "Mesure",
  scopeInspection: "Inspection",
  scopeConsultation: "Consultation",
  scopeRepair: "Réparation",
  scopeCustom: "Sur mesure",
  descriptionPlaceholder: "Décrivez votre projet, incluant le nombre de fenêtres/portes, les dimensions si connues, et toute exigence particulière...",
};

Object.assign(en.QuotePage, quoteEN);
Object.assign(fr.QuotePage, quoteFR);

// ─── SERVICES PAGE ───────────────────────────────────────
const servicesEN = {
  howWeWork: "How We Work",
  ourProcess: "Our Process",
  processDesc: "From first contact to project completion, here's how we deliver exceptional results.",
  processStep1Title: "Initial Consultation",
  processStep1Desc: "Free consultation to understand your needs, budget, and timeline. Available in-person or via video call.",
  processStep2Title: "On-Site Assessment",
  processStep2Desc: "Our certified technicians visit your location for precise measurements and site evaluation.",
  processStep3Title: "Custom Quote",
  processStep3Desc: "Receive a detailed, itemized quote with product recommendations and installation timeline.",
  processStep4Title: "Production & Delivery",
  processStep4Desc: "Your custom windows and doors are manufactured to exact specifications and delivered on schedule.",
  processStep5Title: "Professional Installation",
  processStep5Desc: "Our expert team installs everything to the highest standards with minimal disruption.",
  processStep6Title: "Quality Inspection",
  processStep6Desc: "Final walkthrough to ensure everything meets our quality standards and your expectations.",
  statProjectsCompleted: "Projects Completed",
  statYearsExperience: "Years of Experience",
  statOnTime: "On-Time Completion",
  statSatisfaction: "Satisfaction Guarantee",
};

const servicesFR = {
  howWeWork: "Notre méthode",
  ourProcess: "Notre processus",
  processDesc: "Du premier contact à l'achèvement du projet, voici comment nous livrons des résultats exceptionnels.",
  processStep1Title: "Consultation initiale",
  processStep1Desc: "Consultation gratuite pour comprendre vos besoins, votre budget et votre échéancier. Disponible en personne ou par appel vidéo.",
  processStep2Title: "Évaluation sur site",
  processStep2Desc: "Nos techniciens certifiés visitent votre emplacement pour des mesures précises et une évaluation du site.",
  processStep3Title: "Soumission personnalisée",
  processStep3Desc: "Recevez une soumission détaillée et détaillée avec des recommandations de produits et un calendrier d'installation.",
  processStep4Title: "Production et livraison",
  processStep4Desc: "Vos fenêtres et portes sur mesure sont fabriquées selon des spécifications exactes et livrées dans les délais.",
  processStep5Title: "Installation professionnelle",
  processStep5Desc: "Notre équipe d'experts installe le tout selon les normes les plus élevées avec un minimum de perturbation.",
  processStep6Title: "Inspection de qualité",
  processStep6Desc: "Visite finale pour s'assurer que tout répond à nos normes de qualité et à vos attentes.",
  statProjectsCompleted: "Projets réalisés",
  statYearsExperience: "Années d'expérience",
  statOnTime: "Livraison à temps",
  statSatisfaction: "Garantie de satisfaction",
};

Object.assign(en.ServicesPage, servicesEN);
Object.assign(fr.ServicesPage, servicesFR);

// ─── HOME PAGE ───────────────────────────────────────────
const homeEN = {
  productCasement: "Casement Windows",
  productSliding: "Sliding Doors",
  productDoubleHung: "Double Hung",
  productStorefront: "Storefront",
  productCurtainWall: "Curtain Wall",
  productEntryDoors: "Entry Doors",
  toastQuoteSentTitle: "Quote Request Sent!",
  toastQuoteSentDesc: "We'll get back to you with an estimate.",
  toastQuoteFailTitle: "Failed to Send",
  toastQuoteFailDesc: "Please try again or call us.",
};

const homeFR = {
  productCasement: "Fenêtres à battant",
  productSliding: "Portes coulissantes",
  productDoubleHung: "Fenêtres à guillotine",
  productStorefront: "Vitrine commerciale",
  productCurtainWall: "Mur-rideau",
  productEntryDoors: "Portes d'entrée",
  toastQuoteSentTitle: "Demande de soumission envoyée!",
  toastQuoteSentDesc: "Nous vous recontacterons avec une estimation.",
  toastQuoteFailTitle: "Échec de l'envoi",
  toastQuoteFailDesc: "Veuillez réessayer ou nous appeler.",
};

Object.assign(en.HomePage, homeEN);
Object.assign(fr.HomePage, homeFR);

// ─── FILE UPLOAD COMPONENT (Common keys) ─────────────────
if (!en.Common) en.Common = {};
if (!fr.Common) fr.Common = {};

const commonEN = {
  addPhotos: "Add Photos",
  attachFiles: "Attach Files",
  dragDropFiles: "Drag & drop files here, or use the buttons above",
  maxFilesInfo: "Max {maxFiles} files, {maxSizeMB}MB each",
  filesAttached: "{count} of {maxFiles} files attached",
  removeAll: "Remove all",
};

const commonFR = {
  addPhotos: "Ajouter des photos",
  attachFiles: "Joindre des fichiers",
  dragDropFiles: "Glissez-déposez vos fichiers ici, ou utilisez les boutons ci-dessus",
  maxFilesInfo: "Max {maxFiles} fichiers, {maxSizeMB} Mo chacun",
  filesAttached: "{count} de {maxFiles} fichiers joints",
  removeAll: "Tout supprimer",
};

Object.assign(en.Common, commonEN);
Object.assign(fr.Common, commonFR);

// ─── NAVIGATION (Header portal button) ──────────────────
const navEN = {
  portal: "Portal",
  portalLogin: "Portal Login",
};

const navFR = {
  portal: "Portail",
  portalLogin: "Connexion au portail",
};

Object.assign(en.Navigation, navEN);
Object.assign(fr.Navigation, navFR);

// ─── WRITE FILES ─────────────────────────────────────────
fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + '\n', 'utf8');
fs.writeFileSync(frPath, JSON.stringify(fr, null, 2) + '\n', 'utf8');

console.log('✅ Translation keys added successfully!');
console.log('   - ContactPage: +' + Object.keys(contactEN).length + ' keys');
console.log('   - QuotePage: +' + Object.keys(quoteEN).length + ' keys');
console.log('   - ServicesPage: +' + Object.keys(servicesEN).length + ' keys');
console.log('   - HomePage: +' + Object.keys(homeEN).length + ' keys');
console.log('   - Common: +' + Object.keys(commonEN).length + ' keys');
console.log('   - Navigation: +' + Object.keys(navEN).length + ' keys');
