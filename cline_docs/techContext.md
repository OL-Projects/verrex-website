# VERREX - Tech Context

## Technologies Used
- **Framework**: Next.js 16.1.6 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Custom component library (Radix UI primitives)
- **Icons**: Lucide React
- **Animations**: Custom motion components (intersection observer based)
- **Theme**: next-themes (dark/light/system)
- **Utilities**: clsx, tailwind-merge, class-variance-authority

## Development Setup
- **Node.js**: Required (v18+)
- **Package Manager**: npm
- **Dev Server**: `npm run dev` → http://localhost:3000
- **Build**: `npm run build` (~2.7s compile time)
- **Working Directory**: `c:\Users\Spiro\Desktop\WEB.2026\verrex`

## Deployment
- **GitHub Repository**: `OL-Projects/verrex-website` (main branch)
- **Hosting**: Vercel (auto-deploy on push to main)
- **Domain**: verrex.com (configured in Vercel)
- **Build Command**: `next build`
- **Output**: Static + Server-side rendering

## Project Structure
```
verrex/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout (Header + Footer + ThemeProvider)
│   │   ├── page.tsx            # Homepage (split hero + quote form)
│   │   ├── globals.css         # Global styles + dark mode overrides
│   │   ├── favicon.ico
│   │   ├── about/page.tsx      # Company info, team, partners
│   │   ├── appointments/page.tsx # Booking system (5 types)
│   │   ├── catalog/page.tsx    # 98-page manufacturer catalog viewer
│   │   ├── contact/page.tsx    # Contact form + business info
│   │   ├── products/
│   │   │   ├── page.tsx        # Product catalog with filters
│   │   │   ├── [id]/page.tsx   # Product detail page
│   │   │   └── window-types/   # Subcategory browsing
│   │   ├── projects/page.tsx   # Portfolio (8 projects)
│   │   ├── quote/page.tsx      # 4-step quote wizard
│   │   ├── search/page.tsx     # Global search
│   │   └── services/page.tsx   # Services + process timeline
│   ├── components/
│   │   ├── layout/
│   │   │   ├── header.tsx      # Nav, search bar, mobile menu, ⌘K shortcut
│   │   │   ├── footer.tsx      # Links, contact, social, newsletter
│   │   │   └── mobile-action-bar.tsx # Mobile quick action buttons
│   │   ├── providers/
│   │   │   └── theme-provider.tsx # Dark mode context (next-themes)
│   │   └── ui/
│   │       ├── button.tsx      # 7 variants, 5 sizes (CVA)
│   │       ├── card.tsx        # Card, CardHeader, CardContent, CardFooter
│   │       ├── input.tsx       # Text input with dark mode
│   │       ├── textarea.tsx    # Multi-line input
│   │       ├── badge.tsx       # 7 variant tags (CVA)
│   │       ├── label.tsx       # Form labels
│   │       ├── separator.tsx   # Horizontal/vertical dividers
│   │       ├── motion.tsx      # FadeIn, StaggerContainer, AnimatedCounter, HoverCard, etc.
│   │       └── theme-toggle.tsx # Sun/Moon toggle button
│   ├── lib/
│   │   ├── data.ts             # All static data (products, services, testimonials, projects, company info)
│   │   └── utils.ts            # cn() helper, formatCurrency()
│   └── types/
│       └── index.ts            # TypeScript interfaces (Product, Service, Testimonial, Partner, Project)
├── public/
│   └── images/
│       ├── catalog/            # 98 manufacturer catalog page images (JPEG)
│       ├── hero/               # 6 hero/section background images
│       ├── products/           # 18 product photos (AI-generated)
│       └── projects/           # 16 project portfolio photos (AI-generated)
├── cline_docs/                 # Memory Bank documentation (this folder)
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
└── tailwind.config (v4 - in CSS)
```

## Technical Constraints
- Currently using **static data** in `src/lib/data.ts` (no database yet)
- Form submissions are **client-side only** (no API routes yet) — forms prevent default and do nothing
- Product/project images are **AI-generated placeholders** (except catalog images which are real)
- Hero background image (`catalog-p3-img1.jpeg`) is **relatively low resolution** from PDF extraction
- No authentication system yet
- No email/notification system yet
- Tailwind CSS v4 uses `@custom-variant dark (&:where(.dark, .dark *))` for class-based dark mode

## Dark Mode Implementation
- **Provider**: `next-themes` ThemeProvider wrapping entire app
- **Toggle**: Sun/Moon button in header
- **Approach**: Class-based (`attribute="class"`) with system preference detection
- **Coverage**: All components, all pages, all sections have explicit `dark:` classes
- **Custom CSS**: Comprehensive dark mode overrides in globals.css for surfaces, text, borders, accents, scrollbar, glass morphism

## Key Design Decisions
- **Glassmorphism**: Used for hero quote form (`bg-white/10 backdrop-blur-md border-white/15`)
- **Image-based cards**: Category cards use real photos with gradient overlays instead of solid colors
- **Split hero**: Left content + right form (desktop), stacked on mobile
- **Animation on scroll**: Intersection Observer-based reveal animations
- **Mobile-first**: Responsive breakpoints throughout, mobile action bar for key CTAs
- **B2B tone**: Professional language targeting institutional/corporate clients while remaining accessible to homeowners
