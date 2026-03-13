const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..');

// ─────────────────────────────────────────────
// 1. Update Invoices page.tsx — add role split at top
// ─────────────────────────────────────────────
const invoicesPage = path.join(BASE, 'src/app/[locale]/portal/dashboard/invoices/page.tsx');
let invoiceContent = fs.readFileSync(invoicesPage, 'utf8');

// Find the component function and add role detection
if (!invoiceContent.includes('ClientInvoicesInbox')) {
  // Add import at the top after existing imports
  const lastImport = invoiceContent.lastIndexOf('import ');
  const lineEnd = invoiceContent.indexOf('\n', lastImport);
  const importLine = '\nimport { useSession } from "next-auth/react"\nimport ClientInvoicesInbox from "./client-invoices-inbox"\n';
  invoiceContent = invoiceContent.slice(0, lineEnd + 1) + importLine + invoiceContent.slice(lineEnd + 1);
  
  // Find the return statement and add role check before it
  const fnMatch = invoiceContent.match(/export default function \w+\(\)/);
  if (fnMatch) {
    const fnIdx = invoiceContent.indexOf(fnMatch[0]);
    const firstReturn = invoiceContent.indexOf('return (', fnIdx);
    // Insert role check before the return
    const roleCheck = `
  // Role-based view: client sees inbox, admin sees management
  const { data: session } = useSession()
  const userRole = (session?.user as any)?.role || 'client'
  const userId = (session?.user as any)?.id || 'usr_client_001'
  
  if (userRole === 'client') {
    return <ClientInvoicesInbox clientId={userId} />
  }

  `;
    invoiceContent = invoiceContent.slice(0, firstReturn) + roleCheck + invoiceContent.slice(firstReturn);
  }
  fs.writeFileSync(invoicesPage, invoiceContent, 'utf8');
  console.log('✅ Updated: invoices/page.tsx with role split');
} else {
  console.log('⏭️ Skipped: invoices/page.tsx (already updated)');
}

// ─────────────────────────────────────────────
// 2. Update Contracts page.tsx — add role split at top
// ─────────────────────────────────────────────
const contractsPage = path.join(BASE, 'src/app/[locale]/portal/dashboard/contracts/page.tsx');
let contractContent = fs.readFileSync(contractsPage, 'utf8');

if (!contractContent.includes('ClientContractsInbox')) {
  const lastImport2 = contractContent.lastIndexOf('import ');
  const lineEnd2 = contractContent.indexOf('\n', lastImport2);
  const importLine2 = '\nimport { useSession } from "next-auth/react"\nimport ClientContractsInbox from "./client-contracts-inbox"\n';
  contractContent = contractContent.slice(0, lineEnd2 + 1) + importLine2 + contractContent.slice(lineEnd2 + 1);
  
  const fnMatch2 = contractContent.match(/export default function \w+\(\)/);
  if (fnMatch2) {
    const fnIdx2 = contractContent.indexOf(fnMatch2[0]);
    const firstReturn2 = contractContent.indexOf('return (', fnIdx2);
    const roleCheck2 = `
  // Role-based view: client sees inbox, admin sees management
  const { data: session } = useSession()
  const userRole = (session?.user as any)?.role || 'client'
  const userId = (session?.user as any)?.id || 'usr_client_001'
  
  if (userRole === 'client') {
    return <ClientContractsInbox clientId={userId} />
  }

  `;
    contractContent = contractContent.slice(0, firstReturn2) + roleCheck2 + contractContent.slice(firstReturn2);
  }
  fs.writeFileSync(contractsPage, contractContent, 'utf8');
  console.log('✅ Updated: contracts/page.tsx with role split');
} else {
  console.log('⏭️ Skipped: contracts/page.tsx (already updated)');
}

// ─────────────────────────────────────────────
// 3. Update Estimates page.tsx — add role split at top
// ─────────────────────────────────────────────
const estimatesPage = path.join(BASE, 'src/app/[locale]/portal/dashboard/estimates/page.tsx');
let estimateContent = fs.readFileSync(estimatesPage, 'utf8');

if (!estimateContent.includes('ClientEstimationsInbox')) {
  const lastImport3 = estimateContent.lastIndexOf('import ');
  const lineEnd3 = estimateContent.indexOf('\n', lastImport3);
  const importLine3 = '\nimport { useSession } from "next-auth/react"\nimport ClientEstimationsInbox from "./client-estimations-inbox"\n';
  estimateContent = estimateContent.slice(0, lineEnd3 + 1) + importLine3 + estimateContent.slice(lineEnd3 + 1);
  
  const fnMatch3 = estimateContent.match(/export default function \w+\(\)/);
  if (fnMatch3) {
    const fnIdx3 = estimateContent.indexOf(fnMatch3[0]);
    const firstReturn3 = estimateContent.indexOf('return (', fnIdx3);
    const roleCheck3 = `
  // Role-based view: client sees inbox, admin sees estimate builder
  const { data: session } = useSession()
  const userRole = (session?.user as any)?.role || 'client'
  const userId = (session?.user as any)?.id || 'usr_client_001'
  
  if (userRole === 'client') {
    return <ClientEstimationsInbox clientId={userId} />
  }

  `;
    estimateContent = estimateContent.slice(0, firstReturn3) + roleCheck3 + estimateContent.slice(firstReturn3);
  }
  fs.writeFileSync(estimatesPage, estimateContent, 'utf8');
  console.log('✅ Updated: estimates/page.tsx with role split');
} else {
  console.log('⏭️ Skipped: estimates/page.tsx (already updated)');
}

// ─────────────────────────────────────────────
// 4. Update Sidebar with badge counts
// ─────────────────────────────────────────────
const sidebarPath = path.join(BASE, 'src/components/portal/sidebar.tsx');
let sidebarContent = fs.readFileSync(sidebarPath, 'utf8');

if (!sidebarContent.includes('usePortalStore')) {
  // Add import for usePortalStore
  const importIdx = sidebarContent.indexOf('import { SIDEBAR_NAV }');
  const importLineEnd = sidebarContent.indexOf('\n', importIdx);
  sidebarContent = sidebarContent.slice(0, importLineEnd + 1) + 
    'import { usePortalStore } from "@/lib/portal-store"\n' + 
    sidebarContent.slice(importLineEnd + 1);
  
  // Find where nav items are rendered and add badge logic
  // We need to add a badge computation hook inside the component
  // Find the component function
  const fnStart = sidebarContent.indexOf('export default function');
  const firstUse = sidebarContent.indexOf('const [', fnStart);
  
  // Add badge computation after the first state declaration
  const badgeCode = `
  // ── Badge Counts (for client role) ──
  const storeBadges = (() => {
    try {
      const store = usePortalStore()
      const cid = session?.user ? (session.user as any).id || '' : ''
      const r = role as string
      if (r !== 'client') return {}
      const unreadInvoices = store.invoices.filter(i => i.clientId === cid && i.status !== 'draft' && !i.readByClient).length
      const unsignedContracts = store.contracts.filter(c => (c as any).clientId === cid && c.status === 'sent' && !c.readByClient).length
      const pendingEstimates = store.estimations.filter(e => e.clientId === cid && e.status === 'sent' && !e.readByClient).length
      return {
        '/portal/dashboard/invoices': unreadInvoices,
        '/portal/dashboard/contracts': unsignedContracts,
        '/portal/dashboard/estimates': pendingEstimates,
      } as Record<string, number>
    } catch { return {} }
  })()

`;
  sidebarContent = sidebarContent.slice(0, firstUse) + badgeCode + sidebarContent.slice(firstUse);

  // Now find where badges are rendered in nav items and add the dynamic badge
  // Look for where item.badge or badge display exists, or add it to nav item rendering
  // Find the nav link rendering section - look for item.label rendering
  const labelRender = sidebarContent.indexOf('{item.label}');
  if (labelRender > -1) {
    // Find the closing of that element to add badge after
    const afterLabel = sidebarContent.indexOf('\n', labelRender);
    const badgeRender = `
                    {(() => {
                      const bc = storeBadges[item.href] || 0
                      if (bc > 0) return <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-red-500 text-white min-w-[18px] text-center">{bc}</span>
                      return null
                    })()}`;
    sidebarContent = sidebarContent.slice(0, afterLabel) + badgeRender + sidebarContent.slice(afterLabel);
  }

  fs.writeFileSync(sidebarPath, sidebarContent, 'utf8');
  console.log('✅ Updated: sidebar.tsx with badge counts');
} else {
  console.log('⏭️ Skipped: sidebar.tsx (already updated)');
}

console.log('\n✅ All page updates complete!');
