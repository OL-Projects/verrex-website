import Link from "next/link"
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

const footerLinks = {
  products: [
    { name: "Residential Windows", href: "/products?category=residential" },
    { name: "Commercial Glass", href: "/products?category=commercial" },
    { name: "Industrial Solutions", href: "/products?category=industrial" },
    { name: "All Products", href: "/products" },
  ],
  services: [
    { name: "Free Consultation", href: "/services" },
    { name: "On-Site Measurement", href: "/services" },
    { name: "Professional Installation", href: "/services" },
    { name: "Repair & Maintenance", href: "/services" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Partners", href: "/about#partners" },
    { name: "Careers", href: "/contact" },
  ],
}

export function Footer() {
  return (
    <footer className="bg-slate-900 dark:bg-[#000000] text-white">
      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                <span className="text-white font-bold text-lg">VX</span>
              </div>
              <div>
                <span className="text-2xl font-bold tracking-tight">
                  VERREX
                </span>
                <span className="block text-[10px] text-slate-400 -mt-1 tracking-widest uppercase">
                  Windows & Doors
                </span>
              </div>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-md">
              {companyInfo.description}
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
                Mon-Fri: {companyInfo.hours.weekdays}
              </div>
            </div>
          </div>

          {/* Products Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Products
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.products.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Services
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800 dark:border-[#1e293b]/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} VERREX. All rights reserved.
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
