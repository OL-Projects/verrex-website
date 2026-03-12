// ============================================================
// VEREX PORTAL — Core Type Definitions
// ============================================================

// --- Enums ---

export type UserRole = 'client' | 'admin' | 'contractor' | 'supplier' | 'partner' | 'inspector';

export type LeadSource = 'home_depot' | 'website' | 'referral' | 'phone' | 'walk_in';

export type LeadPriority = 'low' | 'medium' | 'high' | 'urgent';

export type AppointmentType = 'consultation' | 'measurement' | 'inspection' | 'installation' | 'verification' | 'follow_up';

export type PipelineStage =
  | 'lead_received'
  | 'contacted'
  | 'appointment_scheduled'
  | 'measured'
  | 'quote_prepared'
  | 'client_approved'
  | 'ordered_to_supplier'
  | 'in_production'
  | 'shipped'
  | 'delivered'
  | 'install_scheduled'
  | 'installed'
  | 'completion_verified'
  | 'payment_received'
  | 'closed';

export type OrderStatus = 'quoted' | 'approved' | 'ordered' | 'confirmed' | 'production' | 'shipped' | 'delivered';

export type WindowType = 'casement' | 'awning' | 'fixed' | 'single_hung' | 'double_hung' | 'slider' | 'bay' | 'bow' | 'picture' | 'patio_door' | 'entry_door' | 'french_door';

export type GlassType = 'double' | 'triple' | 'low_e' | 'argon' | 'tempered' | 'laminated' | 'frosted' | 'tinted';

export type OpeningDirection = 'left' | 'right' | 'inswing' | 'outswing';

export type TimelineVisibility =
  | 'all'              // Every logged-in user sees this
  | 'client_hidden'    // Everyone except client (admin, contractor, inspector, supplier, partner)
  | 'internal'         // Admin + contractor + inspector only
  | 'admin_contractor' // Admin + contractor only
  | 'admin_only';      // Admin only (audit, cost, overrides)

export type TimelineEventType =
  | 'lead_created'
  | 'contact_attempt'
  | 'appointment_scheduled'
  | 'appointment_rescheduled'
  | 'appointment_completed'
  | 'measurement_completed'
  | 'quote_created'
  | 'quote_sent'
  | 'client_approved'
  | 'client_declined'
  | 'order_placed'
  | 'supplier_confirmed'
  | 'production_started'
  | 'production_update'
  | 'shipped'
  | 'delivered'
  | 'install_scheduled'
  | 'install_started'
  | 'install_completed'
  | 'verification_completed'
  | 'invoice_issued'
  | 'payment_received'
  | 'client_closeout'
  | 'assignment_changed'
  | 'stage_changed'
  | 'note_added'
  | 'document_uploaded'
  | 'photo_uploaded'
  | 'issue_flagged'
  | 'partner_verified'
  | 'system_event';

export type TimelineContextType = 'lead' | 'client' | 'project';

export type AttachmentType = 'photo' | 'video' | 'audio' | 'pdf' | 'document' | 'receipt' | 'signature';

export interface TimelineAttachment {
  id: string;
  name: string;
  url: string;
  type: AttachmentType;
  size?: number;
  visibility: TimelineVisibility;
  uploadedBy: string;
  uploadedAt: string;
}

// --- Interfaces ---

export interface PortalUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  partnerId?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface Partner {
  id: string;
  name: string;
  logo?: string;
  commissionRate: number; // e.g. 0.15 for 15%
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  active: boolean;
}

export interface Lead {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  address: string;
  city: string;
  postalCode: string;
  source: LeadSource;
  partnerId?: string;
  priority: LeadPriority;
  notes: string;
  assignedTo?: string; // contractor userId
  projectId?: string; // converted to project
  stage: PipelineStage;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  leadId: string;
  clientId: string;
  clientName: string;
  address: string;
  city: string;
  stage: PipelineStage;
  assignedContractor?: string;
  assignedInspector?: string;
  partnerId?: string;
  totalValue: number;
  depositPaid: number;
  balanceDue: number;
  products: ProjectProduct[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectProduct {
  id: string;
  location: string; // "Kitchen", "Master Bedroom", etc.
  windowType: WindowType;
  width: number; // inches
  height: number; // inches
  color: string;
  glassType: GlassType;
  gridStyle: string;
  hardware: string;
  openingDirection?: OpeningDirection;
  notes: string;
  quantity: number;
  unitPrice: number;
}

export interface Appointment {
  id: string;
  projectId: string;
  clientName: string;
  address: string;
  type: AppointmentType;
  date: string;
  time: string;
  duration: number; // minutes
  assignedTo: string; // userId
  assignedName: string;
  notes: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
}

export interface MeasurementEntry {
  id: string;
  projectId: string;
  appointmentId?: string;
  location: string;
  windowType: WindowType;
  widthRoughOpening: number;
  heightRoughOpening: number;
  widthExact: number;
  heightExact: number;
  color: string;
  glassType: GlassType;
  gridStyle: string;
  hardware: string;
  openingDirection?: OpeningDirection;
  photos: string[];
  attachments: string[];
  notes: string;
  measuredBy: string;
  measuredAt: string;
}

export interface Order {
  id: string;
  projectId: string;
  supplierId: string;
  supplierName: string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  trackingNumber?: string;
  estimatedDelivery?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productDescription: string;
  windowType: WindowType;
  width: number;
  height: number;
  color: string;
  glassType: GlassType;
  quantity: number;
  unitPrice: number;
}

export interface Message {
  id: string;
  projectId: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  attachments: string[];
  isInternal: boolean; // internal notes not visible to client
  createdAt: string;
}

export interface ChatThread {
  id: string;
  projectId: string;
  projectName: string;
  participants: { userId: string; name: string; role: UserRole }[];
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  projectId: string;
  clientId: string;
  clientName: string;
  clientAddress: string;
  clientCity: string;
  items: InvoiceItem[];
  subtotal: number;
  taxGST: number;
  taxQST: number;
  tax: number;
  total: number;
  depositPaid: number;
  balanceDue: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'void';
  issueDate: string;
  dueDate: string;
  paymentTerms: string;
  notes: string;
  paidDate?: string;
  paidMethod?: string;
  sentDate?: string;
  createdAt: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Contract {
  id: string;
  contractNumber: string;
  projectId: string;
  clientName: string;
  clientAddress: string;
  clientCity: string;
  scopeItems: ContractScopeItem[];
  totalValue: number;
  paymentSchedule: ContractPayment[];
  startDate: string;
  completionDate: string;
  warrantyYears: number;
  terms: string[];
  status: 'draft' | 'sent' | 'signed' | 'active' | 'completed' | 'void';
  signedDate?: string;
  notes: string;
  createdAt: string;
}

export interface ContractScopeItem {
  description: string;
  quantity: number;
  specifications: string;
}

export interface ContractPayment {
  milestone: string;
  percentage: number;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid';
}

export interface Commission {
  id: string;
  partnerId: string;
  projectId: string;
  projectTotal: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'pending' | 'verified' | 'paid';
  verifiedAt?: string;
  paidAt?: string;
}

export interface TimelineEvent {
  id: string;
  projectId: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole | 'system';
  eventType: TimelineEventType;
  title: string;
  visibility: TimelineVisibility;
  notes?: string;
  expandedNotes?: string;
  attachments?: TimelineAttachment[];
  previousStage?: PipelineStage;
  newStage?: PipelineStage;
  linkedRecordType?: 'appointment' | 'order' | 'measurement' | 'invoice';
  linkedRecordId?: string;
  flagged?: boolean;
  flagReason?: string;
  metadata?: Record<string, string>;
  /** @deprecated Use visibility instead */
  isInternal?: boolean;
}

// Visibility check helper — which roles can see which visibility level
export const VISIBILITY_RULES: Record<TimelineVisibility, UserRole[]> = {
  all: ['admin', 'client', 'contractor', 'inspector', 'supplier', 'partner'],
  client_hidden: ['admin', 'contractor', 'inspector', 'supplier', 'partner'],
  internal: ['admin', 'contractor', 'inspector'],
  admin_contractor: ['admin', 'contractor'],
  admin_only: ['admin'],
};

// Client-friendly event labels (used when rendering for clients)
export const CLIENT_EVENT_LABELS: Partial<Record<TimelineEventType, string>> = {
  appointment_scheduled: 'Visit Scheduled',
  appointment_completed: 'Visit Completed',
  measurement_completed: 'Measurements Taken',
  quote_created: 'Your Quote is Ready',
  quote_sent: 'Quote Sent to You',
  client_approved: 'You Approved the Quote',
  production_started: 'Your Windows Are Being Made',
  production_update: 'Production Update',
  shipped: 'Your Order Has Shipped',
  delivered: 'Delivery Completed',
  install_scheduled: 'Installation Date Set',
  install_started: 'Installation In Progress',
  install_completed: 'Installation Complete',
  verification_completed: 'Quality Verified',
  invoice_issued: 'Invoice Available',
  payment_received: 'Payment Confirmed',
  client_closeout: 'Project Complete — Thank You!',
};

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'action';
  link?: string;
  read: boolean;
  createdAt: string;
}

// --- Pipeline Config ---

export const PIPELINE_STAGES: { key: PipelineStage; label: string; color: string }[] = [
  { key: 'lead_received', label: 'Lead Received', color: 'bg-gray-400' },
  { key: 'contacted', label: 'Contacted', color: 'bg-blue-400' },
  { key: 'appointment_scheduled', label: 'Appt Scheduled', color: 'bg-blue-500' },
  { key: 'measured', label: 'Measured', color: 'bg-indigo-500' },
  { key: 'quote_prepared', label: 'Quote Prepared', color: 'bg-purple-500' },
  { key: 'client_approved', label: 'Client Approved', color: 'bg-violet-500' },
  { key: 'ordered_to_supplier', label: 'Ordered', color: 'bg-amber-500' },
  { key: 'in_production', label: 'In Production', color: 'bg-orange-500' },
  { key: 'shipped', label: 'Shipped', color: 'bg-cyan-500' },
  { key: 'delivered', label: 'Delivered', color: 'bg-teal-500' },
  { key: 'install_scheduled', label: 'Install Scheduled', color: 'bg-lime-500' },
  { key: 'installed', label: 'Installed', color: 'bg-green-500' },
  { key: 'completion_verified', label: 'Verified', color: 'bg-emerald-500' },
  { key: 'payment_received', label: 'Payment Received', color: 'bg-emerald-600' },
  { key: 'closed', label: 'Closed', color: 'bg-green-700' },
];

// --- Role Permission Map ---

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['*'], // everything
  client: ['view_own_projects', 'view_own_appointments', 'view_own_invoices', 'view_own_messages', 'upload_photos', 'approve_quote'],
  contractor: ['view_assigned_projects', 'update_measurements', 'update_progress', 'upload_photos', 'accept_lead', 'submit_completion'],
  inspector: ['view_assigned_measurements', 'update_measurements', 'upload_photos', 'confirm_readiness'],
  supplier: ['view_assigned_orders', 'update_order_status', 'add_tracking'],
  partner: ['view_sourced_leads', 'view_sourced_projects', 'view_commissions'],
};

// --- Sidebar Nav Config ---

export interface SidebarItem {
  label: string;
  href: string;
  icon: string;
  roles: UserRole[];
  badge?: number;
}

export const SIDEBAR_NAV: SidebarItem[] = [
  { label: 'Dashboard', href: '/portal/dashboard', icon: 'LayoutDashboard', roles: ['admin', 'client', 'contractor', 'supplier', 'partner', 'inspector'] },
  { label: 'Leads', href: '/portal/dashboard/leads', icon: 'UserPlus', roles: ['admin', 'partner'] },
  { label: 'Projects', href: '/portal/dashboard/projects', icon: 'FolderKanban', roles: ['admin', 'client', 'contractor', 'inspector'] },
  { label: 'Appointments', href: '/portal/dashboard/appointments', icon: 'CalendarDays', roles: ['admin', 'client', 'contractor', 'inspector'] },
  { label: 'Measurements', href: '/portal/dashboard/measurements', icon: 'Ruler', roles: ['admin', 'contractor', 'inspector'] },
  { label: 'Estimates', href: '/portal/dashboard/estimates', icon: 'FileText', roles: ['admin'] },
  { label: 'Contracts', href: '/portal/dashboard/contracts', icon: 'ClipboardSignature', roles: ['admin'] },
  { label: 'Orders', href: '/portal/dashboard/orders', icon: 'Package', roles: ['admin', 'supplier'] },
  { label: 'Messages', href: '/portal/dashboard/messages', icon: 'MessageSquare', roles: ['admin', 'client', 'contractor'] },
  { label: 'Invoices', href: '/portal/dashboard/invoices', icon: 'Receipt', roles: ['admin', 'client'] },
  { label: 'Commissions', href: '/portal/dashboard/commissions', icon: 'BadgeDollarSign', roles: ['admin', 'partner'] },
  { label: 'Analytics', href: '/portal/dashboard/analytics', icon: 'BarChart3', roles: ['admin'] },
  { label: 'Timeline', href: '/portal/dashboard/activity', icon: 'Clock', roles: ['admin'] },
  { label: 'AI Settings', href: '/portal/dashboard/ai-settings', icon: 'Brain', roles: ['admin'] },
  { label: 'IT', href: '/portal/dashboard/it', icon: 'Monitor', roles: ['admin'] },
  { label: 'Settings', href: '/portal/dashboard/settings', icon: 'Settings', roles: ['admin', 'client', 'contractor', 'supplier', 'partner', 'inspector'] },
];
