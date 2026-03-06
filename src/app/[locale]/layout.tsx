import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "../globals.css"
import { SiteChrome } from "@/components/layout/site-chrome"
import { ToastProvider } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { SessionProvider } from "@/components/providers/session-provider"
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
    default: "VEREX | Premium Windows & Doors",
    template: "%s | VEREX",
  },
  description:
    "VEREX is a premier window and door corporation delivering high-performance fenestration systems for residential, commercial, institutional, and industrial projects. Trusted by developers, architects, and facility managers across Canada.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VEREX",
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
    title: "VEREX | Premium Windows & Doors",
    description:
      "Premium window and door solutions for residential, commercial, and industrial projects.",
    type: "website",
    locale: "en_CA",
    siteName: "VEREX",
  },
  twitter: {
    card: "summary_large_image",
    title: "VEREX | Premium Windows & Doors",
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
    canonical: "https://verex.ca",
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
        <SessionProvider>
          <NextIntlClientProvider messages={messages} locale={locale}>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              disableTransitionOnChange={false}
            >
              <ToastProvider>
                <SiteChrome>{children}</SiteChrome>
                <Toaster />
              </ToastProvider>
            </ThemeProvider>
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
