const fs = require('fs');
let content = fs.readFileSync('src/lib/data.ts', 'utf8');

const startMarker = 'export const products: Product[] = [';
const startIdx = content.indexOf(startMarker);
const servicesMarker = '\nexport const services:';
const servicesIdx = content.indexOf(servicesMarker);

const newProducts = `export const products: Product[] = [
  {
    id: "top-hung",
    name: "Top Hung (Awning) Window",
    description: "Top-hinged window that swings outward from the bottom. Excellent for ventilation while maintaining weather protection. The outward swing prevents rain from entering even when open. Ideal for bathrooms, kitchens, and basements where moisture control and airflow are essential.",
    shortDescription: "Top-hinged awning window — ventilates while keeping rain out.",
    category: "residential",
    subcategory: "Windows",
    diagramId: "double-hung",
    images: [],
    features: ["Opens outward from bottom", "Rain protection while ventilating", "Multi-point locking system", "Excellent seal performance", "Easy to operate", "Low maintenance"],
    specifications: { "Frame": "Aluminum / PVC", "Glass": "Double or Triple Glazed", "Operation": "Top-hinged, swings outward", "Rating": "CSA A440", "Energy": "ENERGY STAR\u00ae Certified" },
    priceRange: { min: 300, max: 1100 },
    isCustomizable: true,
    isFeatured: true,
    tags: ["awning", "ventilation", "residential", "bathroom", "kitchen"]
  },
  {
    id: "sliding-window",
    name: "Sliding Window",
    description: "Horizontal sliding window with smooth glide operation. One or more sashes slide laterally along tracks, providing wide opening areas without protruding outside. Perfect for spaces where outward-opening windows are impractical, such as near walkways, patios, or tight exterior spaces.",
    shortDescription: "Smooth horizontal sliding window — wide openings, space-efficient.",
    category: "residential",
    subcategory: "Windows",
    diagramId: "sliding",
    images: [],
    features: ["Smooth horizontal glide", "No exterior protrusion", "Wide opening area", "Easy to clean", "Durable track system", "Screen compatible"],
    specifications: { "Frame": "Aluminum / PVC", "Glass": "Double or Triple Glazed", "Operation": "Horizontal slide", "Rating": "CSA A440", "Energy": "ENERGY STAR\u00ae Certified" },
    priceRange: { min: 250, max: 900 },
    isCustomizable: true,
    isFeatured: false,
    tags: ["sliding", "horizontal", "residential", "patio", "space-saving"]
  },
  {
    id: "casement",
    name: "Casement Window",
    description: "Side-hinged window that swings outward with a crank or lever handle. Provides maximum ventilation and unobstructed views when fully open. The compression seal creates an airtight fit when closed, making casement windows among the most energy-efficient options available.",
    shortDescription: "Side-hinged crank-open window — maximum airflow and energy efficiency.",
    category: "residential",
    subcategory: "Windows",
    diagramId: "casement",
    images: [],
    features: ["Full opening for maximum airflow", "Superior energy efficiency", "Compression seal when closed", "Unobstructed views", "Easy crank operation", "Multi-point locking"],
    specifications: { "Frame": "Aluminum / PVC", "Glass": "Double or Triple Glazed", "Operation": "Side-hinged, crank or lever", "Rating": "CSA A440", "Energy": "ENERGY STAR\u00ae Certified" },
    priceRange: { min: 350, max: 1200 },
    isCustomizable: true,
    isFeatured: true,
    tags: ["casement", "crank", "residential", "energy-efficient", "ventilation"]
  },
  {
    id: "tilt-turn",
    name: "Tilt & Turn Window",
    description: "European-style dual-function window that tilts inward from the top for secure ventilation or swings fully inward from the side for easy cleaning and maximum airflow. The most versatile window type available, combining safety, convenience, and superior thermal performance in one unit.",
    shortDescription: "Dual-function European window — tilts for ventilation, turns for full opening.",
    category: "residential",
    subcategory: "Windows",
    diagramId: "tilt-turn",
    images: [],
    features: ["Dual tilt and turn operation", "Inward opening for easy cleaning", "Secure tilt ventilation mode", "Superior thermal insulation", "Multi-point locking system", "European engineering"],
    specifications: { "Frame": "Aluminum / PVC", "Glass": "Double or Triple Glazed", "Operation": "Tilt-in or swing-in", "Rating": "CSA A440", "Energy": "ENERGY STAR\u00ae Certified" },
    priceRange: { min: 450, max: 1500 },
    isCustomizable: true,
    isFeatured: true,
    tags: ["tilt-turn", "european", "dual-function", "residential", "versatile"]
  },
  {
    id: "hand-cranked",
    name: "Hand Cranked (Crank-Out) Window",
    description: "Casement-style window with a precision worm-gear crank mechanism for effortless operation. The mechanical advantage of the crank makes it ideal for hard-to-reach locations like above countertops or sinks. Opens smoothly with minimal effort and locks securely in any position.",
    shortDescription: "Precision crank mechanism — effortless operation for hard-to-reach spots.",
    category: "residential",
    subcategory: "Windows",
    diagramId: "hand-cranked",
    images: [],
    features: ["Worm-gear crank mechanism", "Effortless operation", "Ideal for hard-to-reach locations", "Locks in any position", "Smooth precision movement", "Weather-tight seal"],
    specifications: { "Frame": "Aluminum / PVC", "Glass": "Double or Triple Glazed", "Operation": "Crank-out (worm gear)", "Rating": "CSA A440", "Energy": "ENERGY STAR\u00ae Certified" },
    priceRange: { min: 400, max: 1300 },
    isCustomizable: true,
    isFeatured: false,
    tags: ["hand-cranked", "crank-out", "residential", "kitchen", "above-counter"]
  },
  {
    id: "sliding-door",
    name: "Sliding Patio Door",
    description: "Premium floor-to-ceiling glass sliding door system with heavy-duty roller mechanism. Provides seamless indoor-outdoor transitions with expansive glass panels that flood interiors with natural light. Available in 2, 3, or 4-panel configurations with low-profile threshold for accessibility.",
    shortDescription: "Floor-to-ceiling glass sliding door — seamless indoor-outdoor living.",
    category: "residential",
    subcategory: "Doors",
    diagramId: "sliding-door",
    images: [],
    features: ["Heavy-duty roller mechanism", "Floor-to-ceiling glass", "Low-profile threshold", "Multi-panel configurations", "Thermal break technology", "Security locking system"],
    specifications: { "Frame": "Aluminum / PVC", "Glass": "Double or Triple Glazed", "Operation": "Horizontal slide on track", "Panels": "2, 3, or 4-panel", "Rating": "CSA A440" },
    priceRange: { min: 800, max: 3500 },
    isCustomizable: true,
    isFeatured: true,
    tags: ["sliding-door", "patio", "residential", "glass-door", "outdoor-living"]
  },
  {
    id: "folding-door",
    name: "Folding (Bi-Fold) Door",
    description: "Multi-panel bi-fold door system that accordion-folds to create wide, unobstructed openings. Panels fold neatly to one or both sides, transforming walls into open-air passages. Perfect for connecting living spaces to patios, decks, or outdoor entertaining areas.",
    shortDescription: "Bi-fold accordion door — transforms walls into wide-open passages.",
    category: "residential",
    subcategory: "Doors",
    diagramId: "folding-door",
    images: [],
    features: ["Accordion bi-fold operation", "Wide unobstructed openings", "Folds to one or both sides", "Indoor-outdoor transformation", "Heavy-duty pivot hinges", "Flush floor track option"],
    specifications: { "Frame": "Aluminum", "Glass": "Double or Triple Glazed", "Operation": "Bi-fold accordion", "Panels": "3 to 7-panel", "Rating": "CSA A440" },
    priceRange: { min: 2000, max: 8000 },
    isCustomizable: true,
    isFeatured: false,
    tags: ["folding-door", "bi-fold", "residential", "patio", "wide-opening"]
  },
  {
    id: "swing-door",
    name: "Swing Entry Door",
    description: "Commercial-grade glass swing door with push bar hardware, reinforced frame, and integrated closer mechanism. Designed for high-traffic entries with ADA-compliant threshold, panic hardware compatibility, and impact-resistant tempered glass. Available in single or double-leaf configurations.",
    shortDescription: "Commercial glass entry door — high-traffic, ADA-compliant.",
    category: "commercial",
    subcategory: "Doors",
    diagramId: "swing-door",
    images: [],
    features: ["Push bar hardware", "Integrated door closer", "ADA-compliant threshold", "Impact-resistant glass", "Panic hardware compatible", "Single or double-leaf"],
    specifications: { "Frame": "Aluminum", "Glass": "Tempered Safety Glass", "Operation": "Swing (push/pull)", "Hardware": "Commercial grade", "Rating": "CSA A440" },
    priceRange: { min: 1500, max: 5000 },
    isCustomizable: true,
    isFeatured: false,
    tags: ["swing-door", "commercial", "entry", "glass-door", "high-traffic"]
  },
]`;

const newContent = content.substring(0, startIdx) + newProducts + '\n\n' + content.substring(servicesIdx + 1);
fs.writeFileSync('src/lib/data.ts', newContent, 'utf8');
console.log('Products array replaced successfully with 8 fenestration types');
