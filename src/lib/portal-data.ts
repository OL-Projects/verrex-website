// ============================================================
// VEREX PORTAL — Mock Data Store (Phase 1)
// Replace with database queries in Phase 2
// ============================================================

import type {
  Lead,
  Project,
  Appointment,
  MeasurementEntry,
  Order,
  ChatThread,
  Message,
  Invoice,
  Commission,
  Contract,
  ContractScopeItem,
  ContractPayment,
  Notification,
  Partner,
  PortalUser,
  TimelineEvent,
  UserRole,
} from '@/types/portal';
import { VISIBILITY_RULES } from '@/types/portal';

// --- Partners ---

export const mockPartners: Partner[] = [
  {
    id: 'ptr_001',
    name: 'Home Depot Canada',
    logo: '/images/partners/hd-a.svg',
    commissionRate: 0.15,
    contactName: 'David Wilson',
    contactEmail: 'partner@homedepot.com',
    contactPhone: '(416) 555-9000',
    active: true,
  },
];

// --- Users ---

export const mockUsers: PortalUser[] = [
  { id: 'usr_admin_001', email: 'admin@verex.ca', name: 'Sarah Mitchell', role: 'admin', phone: '(514) 555-0100', createdAt: '2025-01-15', lastLogin: '2026-02-25' },
  { id: 'usr_client_001', email: 'client@demo.com', name: 'Jean-Pierre Tremblay', role: 'client', phone: '(514) 555-0201', createdAt: '2025-06-20', lastLogin: '2026-02-24' },
  { id: 'usr_contractor_001', email: 'contractor@demo.com', name: 'Mike Thompson', role: 'contractor', phone: '(514) 555-0301', createdAt: '2025-03-10', lastLogin: '2026-02-25' },
  { id: 'usr_supplier_001', email: 'supplier@demo.com', name: 'Lisa Chen', role: 'supplier', phone: '(416) 555-0401', createdAt: '2025-02-01', lastLogin: '2026-02-23' },
  { id: 'usr_partner_001', email: 'partner@homedepot.com', name: 'David Wilson', role: 'partner', phone: '(416) 555-9000', partnerId: 'ptr_001', createdAt: '2025-01-01', lastLogin: '2026-02-25' },
  { id: 'usr_inspector_001', email: 'inspector@demo.com', name: 'Robert Garcia', role: 'inspector', phone: '(514) 555-0501', createdAt: '2025-04-15', lastLogin: '2026-02-22' },
];

// --- Leads ---

export const mockLeads: Lead[] = [
  {
    id: 'lead_001',
    clientName: 'Jean-Pierre Tremblay',
    clientEmail: 'client@demo.com',
    clientPhone: '(514) 555-0201',
    address: '742 Rue Saint-Denis',
    city: 'Montreal',
    postalCode: 'H2X 3K6',
    source: 'home_depot',
    partnerId: 'ptr_001',
    priority: 'high',
    notes: 'Full window replacement — 12 windows, 2 patio doors. Older home, needs energy upgrade.',
    assignedTo: 'usr_contractor_001',
    projectId: 'proj_001',
    stage: 'in_production',
    createdAt: '2025-11-15',
    updatedAt: '2026-02-20',
  },
  {
    id: 'lead_002',
    clientName: 'Marie Dubois',
    clientEmail: 'marie.dubois@email.com',
    clientPhone: '(450) 555-0302',
    address: '123 Boulevard des Laurentides',
    city: 'Laval',
    postalCode: 'H7G 2T1',
    source: 'website',
    priority: 'medium',
    notes: 'Interested in casement windows for kitchen and living room. Budget: ~$8,000.',
    assignedTo: 'usr_contractor_001',
    projectId: 'proj_002',
    stage: 'quote_prepared',
    createdAt: '2026-01-10',
    updatedAt: '2026-02-18',
  },
  {
    id: 'lead_003',
    clientName: 'Robert Lavoie',
    clientEmail: 'r.lavoie@email.com',
    clientPhone: '(819) 555-0403',
    address: '456 Chemin du Lac',
    city: 'Sherbrooke',
    postalCode: 'J1H 4A6',
    source: 'referral',
    priority: 'low',
    notes: 'Cottage renovation — bay window for great room. Spring install preferred.',
    stage: 'contacted',
    createdAt: '2026-02-01',
    updatedAt: '2026-02-15',
  },
  {
    id: 'lead_004',
    clientName: 'Sophie Martin',
    clientEmail: 's.martin@email.com',
    clientPhone: '(514) 555-0504',
    address: '89 Avenue du Parc',
    city: 'Montreal',
    postalCode: 'H2V 4E6',
    source: 'home_depot',
    partnerId: 'ptr_001',
    priority: 'urgent',
    notes: 'Broken patio door — needs emergency replacement ASAP. Has small children.',
    assignedTo: 'usr_contractor_001',
    stage: 'appointment_scheduled',
    createdAt: '2026-02-20',
    updatedAt: '2026-02-24',
  },
  {
    id: 'lead_005',
    clientName: 'Andrew Chen',
    clientEmail: 'a.chen@email.com',
    clientPhone: '(438) 555-0605',
    address: '567 Rue Crescent',
    city: 'Montreal',
    postalCode: 'H3G 2B1',
    source: 'phone',
    priority: 'medium',
    notes: 'Commercial storefront — 6 large fixed windows. Needs thermal specs for building code.',
    stage: 'lead_received',
    createdAt: '2026-02-23',
    updatedAt: '2026-02-23',
  },
];

// --- Projects ---

export const mockProjects: Project[] = [
  {
    id: 'proj_001',
    leadId: 'lead_001',
    clientId: 'usr_client_001',
    clientName: 'Jean-Pierre Tremblay',
    address: '742 Rue Saint-Denis, Montreal',
    city: 'Montreal',
    stage: 'in_production',
    assignedContractor: 'usr_contractor_001',
    partnerId: 'ptr_001',
    totalValue: 24500,
    depositPaid: 7350,
    balanceDue: 17150,
    products: [
      { id: 'pp_001', location: 'Kitchen', windowType: 'casement', width: 36, height: 48, color: 'White', glassType: 'triple', gridStyle: 'Colonial', hardware: 'Brushed Nickel', openingDirection: 'left', notes: 'Above sink', quantity: 2, unitPrice: 1200 },
      { id: 'pp_002', location: 'Living Room', windowType: 'bay', width: 96, height: 60, color: 'White', glassType: 'triple', gridStyle: 'Prairie', hardware: 'Brushed Nickel', notes: 'Street-facing', quantity: 1, unitPrice: 4500 },
      { id: 'pp_003', location: 'Master Bedroom', windowType: 'casement', width: 30, height: 48, color: 'White', glassType: 'double', gridStyle: 'None', hardware: 'Chrome', openingDirection: 'right', notes: '', quantity: 2, unitPrice: 980 },
      { id: 'pp_004', location: 'Dining Room', windowType: 'patio_door', width: 72, height: 80, color: 'White', glassType: 'triple', gridStyle: 'None', hardware: 'Brushed Nickel', openingDirection: 'left', notes: 'Leads to backyard deck', quantity: 1, unitPrice: 3800 },
    ],
    notes: 'Priority client via Home Depot. Full home window replacement project. Energy Star rated products required.',
    createdAt: '2025-11-20',
    updatedAt: '2026-02-20',
  },
  {
    id: 'proj_002',
    leadId: 'lead_002',
    clientId: 'usr_client_002',
    clientName: 'Marie Dubois',
    address: '123 Boulevard des Laurentides, Laval',
    city: 'Laval',
    stage: 'quote_prepared',
    assignedContractor: 'usr_contractor_001',
    totalValue: 7800,
    depositPaid: 0,
    balanceDue: 7800,
    products: [
      { id: 'pp_005', location: 'Kitchen', windowType: 'casement', width: 36, height: 48, color: 'Sandstone', glassType: 'double', gridStyle: 'Colonial', hardware: 'Brass', openingDirection: 'left', notes: 'Match existing trim', quantity: 3, unitPrice: 1100 },
      { id: 'pp_006', location: 'Living Room', windowType: 'picture', width: 60, height: 48, color: 'Sandstone', glassType: 'double', gridStyle: 'Prairie', hardware: 'Brass', notes: 'No opening needed', quantity: 1, unitPrice: 1500 },
    ],
    notes: 'Budget-conscious client. Prefers sandstone to match brick exterior.',
    createdAt: '2026-01-15',
    updatedAt: '2026-02-18',
  },
];

// --- Appointments ---

export const mockAppointments: Appointment[] = [
  { id: 'apt_001', projectId: 'proj_001', clientName: 'Jean-Pierre Tremblay', address: '742 Rue Saint-Denis', type: 'measurement', date: '2025-12-05', time: '09:00', duration: 120, assignedTo: 'usr_contractor_001', assignedName: 'Mike Thompson', notes: 'Bring laser measure + camera', status: 'completed' },
  { id: 'apt_002', projectId: 'proj_001', clientName: 'Jean-Pierre Tremblay', address: '742 Rue Saint-Denis', type: 'installation', date: '2026-03-15', time: '08:00', duration: 480, assignedTo: 'usr_contractor_001', assignedName: 'Mike Thompson', notes: 'Full day install — 2 crew members needed', status: 'scheduled' },
  { id: 'apt_003', projectId: 'proj_002', clientName: 'Marie Dubois', address: '123 Boulevard des Laurentides', type: 'consultation', date: '2026-03-01', time: '14:00', duration: 60, assignedTo: 'usr_contractor_001', assignedName: 'Mike Thompson', notes: 'Present quote and options', status: 'scheduled' },
  { id: 'apt_004', projectId: '', clientName: 'Sophie Martin', address: '89 Avenue du Parc', type: 'measurement', date: '2026-02-28', time: '10:00', duration: 90, assignedTo: 'usr_contractor_001', assignedName: 'Mike Thompson', notes: 'Emergency patio door replacement — measure first', status: 'confirmed' },
];

// --- Measurements ---

export const mockMeasurements: MeasurementEntry[] = [
  {
    id: 'meas_001', projectId: 'proj_001', appointmentId: 'apt_001', location: 'Kitchen — Above Sink',
    windowType: 'casement', widthRoughOpening: 37.5, heightRoughOpening: 49, widthExact: 36, heightExact: 48,
    color: 'White', glassType: 'triple', gridStyle: 'Colonial', hardware: 'Brushed Nickel', openingDirection: 'left',
    photos: [], attachments: [], notes: 'Tight fit — check shimming clearance', measuredBy: 'usr_contractor_001', measuredAt: '2025-12-05',
  },
  {
    id: 'meas_002', projectId: 'proj_001', appointmentId: 'apt_001', location: 'Living Room — Bay Window',
    windowType: 'bay', widthRoughOpening: 98, heightRoughOpening: 62, widthExact: 96, heightExact: 60,
    color: 'White', glassType: 'triple', gridStyle: 'Prairie', hardware: 'Brushed Nickel',
    photos: [], attachments: [], notes: 'Structural support beam above — verify load', measuredBy: 'usr_contractor_001', measuredAt: '2025-12-05',
  },
];

// --- Orders ---

export const mockOrders: Order[] = [
  {
    id: 'ord_001',
    projectId: 'proj_001',
    supplierId: 'usr_supplier_001',
    supplierName: 'Fenestra Glass Corp.',
    items: [
      { id: 'oi_001', productDescription: 'Casement Window — Colonial Grid', windowType: 'casement', width: 36, height: 48, color: 'White', glassType: 'triple', quantity: 2, unitPrice: 1200 },
      { id: 'oi_002', productDescription: 'Bay Window — Prairie Grid', windowType: 'bay', width: 96, height: 60, color: 'White', glassType: 'triple', quantity: 1, unitPrice: 4500 },
      { id: 'oi_003', productDescription: 'Casement Window — No Grid', windowType: 'casement', width: 30, height: 48, color: 'White', glassType: 'double', quantity: 2, unitPrice: 980 },
      { id: 'oi_004', productDescription: 'Patio Door — Sliding', windowType: 'patio_door', width: 72, height: 80, color: 'White', glassType: 'triple', quantity: 1, unitPrice: 3800 },
    ],
    status: 'production',
    totalAmount: 12660,
    estimatedDelivery: '2026-03-10',
    notes: 'Rush order — client approved. Custom bay window 4-6 week lead time.',
    createdAt: '2026-01-25',
    updatedAt: '2026-02-20',
  },
];

// --- Messages / Chat ---

export const mockChatThreads: ChatThread[] = [
  {
    id: 'thread_001',
    projectId: 'proj_001',
    projectName: 'Tremblay — 742 Rue Saint-Denis',
    participants: [
      { userId: 'usr_client_001', name: 'Jean-Pierre Tremblay', role: 'client' },
      { userId: 'usr_admin_001', name: 'Sarah Mitchell', role: 'admin' },
      { userId: 'usr_contractor_001', name: 'Mike Thompson', role: 'contractor' },
    ],
    lastMessage: 'Windows are in production — expected delivery March 10th.',
    lastMessageAt: '2026-02-20T14:30:00',
    unreadCount: 1,
  },
  {
    id: 'thread_002',
    projectId: 'proj_002',
    projectName: 'Dubois — 123 Blvd des Laurentides',
    participants: [
      { userId: 'usr_admin_001', name: 'Sarah Mitchell', role: 'admin' },
      { userId: 'usr_contractor_001', name: 'Mike Thompson', role: 'contractor' },
    ],
    lastMessage: 'Quote is ready, scheduling consultation visit.',
    lastMessageAt: '2026-02-18T09:15:00',
    unreadCount: 0,
  },
];

export const mockMessages: Message[] = [
  { id: 'msg_001', projectId: 'proj_001', threadId: 'thread_001', senderId: 'usr_admin_001', senderName: 'Sarah Mitchell', senderRole: 'admin', content: 'Hi Jean-Pierre, just confirming the measurement visit for Dec 5th at 9 AM. Mike will be there.', attachments: [], isInternal: false, createdAt: '2025-12-01T10:00:00' },
  { id: 'msg_002', projectId: 'proj_001', threadId: 'thread_001', senderId: 'usr_client_001', senderName: 'Jean-Pierre Tremblay', senderRole: 'client', content: 'Perfect, I\'ll be home. Do I need to move any furniture?', attachments: [], isInternal: false, createdAt: '2025-12-01T11:30:00' },
  { id: 'msg_003', projectId: 'proj_001', threadId: 'thread_001', senderId: 'usr_contractor_001', senderName: 'Mike Thompson', senderRole: 'contractor', content: 'Just need clear access to windows — about 2 feet clearance. I\'ll bring everything needed.', attachments: [], isInternal: false, createdAt: '2025-12-01T14:00:00' },
  { id: 'msg_004', projectId: 'proj_001', threadId: 'thread_001', senderId: 'usr_admin_001', senderName: 'Sarah Mitchell', senderRole: 'admin', content: 'Windows are in production — expected delivery March 10th. I\'ll send install scheduling options soon.', attachments: [], isInternal: false, createdAt: '2026-02-20T14:30:00' },
  { id: 'msg_005', projectId: 'proj_001', threadId: 'thread_001', senderId: 'usr_contractor_001', senderName: 'Mike Thompson', senderRole: 'contractor', content: '[INTERNAL] Bay window rough opening is tighter than expected. May need custom shims — factor into install time.', attachments: [], isInternal: true, createdAt: '2025-12-05T16:00:00' },
];

// --- Invoices ---

export const mockInvoices: Invoice[] = [
  {
    id: 'inv_001',
    invoiceNumber: 'INV-VEREX-2026-0001',
    projectId: 'proj_001',
    clientId: 'usr_client_001',
    clientName: 'Jean-Pierre Tremblay',
    clientAddress: '742 Rue Saint-Denis',
    clientCity: 'Montreal, QC H2X 3K6',
    items: [
      { description: 'Casement Windows (Kitchen) — Dual-pane Low-E Argon', quantity: 2, unitPrice: 1200, total: 2400 },
      { description: 'Bay Window (Living Room) — Triple-pane, Oak interior', quantity: 1, unitPrice: 4500, total: 4500 },
      { description: 'Casement Windows (Master Bedroom)', quantity: 2, unitPrice: 980, total: 1960 },
      { description: 'Patio Door (Dining Room) — Sliding, built-in blinds', quantity: 1, unitPrice: 3800, total: 3800 },
      { description: 'Professional Installation Labour', quantity: 1, unitPrice: 8500, total: 8500 },
      { description: 'Materials, Hardware & Sealants', quantity: 1, unitPrice: 2340, total: 2340 },
    ],
    subtotal: 23500,
    taxGST: 1175,
    taxQST: 2344.13,
    tax: 3519.13,
    total: 27019.13,
    depositPaid: 7350,
    balanceDue: 19669.13,
    status: 'sent',
    issueDate: '2026-02-10',
    dueDate: '2026-04-15',
    sentDate: '2026-02-10',
    paymentTerms: 'Net 30',
    notes: 'Balance due upon installation completion. E-transfer accepted.',
    createdAt: '2026-02-10',
  },
  {
    id: 'inv_002',
    invoiceNumber: 'INV-VEREX-2026-0002',
    projectId: 'proj_002',
    clientId: 'usr_client_002',
    clientName: 'Marie-Claire Dubois',
    clientAddress: '1590 Boulevard René-Lévesque O',
    clientCity: 'Montreal, QC H3G 1T7',
    items: [
      { description: 'Double Hung Windows (x6) — Vinyl white', quantity: 6, unitPrice: 680, total: 4080 },
      { description: 'Entry Door — Fibreglass, sidelite panel', quantity: 1, unitPrice: 2800, total: 2800 },
      { description: 'Installation Labour', quantity: 1, unitPrice: 4200, total: 4200 },
      { description: 'Trim & Finishing Package', quantity: 1, unitPrice: 950, total: 950 },
    ],
    subtotal: 12030,
    taxGST: 601.50,
    taxQST: 1199.99,
    tax: 1801.49,
    total: 13831.49,
    depositPaid: 4000,
    balanceDue: 9831.49,
    status: 'paid',
    issueDate: '2026-01-15',
    dueDate: '2026-02-15',
    sentDate: '2026-01-15',
    paidDate: '2026-02-12',
    paidMethod: 'E-Transfer',
    paymentTerms: 'Net 30',
    notes: 'Paid in full — thank you.',
    createdAt: '2026-01-15',
  },
  {
    id: 'inv_003',
    invoiceNumber: 'INV-VEREX-2026-0003',
    projectId: 'proj_003',
    clientId: 'usr_client_003',
    clientName: 'Robert Lafleur',
    clientAddress: '88 Avenue du Parc',
    clientCity: 'Laval, QC H7N 3X5',
    items: [
      { description: 'Awning Windows (Bathroom x2)', quantity: 2, unitPrice: 520, total: 1040 },
      { description: 'Fixed Picture Window (Stairwell)', quantity: 1, unitPrice: 1650, total: 1650 },
      { description: 'Installation Labour', quantity: 1, unitPrice: 1800, total: 1800 },
    ],
    subtotal: 4490,
    taxGST: 224.50,
    taxQST: 447.88,
    tax: 672.38,
    total: 5162.38,
    depositPaid: 1500,
    balanceDue: 3662.38,
    status: 'overdue',
    issueDate: '2026-01-05',
    dueDate: '2026-02-05',
    sentDate: '2026-01-05',
    paymentTerms: 'Net 30',
    notes: 'OVERDUE — Please remit payment immediately.',
    createdAt: '2026-01-05',
  },
  {
    id: 'inv_004',
    invoiceNumber: 'INV-VEREX-2026-0004',
    projectId: 'proj_001',
    clientId: 'usr_client_001',
    clientName: 'Jean-Pierre Tremblay',
    clientAddress: '742 Rue Saint-Denis',
    clientCity: 'Montreal, QC H2X 3K6',
    items: [
      { description: 'Change Order: Upgrade to Triple-Pane (Kitchen)', quantity: 2, unitPrice: 350, total: 700 },
      { description: 'Additional hardware — premium handles', quantity: 4, unitPrice: 85, total: 340 },
    ],
    subtotal: 1040,
    taxGST: 52,
    taxQST: 103.74,
    tax: 155.74,
    total: 1195.74,
    depositPaid: 0,
    balanceDue: 1195.74,
    status: 'draft',
    issueDate: '2026-02-25',
    dueDate: '2026-03-27',
    paymentTerms: 'Net 30',
    notes: 'Supplementary invoice for approved change order.',
    createdAt: '2026-02-25',
  },
];

// --- Commissions ---

export const mockCommissions: Commission[] = [
  {
    id: 'comm_001',
    partnerId: 'ptr_001',
    projectId: 'proj_001',
    projectTotal: 24500,
    commissionRate: 0.15,
    commissionAmount: 3675,
    status: 'pending',
  },
];

// --- Contracts ---

export const mockContracts: Contract[] = [
  {
    id: 'cont_001',
    contractNumber: 'CONT-VEREX-2026-0001',
    projectId: 'proj_001',
    clientName: 'Jean-Pierre Tremblay',
    clientAddress: '742 Rue Saint-Denis',
    clientCity: 'Montreal, QC H2X 3K6',
    scopeItems: [
      { description: 'Casement Windows — Triple-pane Low-E Argon (Kitchen)', quantity: 2, specifications: '36"W × 48"H, White, Colonial Grid, Brushed Nickel Hardware' },
      { description: 'Bay Window — Triple-pane, Oak Interior (Living Room)', quantity: 1, specifications: '96"W × 60"H, White, Prairie Grid, Brushed Nickel Hardware' },
      { description: 'Casement Windows — Double-pane (Master Bedroom)', quantity: 2, specifications: '30"W × 48"H, White, No Grid, Chrome Hardware' },
      { description: 'Patio Door — Sliding, Triple-pane (Dining Room)', quantity: 1, specifications: '72"W × 80"H, White, No Grid, Brushed Nickel Hardware' },
      { description: 'Professional Installation — Complete removal, install, insulation, trim', quantity: 1, specifications: '2-day install, 2 crew members, includes disposal of old units' },
    ],
    totalValue: 27019.13,
    paymentSchedule: [
      { milestone: 'Contract Signing — Deposit', percentage: 30, amount: 8105.74, dueDate: '2025-12-18', status: 'paid' },
      { milestone: 'Product Delivery Confirmation', percentage: 40, amount: 10807.65, dueDate: '2026-03-10', status: 'pending' },
      { milestone: 'Installation Completion & Verification', percentage: 30, amount: 8105.74, dueDate: '2026-03-20', status: 'pending' },
    ],
    startDate: '2026-03-15',
    completionDate: '2026-03-17',
    warrantyYears: 5,
    terms: [
      'All work shall conform to the Quebec Building Code (CCQ) and National Building Code of Canada.',
      'The Contractor holds a valid RBQ licence (#5678-9012-34) and carries comprehensive liability insurance.',
      'The Client authorizes the Contractor to perform all described work at the above address.',
      'Changes to the scope of work must be documented in writing and signed by both parties before execution.',
      'The Contractor warrants all installation work for a period of 5 years from completion date.',
      'Manufacturer product warranties apply separately and are transferred to the Client upon installation.',
      'Either party may cancel this contract within 10 business days of signing without penalty (Consumer Protection Act, s.59).',
      'Force majeure events (acts of God, pandemics, supply chain disruptions) may extend timelines without liability.',
      'Disputes shall be resolved through mediation before any legal proceedings, governed by the laws of Quebec.',
      'All prices include applicable GST/TPS (5%) and QST/TVQ (9.975%).',
    ],
    status: 'signed',
    signedDate: '2025-12-18',
    notes: 'Client signed at consultation. Deposit received via E-Transfer.',
    createdAt: '2025-12-15',
  },
  {
    id: 'cont_002',
    contractNumber: 'CONT-VEREX-2026-0002',
    projectId: 'proj_002',
    clientName: 'Marie Dubois',
    clientAddress: '123 Boulevard des Laurentides',
    clientCity: 'Laval, QC H7G 2T1',
    scopeItems: [
      { description: 'Casement Windows — Double-pane (Kitchen)', quantity: 3, specifications: '36"W × 48"H, Sandstone, Colonial Grid, Brass Hardware' },
      { description: 'Picture Window — Double-pane (Living Room)', quantity: 1, specifications: '60"W × 48"H, Sandstone, Prairie Grid, Brass Hardware' },
      { description: 'Professional Installation', quantity: 1, specifications: '1-day install, includes trim finishing' },
    ],
    totalValue: 8967.83,
    paymentSchedule: [
      { milestone: 'Contract Signing — Deposit', percentage: 30, amount: 2690.35, dueDate: '2026-03-01', status: 'pending' },
      { milestone: 'Installation Completion', percentage: 70, amount: 6277.48, dueDate: '2026-04-15', status: 'pending' },
    ],
    startDate: '2026-04-10',
    completionDate: '2026-04-10',
    warrantyYears: 5,
    terms: [
      'All work shall conform to the Quebec Building Code (CCQ) and National Building Code of Canada.',
      'The Contractor holds a valid RBQ licence (#5678-9012-34) and carries comprehensive liability insurance.',
      'The Client authorizes the Contractor to perform all described work at the above address.',
      'Changes to the scope of work must be documented in writing and signed by both parties before execution.',
      'The Contractor warrants all installation work for a period of 5 years from completion date.',
      'Manufacturer product warranties apply separately and are transferred to the Client upon installation.',
      'Either party may cancel this contract within 10 business days of signing without penalty (Consumer Protection Act, s.59).',
      'Disputes shall be resolved through mediation before any legal proceedings, governed by the laws of Quebec.',
    ],
    status: 'draft',
    notes: 'Pending consultation visit Mar 1.',
    createdAt: '2026-02-20',
  },
];

// --- Notifications ---

export const mockNotifications: Notification[] = [
  { id: 'notif_001', userId: 'usr_admin_001', title: 'New Lead', message: 'Andrew Chen submitted a commercial inquiry via phone.', type: 'info', link: '/portal/dashboard/leads', read: false, createdAt: '2026-02-23T09:00:00' },
  { id: 'notif_002', userId: 'usr_admin_001', title: 'Urgent Lead', message: 'Sophie Martin — emergency patio door replacement from Home Depot.', type: 'warning', link: '/portal/dashboard/leads', read: false, createdAt: '2026-02-20T15:30:00' },
  { id: 'notif_003', userId: 'usr_contractor_001', title: 'New Assignment', message: 'You\'ve been assigned to Sophie Martin — measurement visit Feb 28.', type: 'action', link: '/portal/dashboard/appointments', read: false, createdAt: '2026-02-24T08:00:00' },
  { id: 'notif_004', userId: 'usr_client_001', title: 'Production Update', message: 'Your windows are now in production. Estimated delivery: March 10.', type: 'success', link: '/portal/dashboard/projects', read: false, createdAt: '2026-02-20T14:30:00' },
  { id: 'notif_005', userId: 'usr_supplier_001', title: 'New Order', message: 'Order ORD-001 received — 7 items, rush production requested.', type: 'action', link: '/portal/dashboard/orders', read: true, createdAt: '2026-01-25T10:00:00' },
  { id: 'notif_006', userId: 'usr_partner_001', title: 'Lead Update', message: 'Tremblay project now in production — on track for spring install.', type: 'info', link: '/portal/dashboard/leads', read: false, createdAt: '2026-02-20T15:00:00' },
];

// --- Helper Functions ---

export function getLeadsByRole(userId: string, role: string): Lead[] {
  switch (role) {
    case 'admin':
      return mockLeads;
    case 'partner':
      const user = mockUsers.find(u => u.id === userId);
      return mockLeads.filter(l => l.partnerId === user?.partnerId);
    case 'contractor':
      return mockLeads.filter(l => l.assignedTo === userId);
    default:
      return [];
  }
}

export function getProjectsByRole(userId: string, role: string): Project[] {
  switch (role) {
    case 'admin':
      return mockProjects;
    case 'client':
      return mockProjects.filter(p => p.clientId === userId);
    case 'contractor':
      return mockProjects.filter(p => p.assignedContractor === userId);
    case 'inspector':
      return mockProjects.filter(p => p.assignedInspector === userId);
    case 'partner':
      const user = mockUsers.find(u => u.id === userId);
      return mockProjects.filter(p => p.partnerId === user?.partnerId);
    default:
      return [];
  }
}

export function getAppointmentsByRole(userId: string, role: string): Appointment[] {
  switch (role) {
    case 'admin':
      return mockAppointments;
    case 'client':
      // Get client's project IDs first
      const clientProjects = mockProjects.filter(p => p.clientId === userId).map(p => p.id);
      return mockAppointments.filter(a => clientProjects.includes(a.projectId));
    case 'contractor':
    case 'inspector':
      return mockAppointments.filter(a => a.assignedTo === userId);
    default:
      return [];
  }
}

export function getNotificationsByUser(userId: string): Notification[] {
  return mockNotifications.filter(n => n.userId === userId);
}

export function getOrdersByRole(userId: string, role: string): Order[] {
  switch (role) {
    case 'admin':
      return mockOrders;
    case 'supplier':
      return mockOrders.filter(o => o.supplierId === userId);
    default:
      return [];
  }
}

export function getThreadsByRole(userId: string, role: string): ChatThread[] {
  switch (role) {
    case 'admin':
      return mockChatThreads;
    default:
      return mockChatThreads.filter(t =>
        t.participants.some(p => p.userId === userId)
      );
  }
}

export function getInvoicesByRole(userId: string, role: string): Invoice[] {
  switch (role) {
    case 'admin':
      return mockInvoices;
    case 'client':
      return mockInvoices.filter(i => i.clientId === userId);
    default:
      return [];
  }
}

export function getCommissionsByPartner(userId: string): Commission[] {
  const user = mockUsers.find(u => u.id === userId);
  return mockCommissions.filter(c => c.partnerId === user?.partnerId);
}

// --- Timeline Events (Enhanced v2 — 5-tier visibility) ---

export const mockTimelineEvents: TimelineEvent[] = [
  // proj_001 — Tremblay full journey
  { id: 'tl_001', projectId: 'proj_001', timestamp: '2025-11-15T09:00:00', actorId: 'system', actorName: 'Home Depot API', actorRole: 'system', eventType: 'lead_created', title: 'Lead imported from Home Depot', visibility: 'internal', notes: 'Source: Home Depot Laval. Partner: David Wilson. Priority: High.', expandedNotes: 'Auto-imported via partner integration. Lead scored as HIGH based on project scope (full home, 14 openings) and partner priority flag. Source reference: HD-MTL-2025-4421.' },
  { id: 'tl_002', projectId: 'proj_001', timestamp: '2025-11-16T10:30:00', actorId: 'usr_admin_001', actorName: 'Sarah Mitchell', actorRole: 'admin', eventType: 'contact_attempt', title: 'Initial contact — phone call', visibility: 'internal', notes: 'Spoke with Jean-Pierre. Full home window replacement. 12 windows + 2 patio doors.', expandedNotes: 'Call duration: 18 min. Client very engaged. Wants energy efficiency. Current windows are 25+ years old, single pane aluminum. Has flexibility on colors but prefers white. Budget not discussed yet — will present quote after measurement. Client available most weekdays.' },
  { id: 'tl_003', projectId: 'proj_001', timestamp: '2025-11-18T11:00:00', actorId: 'usr_admin_001', actorName: 'Sarah Mitchell', actorRole: 'admin', eventType: 'assignment_changed', title: 'Assigned contractor: Mike Thompson', visibility: 'admin_contractor', notes: 'Mike has availability and experience with full-home projects.', expandedNotes: 'Selected Mike over two other available contractors due to: (1) proximity to Montreal East, (2) 98% client satisfaction on similar scope jobs, (3) availability in December for measurement.' },
  { id: 'tl_004', projectId: 'proj_001', timestamp: '2025-11-20T09:00:00', actorId: 'usr_admin_001', actorName: 'Sarah Mitchell', actorRole: 'admin', eventType: 'stage_changed', title: 'Lead converted to project', visibility: 'client_hidden', notes: 'Created project PRJ-001 from lead.', previousStage: 'lead_received', newStage: 'contacted' },
  { id: 'tl_005', projectId: 'proj_001', timestamp: '2025-11-22T14:00:00', actorId: 'usr_admin_001', actorName: 'Sarah Mitchell', actorRole: 'admin', eventType: 'appointment_scheduled', title: 'Measurement visit scheduled', visibility: 'all', notes: 'Dec 5, 2025 at 9:00 AM. Duration: 2 hours.', linkedRecordType: 'appointment', linkedRecordId: 'apt_001', previousStage: 'contacted', newStage: 'appointment_scheduled' },
  { id: 'tl_006', projectId: 'proj_001', timestamp: '2025-12-05T11:30:00', actorId: 'usr_contractor_001', actorName: 'Mike Thompson', actorRole: 'contractor', eventType: 'appointment_completed', title: 'Measurement visit completed', visibility: 'all', notes: 'All 14 openings measured. Photos taken. Client present and cooperative.', linkedRecordType: 'appointment', linkedRecordId: 'apt_001' },
  { id: 'tl_007', projectId: 'proj_001', timestamp: '2025-12-05T12:00:00', actorId: 'usr_contractor_001', actorName: 'Mike Thompson', actorRole: 'contractor', eventType: 'measurement_completed', title: 'Measurements uploaded', visibility: 'all', notes: '4 rooms measured: Kitchen (2), Living Room (1 bay), Master BR (2), Dining Room (1 patio door).', linkedRecordType: 'measurement', linkedRecordId: 'meas_001', attachments: [{ id: 'att_001', name: 'kitchen-window-left.jpg', url: '/uploads/proj_001/kitchen-left.jpg', type: 'photo', visibility: 'all', uploadedBy: 'usr_contractor_001', uploadedAt: '2025-12-05T12:00:00' }, { id: 'att_002', name: 'bay-window-exterior.jpg', url: '/uploads/proj_001/bay-exterior.jpg', type: 'photo', visibility: 'all', uploadedBy: 'usr_contractor_001', uploadedAt: '2025-12-05T12:05:00' }, { id: 'att_003', name: 'measurement-sheet.pdf', url: '/uploads/proj_001/measurements.pdf', type: 'pdf', visibility: 'internal', uploadedBy: 'usr_contractor_001', uploadedAt: '2025-12-05T12:10:00' }], previousStage: 'appointment_scheduled', newStage: 'measured' },
  { id: 'tl_007b', projectId: 'proj_001', timestamp: '2025-12-05T13:00:00', actorId: 'usr_inspector_001', actorName: 'Robert Garcia', actorRole: 'inspector', eventType: 'issue_flagged', title: 'Flagged: Bay window structural concern', visibility: 'internal', notes: 'Load-bearing beam above bay window opening. Recommend structural engineer sign-off before installation.', flagged: true, flagReason: 'Structural concern — bay window header beam may be undersized for new unit weight.', expandedNotes: 'Visual inspection of the header beam above the living room bay window opening reveals potential undersizing. The existing beam appears to be a single 2×8 spanning 96 inches. New triple-glass bay window unit will be approximately 40% heavier. Recommendation: get structural engineer confirmation before proceeding with order. This should NOT delay measurement sign-off but must be resolved before install.' },
  { id: 'tl_008', projectId: 'proj_001', timestamp: '2025-12-05T16:00:00', actorId: 'usr_contractor_001', actorName: 'Mike Thompson', actorRole: 'contractor', eventType: 'note_added', title: 'Bay window — shim clearance note', visibility: 'admin_contractor', notes: 'Rough opening is tighter than expected. May need custom shims — factor into install time.', expandedNotes: 'Rough opening measures 98" wide × 62" tall. Product spec calls for 96" × 60". That gives us only 1" clearance per side instead of the standard 1.5". Will need precision shimming and possibly trim the rough opening by 0.25" on each side. Add 45 min to install time for this window. Already factored into my estimate.' },
  { id: 'tl_008b', projectId: 'proj_001', timestamp: '2025-12-08T10:00:00', actorId: 'usr_admin_001', actorName: 'Sarah Mitchell', actorRole: 'admin', eventType: 'note_added', title: 'Margin analysis — internal', visibility: 'admin_only', notes: 'Project cost breakdown: products $12,660 + labour $4,200 + materials $1,640 = $18,500. Quote $24,500. Margin: 24.5%. HD commission: $3,675.', expandedNotes: 'Product cost from Fenestra: $12,660. Labour estimate (Mike): $4,200 (2 days × 2 crew). Materials/hardware: $1,640. Total cost: $18,500. Client quote: $24,500. Gross margin: $6,000 (24.5%). After HD 15% commission ($3,675): net margin $2,325 (9.5%). This is acceptable for a partner-sourced deal of this size. Volume discount from Fenestra on triple-glass partially offsets the lower margin.' },
  { id: 'tl_009', projectId: 'proj_001', timestamp: '2025-12-10T10:00:00', actorId: 'usr_admin_001', actorName: 'Sarah Mitchell', actorRole: 'admin', eventType: 'quote_created', title: 'Quote prepared', visibility: 'client_hidden', notes: 'Total: $24,500 (products + labour + materials). Triple-glass Energy Star throughout.', previousStage: 'measured', newStage: 'quote_prepared' },
  { id: 'tl_010', projectId: 'proj_001', timestamp: '2025-12-12T09:00:00', actorId: 'usr_admin_001', actorName: 'Sarah Mitchell', actorRole: 'admin', eventType: 'quote_sent', title: 'Quote sent to client', visibility: 'all', notes: 'Deposit required: 30% ($7,350).', attachments: [{ id: 'att_004', name: 'VEREX-Quote-PRJ001.pdf', url: '/uploads/proj_001/quote.pdf', type: 'pdf', visibility: 'all', uploadedBy: 'usr_admin_001', uploadedAt: '2025-12-12T09:00:00' }] },
  { id: 'tl_011', projectId: 'proj_001', timestamp: '2025-12-18T15:00:00', actorId: 'usr_client_001', actorName: 'Jean-Pierre Tremblay', actorRole: 'client', eventType: 'client_approved', title: 'Client approved quote', visibility: 'all', notes: 'Approved all selections. Deposit of $7,350 received via e-transfer.', previousStage: 'quote_prepared', newStage: 'client_approved', attachments: [{ id: 'att_005', name: 'signed-approval.pdf', url: '/uploads/proj_001/approval.pdf', type: 'signature', visibility: 'all', uploadedBy: 'usr_client_001', uploadedAt: '2025-12-18T15:00:00' }] },
  { id: 'tl_012', projectId: 'proj_001', timestamp: '2025-12-19T10:00:00', actorId: 'system', actorName: 'System', actorRole: 'system', eventType: 'payment_received', title: 'Deposit payment received', visibility: 'all', notes: '$7,350 deposit confirmed. E-transfer ref: VRX-DEP-20251219.', metadata: { amount: '7350', method: 'e-transfer' }, attachments: [{ id: 'att_006', name: 'e-transfer-receipt.pdf', url: '/uploads/proj_001/receipt-dep.pdf', type: 'receipt', visibility: 'all', uploadedBy: 'system', uploadedAt: '2025-12-19T10:00:00' }] },
  { id: 'tl_013', projectId: 'proj_001', timestamp: '2026-01-25T10:00:00', actorId: 'usr_admin_001', actorName: 'Sarah Mitchell', actorRole: 'admin', eventType: 'order_placed', title: 'Purchase order sent to supplier', visibility: 'client_hidden', notes: 'Order ORD-001: Fenestra Glass Corp. 7 items, rush production. ETA: March 10.', linkedRecordType: 'order', linkedRecordId: 'ord_001', previousStage: 'client_approved', newStage: 'ordered_to_supplier', attachments: [{ id: 'att_007', name: 'PO-ORD001-Fenestra.pdf', url: '/uploads/proj_001/po-001.pdf', type: 'document', visibility: 'client_hidden', uploadedBy: 'usr_admin_001', uploadedAt: '2026-01-25T10:00:00' }] },
  { id: 'tl_014', projectId: 'proj_001', timestamp: '2026-01-27T14:00:00', actorId: 'usr_supplier_001', actorName: 'Lisa Chen', actorRole: 'supplier', eventType: 'supplier_confirmed', title: 'Supplier confirmed order', visibility: 'client_hidden', notes: 'All items confirmed. Custom bay 4-6 weeks. Standard items 2-3 weeks.', expandedNotes: 'Fenestra order confirmation #FEN-2026-0891. All 7 line items accepted. Bay window enters custom fabrication queue — position #4. Standard casements and patio door on regular production. Delivery to our Montreal warehouse. Contact for updates: production@fenestra.ca' },
  { id: 'tl_015', projectId: 'proj_001', timestamp: '2026-02-10T09:00:00', actorId: 'usr_admin_001', actorName: 'Sarah Mitchell', actorRole: 'admin', eventType: 'invoice_issued', title: 'Invoice INV-001 generated', visibility: 'all', notes: 'Total: $27,025 (incl. tax). Deposit applied: $7,350. Balance: $19,675. Due: Apr 15.', linkedRecordType: 'invoice', linkedRecordId: 'inv_001' },
  { id: 'tl_015b', projectId: 'proj_001', timestamp: '2026-02-12T11:00:00', actorId: 'usr_partner_001', actorName: 'David Wilson', actorRole: 'partner', eventType: 'partner_verified', title: 'Partner verification checkpoint', visibility: 'client_hidden', notes: 'Home Depot confirmed project progression. Measurements verified, quote approved by client, order placed. On track for spring install.', expandedNotes: 'Partner verification #3 of 5 for this project. Previous checkpoints: (1) lead accepted, (2) measurement completed. This checkpoint: order confirmed. Remaining: (4) installation complete, (5) final client sign-off. Commission tracking: $3,675 pending, triggers on checkpoint 5 completion.' },
  { id: 'tl_016', projectId: 'proj_001', timestamp: '2026-02-15T11:00:00', actorId: 'usr_supplier_001', actorName: 'Lisa Chen', actorRole: 'supplier', eventType: 'production_started', title: 'Production started', visibility: 'all', notes: 'All items in production. Bay window custom fabrication underway.', previousStage: 'ordered_to_supplier', newStage: 'in_production' },
  { id: 'tl_017', projectId: 'proj_001', timestamp: '2026-02-20T14:30:00', actorId: 'usr_admin_001', actorName: 'Sarah Mitchell', actorRole: 'admin', eventType: 'production_update', title: 'Production update — on track', visibility: 'all', notes: 'Supplier confirms on schedule. Expected delivery March 10. Install date being scheduled.' },
  { id: 'tl_017b', projectId: 'proj_001', timestamp: '2026-02-22T09:00:00', actorId: 'usr_admin_001', actorName: 'Sarah Mitchell', actorRole: 'admin', eventType: 'install_scheduled', title: 'Installation scheduled — March 15', visibility: 'all', notes: 'Full-day installation. 2 crew members. Client confirmed availability.', linkedRecordType: 'appointment', linkedRecordId: 'apt_002', newStage: 'in_production' },

  // proj_002 — Dubois journey
  { id: 'tl_018', projectId: 'proj_002', timestamp: '2026-01-10T12:00:00', actorId: 'system', actorName: 'Website', actorRole: 'system', eventType: 'lead_created', title: 'Lead received via website', visibility: 'internal', notes: 'Marie Dubois submitted inquiry for casement windows.' },
  { id: 'tl_019', projectId: 'proj_002', timestamp: '2026-01-12T10:00:00', actorId: 'usr_admin_001', actorName: 'Sarah Mitchell', actorRole: 'admin', eventType: 'contact_attempt', title: 'Initial contact — phone call', visibility: 'internal', notes: 'Spoke with Marie. Budget ~$8,000. Prefers sandstone to match brick exterior.' },
  { id: 'tl_020', projectId: 'proj_002', timestamp: '2026-01-15T09:00:00', actorId: 'usr_admin_001', actorName: 'Sarah Mitchell', actorRole: 'admin', eventType: 'stage_changed', title: 'Lead converted to project', visibility: 'client_hidden', notes: 'Created project PRJ-002. Assigned contractor Mike Thompson.', previousStage: 'lead_received', newStage: 'contacted' },
  { id: 'tl_021', projectId: 'proj_002', timestamp: '2026-02-10T11:00:00', actorId: 'usr_admin_001', actorName: 'Sarah Mitchell', actorRole: 'admin', eventType: 'quote_created', title: 'Quote prepared', visibility: 'client_hidden', notes: 'Total: $7,800. Sandstone casement ×3 + picture window.', previousStage: 'contacted', newStage: 'quote_prepared' },
  { id: 'tl_022', projectId: 'proj_002', timestamp: '2026-02-18T09:15:00', actorId: 'usr_admin_001', actorName: 'Sarah Mitchell', actorRole: 'admin', eventType: 'appointment_scheduled', title: 'Consultation visit scheduled', visibility: 'all', notes: 'Mar 1, 2026 at 2:00 PM. Present quote and discuss options.', linkedRecordType: 'appointment', linkedRecordId: 'apt_003' },
];

export function getTimelineByProject(projectId: string, userRole: string): TimelineEvent[] {
  const role = userRole as UserRole;
  return mockTimelineEvents
    .filter(e => e.projectId === projectId)
    .filter(e => {
      const vis = e.visibility || 'all';
      const allowedRoles = VISIBILITY_RULES[vis];
      return allowedRoles?.includes(role) ?? false;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getProjectById(projectId: string): Project | undefined {
  return mockProjects.find(p => p.id === projectId);
}

export function getOrdersByProject(projectId: string): Order[] {
  return mockOrders.filter(o => o.projectId === projectId);
}

export function getAppointmentsByProject(projectId: string): Appointment[] {
  return mockAppointments.filter(a => a.projectId === projectId);
}

export function getMeasurementsByProject(projectId: string): MeasurementEntry[] {
  return mockMeasurements.filter(m => m.projectId === projectId);
}

export function getInvoicesByProject(projectId: string): Invoice[] {
  return mockInvoices.filter(i => i.projectId === projectId);
}

export function getMessagesByProject(projectId: string, userRole: string): Message[] {
  return mockMessages
    .filter(m => m.projectId === projectId)
    .filter(m => userRole === 'admin' || userRole === 'contractor' || !m.isInternal)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

// --- Timeline by Lead ---
export function getTimelineByLead(leadId: string, userRole: string): TimelineEvent[] {
  const role = userRole as UserRole;
  const lead = mockLeads.find(l => l.id === leadId);
  if (!lead) return [];
  // Get events from linked project + lead-stage events
  const projectIds = lead.projectId ? [lead.projectId] : [];
  const leadEventTypes: string[] = ['lead_created', 'contact_attempt', 'assignment_changed', 'appointment_scheduled', 'stage_changed'];
  return mockTimelineEvents
    .filter(e => projectIds.includes(e.projectId) && leadEventTypes.includes(e.eventType))
    .filter(e => {
      const vis = e.visibility || 'all';
      const allowedRoles = VISIBILITY_RULES[vis];
      return allowedRoles?.includes(role) ?? false;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// --- Timeline by Client (cross-project) ---
export function getTimelineByClient(clientId: string, userRole: string): TimelineEvent[] {
  const role = userRole as UserRole;
  const clientProjects = mockProjects.filter(p => p.clientId === clientId);
  const projectIds = clientProjects.map(p => p.id);
  return mockTimelineEvents
    .filter(e => projectIds.includes(e.projectId))
    .filter(e => {
      const vis = e.visibility || 'all';
      const allowedRoles = VISIBILITY_RULES[vis];
      return allowedRoles?.includes(role) ?? false;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// --- Universal timeline (all events, admin) ---
export function getUniversalTimeline(userRole: string): TimelineEvent[] {
  const role = userRole as UserRole;
  return mockTimelineEvents
    .filter(e => {
      const vis = e.visibility || 'all';
      const allowedRoles = VISIBILITY_RULES[vis];
      return allowedRoles?.includes(role) ?? false;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// --- Get searchable entities for context selector ---
export function getSearchableLeads() {
  return mockLeads.map(l => ({ id: l.id, label: `${l.clientName} — ${l.address}`, stage: l.stage }));
}
export function getSearchableClients() {
  const clientUsers = mockUsers.filter(u => u.role === 'client');
  return clientUsers.map(u => ({ id: u.id, label: u.name, email: u.email }));
}
export function getSearchableProjects() {
  return mockProjects.map(p => ({ id: p.id, label: `${p.clientName} — ${p.address}`, stage: p.stage }));
}
