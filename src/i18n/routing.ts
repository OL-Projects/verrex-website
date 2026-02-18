import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // All supported locales
  locales: ['en', 'fr'],

  // Used when no locale matches
  defaultLocale: 'en',

  // No prefix for default locale (English), /fr/ for French
  localePrefix: 'as-needed'
});
