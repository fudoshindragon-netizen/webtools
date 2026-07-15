/**
 * MicroVenture Labs — Full Shop Page with Traffic Features
 */

// ─── PRODUCT DATA ───────────────────────────────────────────────
const TEMPLATES = [
      { id: 'focus-os', title: 'Focus OS', subtitle: 'The All-in-One Productivity Hub', desc: 'A minimalist Notion dashboard for task management, goal tracking, weekly reviews, and second brain — designed for solopreneurs.', price: '$15', img: '/images/focus-os.png', href: 'https://buy.stripe.com/cNi7sL5uc8Bk80YbH80ZW02', badge: 'Notion Template' },
      { id: 'viralflow', title: 'ViralFlow', subtitle: 'Faceless Content Calendar', desc: 'Content operating system for TikTok & YouTube Shorts. Viral hook library, trend tracker, and multi-platform scheduling.', price: '$19', img: '/images/viralflow.png', href: 'https://buy.stripe.com/cNi5kD9KsdVEgxuaD40ZW03', badge: 'Notion Template' },
      { id: 'mednotes', title: 'MedNotes', subtitle: 'Medical Student Pocket Guide', desc: 'High-yield reference for med students & residents. Lab values, mnemonics, anatomy cheat sheets, and pharmacology guides.', price: '$15', img: '/images/mednotes.png', href: 'https://buy.stripe.com/14A00je0I6tcftq26y0ZW04', badge: 'Notion + PDF' },
      { id: 'js-mastery', title: 'JS Interview Prep', subtitle: 'JavaScript Interview Dashboard', desc: '150+ interview questions, LeetCode tracker, code snippet library, and progress tracker — your complete JS interview system.', price: '$15', img: '/images/js-mastery.png', href: 'https://buy.stripe.com/4gM28r2i0aJs5SQeTk0ZW05', badge: 'Notion Template' }
    ];

const ART_COLLECTIONS = [
  { id: 'anime-wisdom', title: 'Anime Life Wisdom', subtitle: 'Neo-Tokyo Lofi Art Collection', desc: '9 high-res digital art pieces blending anime aesthetics with powerful life lessons. Discipline, Growth, Resilience & more.', price: '$15', img: '/images/anime-wisdom.png', href: 'https://buy.stripe.com/8x228r6yg8Bk2GEfXo0ZW00', badge: 'Digital Art' },
  { id: 'ghibli-wisdom', title: 'Ghibli Wisdom', subtitle: 'Watercolor Art & Mentorship Bundle', desc: '9 enchanting hand-painted watercolor pieces inspired by classic anime. Gentle wisdom for your digital space.', price: '$19', img: '/images/ghibli-wisdom.png', href: 'https://buy.stripe.com/00w3cvaOwcRA80Y26y0ZW01', badge: 'Digital Art' },
  { id: 'dark-academia', title: 'Dark Academia Wisdom', subtitle: 'Moody Art & Literature Collection', desc: '9 atmospheric vintage-style art pieces with literary quotes. Moody academia aesthetic at its finest.', price: '$15', img: '/images/dark-academia.png', href: 'https://buy.stripe.com/dRmeVdbSA18SgxuaD40ZW07', badge: 'Digital Art' },
  { id: 'faceless-motivation', title: 'Faceless Motivation', subtitle: 'Cyberpunk Hustle & Grind Art', desc: '9 bold cyberpunk motivation cards with faceless silhouettes and powerful text. Hustle culture meets aesthetic design.', price: '$12', img: '/images/faceless-motivation.png', href: 'https://buy.stripe.com/bJe28r8GobNw2GEbH80ZW09', badge: 'Digital Art' },
  { id: 'relatable-struggles', title: 'Relatable Life Struggles', subtitle: 'Humorous Meme Art Collection', desc: '9 hilarious anime-style meme pieces about everyday struggles. Monday mornings, procrastination, adulting fails, and more.', price: '$9', img: '/images/relatable-struggles.png', href: 'https://buy.stripe.com/4gM6oH5uccRAa964eG0ZW08', badge: 'Meme Art' }
];

const TOOLS = [
  { id: 'md-to-html', title: 'Markdown → HTML Converter', desc: 'Paste Markdown, get clean HTML. Copy to clipboard or download as an .html file. Free, no signup.', icon: '📝', href: 'https://md-to-html-one.vercel.app' },
  { id: 'yt-optimizer', title: 'YouTube Title Optimizer', desc: 'Get 5 optimized title suggestions + trending hashtags for any video topic. Built for creators.', icon: '🎬', href: 'https://yt-title-optimizer.vercel.app' }
];

// ─── FREE DOWNLOADS (Traffic Bait) ─────────────────────────────
const FREE_RESOURCES = [
  { id: 'lab-values', title: 'Essential Lab Values Cheat Sheet', desc: 'Quick-reference guide for medical students — CBC, BMP, ABG, cardiac markers, and more. Print it, keep it in your pocket.', icon: '🩺', file: '/downloads/mednotes-lab-values.md', cta: '📥 Download Free Cheat Sheet' },
  { id: 'js-cheatsheet', title: 'JavaScript Interview Cheatsheet', desc: 'Top 10 JS concepts explained: closures, promises, this, prototypes, event loop, and more. Perfect for last-minute interview prep.', icon: '💻', file: '/downloads/js-interview-cheatsheet.md', cta: '📥 Download Free Guide' },
  { id: 'productivity', title: 'The Solopreneur Daily System', desc: 'A one-page productivity framework for solo founders. Plan your week, track priorities, and get more done without burnout.', icon: '⚡', file: '/downloads/solopreneur-daily-system.md', cta: '📥 Download Free System' }
];

// ─── BLOG / RESOURCES CONTENT ──────────────────────────────────
const BLOG_POSTS = [
      { id: 'notion-tips', title: '5 Notion Organization Ideas for Busy Creators', desc: 'Simple database views, linked databases, and automation tricks every Notion user should know.', icon: '📘', href: 'https://www.buymeacoffee.com/microventurelabs' },
      { id: 'faceless-content', title: 'How to Start a Faceless Channel in 2026', desc: 'A practical guide to scripting, producing, and publishing faceless content at scale.', icon: '🎥', href: 'https://www.buymeacoffee.com/microventurelabs' },
      { id: 'med-study', title: 'How to Organize Medical Notes Digitally', desc: 'Tips for using digital tools and templates to organize study materials, track progress, and review efficiently.', icon: '📚', href: 'https://www.buymeacoffee.com/microventurelabs' }
    ];

// ─── SOCIAL SHARE URL HELPER ───────────────────────────────────
function getShareLinks(title, url) {
  const encodedUrl = encodeURIComponent(url || 'https://generationwealthforever.com');
  const encodedTitle = encodeURIComponent(title || 'MicroVenture Labs — Digital Products for Creators');
  return [
    { name: 'Twitter', icon: '🐦', url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}` },
    { name: 'Facebook', icon: '👍', url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { name: 'LinkedIn', icon: '💼', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` }
  ];
}

// ─── RENDER ──────────────────────────────────────────────────────
function renderFreeResources() {
  const grid = document.getElementById('free-resources-grid');
  grid.innerHTML = FREE_RESOURCES.map(r => `
    <div class="free-card">
      <div class="free-icon">${r.icon}</div>
      <h3 class="free-title">${r.title}</h3>
      <p class="free-desc">${r.desc}</p>
      <a href="${r.file}" target="_blank" class="btn-primary" style="width:100%;justify-content:center;font-size:14px;padding:12px 20px">${r.cta}</a>
    </div>
  `).join('');
}

function renderBlog() {
  const grid = document.getElementById('blog-grid');
  grid.innerHTML = BLOG_POSTS.map(p => `
    <div class="blog-card">
      <div class="blog-icon">${p.icon}</div>
      <h3 class="blog-title">${p.title}</h3>
      <p class="blog-desc">${p.desc}</p>
      <a href="${p.href}" target="_blank" class="btn-outline" style="width:100%;justify-content:center">☕ Read on Buymeacoffee →</a>
    </div>
  `).join('');
}

function renderCards(gridId, items, cardType) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  grid.innerHTML = items.map(item => {
    if (cardType === 'product') {
      const shareLinks = getShareLinks(`${item.title} — ${item.price}`, null);
      return `
        <div class="product-card">
          <img class="product-card-image" src="${item.img}" alt="${item.title}" loading="lazy" />
          <div class="product-card-info">
            <span class="product-card-badge">${item.badge}</span>
            <h3 class="product-card-title">${item.title}</h3>
            <p class="product-card-desc">${item.desc}</p>
            <div class="product-card-price">${item.price}</div>
            <a href="${item.href}" target="_blank" class="btn-buy">🛍️ Buy Now — ${item.price}</a>
            <details class="share-toggle">
              <summary class="share-summary">🔗 Share this product</summary>
              <div class="share-links">
                ${shareLinks.map(s => `<a href="${s.url}" target="_blank" rel="noopener" class="share-link">${s.icon} ${s.name}</a>`).join('')}
              </div>
            </details>
          </div>
        </div>
      `;
    }
    if (cardType === 'tool') {
      return `
        <div class="tool-card">
          <div class="tool-icon">${item.icon}</div>
          <h3>${item.title}</h3>
          <p>${item.desc}</p>
          <div class="tool-actions">
            <a href="${item.href}" target="_blank" class="btn-outline">🚀 Open Tool</a>
            <a href="https://www.buymeacoffee.com/microventurelabs" target="_blank" class="btn-outline">☕ Support</a>
          </div>
        </div>
      `;
    }
    return '';
  }).join('');
}

// ─── STRUCTURED DATA (JSON-LD) ────────────────────────────────
function injectStructuredData() {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Store",
    "name": "MicroVenture Labs",
    "url": "https://generationwealthforever.com",
    "description": "Digital products for creators, students, and solopreneurs — Notion templates, art collections, and free web tools.",
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "USD",
      "lowPrice": "9",
      "highPrice": "19"
    }
  });
  document.head.appendChild(script);
}

// ─── INIT ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderFreeResources();
  renderBlog();
  renderCards('templates-grid', TEMPLATES, 'product');
  renderCards('art-grid', ART_COLLECTIONS, 'product');
  renderCards('tools-grid', TOOLS, 'tool');
  injectStructuredData();
});