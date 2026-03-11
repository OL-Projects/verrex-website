const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, '..', 'messages', 'en.json');
const frPath = path.join(__dirname, '..', 'messages', 'fr.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const fr = JSON.parse(fs.readFileSync(frPath, 'utf8'));

// English ProductData (mirrors data.ts exactly)
en.ProductData = {
  "subcategory": { "Windows": "Windows", "Doors": "Doors" },
  "specKey": {
    "frame": "Frame", "glass": "Glass", "operation": "Operation",
    "rating": "Rating", "energy": "Energy", "panels": "Panels",
    "locking": "Locking", "mode": "Mode", "threshold": "Threshold",
    "leaf": "Leaf", "compliance": "Compliance"
  },
  "specVal": {
    "aluminum___pvc": "Aluminum / PVC",
    "double_or_triple_glazed": "Double or Triple Glazed",
    "top_hinged__swings_outward": "Top-hinged, swings outward",
    "csa_a440": "CSA A440",
    "energy_star_certified": "ENERGY STAR® Certified",
    "horizontal_slide": "Horizontal slide",
    "side_hinged__swings_outward": "Side-hinged, swings outward",
    "tilt_inward___full_swing_inward": "Tilt inward + full swing inward",
    "crank_operated__swings_outward": "Crank-operated, swings outward",
    "horizontal_glide_on_track": "Horizontal glide on track",
    "2__3__or_4_panel": "2, 3, or 4-panel",
    "multi_point": "Multi-point",
    "bi_fold_stack": "Bi-fold stack",
    "2_to_7_panel": "2 to 7-panel",
    "flush_option": "Flush option",
    "hinged__single_or_double": "Hinged, single or double",
    "single___double": "Single / Double",
    "ada___aoda": "ADA / AODA"
  },
  "top-hung": {
    "name": "Top Hung (Awning) Window",
    "shortDescription": "Top-hinged awning window — ventilates while keeping rain out.",
    "description": "Top-hinged window that swings outward from the bottom. Excellent for ventilation while maintaining weather protection. The outward swing prevents rain from entering even when open. Ideal for bathrooms, kitchens, and basements where moisture control and airflow are essential.",
    "feature1": "Opens outward from bottom",
    "feature2": "Rain protection while ventilating",
    "feature3": "Multi-point locking system",
    "feature4": "Excellent seal performance",
    "feature5": "Easy to operate",
    "feature6": "Low maintenance"
  },
  "sliding-window": {
    "name": "Sliding Window",
    "shortDescription": "Smooth horizontal sliding window — wide openings, space-efficient.",
    "description": "Horizontally sliding sash window that glides on precision-engineered tracks. Offers wide openings without intruding into interior or exterior space. Ideal for rooms facing walkways, patios, or areas where swing clearance is limited.",
    "feature1": "Smooth horizontal glide",
    "feature2": "No exterior protrusion",
    "feature3": "Wide opening area",
    "feature4": "Easy to clean",
    "feature5": "Durable track system",
    "feature6": "Screen compatible"
  },
  "casement": {
    "name": "Casement Window",
    "shortDescription": "Side-hinged window — full opening, maximum airflow.",
    "description": "Side-hinged window that swings outward for full-width ventilation. Offers unobstructed views, superior energy efficiency due to compression sealing, and easy cleaning from inside. Perfect for living rooms, bedrooms, and any space requiring maximum natural light and airflow.",
    "feature1": "Full opening for maximum airflow",
    "feature2": "Compression seal for energy efficiency",
    "feature3": "Unobstructed exterior views",
    "feature4": "Multi-point locking system",
    "feature5": "Easy interior cleaning",
    "feature6": "Modern slim sightlines"
  },
  "tilt-turn": {
    "name": "Tilt & Turn Window",
    "shortDescription": "European dual-mode — tilts for ventilation, turns for full access.",
    "description": "European-style dual-function window that tilts inward from the top for secure ventilation or swings fully inward on side hinges for easy cleaning and emergency egress. Combines superior thermal performance with versatile operation.",
    "feature1": "Dual tilt and turn operation",
    "feature2": "Secure top-tilt ventilation",
    "feature3": "Full inward swing for cleaning",
    "feature4": "Emergency egress capable",
    "feature5": "Superior thermal performance",
    "feature6": "Child-safe tilt mode"
  },
  "hand-cranked": {
    "name": "Hand Cranked (Casement) Window",
    "shortDescription": "Crank-operated casement — precise control, outward opening.",
    "description": "Casement window operated by a hand crank mechanism that swings the sash outward. Provides precise control over the opening angle, excellent for hard-to-reach locations like above kitchen sinks or counters. Robust mechanical operation with tight weather sealing.",
    "feature1": "Precise crank-operated opening",
    "feature2": "Ideal for hard-to-reach spots",
    "feature3": "Tight seal when closed",
    "feature4": "Full outward projection",
    "feature5": "Smooth mechanical operation",
    "feature6": "Durable hardware"
  },
  "sliding-door": {
    "name": "Sliding Patio Door",
    "shortDescription": "Large-panel sliding door — seamless indoor-outdoor living.",
    "description": "Large-panel door system that glides horizontally on heavy-duty precision tracks. Available in 2, 3, and 4-panel configurations. Creates seamless transitions between indoor and outdoor living spaces while maximizing natural light and views.",
    "feature1": "Heavy-duty roller mechanism",
    "feature2": "Floor-to-ceiling glass",
    "feature3": "Multi-point security locks",
    "feature4": "Thermal break frames",
    "feature5": "Smooth effortless glide",
    "feature6": "Screen door included"
  },
  "folding-door": {
    "name": "Folding (Bi-Fold) Door",
    "shortDescription": "Multi-panel bi-fold — opens entire wall for indoor-outdoor flow.",
    "description": "Multi-panel bi-fold door system that folds and stacks to create wide-open passages. Transforms entire walls into open-air spaces. Ideal for patios, restaurants, and any space where maximum opening width and flexible living are desired.",
    "feature1": "Full wall opening capability",
    "feature2": "Bi-fold panel stacking",
    "feature3": "Flush threshold option",
    "feature4": "Weather-rated seals",
    "feature5": "Smooth folding operation",
    "feature6": "Multiple panel configurations"
  },
  "swing-door": {
    "name": "Swing Entry Door",
    "shortDescription": "Classic hinged door — single or double, residential & commercial.",
    "description": "Traditional hinged door that swings open on side-mounted hinges. Available as single or double-leaf, inward or outward opening. Suitable for residential entries, commercial storefronts, and institutional buildings with ADA/AODA compliance options.",
    "feature1": "Classic hinged operation",
    "feature2": "Single or double leaf",
    "feature3": "ADA/AODA compliant options",
    "feature4": "Panic hardware available",
    "feature5": "Heavy-duty hinges",
    "feature6": "Wide range of finishes"
  }
};

// French ProductData
fr.ProductData = {
  "subcategory": { "Windows": "Fenêtres", "Doors": "Portes" },
  "specKey": {
    "frame": "Cadre", "glass": "Verre", "operation": "Opération",
    "rating": "Cote", "energy": "Énergie", "panels": "Panneaux",
    "locking": "Verrouillage", "mode": "Mode", "threshold": "Seuil",
    "leaf": "Vantail", "compliance": "Conformité"
  },
  "specVal": {
    "aluminum___pvc": "Aluminium / PVC",
    "double_or_triple_glazed": "Double ou triple vitrage",
    "top_hinged__swings_outward": "Articulée en haut, s'ouvre vers l'extérieur",
    "csa_a440": "CSA A440",
    "energy_star_certified": "Certifié ENERGY STAR®",
    "horizontal_slide": "Coulissement horizontal",
    "side_hinged__swings_outward": "Charnières latérales, s'ouvre vers l'extérieur",
    "tilt_inward___full_swing_inward": "Basculement intérieur + battant intérieur complet",
    "crank_operated__swings_outward": "Opération à manivelle, s'ouvre vers l'extérieur",
    "horizontal_glide_on_track": "Glissement horizontal sur rail",
    "2__3__or_4_panel": "2, 3 ou 4 panneaux",
    "multi_point": "Multipoints",
    "bi_fold_stack": "Empilage bi-pliant",
    "2_to_7_panel": "2 à 7 panneaux",
    "flush_option": "Option affleurante",
    "hinged__single_or_double": "Charnières, simple ou double",
    "single___double": "Simple / Double",
    "ada___aoda": "ADA / AODA"
  },
  "top-hung": {
    "name": "Fenêtre à auvent (battant haut)",
    "shortDescription": "Fenêtre à auvent articulée en haut — ventile tout en bloquant la pluie.",
    "description": "Fenêtre articulée en haut qui s'ouvre vers l'extérieur par le bas. Excellente pour la ventilation tout en maintenant la protection contre les intempéries. L'ouverture vers l'extérieur empêche la pluie d'entrer même lorsqu'elle est ouverte. Idéale pour les salles de bain, cuisines et sous-sols où le contrôle de l'humidité et la circulation d'air sont essentiels.",
    "feature1": "S'ouvre vers l'extérieur par le bas",
    "feature2": "Protection contre la pluie pendant la ventilation",
    "feature3": "Système de verrouillage multipoints",
    "feature4": "Excellente performance d'étanchéité",
    "feature5": "Facile à utiliser",
    "feature6": "Faible entretien"
  },
  "sliding-window": {
    "name": "Fenêtre coulissante",
    "shortDescription": "Fenêtre coulissante horizontale — larges ouvertures, gain d'espace.",
    "description": "Fenêtre à châssis coulissant horizontalement qui glisse sur des rails de précision. Offre de larges ouvertures sans empiéter sur l'espace intérieur ou extérieur. Idéale pour les pièces donnant sur des allées, patios ou zones où le dégagement de battant est limité.",
    "feature1": "Glissement horizontal fluide",
    "feature2": "Aucune saillie extérieure",
    "feature3": "Large zone d'ouverture",
    "feature4": "Facile à nettoyer",
    "feature5": "Système de rails durable",
    "feature6": "Compatible avec moustiquaire"
  },
  "casement": {
    "name": "Fenêtre à battant",
    "shortDescription": "Fenêtre à charnières latérales — ouverture complète, débit d'air maximal.",
    "description": "Fenêtre à charnières latérales qui s'ouvre vers l'extérieur pour une ventilation pleine largeur. Offre des vues dégagées, une efficacité énergétique supérieure grâce au joint de compression, et un nettoyage facile de l'intérieur. Parfaite pour les salons, chambres et tout espace nécessitant un maximum de lumière naturelle et de circulation d'air.",
    "feature1": "Ouverture complète pour débit d'air maximal",
    "feature2": "Joint de compression pour l'efficacité énergétique",
    "feature3": "Vues extérieures sans obstruction",
    "feature4": "Système de verrouillage multipoints",
    "feature5": "Nettoyage facile de l'intérieur",
    "feature6": "Lignes de vision minces et modernes"
  },
  "tilt-turn": {
    "name": "Fenêtre oscillo-battante",
    "shortDescription": "Style européen double mode — bascule pour ventiler, tourne pour accès complet.",
    "description": "Fenêtre européenne à double fonction qui bascule vers l'intérieur par le haut pour une ventilation sécurisée ou s'ouvre complètement vers l'intérieur sur charnières latérales pour un nettoyage facile et une sortie d'urgence. Combine une performance thermique supérieure avec une opération polyvalente.",
    "feature1": "Opération double basculement et battant",
    "feature2": "Ventilation sécurisée par basculement",
    "feature3": "Battant intérieur complet pour le nettoyage",
    "feature4": "Sortie d'urgence possible",
    "feature5": "Performance thermique supérieure",
    "feature6": "Mode basculant sécuritaire pour enfants"
  },
  "hand-cranked": {
    "name": "Fenêtre à manivelle (battant)",
    "shortDescription": "Battant à manivelle — contrôle précis, ouverture vers l'extérieur.",
    "description": "Fenêtre à battant opérée par un mécanisme à manivelle qui projette le châssis vers l'extérieur. Offre un contrôle précis de l'angle d'ouverture, excellente pour les emplacements difficiles d'accès comme au-dessus des éviers ou comptoirs de cuisine. Opération mécanique robuste avec étanchéité serrée.",
    "feature1": "Ouverture précise à manivelle",
    "feature2": "Idéale pour les endroits difficiles d'accès",
    "feature3": "Étanchéité serrée en position fermée",
    "feature4": "Projection extérieure complète",
    "feature5": "Opération mécanique fluide",
    "feature6": "Quincaillerie durable"
  },
  "sliding-door": {
    "name": "Porte-fenêtre coulissante",
    "shortDescription": "Porte coulissante à grands panneaux — transition intérieur-extérieur harmonieuse.",
    "description": "Système de porte à grands panneaux qui glisse horizontalement sur des rails de précision robustes. Disponible en configurations 2, 3 et 4 panneaux. Crée des transitions harmonieuses entre les espaces intérieurs et extérieurs tout en maximisant la lumière naturelle et les vues.",
    "feature1": "Mécanisme à roulettes robuste",
    "feature2": "Vitrage du sol au plafond",
    "feature3": "Serrures de sécurité multipoints",
    "feature4": "Cadres à rupture thermique",
    "feature5": "Glissement doux et sans effort",
    "feature6": "Porte moustiquaire incluse"
  },
  "folding-door": {
    "name": "Porte pliante (bi-fold)",
    "shortDescription": "Porte pliante multi-panneaux — ouvre le mur entier pour un flux intérieur-extérieur.",
    "description": "Système de porte bi-pliant multi-panneaux qui se plie et s'empile pour créer de larges passages ouverts. Transforme des murs entiers en espaces ouverts. Idéale pour les patios, restaurants et tout espace où une largeur d'ouverture maximale et un mode de vie flexible sont souhaités.",
    "feature1": "Capacité d'ouverture du mur complet",
    "feature2": "Empilage de panneaux bi-pliants",
    "feature3": "Option de seuil affleurant",
    "feature4": "Joints certifiés intempéries",
    "feature5": "Opération de pliage fluide",
    "feature6": "Configurations multi-panneaux"
  },
  "swing-door": {
    "name": "Porte battante d'entrée",
    "shortDescription": "Porte classique à charnières — simple ou double, résidentiel et commercial.",
    "description": "Porte traditionnelle à charnières qui s'ouvre sur des charnières latérales. Disponible en simple ou double vantail, ouverture intérieure ou extérieure. Convient aux entrées résidentielles, devantures commerciales et bâtiments institutionnels avec options de conformité ADA/AODA.",
    "feature1": "Opération classique à charnières",
    "feature2": "Simple ou double vantail",
    "feature3": "Options conformes ADA/AODA",
    "feature4": "Quincaillerie antipanique disponible",
    "feature5": "Charnières robustes",
    "feature6": "Large gamme de finis"
  }
};

fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + '\n');
fs.writeFileSync(frPath, JSON.stringify(fr, null, 2) + '\n');
console.log('✅ ProductData translations added to en.json and fr.json');
