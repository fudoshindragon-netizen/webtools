/**
 * MicroVenture Labs — shared product data for the two-page storefront.
 * Study Hub (index.html) and Focus & Flow (focus-flow.html) both import from here.
 */

// ─── STUDY HUB · Paid study products (product-card style) ───────
// The two $15 study packs (Electrical Deeper Understanding, OChem Mastery Pack)
// are hardcoded study cards in index.html (they carry the "Inside the $15 pack"
// teaser boxes), so they are NOT in this array.
export const STUDY_PRODUCTS = [
  { id: 'safety-guide', title: 'Electrical Safety Quick Reference Guide', subtitle: 'OSHA, NEC & NFPA Field Planning Aid', desc: 'Plain-English U.S. electrical safety quick-reference covering OSHA, NEC (2026), NFPA 70E (2027), and NFPA 70B (2026), with a printable one-page field checklist for toolbox talks, pre-job briefs, and maintenance planning.', note: 'Not legal advice, not certified training, not a substitute for official standards or AHJ/employer requirements.', price: '$15', img: '/images/safety-guide.png', href: 'https://buy.stripe.com/aFacN509Sg3Mepm6mO0ZW0a', badge: 'Safety Guide' },
  { id: 'js-mastery', title: 'JS Interview Prep', subtitle: '150-Question JavaScript Study Guide', desc: '150 vetted interview questions with answers, a snippet library, a 3-week study plan, and a printable progress tracker. Read, print, and self-test — no app required.', price: '$15', img: '/images/js-mastery.png', href: 'https://buy.stripe.com/4gM28r2i0aJs5SQeTk0ZW05', badge: 'Study Guide' },
  { id: 'mednotes', title: 'MedNotes', subtitle: 'Medical Student Pocket Guide', desc: 'High-yield reference for med students & residents. Lab values, mnemonics, anatomy cheat sheets, and pharmacology guides.', price: '$15', img: '/images/mednotes.png', href: 'https://buy.stripe.com/14A00je0I6tcftq26y0ZW04', badge: 'Notion + PDF' },
];

// ─── STUDY HUB · Free study apps (study-card style, free-only) ──
export const FREE_STUDY_APPS = [
  { id: 'ochem', variant: 'ochem', badge: '🧪 Free Study Tool', title: 'Free Organic Chemistry Practice', desc: 'Concept summaries, 64 practice questions with worked solutions, and real molecule diagrams — free, no signup.', href: 'https://ochem-app.vercel.app', cta: 'Start Practicing Free →' },
  { id: 'electrical', variant: 'electrical', badge: '⚡ Free Study Tool', title: 'Free Electrical Controls & Power Practice', desc: '14 topics and 77 practice questions with worked solutions covering electrical controls and power systems — free, no signup.', href: 'https://8p2-app.vercel.app', cta: 'Start Practicing Free →' },
  { id: 'algebra', variant: 'algebra', badge: '📐 Free Study Tool', title: 'Free Algebra, Functions & Data Analysis Practice', desc: '12 topics and 64 practice questions with step-by-step METHOD blocks, source-verified references, and high-contrast neurodivergent-friendly styling. 100% free — no signup, no upsell.', href: 'https://algebra-app-seven.vercel.app', cta: 'Start Practicing Free →' },
  { id: 'quadratic', variant: 'quadratic', badge: '📈 Free Interactive Tool', title: 'Quadratic Functions & Transformations Explainer', desc: 'Type any quadratic equation and get a full breakdown — vertical scale, shifts, vertex, axis of symmetry, domain, range, and increasing/decreasing intervals — with a live graph and "why" explanations. 100% free, no signup.', href: 'https://quadratic-app.vercel.app', cta: 'Try It Free →' },
];

// ─── STUDY HUB · Free cheat-sheet resources ──────────────────────
export const FREE_STUDY_RESOURCES = [
  { id: 'lab-values', title: 'Essential Lab Values Cheat Sheet', desc: 'Quick-reference guide for medical students — CBC, BMP, ABG, cardiac markers, and more. Print it, keep it in your pocket.', icon: '🩺', href: '/downloads/mednotes-lab-values.md', cta: '📥 Download Free Cheat Sheet' },
  { id: 'js-cheatsheet', title: 'JavaScript Interview Cheatsheet', desc: 'Top 10 JS concepts explained: closures, promises, this, prototypes, event loop, and more. Perfect for last-minute interview prep.', icon: '💻', href: '/downloads/js-interview-cheatsheet.md', cta: '📥 Download Free Guide' },
];

// ─── FOCUS & FLOW · Digital templates ────────────────────────────
export const TEMPLATES = [
  { id: 'viralflow', title: 'ViralFlow', subtitle: 'Faceless Content Calendar & Operations Pack', desc: 'A content calendar, 60-hook library, trend tracker, and publishing checklist for TikTok, Shorts, and Reels — CSVs and guides, no app lock-in.', price: '$19', img: '/images/viralflow.png', href: 'https://buy.stripe.com/cNi5kD9KsdVEgxuaD40ZW03', badge: 'Content Pack' },
  { id: 'focus-os', title: 'Focus OS', subtitle: 'Printable Productivity System for Solopreneurs', desc: 'A weekly planner, daily priorities sheet, goal tracker, weekly review, and second-brain guide. Print it or fill it on a tablet — no app required.', price: '$15', img: '/images/focus-os.png', href: 'https://buy.stripe.com/cNi7sL5uc8Bk80YbH80ZW02', badge: 'Printable Planner' },
];

// ─── FOCUS & FLOW · Art collections (Watercolor Wisdom leads) ────
export const ART_COLLECTIONS = [
  { id: 'ghibli-wisdom', title: 'Watercolor Wisdom', subtitle: 'Watercolor Art & Mentorship Bundle', desc: '9 enchanting hand-painted watercolor pieces inspired by classic anime. Gentle wisdom for your digital space.', price: '$19', img: '/images/ghibli-wisdom.png', href: 'https://buy.stripe.com/00w3cvaOwcRA80Y26y0ZW01', badge: 'Digital Art' },
  { id: 'anime-wisdom', title: 'Anime Life Wisdom', subtitle: 'Neo-Tokyo Lofi Art Collection', desc: '9 high-res digital art pieces blending anime aesthetics with powerful life lessons. Discipline, Growth, Resilience & more.', price: '$15', img: '/images/anime-wisdom.png', href: 'https://buy.stripe.com/8x228r6yg8Bk2GEfXo0ZW00', badge: 'Digital Art' },
  { id: 'dark-academia', title: 'Dark Academia Wisdom', subtitle: 'Moody Art & Literature Collection', desc: '9 atmospheric vintage-style art pieces with literary quotes. Moody academia aesthetic at its finest.', price: '$15', img: '/images/dark-academia.png', href: 'https://buy.stripe.com/dRmeVdbSA18SgxuaD40ZW07', badge: 'Digital Art' },
  { id: 'faceless-motivation', title: 'Faceless Motivation', subtitle: 'Cyberpunk Hustle & Grind Art', desc: '9 bold cyberpunk motivation cards with faceless silhouettes and powerful text. Hustle culture meets aesthetic design.', price: '$12', img: '/images/faceless-motivation.png', href: 'https://buy.stripe.com/bJe28r8GobNw2GEbH80ZW09', badge: 'Digital Art' },
  { id: 'relatable-struggles', title: 'Relatable Life Struggles', subtitle: 'Humorous Meme Art Collection', desc: '9 hilarious anime-style meme pieces about everyday struggles. Monday mornings, procrastination, adulting fails, and more.', price: '$9', img: '/images/relatable-struggles.png', href: 'https://buy.stripe.com/4gM6oH5uccRAa964eG0ZW08', badge: 'Meme Art' },
];

// ─── FOCUS & FLOW · Free creator resources (in display order) ────
export const CREATOR_FREE = [
  { id: 'productivity', title: 'The Solopreneur Daily System', desc: 'A one-page productivity framework for solo founders. Plan your week, track priorities, and get more done without burnout.', icon: '⚡', href: '/downloads/solopreneur-daily-system.md', cta: '📥 Download Free System', external: false },
  { id: 'md-to-html', title: 'Markdown → HTML Converter', desc: 'Paste Markdown, get clean HTML. Copy to clipboard or download as an .html file. Free, no signup.', icon: '📝', href: 'https://md-to-html-one.vercel.app', cta: '🚀 Open Tool', external: true },
  { id: 'yt-optimizer', title: 'YouTube Title Optimizer', desc: 'Get 5 optimized title suggestions + trending hashtags for any video topic. Built for creators.', icon: '🎬', href: 'https://yt-title-optimizer.vercel.app', cta: '🚀 Open Tool', external: true },
  { id: 'faceless-channel', title: 'How to Start a Faceless Channel in 2026', desc: 'A practical guide to scripting, producing, and publishing faceless content at scale.', icon: '🎥', href: 'https://www.buymeacoffee.com/microventurelabs', cta: '📖 Read Guide →', external: true },
  { id: 'notion-organization', title: '5 Notion Organization Ideas for Busy Creators', desc: 'Simple database views, linked databases, and automation tricks every Notion user should know.', icon: '📘', href: 'https://www.buymeacoffee.com/microventurelabs', cta: '📖 Read Guide →', external: true },
];
