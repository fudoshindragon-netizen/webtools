/**
 * MicroVenture Labs — shared render helpers for the two-page storefront.
 */

// ─── SOCIAL SHARE URL HELPER ─────────────────────────────────────
export function getShareLinks(title, url) {
  const encodedUrl = encodeURIComponent(url || 'https://generationwealthforever.com');
  const encodedTitle = encodeURIComponent(title || 'MicroVenture Labs');
  return [
    { name: 'Twitter', icon: '🐦', url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}` },
    { name: 'Facebook', icon: '👍', url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { name: 'LinkedIn', icon: '💼', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
  ];
}

// ─── PRODUCT CARDS (paid) ────────────────────────────────────────
export function renderProductCards(gridId, items) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  grid.innerHTML = items.map((item) => {
    const shareLinks = getShareLinks(`${item.title} — ${item.price}`, null);
    const noteHtml = item.note ? `<p class="product-card-note">${item.note}</p>` : '';
    return `
      <div class="product-card">
        <img class="product-card-image" src="${item.img}" alt="${item.title}" loading="lazy" />
        <div class="product-card-info">
          <span class="product-card-badge">${item.badge}</span>
          <h3 class="product-card-title">${item.title}</h3>
          <p class="product-card-desc">${item.desc}</p>
          ${noteHtml}
          <div class="product-card-price">${item.price}</div>
          ${item.available === false
            ? `<span class="btn-coming-soon">⏳ Coming soon</span>`
            : `<a href="${item.href}" target="_blank" rel="noopener" class="btn-buy">🛍️ Buy Now — ${item.price}</a>`}
          <details class="share-toggle">
            <summary class="share-summary">🔗 Share this product</summary>
            <div class="share-links">
              ${shareLinks.map((s) => `<a href="${s.url}" target="_blank" rel="noopener" class="share-link">${s.icon} ${s.name}</a>`).join('')}
            </div>
          </details>
        </div>
      </div>
    `;
  }).join('');
}

// ─── FREE CARDS (downloads / guides) ─────────────────────────────
export function renderFreeCards(gridId, items) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  grid.innerHTML = items.map((r) => `
    <div class="free-card">
      <div class="free-icon">${r.icon}</div>
      <h3 class="free-title">${r.title}</h3>
      <p class="free-desc">${r.desc}</p>
      <a href="${r.href}" target="_blank" rel="noopener" class="btn-primary" style="width:100%;justify-content:center;font-size:14px;padding:12px 20px">${r.cta}</a>
    </div>
  `).join('');
}

// ─── FREE STUDY APP CARDS (study-card style) ─────────────────────
export function renderStudyAppCards(gridId, items) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  grid.innerHTML = items.map((a) => `
    <div class="study-card study-card--${a.variant}">
      <span class="study-badge study-badge--${a.variant}">${a.badge}</span>
      <h2 class="section-title">${a.title}</h2>
      <p class="section-sub">${a.desc}</p>
      <div class="study-card-ctas">
        <a href="${a.href}" target="_blank" rel="noopener" class="btn-primary">${a.cta}</a>
      </div>
    </div>
  `).join('');
}
