/**
 * MicroVenture Labs — Central Product Sales Page
 */

// ─── PRODUCT DATA ───────────────────────────────────────────────
const TEMPLATES = [
  {
    id: 'focus-os',
    title: 'Focus OS',
    subtitle: 'The All-in-One Productivity Hub',
    desc: 'A minimalist Notion dashboard for task management, goal tracking, weekly reviews, and second brain — designed for solopreneurs.',
    price: '$15',
    img: '/images/focus-os.png',
    href: 'https://buy.stripe.com/cNi7sL5uc8Bk80YbH80ZW02',
    badge: 'Notion Template'
  },
  {
    id: 'viralflow',
    title: 'ViralFlow',
    subtitle: 'Faceless Content Calendar',
    desc: 'Content operating system for TikTok & YouTube Shorts creators. Viral hook library, trend tracker, and multi-platform scheduling.',
    price: '$19',
    img: '/images/viralflow.png',
    href: 'https://buy.stripe.com/cNi5kD9KsdVEgxuaD40ZW03',
    badge: 'Notion Template'
  },
  {
    id: 'mednotes',
    title: 'MedNotes',
    subtitle: 'Medical Student Pocket Guide',
    desc: 'High-yield reference for med students & residents. Lab values, mnemonics, anatomy cheat sheets, and pharmacology guides.',
    price: '$15',
    img: '/images/mednotes.png',
    href: 'https://buy.stripe.com/14A00je0I6tcftq26y0ZW04',
    badge: 'Notion + PDF'
  },
  {
    id: 'js-mastery',
    title: 'JS Interview Prep',
    subtitle: 'JavaScript Interview Dashboard',
    desc: '150+ interview questions, LeetCode tracker, code snippet library, and progress tracker — your complete JS interview system.',
    price: '$15',
    img: '/images/js-mastery.png',
    href: 'https://buy.stripe.com/4gM28r2i0aJs5SQeTk0ZW05',
    badge: 'Notion Template'
  }
];

const ART_COLLECTIONS = [
  {
    id: 'anime-wisdom',
    title: 'Anime Life Wisdom',
    subtitle: 'Neo-Tokyo Lofi Art Collection',
    desc: '9 high-res digital art pieces blending anime aesthetics with powerful life lessons. Discipline, Growth, Resilience & more.',
    price: '$15',
    img: '/images/anime-wisdom.png',
    href: 'https://buy.stripe.com/8x228r6yg8Bk2GEfXo0ZW00',
    badge: 'Digital Art'
  },
  {
    id: 'ghibli-wisdom',
    title: 'Ghibli Wisdom',
    subtitle: 'Watercolor Art & Mentorship Bundle',
    desc: '9 enchanting hand-painted watercolor pieces inspired by classic anime. Gentle wisdom for your digital space.',
    price: '$19',
    img: '/images/ghibli-wisdom.png',
    href: 'https://buy.stripe.com/4gMeVd8Go3h080Y3aC0ZW06',
    badge: 'Digital Art'
  }
];

const TOOLS = [
  {
    id: 'md-to-html',
    title: 'Markdown → HTML Converter',
    desc: 'Paste Markdown, get clean HTML. Copy to clipboard or download as an .html file. Free, no signup.',
    icon: '📝',
    href: 'https://md-to-html-one.vercel.app',
    badge: 'Free Tool'
  },
  {
    id: 'yt-optimizer',
    title: 'YouTube Title Optimizer',
    desc: 'Get 5 optimized title suggestions + trending hashtags for any video topic. Built for creators.',
    icon: '🎬',
    href: 'https://yt-title-optimizer.vercel.app',
    badge: 'Free Tool'
  }
];

// ─── RENDER ──────────────────────────────────────────────────────
function renderCards(gridId, items, cardType) {
  const grid = document.getElementById(gridId);
  grid.innerHTML = items.map(item => {
    if (cardType === 'product') {
      const buyBtn = `<a href="${item.href}" target="_blank" class="btn-buy">🛍️ Buy Now — ${item.price}</a>`;

      return `
        <div class="product-card">
          <img class="product-card-image" src="${item.img}" alt="${item.title}" loading="lazy" />
          <div class="product-card-info">
            <span class="product-card-badge">${item.badge}</span>
            <h3 class="product-card-title">${item.title}</h3>
            <p class="product-card-desc">${item.desc}</p>
            <div class="product-card-price">${item.price}</div>
            ${buyBtn}
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
          </div>
        </div>
      `;
    }
    return '';
  }).join('');
}

// ─── INIT ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderCards('templates-grid', TEMPLATES, 'product');
  renderCards('art-grid', ART_COLLECTIONS, 'product');
  renderCards('tools-grid', TOOLS, 'tool');
});