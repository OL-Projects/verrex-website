/**
 * Add service translation keys + testimonial keys to en.json and fr.json
 */
const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, '..', 'messages', 'en.json');
const frPath = path.join(__dirname, '..', 'messages', 'fr.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const fr = JSON.parse(fs.readFileSync(frPath, 'utf8'));

// ─── SERVICE DATA TRANSLATIONS ───────────────────────────
en.ServiceData = {
  "1": { name: "Free Consultation", description: "Discuss your project requirements, explore product options, and get expert advice — all at no cost. We help you make informed decisions for your home or business.", features: ["No-obligation assessment", "Product recommendations", "Budget planning", "Timeline estimation"] },
  "2": { name: "On-Site Measurement", description: "Accurate, laser-precise measurements taken at your location to ensure perfect fit for every window and door installation.", features: ["Laser precision measuring", "Site condition assessment", "Custom sizing", "Written specifications"] },
  "3": { name: "Professional Installation", description: "Our certified installation team ensures your windows and doors are installed to manufacturer specifications and local building codes.", features: ["Licensed & insured installers", "Manufacturer-certified methods", "Code-compliant installation", "Clean job site guarantee"] },
  "4": { name: "Site Inspection", description: "Comprehensive evaluation of your existing windows and doors to identify issues, energy loss points, and replacement priorities.", features: ["Detailed condition assessment", "Energy efficiency analysis", "Priority recommendations", "Written inspection report"] },
  "5": { name: "Custom Fabrication", description: "Bespoke window and door solutions manufactured to your exact specifications for unique architectural requirements.", features: ["Custom shapes & sizes", "Specialty glass options", "Unique frame profiles", "Architectural consultation"] },
  "6": { name: "Repair & Maintenance", description: "Expert repair and preventive maintenance services to extend the life and performance of your existing windows and doors.", features: ["Seal replacement", "Hardware repair", "Glass replacement", "Weatherstripping"] },
  duration: {
    "1": "30-60 minutes",
    "2": "1-2 hours",
    "3": "Half day - Multiple days",
    "4": "1-3 hours",
    "5": "2-4 weeks",
    "6": "1-4 hours",
  },
};

fr.ServiceData = {
  "1": { name: "Consultation gratuite", description: "Discutez de vos besoins de projet, explorez les options de produits et obtenez des conseils d'experts — le tout sans frais. Nous vous aidons à prendre des décisions éclairées pour votre maison ou votre entreprise.", features: ["Évaluation sans obligation", "Recommandations de produits", "Planification budgétaire", "Estimation de l'échéancier"] },
  "2": { name: "Mesure sur site", description: "Des mesures précises au laser prises à votre emplacement pour assurer un ajustement parfait pour chaque installation de fenêtre et de porte.", features: ["Mesure de précision au laser", "Évaluation de l'état du site", "Dimensionnement sur mesure", "Spécifications écrites"] },
  "3": { name: "Installation professionnelle", description: "Notre équipe d'installation certifiée s'assure que vos fenêtres et portes sont installées selon les spécifications du fabricant et les codes du bâtiment locaux.", features: ["Installateurs agréés et assurés", "Méthodes certifiées par le fabricant", "Installation conforme aux codes", "Garantie de chantier propre"] },
  "4": { name: "Inspection du site", description: "Évaluation complète de vos fenêtres et portes existantes pour identifier les problèmes, les points de perte d'énergie et les priorités de remplacement.", features: ["Évaluation détaillée de l'état", "Analyse de l'efficacité énergétique", "Recommandations prioritaires", "Rapport d'inspection écrit"] },
  "5": { name: "Fabrication sur mesure", description: "Solutions de fenêtres et de portes sur mesure fabriquées selon vos spécifications exactes pour des exigences architecturales uniques.", features: ["Formes et tailles personnalisées", "Options de vitrage spécialisées", "Profils de cadre uniques", "Consultation architecturale"] },
  "6": { name: "Réparation et entretien", description: "Services de réparation et d'entretien préventif experts pour prolonger la durée de vie et les performances de vos fenêtres et portes existantes.", features: ["Remplacement de joints", "Réparation de quincaillerie", "Remplacement de vitrage", "Calfeutrage"] },
  duration: {
    "1": "30-60 minutes",
    "2": "1-2 heures",
    "3": "Demi-journée - Plusieurs jours",
    "4": "1-3 heures",
    "5": "2-4 semaines",
    "6": "1-4 heures",
  },
};

// ─── TESTIMONIAL TRANSLATIONS ────────────────────────────
en.TestimonialData = {
  "1": { content: "VEREX transformed our home with beautiful casement windows. The installation team was professional, clean, and efficient. We've already noticed a significant reduction in our heating bills.", role: "Homeowner" },
  "2": { content: "Managing a 200-unit complex, I need reliable partners. VEREX delivered every window on time, on budget, and their after-sales support is exceptional.", role: "Property Manager" },
  "3": { content: "As an architect, I appreciate VEREX's ability to execute custom designs precisely. Their curtain wall work on our latest project exceeded expectations.", role: "Architect" },
  "4": { content: "The industrial-grade glass installations for our manufacturing facility were completed to the highest safety standards. VEREX understands commercial needs.", role: "Factory Manager" },
};

fr.TestimonialData = {
  "1": { content: "VEREX a transformé notre maison avec de magnifiques fenêtres à battant. L'équipe d'installation était professionnelle, propre et efficace. Nous avons déjà remarqué une réduction importante de nos factures de chauffage.", role: "Propriétaire" },
  "2": { content: "Gérant un complexe de 200 unités, j'ai besoin de partenaires fiables. VEREX a livré chaque fenêtre à temps, dans le budget, et leur service après-vente est exceptionnel.", role: "Gestionnaire immobilier" },
  "3": { content: "En tant qu'architecte, j'apprécie la capacité de VEREX à exécuter des conceptions personnalisées avec précision. Leur travail de mur-rideau sur notre dernier projet a dépassé les attentes.", role: "Architecte" },
  "4": { content: "Les installations de vitrage de qualité industrielle pour notre usine de fabrication ont été réalisées selon les normes de sécurité les plus élevées. VEREX comprend les besoins commerciaux.", role: "Directeur d'usine" },
};

fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + '\n', 'utf8');
fs.writeFileSync(frPath, JSON.stringify(fr, null, 2) + '\n', 'utf8');

console.log('✅ Service + Testimonial translation keys added!');
