# Active Context

## Latest Session — March 13, 2026 (Evening)

### Completed This Session
1. **Profile dropdown z-index fix** — Added `relative z-[100]` to portal topbar so profile/notification dropdowns always appear above page content
2. **Admin IT User Editor** — Full CRUD modal: edit name, display name, email, phone, company, address, role, status (active/suspended), notes, clear photo; PATCH/GET API with field validation
3. **Removed Commissions page** — Deleted page, removed from sidebar nav and i18n references
4. **Enterprise CRM Admin Dashboard** — Complete overhaul:
   - KPI strip (6 live stats: revenue, projects, leads, invoices, appointments, clients)
   - Revenue breakdown with progress bars (collected/pending/overdue)
   - Project pipeline visualization (active/pending/completed)
   - Lead funnel (new→contacted→qualified→converted) + source breakdown
   - Quick actions grid (8 shortcuts)
   - Activity feed from ProjectActivity with author names
   - Upcoming appointments with date cards
   - Document stats (total/viewed/signed + overdue/paid badges)
   - Recent clients table with avatar + company + counts
   - Recent leads compact cards with status badges
   - Design: thin borders, compact spacing, tabular-nums, engineer-grade look
5. **Enhanced /api/admin/stats** — 28 parallel database queries for comprehensive dashboard data

### Commits Pushed
- `a02159c` — Profile dropdown z-index fix
- `aa5b0f1` — Admin IT user profile editor
- `08fe6b2` — Enterprise CRM admin dashboard + remove commissions

### Next Steps
- Client portal Financial Documents: signing/approval workflow with admin notifications
- Further design language refinements across portal pages
- Document signing PDF workflow (already has signature-pad component)


## Latest: Document Signing, Approval & Admin Notification System (March 13, 2026)

### What Was Done
Implemented a complete **document signing, approval, and admin notification system** for the Financial Documents section of the client portal (Estimates, Contracts, Invoices).

#### Database Changes
- Added 6 new fields to the `Document` model: `signatureUrl`, `signedAt`, `acceptedAt`, `rejectedAt`, `revisionNote`, `clientIp`
- Expanded status to support: `draft | sent | viewed | signed | accepted | rejected`

#### API Route Enhancement (`/api/portal/documents/[id]`)
- **sign** — Stores signature (base64), sets status → "signed", timestamps, notifies admin via email
- **accept** — Sets status → "accepted" (with optional signature), notifies admin
- **reject** — Sets status → "rejected", notifies admin
- **revision** — Stores revision message, notifies admin (status unchanged)
- IP address captured for audit trail on all client actions

#### Admin Email Notifications (4 new templates in `email.ts`)
- **Document Signed** — Branded email to admin when client signs a contract
- **Document Accepted** — When client accepts an estimate or acknowledges an invoice
- **Document Declined** — When client declines a document
- **Revision Requested** — When client requests changes (includes their message)

#### Client Inbox Pages Enhanced
- **Estimates**: Added SignaturePad → "Accept & Sign Estimate" flow, wired revision request to API, added decline with API
- **Contracts**: Wired revision request to API (signing already worked), added success banners
- **Invoices**: Added "Acknowledge & Sign" with SignaturePad, wired revision request to API
- All three pages now show **success banners** after actions confirming admin was notified

### Previous: Financial Documents Overhaul
All three pages (Estimates, Contracts, Invoices) already had:
- Show **badge counts** on the sidebar for unread/pending documents (client role only)
- Display a **client inbox view** (read-only reception) when the user has `role: client`
- Display the **admin management view** (full CRUD) when the user has `role: admin`
- Support **document signing** (contracts via SignaturePad component)
- Support **revision requests** (contracts + estimations via RevisionRequestModal)
- Track **read/unread** status with blue dot indicators

### Files Created
- `src/app/[locale]/portal/dashboard/contracts/` — Full contracts management page + client inbox
- `src/app/[locale]/portal/dashboard/estimates/client-estimations-inbox.tsx` — Client estimation inbox  
- `src/app/[locale]/portal/dashboard/invoices/client-invoices-inbox.tsx` — Client invoice inbox
- `src/components/portal/signature-pad.tsx` — Reusable signature capture component
- `src/components/portal/revision-request-modal.tsx` — Reusable revision request modal

### Files Modified
- `src/types/portal.ts` — Added Contract, Estimation types + readByClient/clientResponse fields on Invoice
- `src/lib/portal-store.tsx` — Added contracts[], estimations[] stores + actions (sign, respond, markRead)
- `src/components/portal/sidebar.tsx` — Added badge counts for financial docs (client role)
- `src/app/[locale]/portal/dashboard/invoices/page.tsx` — Role-based view split
- `src/app/[locale]/portal/dashboard/estimates/page.tsx` — Role-based view split

### Architecture Pattern
- Admin sees full management tools (create, edit, send, void)
- Client sees inbox-style read-only view with action buttons (sign, acknowledge, request revision)
- Role detection: `useSession()` → `session.user.role` → conditional render
- All hooks called before early return (React Rules of Hooks compliant)

## Previous Context

## Latest Session — Mar 11, 2026 (Evening)

### Completed: IT Operations Center (Support → IT Portal Page)

**New Sidebar Section: Support → IT**
- Added "Support" group to sidebar navigation (after Insights)
- Added "IT" nav item with Monitor icon
- EN/FR translations added (`it`/`support` keys in portal-i18n.ts)

**6 Live API Routes Created (all admin-only, session-validated):**
- `GET /api/admin/it/system-info` — Node.js runtime, CPU, memory, OS, env vars audit, framework versions
- `GET /api/admin/it/database-stats` — PostgreSQL ping latency, table row counts, users by role, recent signups
- `GET /api/admin/it/services` — Live connectivity checks: PostgreSQL, NextAuth, Resend, Vercel Blob, Next.js runtime
- `GET /api/admin/it/users` — Full user listing with related data counts (projects, invoices, leads, etc.)
- `DELETE /api/admin/it/users/[id]` — Delete user account with cascade (prevents self-deletion)
- `POST /api/admin/it/users/[id]/reset-password` — Force password reset with secure temp password (bcrypt 12 rounds)

**IT Dashboard Page (`/portal/dashboard/it`):**
- 6 top-level stat badges: Uptime, Heap, CPU%, DB Latency, Total Users, Total DB Rows
- Collapsible sections:
  1. **Server & Environment** — Node/Next/Prisma/TS versions, CPU model, RAM, heap, env vars audit (✅/✗)
  2. **Database Dashboard** — Ping latency, provider, total rows, per-table row counts, DB version
  3. **Connected Services** — Live status for PostgreSQL, NextAuth, Resend, Blob Storage, Next.js
  4. **Security Overview** — Users by role, new accounts (7d), auth config audit
  5. **Account Management** — Searchable user table, reset password (with show/copy temp pw), delete account (confirm flow)
  6. **Diagnostics & Quick Actions** — Refresh all, build version, last refreshed timestamp

**Build Status:** ✅ TypeScript compiled clean — pre-existing Resend env issue on change-password route (unrelated)

---

### Completed: Real Authentication System (Production-Ready)

**Auth Fixes & Upgrades:**
- Fixed `AUTH_SECRET` env var (NextAuth v5 requires `AUTH_SECRET`, was using `NEXTAUTH_SECRET`)
- Added `AUTH_TRUST_HOST=true` and `NEXT_PUBLIC_BASE_URL` to `.env.local`
- Fixed demo login email mismatch (login page buttons now match seeded DB users: `*@verex.ca`)
- Standardized password minimum to 8 characters everywhere (signup, register API, reset-password API, reset-password page)
- Added `role` field to signup request body (was missing, now explicitly sends selected role)
- Removed misleading "Phase 1 Demo — Accounts stored in memory" notice from signup page

**New API Endpoints:**
- `PUT /api/portal/profile` — Fetch and update logged-in user's profile (name, phone, company)
- `POST /api/portal/change-password` — Change password (requires current password verification)

**Settings Page Upgrade:**
- Profile section now fetches real user data from DB via `/api/portal/profile`
- Editable fields: Name, Phone, Company (Email is read-only)
- Shows role badge and "Member since" date
- Working "Save Changes" button with dirty-state detection
- Working "Change Password" flow (current password → new password → confirm)
- Removed all "demo mode" and "Phase 2" labels from functional features
- Auto-clearing success/error messages

**API Test Results (all passing):**
- ✅ Signup creates real user in PostgreSQL (Neon)
- ✅ Duplicate email rejected (409)
- ✅ Short password rejected (400, "at least 8 characters")
- ✅ Login via NextAuth credentials (302 redirect, session cookie set)
- ✅ Forgot password sends real email via Resend + prevents email enumeration
- ✅ Invalid reset token rejected (400)
- ✅ Profile endpoint rejects unauthenticated requests (401)
- ✅ Change-password endpoint rejects unauthenticated requests (401)
- ✅ Welcome email delivered successfully
- ✅ Password reset email delivered successfully

**Security Features:**
- bcrypt password hashing (12 rounds)
- JWT sessions (24hr expiry)
- CSRF protection via NextAuth
- Route protection via proxy.ts (dashboard routes require session cookie)
- Email enumeration prevention on forgot-password
- Password reset tokens expire after 1 hour
- Server-side session validation on all protected API endpoints

**Build Status:** ✅ Clean — 0 errors, all routes compiled

---

## Previous Session — Feb 25, 2026

### Completed: Full Portal System (Phase 1 MVP)

**Portal Architecture Delivered:**
- NextAuth v5 (credentials provider) with 6 demo users (admin, client, contractor, supplier, partner, inspector)
- Role-based dashboard redirect after login
- Session provider wrapping entire app
- Protected `/portal/dashboard/*` routes via proxy.ts auth check

**Pages Created:**
- `/portal` — Welcome/landing page (glassmorphism design, role cards)
- `/portal/login` — Login page with demo quick-login buttons, Suspense-wrapped
- `/portal/signup` — Signup page with role selection (client self-signup, others invite-only)
- `/portal/dashboard` — Role-redirect page (auto-routes to correct dashboard)
- `/portal/dashboard/admin` — Admin dashboard (KPIs, leads, pipeline, appointments)
- `/portal/dashboard/client` — Client dashboard (projects, pipeline progress, financials)
- `/portal/dashboard/contractor` — Contractor dashboard (schedule, assigned projects)
- `/portal/dashboard/supplier` — Supplier dashboard (purchase orders, production status)
- `/portal/dashboard/partner` — Partner dashboard (leads, commissions, project tracking)
- `/portal/dashboard/leads` — Leads management (search, filter by source, priority badges)
- `/portal/dashboard/projects` — Projects with full pipeline visualization
- `/portal/dashboard/appointments` — Appointments by type with upcoming/past sections
- `/portal/dashboard/measurements` — Measurement records with rough/exact dimensions
- `/portal/dashboard/orders` — Order management with item details and tracking
- `/portal/dashboard/messages` — Per-project messaging with internal notes support
- `/portal/dashboard/settings` — Profile, notifications, security settings

**Components Created:**
- `components/portal/sidebar.tsx` — Collapsible sidebar with role-filtered navigation
- `components/portal/portal-topbar.tsx` — Top bar with notifications, user dropdown, sign-out
- `components/portal/stats-card.tsx` — Animated KPI cards with trend indicators
- `components/portal/pipeline-status.tsx` — 15-stage pipeline visualizer (compact + full)
- `components/providers/session-provider.tsx` — NextAuth SessionProvider wrapper

**Data Layer:**
- `lib/portal-data.ts` — Comprehensive mock data system with:
  - 6 demo users across all roles
  - Mock leads, projects, appointments, measurements, orders, messages, notifications
  - Role-scoped query functions (getProjectsByRole, getOrdersByRole, etc.)
  - 15-stage pipeline constants with color coding
- `types/portal.ts` — Full TypeScript interfaces for all portal data models
- `types/auth.ts` — NextAuth session/JWT type extensions

**Header Updated:**
- Portal login button added (desktop + mobile) with LogIn icon

**Technical Notes:**
- Next.js 16 requires `proxy.ts` instead of `middleware.ts` — merged i18n + auth protection
- `useSearchParams()` requires Suspense boundary for static prerendering
- Dashboard layout hides site header/footer, uses its own sidebar + topbar
- All portal pages are client components ("use client") for interactivity
- Build passes clean: ✅ Compiled successfully

**Build Status:** ✅ Clean — 0 errors, all routes prerendered

### Next Steps (Phase 2)
- Real database backend (Supabase/Prisma) replacing mock data
- Invoicing/payments/receipts + commission calculation
- Contractor acceptance workflow + stronger permissions
- Partner lead import (CSV/API)
- File upload system for attachments/photos
- Email notifications (Resend/SendGrid)
- Real authentication with password hashing

---

## Previous Session — Feb 20, 2026

### Completed: Full i18n Wiring (All Pages)
Wired `t()` translation calls across ALL pages and layout components:

**Layout Components:**
- header.tsx (~20 Navigation keys)
- footer.tsx (~18 Footer keys)
- mobile-action-bar.tsx (~5 keys)

**Pages (15 total):**
- Home page (~64 HomePage keys)
- About page (~26 AboutPage keys)
- Appointments page (~34 keys)
- Catalog page (~14 keys)
- Contact page (~31 keys)
- Search page (~13 keys + resultsCount ICU plural)
- Products listing page (~16 keys)
- Product detail page (~14 ProductDetail keys)
- Window types page (~3 keys — rest in Window3DConfigurator component)
- Projects page (~23 keys, refactored categories array)
- Quote page (~25+ keys, moved steps array inside component)
- Services page (~6 keys — page has fewer hardcoded strings)

**Translation Files:**
- en.json: ~350+ keys across 14 namespaces + Data namespace
- fr.json: Full French translations matching all en.json keys
- Added missing keys: QuotePage.address, SearchPage.resultsCount (ICU format)

**Build Status:** ✅ Clean — 41 static pages, 0 errors

### Next Steps
- Git commit & push all i18n wiring changes
- Clean up any remaining hardcoded strings (minor secondary text)
- Consider data-level translations (product names/descriptions via Data namespace)


## Current Status
**Realistic 3D Render Upgrade COMPLETE** — Deployed on Vercel via GitHub.

## Latest Session Work (Feb 17, 2026 — Evening)

### 3D Window Configurator — Realistic Render Upgrade

#### Glass Material → MeshTransmissionMaterial (Drei)
- **Replaced** `meshPhysicalMaterial` with `MeshTransmissionMaterial` from `@react-three/drei`
- **Real refraction** with `transmissionSampler` for shared Three.js transmission buffer
- **Chromatic aberration** per glass type (0.01–0.045 range)
- **Anisotropic blur** for realistic light scattering
- **5 glass types** with physically-based configs:
  - Clear: IOR 1.52, full transmission, chromatic aberration 0.04
  - Low-E: slight green tint, transmission 0.92, reduced aberration
  - Tinted: blue-grey, transmission 0.7, solar heat reduction
  - Frosted: roughness 0.6, heavy anisotropic blur 0.9, distortion 0.08
  - Tempered: near-perfect clarity, thicker (0.55), highest aberration 0.045

#### Frame Profiles — Vinyl (uPVC) Realistic
- **Enhanced bevels**: bevelThickness 0.018, bevelSize 0.01, bevelSegments 5
- **Vinyl material**: roughness 0.45, metalness 0.02 (plastic, not metal)
- **Environment map** intensity 0.6 for subtle reflections

#### Spring Physics Animation System
- **Damped harmonic oscillator** (`springStep` utility in WindowParts.tsx)
- **Per-window-type tuning**: heavier sashes = lower stiffness, more damping
  - Double-Hung: stiffness 120, damping 18 (heavy sash)
  - Casement: stiffness 140, damping 16 (lighter panels)
  - Sliding: stiffness 130, damping 18
  - Tilt-Turn: stiffness 110, damping 20 (heavy panel)
  - Jalousie: stiffness 160, damping 15 (light slats)
- **Delta-time capped** at 0.033s for numerical stability

#### Hardware — Satin Nickel Finish
- **Material**: roughness 0.15, metalness 0.9, envMapIntensity 1.2
- **Lever handles**: base plate + rosette + arm + rounded tip
- **Crank handles**: base + shaft + arm + knob (sphereGeometry)
- **Tilt-turn handles**: espagnolette style with rosette
- **Hinges**: barrel + knuckles + leaf plates (detailed geometry)
- **Lock points**: box + bolt cylinder

#### New Components
- **WindowScreen**: semi-transparent mesh for operable windows
- **Weatherstrip gaskets**: EPDM rubber seals (dark, high roughness)
- **Support brackets**: on garden windows
- **Mortar joints**: on glass block windows
- **Pressure plates**: on curtain wall mullions
- **Thresholds**: on storefront door openings
- **Seat boards**: on bay/bow windows

#### Architecture Split (Large File Safety)
- **Problem**: AllWindows.tsx was 400+ lines, caused `write_to_file` truncation failures
- **Solution**: Split into 4 focused files + barrel re-export:
  - `OperableWindows.tsx` — Sliding, Awning, Hopper, Skylight, Jalousie
  - `TiltTurnWindow.tsx` — Tilt & Turn (complex, own file)
  - `StaticWindows.tsx` — Bay/Bow, Picture, Garden, Transom, Glass Block
  - `CommercialWindows.tsx` — Curtain Wall, Storefront, Generic
  - `AllWindows.tsx` — barrel re-export only (~8 lines)

## Git History (Latest Commits)
- `b483e89` — feat: realistic 3D renders — MeshTransmissionMaterial glass, spring physics, enhanced hardware, split architecture
- `0263f57` — wip: window-types page and configurator local updates
- `dc992b9` — feat: complete 3D window configurator with 15 animated window types

## Known Issues / Pending Items
- Quick quote form is presentational only (no backend submission yet)
- All forms are client-side only (no API routes)
- Product images are AI-generated placeholders
- Hero background image could benefit from higher resolution

## Next Steps
- **Phase 2**: Backend API routes for form submissions (quote, contact, appointments)
- **Phase 2**: Database setup (PostgreSQL/Prisma or Supabase)
- **Phase 2**: Email notification system
- **Phase 3**: Authentication and admin/client dashboards
- **Phase 4**: Integrations (payments, chat, analytics)
- **Phase 5**: SEO, performance, accessibility, testing
