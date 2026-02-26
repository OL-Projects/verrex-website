// ============================================================
// VERREX PORTAL — Core Type Definitions
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
  projectId: string;
  clientId: string;
  clientName: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  depositPaid: number;
  balanceDue: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  dueDate: string;
  createdAt: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
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
  { label: 'Orders', href: '/portal/dashboard/orders', icon: 'Package', roles: ['admin', 'supplier'] },
  { label: 'Messages', href: '/portal/dashboard/messages', icon: 'MessageSquare', roles: ['admin', 'client', 'contractor'] },
  { label: 'Invoices', href: '/portal/dashboard/invoices', icon: 'Receipt', roles: ['admin', 'client'] },
  { label: 'Commissions', href: '/portal/dashboard/commissions', icon: 'BadgeDollarSign', roles: ['admin', 'partner'] },
  { label: 'Analytics', href: '/portal/dashboard/analytics', icon: 'BarChart3', roles: ['admin'] },
  { label: 'Activity', href: '/portal/dashboard/activity', icon: 'Activity', roles: ['admin'] },
  { label: 'Settings', href: '/portal/dashboard/settings', icon: 'Settings', roles: ['admin', 'client', 'contractor', 'supplier', 'partner', 'inspector'] },
];
