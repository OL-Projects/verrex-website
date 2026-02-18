import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "../globals.css"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { MobileActionBar } from "@/components/layout/mobile-action-bar"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { NextIntlClientProvider, hasLocale } from "next-intl"
import { notFound } from "next/navigation"
import { routing } from "@/i18n/routing"
import { setRequestLocale, getMessages } from "next-intl/server"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
}

export const metadata: Metadata = {
  title: {
    default: "VERREX | Premium Windows & Doors",
    template: "%s | VERREX",
  },
  description:
    "VERREX is a premier window and door corporation delivering high-performance fenestration systems for residential, commercial, institutional, and industrial projects. Trusted by developers, architects, and facility managers across Canada.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VERREX",
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  keywords: [
    "windows",
    "doors",
    "installation",
    "commercial windows",
    "industrial doors",
    "residential windows",
    "storefront systems",
    "curtain wall",
    "window replacement",
    "door systems",
    "fenestration",
    "Canadian windows",
    "Canada",
    "government buildings",
    "institutional",
  ],
  openGraph: {
    title: "VERREX | Premium Windows & Doors",
    description:
      "Premium window and door solutions for residential, commercial, and industrial projects.",
    type: "website",
    locale: "en_CA",
    siteName: "VERREX",
  },
  twitter: {
    card: "summary_large_image",
    title: "VERREX | Premium Windows & Doors",
    description: "Premium window and door solutions for residential, commercial, and industrial projects.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://verrex.com",
  },
  category: "business",
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Ensure that the incoming locale is valid
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Get messages for the current locale
  const messages = await getMessages();

  return (
    <html lang={locale} className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-white dark:bg-[#030712] text-slate-900 dark:text-slate-100 antialiased">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange={false}
          >
            <Header />
            <main className="min-h-[calc(100vh-4rem)] pb-16 lg:pb-0">{children}</main>
            <Footer />
            <MobileActionBar />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
