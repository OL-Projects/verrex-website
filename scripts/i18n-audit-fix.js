// Script to add missing i18n keys to en.json and fr.json
const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, '..', 'messages', 'en.json');
const frPath = path.join(__dirname, '..', 'messages', 'fr.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const fr = JSON.parse(fs.readFileSync(frPath, 'utf8'));

// ============ HOMEPAGE ============
Object.assign(en.HomePage, {
  sectorTitle: "Solutions For Every Sector",
  sectorDesc: "Comprehensive window and door systems engineered for every building type — from multi-family developments to government facilities and manufacturing plants.",
  whyChooseTitle: "Why Choose",
  whyChooseBrand: "VEREX",
  whyChooseDesc: "We are your strategic partner for fenestration projects of any scale — combining manufacturer-direct pricing, certified installation, and comprehensive project management to deliver results.",
  whyLicensed: "Fully Licensed & Bonded",
  whyLicensedDesc: "Complete liability coverage, WSIB compliant, and licensed professionals on every project.",
  whyCode: "Code Compliant",
  whyCodeDesc: "All products meet or exceed the National Building Code of Canada, CSA A440, and NAFS standards.",
  whyOnTime: "On-Time, On-Budget",
  whyOnTimeDesc: "98% on-time completion rate with transparent project management and milestone tracking.",
  whyPriceMatch: "Premium Quality, Price-Match Guarantee",
  whyPriceMatchDesc: "Uncompromising quality backed by our price-match guarantee. Get the best products at the most competitive prices — guaranteed.",
  industryCertified: "Industry Certified",
  verified: "Verified",
  selectProductType: "Select Product Type",
  cityPlaceholder: "City",
  postalCodePlaceholder: "Postal Code",
  quantityLabel: "Quantity / Units",
  quantityPlaceholder: "e.g. 10",
  sending: "Sending...",
});

Object.assign(fr.HomePage, {
  sectorTitle: "Solutions pour chaque secteur",
  sectorDesc: "Systèmes de fenêtres et de portes complets conçus pour chaque type de bâtiment — des développements multifamiliaux aux installations gouvernementales et usines de fabrication.",
  whyChooseTitle: "Pourquoi choisir",
  whyChooseBrand: "VEREX",
  whyChooseDesc: "Nous sommes votre partenaire stratégique pour les projets de fenestration de toute envergure — combinant prix directs du fabricant, installation certifiée et gestion de projet complète pour livrer des résultats.",
  whyLicensed: "Entièrement licencié et cautionné",
  whyLicensedDesc: "Couverture complète de responsabilité, conforme CNESST, et professionnels licenciés sur chaque projet.",
  whyCode: "Conforme aux codes",
  whyCodeDesc: "Tous les produits respectent ou dépassent le Code national du bâtiment du Canada, les normes CSA A440 et NAFS.",
  whyOnTime: "À temps, dans le budget",
  whyOnTimeDesc: "Taux de livraison à temps de 98 % avec gestion de projet transparente et suivi des jalons.",
  whyPriceMatch: "Qualité premium, garantie d'égalisation des prix",
  whyPriceMatchDesc: "Qualité sans compromis soutenue par notre garantie d'égalisation des prix. Obtenez les meilleurs produits aux prix les plus compétitifs — garanti.",
  industryCertified: "Certifié par l'industrie",
  verified: "Vérifié",
  selectProductType: "Sélectionnez le type de produit",
  cityPlaceholder: "Ville",
  postalCodePlaceholder: "Code postal",
  quantityLabel: "Quantité / Unités",
  quantityPlaceholder: "ex. 10",
  sending: "Envoi en cours...",
});

// ============ CONTACT PAGE ============
Object.assign(en.ContactPage, {
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
  phoneLabel: "Phone",
  emailLabel: "Email",
  addressLabel: "Address",
  attachments: "Attachments",
  attachmentsDesc: "Add photos of your windows or relevant documents",
  preferredContact: "Preferred Contact Method",
  contactEmail: "Email",
  contactPhone: "Phone",
  contactEither: "Either",
  reachUsDesc: "Reach us by phone, email, or visit our office. We're here to help with all your window and door needs.",
  failedTitle: "Failed to Send",
  failedDesc: "Please try again or call us directly.",
  toAdmin: "To: admin@verex.ca",
});

Object.assign(fr.ContactPage, {
  liveChat: "Clavardage",
  comingSoon: "Bientôt disponible",
  videoCall: "Appel vidéo",
  bookOnline: "Réserver en ligne",
  selectSubject: "Sélectionnez un sujet",
  subjectGeneral: "Demande générale",
  subjectQuote: "Demande de soumission",
  subjectInstallation: "Question d'installation",
  subjectSupport: "Soutien",
  subjectPartnership: "Partenariat",
  phoneLabel: "Téléphone",
  emailLabel: "Courriel",
  addressLabel: "Adresse",
  attachments: "Pièces jointes",
  attachmentsDesc: "Ajoutez des photos de vos fenêtres ou documents pertinents",
  preferredContact: "Méthode de contact préférée",
  contactEmail: "Courriel",
  contactPhone: "Téléphone",
  contactEither: "Les deux",
  reachUsDesc: "Contactez-nous par téléphone, courriel ou visitez notre bureau. Nous sommes là pour vous aider avec tous vos besoins en fenêtres et portes.",
  failedTitle: "Échec de l'envoi",
  failedDesc: "Veuillez réessayer ou nous appeler directement.",
  toAdmin: "À : admin@verex.ca",
});

// ============ APPOINTMENTS PAGE ============
Object.assign(en.AppointmentsPage, {
  locationLabel: "Location / Address",
  locationPlaceholder: "123 Main St, Toronto",
  booking: "Booking...",
  bookedTitle: "Appointment Booked!",
  bookedDesc: "We'll confirm your appointment shortly.",
  failedTitle: "Failed to Book",
  failedDesc: "Please try again or call us directly.",
});

Object.assign(fr.AppointmentsPage, {
  locationLabel: "Emplacement / Adresse",
  locationPlaceholder: "123 rue Principale, Montréal",
  booking: "Réservation en cours...",
  bookedTitle: "Rendez-vous réservé!",
  bookedDesc: "Nous confirmerons votre rendez-vous sous peu.",
  failedTitle: "Échec de la réservation",
  failedDesc: "Veuillez réessayer ou nous appeler directement.",
});

// ============ ABOUT PAGE ============
Object.assign(en.AboutPage, {
  projectsCompleted: "Projects Completed",
  expertTeamMembers: "Expert Team Members",
  sqFtInstalled: "Sq Ft Installed",
  onTimeDelivery: "On-Time Delivery",
  pullQuote: "Excellence in every pane — delivering quality fenestration solutions you can trust.",
  industryStandards: "Industry Standards",
  certsCompliance: "Certifications & Compliance",
  certsDesc: "All VEREX products meet or exceed the highest industry standards",
});

Object.assign(fr.AboutPage, {
  projectsCompleted: "Projets complétés",
  expertTeamMembers: "Membres de l'équipe d'experts",
  sqFtInstalled: "Pi² installés",
  onTimeDelivery: "Livraison à temps",
  pullQuote: "L'excellence dans chaque vitrage — offrant des solutions de fenestration de qualité en lesquelles vous pouvez avoir confiance.",
  industryStandards: "Normes de l'industrie",
  certsCompliance: "Certifications et conformité",
  certsDesc: "Tous les produits VEREX respectent ou dépassent les normes les plus élevées de l'industrie",
});

// Write back
fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + '\n');
fs.writeFileSync(frPath, JSON.stringify(fr, null, 2) + '\n');

console.log('✅ Added i18n keys to en.json and fr.json');
