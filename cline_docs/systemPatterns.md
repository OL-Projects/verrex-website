# VERREX - System Patterns

## Architecture
- **Next.js App Router**: File-based routing with server/client component split
- **Component-Based UI**: Reusable UI primitives (Button, Card, Input, Badge, etc.) built with Radix UI + CVA
- **Static Data Layer**: All product/service/project data in `src/lib/data.ts` — designed for easy replacement with API/database later
- **Type-Safe**: Full TypeScript interfaces in `src/types/index.ts` (Product, Service, Testimonial, Partner, Project)
- **Theme System**: next-themes provider with class-based dark mode, system preference detection

## Key Patterns

### Component Design
- **Server Components by Default**: Pages are server components unless they need interactivity
- **"use client" Directive**: Used for pages with forms, state, or event handlers (homepage, products, quote, contact, appointments, search)
- **Variant-Based Components**: `class-variance-authority` (CVA) for Button (7 variants, 5 sizes) and Badge (7 variants)
- **Utility-First CSS**: Tailwind classes with `cn()` helper for conditional merging via `clsx + tailwind-merge`
- **Responsive Design**: Mobile-first with `sm:`, `md:`, `lg:`, `xl:` breakpoints

### Animation System (`motion.tsx`)
- **FadeIn**: Opacity + translateY animation on scroll (configurable delay)
- **FadeInLeft / FadeInRight**: Horizontal entrance animations
- **StaggerContainer + StaggerItem**: Sequential reveal for lists/grids
- **RevealSection**: Section-level scroll reveal wrapper
- **AnimatedCounter**: Number counting animation (e.g., "500+" stats)
- **HoverCard**: Lift + shadow effect on hover
- **ScaleIn**: Scale-up entrance animation
- All use **Intersection Observer** for scroll-triggered activation

### Homepage Layout Pattern
```
┌──────────────────────────────────────────────┐
│ HERO (min-h-85vh, photo background)          │
│ ┌──────────────┐ ┌──────────────────────────┐│
│ │ Left Content  │ │ Glassmorphism Quote Form ││
│ │ • Badge       │ │ • Name, Email            ││
│ │ • H1 Headline │ │ • Phone, City            ││
│ │ • Description │ │ • Postal Code            ││
│ │ • CTA Buttons │ │ • Product Checkboxes     ││
│ │ • Cert Badges │ │ • Quantity               ││
│ └──────────────┘ │ • Submit Button           ││
│                   └──────────────────────────┘│
│ ┌────────────────────────────────────────────┐│
│ │ STATS BAR (frosted glass)                  ││
│ │ 500+ | 2M+ | 98% | 15+                    ││
│ └────────────────────────────────────────────┘│
├──────────────────────────────────────────────┤
│ CATEGORY CARDS (3 image-overlay cards)       │
│ Residential | Commercial | Industrial        │
├──────────────────────────────────────────────┤
│ FEATURED PRODUCTS (4 product cards)          │
├──────────────────────────────────────────────┤
│ SERVICES (6 service cards, 3x2 grid)         │
├──────────────────────────────────────────────┤
│ WHY CHOOSE VERREX (2-col: benefits + image)  │
├──────────────────────────────────────────────┤
│ TESTIMONIALS (4 cards)                       │
├──────────────────────────────────────────────┤
│ RECENT PROJECTS (3 featured project cards)   │
├──────────────────────────────────────────────┤
│ CTA SECTION (dark bg, 2 buttons)             │
└──────────────────────────────────────────────┘
```

### Form Patterns
- **Quote Wizard** (`/quote`): 4-step progressive form with step indicator, back/next buttons
- **Appointment Booking** (`/appointments`): Type selection → date/time picker → contact info
- **Contact Form** (`/contact`): Single-page form with validation states
- **Hero Quick Quote**: Inline glassmorphism form (desktop only, `hidden lg:block`)

### Image Strategy
- **Hero**: Full-width background with dual gradient overlays (readability + depth)
- **Category Cards**: Background images with gradient overlay + frosted icon containers
- **Product Cards**: 4:3 aspect ratio with hover zoom effect
- **Project Cards**: Fixed height with gradient overlay text at bottom
- **Catalog**: 98 page images in responsive grid with lightbox viewer

## Data Flow
1. Static data exports from `src/lib/data.ts` (products, services, testimonials, projects, partners, company info, time slots)
2. Pages import and render data directly (SSR for server components)
3. Client components use React `useState` for interactivity (filters, form steps, search)
4. Forms collect data client-side with `onSubmit={(e) => e.preventDefault()}`
5. **Future**: Replace static imports with API calls → database queries

## Component Hierarchy
```
RootLayout (layout.tsx)
├── ThemeProvider (next-themes)
│   ├── Header (navigation, search, theme toggle, mobile menu)
│   ├── Main Content (page.tsx for each route)
│   │   └── Page-specific components
│   │       ├── FadeIn / StaggerContainer (animation wrappers)
│   │       ├── Card / HoverCard (content containers)
│   │       ├── Badge (category/status tags)
│   │       ├── Button (CTAs, form actions)
│   │       └── Input / Textarea / Label (form elements)
│   ├── Footer (links, contact, social)
│   └── MobileActionBar (bottom action buttons, mobile only)
```

## Styling Conventions
- **Surfaces**: `bg-white dark:bg-slate-900`, `bg-slate-50 dark:bg-[#020617]`
- **Deep dark**: `dark:bg-[#030712]` for main content, `dark:bg-[#020617]` for alternating sections
- **Text**: `text-slate-900 dark:text-white` (headings), `text-slate-600 dark:text-slate-400` (body)
- **Borders**: `border-slate-200 dark:border-slate-800`
- **Accent**: Blue-600/Blue-400 for links and CTAs
- **Glass**: `bg-white/10 backdrop-blur-md border border-white/15` (hero form, certification badges)
- **Shadows**: `shadow-lg hover:shadow-xl` for cards, `shadow-2xl` for hero form
- **Transitions**: `transition-all duration-300` for most interactive elements

## Git Workflow
- Single `main` branch
- Direct pushes to main (no PR process currently)
- Vercel auto-deploys on every push
- Build verification before push: `npm run build` then `git add . && git commit && git push`
