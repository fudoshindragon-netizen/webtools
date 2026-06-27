/**
 * Anime Life Wisdom — NFT Gallery (Vite + vanilla JS)
 */

const NFT_DATA = [
  {
    id: '01',
    title: 'Discipline',
    quote: '"Consistency is the bridge between goals and accomplishment."',
    desc: 'A samurai meditates under a mountain waterfall — a timeless reminder that discipline, not talent, builds mastery.',
    file: '01-discipline.png'
  },
  {
    id: '02',
    title: 'Growth',
    quote: '"Knowledge is the seed, but practice is the rain."',
    desc: 'A young mage tends to a magical sprout in a mystical library. Growth requires nurture, patience, and daily effort.',
    file: '02-growth.png'
  },
  {
    id: '03',
    title: 'Resilience',
    quote: '"It\'s not about how fast you go, but how many times you get back on the track."',
    desc: 'A cyberpunk racer fixes their bike in the neon rain. Resilience is the power to rise after every fall.',
    file: '03-resilience.png'
  },
  {
    id: '04',
    title: 'Focus',
    quote: '"The target is not outside, but within your own mind."',
    desc: 'An elegant archer in a peaceful zen garden — focus is the art of quieting the mind to hit your mark.',
    file: '04-focus.png'
  },
  {
    id: '05',
    title: 'Courage',
    quote: '"Courage is not the absence of fear, but the decision that something else is more important."',
    desc: 'A small knight faces a crystal dragon\'s cave. True courage moves forward despite the fear.',
    file: '05-courage.png'
  },
  {
    id: '06',
    title: 'Peace',
    quote: '"External storms cannot shake the mountain that finds peace within."',
    desc: 'A monk meditates on a floating island above the clouds. Peace is an inside job.',
    file: '06-peace.png'
  },
  {
    id: '07',
    title: 'Creativity',
    quote: '"Your imagination is the only limit to the world you can create."',
    desc: 'A cosmic artist paints a nebula into existence. Creativity is the spark that builds universes.',
    file: '07-creativity.png'
  },
  {
    id: '08',
    title: 'Community',
    quote: '"Individually we are drops, together we are an ocean."',
    desc: 'A group of adventurers shares a meal by the campfire. Community multiplies strength and joy.',
    file: '08-community.png'
  },
  {
    id: '09',
    title: 'Time',
    quote: '"Don\'t watch the clock; do what it does. Keep going."',
    desc: 'A master clockmaker crafts an intricate clockwork heart. Time is the canvas — what will you build on it?',
    file: '09-time.png'
  }
];

function buildGallery() {
  const grid = document.getElementById('gallery-grid');
  grid.innerHTML = NFT_DATA.map(item => `
    <div class="nft-card" data-id="${item.id}">
      <img
        class="nft-card-image"
        src="/images/${item.file}"
        alt="${item.title} — ${item.quote}"
        loading="lazy"
      />
      <div class="nft-card-info">
        <div class="nft-card-number">${item.id.padStart(2, '0')}</div>
        <div class="nft-card-title">${item.title}</div>
        <div class="nft-card-quote">${item.quote}</div>
      </div>
    </div>
  `).join('');

  // Click handlers
  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.nft-card');
    if (card) openLightbox(card.dataset.id);
  });
}

function openLightbox(id) {
  const item = NFT_DATA.find(d => d.id === id);
  if (!item) return;

  const lb = document.getElementById('lightbox');
  document.getElementById('lightbox-image').src = `/images/${item.file}`;
  document.getElementById('lightbox-image').alt = `${item.title} — ${item.quote}`;
  document.getElementById('lightbox-title').textContent = item.title;
  document.getElementById('lightbox-quote').textContent = item.quote;
  document.getElementById('lightbox-desc').textContent = item.desc;
  lb.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.add('hidden');
  document.body.style.overflow = '';
}

// Lightbox events
document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
document.getElementById('lightbox-close-btn').addEventListener('click', closeLightbox);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

// Init
document.addEventListener('DOMContentLoaded', buildGallery);