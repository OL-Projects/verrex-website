# Active Context

## Latest Session — Feb 20, 2026

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
