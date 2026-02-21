"use client"

import { useTranslations } from 'next-intl'
import { Link as IntlLink } from '@/i18n/navigation'
import { companyInfo } from "@/lib/data"
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
} from "lucide-react"

export function Footer() {
  const t = useTranslations('Footer')

  const footerLinks = {
    products: [
      { name: t('residentialWindows'), href: "/products?category=residential" },
      { name: t('commercialGlass'), href: "/products?category=commercial" },
      { name: t('industrialSolutions'), href: "/products?category=industrial" },
      { name: t('allProducts'), href: "/products" },
    ],
    services: [
      { name: t('freeConsultation'), href: "/services" },
      { name: t('onSiteMeasurement'), href: "/services" },
      { name: t('professionalInstallation'), href: "/services" },
      { name: t('repairMaintenance'), href: "/services" },
    ],
    company: [
      { name: t('aboutUs'), href: "/about" },
      { name: t('contactLink'), href: "/contact" },
      { name: t('partners'), href: "/about#partners" },
      { name: t('careers'), href: "/contact" },
    ],
  }
  return (
    <footer className="bg-slate-900 dark:bg-[#000000] text-white">
      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <IntlLink href="/" className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                <span className="text-white font-bold text-lg">VX</span>
              </div>
              <div>
                <span className="text-2xl font-bold tracking-tight">
                  VERREX
                </span>
                <span className="block text-[10px] text-slate-400 -mt-1 tracking-widest uppercase">
                  {t('premiumWindows')}
                </span>
              </div>
            </IntlLink>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-md">
              {t('description')}
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <a
                href={`tel:${companyInfo.phone}`}
                className="flex items-center gap-3 text-sm text-slate-300 hover:text-blue-400 transition-colors"
              >
                <Phone className="h-4 w-4 text-blue-400" />
                {companyInfo.phone}
              </a>
              <a
                href={`mailto:${companyInfo.email}`}
                className="flex items-center gap-3 text-sm text-slate-300 hover:text-blue-400 transition-colors"
              >
                <Mail className="h-4 w-4 text-blue-400" />
                {companyInfo.email}
              </a>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <MapPin className="h-4 w-4 text-blue-400 shrink-0" />
                {companyInfo.address}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Clock className="h-4 w-4 text-blue-400" />
                {t('products') === 'Produits' ? 'Lun-Ven: ' : 'Mon-Fri: '}{companyInfo.hours.weekdays}
              </div>
            </div>
          </div>

          {/* Products / Services / Company Links — Horizontal on mobile */}
          <div className="col-span-1 lg:col-span-3 grid grid-cols-3 gap-4 sm:gap-8">
            {/* Products Links */}
            <div>
              <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider mb-3 sm:mb-4">
                {t('products')}
              </h3>
              <ul className="space-y-1.5 sm:space-y-2.5">
                {footerLinks.products.map((link) => (
                  <li key={link.name}>
                    <IntlLink
                      href={link.href}
                      className="text-xs sm:text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </IntlLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services Links */}
            <div>
              <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider mb-3 sm:mb-4">
                {t('services')}
              </h3>
              <ul className="space-y-1.5 sm:space-y-2.5">
                {footerLinks.services.map((link) => (
                  <li key={link.name}>
                    <IntlLink
                      href={link.href}
                      className="text-xs sm:text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </IntlLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider mb-3 sm:mb-4">
                {t('company')}
              </h3>
              <ul className="space-y-1.5 sm:space-y-2.5">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <IntlLink
                      href={link.href}
                      className="text-xs sm:text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </IntlLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800 dark:border-[#1e293b]/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} VERREX. {t('allRightsReserved')}
            </p>
            <div className="flex items-center gap-4">
              <a
                href={companyInfo.social.facebook}
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href={companyInfo.social.instagram}
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={companyInfo.social.linkedin}
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href={companyInfo.social.twitter}
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
