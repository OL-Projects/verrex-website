const fs = require('fs');
const path = require('path');

// ===== ABOUT PAGE =====
const aboutPath = path.join(__dirname, '..', 'src', 'app', '[locale]', 'about', 'page.tsx');
let about = fs.readFileSync(aboutPath, 'utf8');

about = about.replace(`{ value: "500+", label: "Projects Completed" }`, `{ value: "500+", label: t('projectsCompleted') }`);
about = about.replace(`{ value: "50+", label: "Expert Team Members" }`, `{ value: "50+", label: t('expertTeamMembers') }`);
about = about.replace(`{ value: "2M+", label: "Sq Ft Installed" }`, `{ value: "2M+", label: t('sqFtInstalled') }`);
about = about.replace(`{ value: "98%", label: "On-Time Delivery" }`, `{ value: "98%", label: t('onTimeDelivery') }`);
about = about.replace(
  `&ldquo;Excellence in every pane &mdash; delivering quality fenestration solutions you can trust.&rdquo;`,
  `&ldquo;{t('pullQuote')}&rdquo;`
);
about = about.replace(`<Badge variant="secondary" className="mb-3">Industry Standards</Badge>`, `<Badge variant="secondary" className="mb-3">{t('industryStandards')}</Badge>`);
about = about.replace(`<h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Certifications &amp; Compliance</h2>`, `<h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{t('certsCompliance')}</h2>`);
about = about.replace(`<p className="mt-2 text-slate-600 dark:text-slate-400">All VEREX products meet or exceed the highest industry standards</p>`, `<p className="mt-2 text-slate-600 dark:text-slate-400">{t('certsDesc')}</p>`);
about = about.replace(`<Badge variant="primary" className="mb-4">About VEREX</Badge>`, `<Badge variant="primary" className="mb-4">{t('aboutBadge')}</Badge>`);

fs.writeFileSync(aboutPath, about);
console.log('✅ About page i18n fixed');

// ===== APPOINTMENTS PAGE =====
const apptPath = path.join(__dirname, '..', 'src', 'app', '[locale]', 'appointments', 'page.tsx');
let appt = fs.readFileSync(apptPath, 'utf8');

appt = appt.replace(`<Label htmlFor="location">Location / Address</Label>`, `<Label htmlFor="location">{t('locationLabel')}</Label>`);
appt = appt.replace(`placeholder="123 Main St, Toronto"`, `placeholder={t('locationPlaceholder')}`);
appt = appt.replace(`{sending ? <><Loader2 className="h-5 w-5 animate-spin" /> Booking...</>`, `{sending ? <><Loader2 className="h-5 w-5 animate-spin" /> {t('booking')}</>`);
appt = appt.replace(
  `toast({ title: "Appointment Booked!", description: "We'll confirm your appointment shortly.", variant: "success" })`,
  `toast({ title: t('bookedTitle'), description: t('bookedDesc'), variant: "success" })`
);
appt = appt.replace(
  `toast({ title: "Failed to Book", description: "Please try again or call us directly.", variant: "error" })`,
  `toast({ title: t('failedTitle'), description: t('failedDesc'), variant: "error" })`
);

fs.writeFileSync(apptPath, appt);
console.log('✅ Appointments page i18n fixed');

// ===== Add aboutBadge key =====
['en', 'fr'].forEach(l => {
  const p = path.join(__dirname, '..', 'messages', l + '.json');
  const j = JSON.parse(fs.readFileSync(p, 'utf8'));
  if (!j.AboutPage.aboutBadge) {
    j.AboutPage.aboutBadge = l === 'fr' ? 'À propos de VEREX' : 'About VEREX';
    fs.writeFileSync(p, JSON.stringify(j, null, 2) + '\n');
  }
});
console.log('✅ aboutBadge key added');
