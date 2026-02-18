"use client"

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { useParams } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const [isPending, startTransition] = useTransition()

  const nextLocale = locale === 'en' ? 'fr' : 'en'
  const label = locale === 'en' ? 'EN' : 'FR'

  function switchLocale() {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale })
    })
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={switchLocale}
      disabled={isPending}
      className="relative h-9 w-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden transition-colors duration-300 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs font-semibold"
      aria-label={`Switch to ${nextLocale === 'en' ? 'English' : 'French'}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={locale}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="text-slate-700 dark:text-slate-200"
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}
