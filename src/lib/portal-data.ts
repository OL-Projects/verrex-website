// ============================================================
// VERREX PORTAL — Mock Data Store (Phase 1)
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
  Notification,
  Partner,
  PortalUser,
} from '@/types/portal';

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
  { id: 'usr_admin_001', email: 'admin@verrex.com', name: 'Sarah Mitchell', role: 'admin', phone: '(514) 555-0100', createdAt: '2025-01-15', lastLogin: '2026-02-25' },
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
    projectId: 'proj_001',
    clientId: 'usr_client_001',
    clientName: 'Jean-Pierre Tremblay',
    items: [
      { description: 'Casement Windows x2 — Kitchen', quantity: 2, unitPrice: 1200, total: 2400 },
      { description: 'Bay Window — Living Room', quantity: 1, unitPrice: 4500, total: 4500 },
      { description: 'Casement Windows x2 — Master BR', quantity: 2, unitPrice: 980, total: 1960 },
      { description: 'Patio Door — Dining Room', quantity: 1, unitPrice: 3800, total: 3800 },
      { description: 'Installation Labour', quantity: 1, unitPrice: 8500, total: 8500 },
      { description: 'Materials & Hardware', quantity: 1, unitPrice: 2340, total: 2340 },
    ],
    subtotal: 23500,
    tax: 3525,
    total: 27025,
    depositPaid: 7350,
    balanceDue: 19675,
    status: 'sent',
    dueDate: '2026-04-15',
    createdAt: '2026-02-10',
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
