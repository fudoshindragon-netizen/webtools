import './style.css';

// ──────────────────────── TITLE TEMPLATES ────────────────────────
const TITLE_TEMPLATES = [
  (t) => `${t}: The Complete Guide for Beginners`,
  (t) => `5 ${t} Tips You Wish You Knew Sooner`,
  (t) => `I Tried ${t} for 30 Days — Here's What Happened`,
  (t) => `The Ultimate ${t} Tutorial (2026 Update)`,
  (t) => `${t} Explained in 10 Minutes`,
  (t) => `How to Master ${t} in 2026`,
  (t) => `10 ${t} Hacks That Actually Work`,
  (t) => `${t} for Beginners: Start Here`,
  (t) => `Why Everyone Is Talking About ${t}`,
  (t) => `The Truth About ${t} — What Nobody Tells You`,
  (t) => `${t}: 3 Common Mistakes to Avoid`,
  (t) => `How I Make Money with ${t}`,
  (t) => `${t} vs ${getRandomAlternative(t)}: Which Is Better?`,
  (t) => `Top 7 ${t} Tools You Need to Try`,
  (t) => `${t} Made Simple: A Step-by-Step Guide`,
  (t) => `Don't Start ${t} Until You Watch This`,
  (t) => `The #1 Secret to ${t} Success`,
  (t) => `${t} for Experts: Advanced Techniques`,
  (t) => `Is ${t} Worth It in 2026? An Honest Review`,
  (t) => `Stop Making These ${t} Mistakes`,
];

function getRandomAlternative(topic) {
  const alternatives = ['Alternatives', 'Competitors', 'Different Approaches', 'Other Options', 'Similar Tools'];
  return alternatives[Math.floor(Math.random() * alternatives.length)];
}

// ──────────────────────── HASHTAG DATABASE ────────────────────────
// Organized by niche categories with keyword matching
const HASHTAG_NICHES = [
  {
    name: 'tech',
    keywords: ['tech', 'coding', 'programming', 'python', 'javascript', 'web dev', 'software', 'app', 'ai', 'artificial intelligence', 'developer', 'computer'],
    tags: [
      { tag: 'technology', volume: '2.5B' },
      { tag: 'coding', volume: '1.8B' },
      { tag: 'programming', volume: '1.2B' },
      { tag: 'python', volume: '980M' },
      { tag: 'javascript', volume: '750M' },
      { tag: 'webdevelopment', volume: '620M' },
      { tag: 'ai', volume: '4.1B' },
      { tag: 'machinelearning', volume: '890M' },
      { tag: 'softwareengineer', volume: '510M' },
      { tag: 'computerscience', volume: '450M' },
    ],
  },
  {
    name: 'gaming',
    keywords: ['gaming', 'game', 'minecraft', 'fortnite', 'valorant', 'gta', 'roblox', 'fifa', 'nintendo', 'playstation', 'xbox', 'pc gaming', 'streaming'],
    tags: [
      { tag: 'gaming', volume: '3.2B' },
      { tag: 'gamer', volume: '1.5B' },
      { tag: 'minecraft', volume: '2.1B' },
      { tag: 'fortnite', volume: '1.8B' },
      { tag: 'valorant', volume: '720M' },
      { tag: 'gamingcommunity', volume: '680M' },
      { tag: 'pcgaming', volume: '590M' },
      { tag: 'gamingsetup', volume: '420M' },
      { tag: 'twitch', volume: '380M' },
      { tag: 'esports', volume: '310M' },
    ],
  },
  {
    name: 'fitness',
    keywords: ['fitness', 'workout', 'gym', 'exercise', 'weight loss', 'muscle', 'yoga', 'running', 'bodybuilding', 'healthy', 'diet', 'nutrition'],
    tags: [
      { tag: 'fitness', volume: '3.5B' },
      { tag: 'gym', volume: '1.9B' },
      { tag: 'workout', volume: '1.6B' },
      { tag: 'weightloss', volume: '1.2B' },
      { tag: 'bodybuilding', volume: '780M' },
      { tag: 'yoga', volume: '690M' },
      { tag: 'fitnessmotivation', volume: '650M' },
      { tag: 'healthylifestyle', volume: '580M' },
      { tag: 'nutrition', volume: '420M' },
      { tag: 'musclebuilding', volume: '340M' },
    ],
  },
  {
    name: 'food',
    keywords: ['food', 'cooking', 'recipe', 'baking', 'dinner', 'breakfast', 'healthy food', 'meal prep', 'vegan', 'keto', 'cake', 'chocolate'],
    tags: [
      { tag: 'food', volume: '4.8B' },
      { tag: 'cooking', volume: '1.5B' },
      { tag: 'recipe', volume: '1.3B' },
      { tag: 'foodie', volume: '980M' },
      { tag: 'baking', volume: '720M' },
      { tag: 'healthyfood', volume: '610M' },
      { tag: 'mealprep', volume: '480M' },
      { tag: 'vegan', volume: '420M' },
      { tag: 'keto', volume: '380M' },
      { tag: 'comfortfood', volume: '290M' },
    ],
  },
  {
    name: 'travel',
    keywords: ['travel', 'vacation', 'trip', 'tourism', 'backpacking', 'adventure', 'wanderlust', 'explore', 'holiday', 'destination'],
    tags: [
      { tag: 'travel', volume: '4.2B' },
      { tag: 'wanderlust', volume: '1.1B' },
      { tag: 'adventure', volume: '890M' },
      { tag: 'travelphotography', volume: '750M' },
      { tag: 'explore', volume: '680M' },
      { tag: 'nature', volume: '2.1B' },
      { tag: 'backpacking', volume: '420M' },
      { tag: 'roadtrip', volume: '380M' },
      { tag: 'solotravel', volume: '310M' },
      { tag: 'traveltips', volume: '280M' },
    ],
  },
  {
    name: 'business',
    keywords: ['business', 'entrepreneur', 'startup', 'marketing', 'money', 'finance', 'investing', 'side hustle', 'passive income', 'make money', 'sales'],
    tags: [
      { tag: 'business', volume: '2.8B' },
      { tag: 'entrepreneur', volume: '1.3B' },
      { tag: 'marketing', volume: '890M' },
      { tag: 'money', volume: '2.2B' },
      { tag: 'startup', volume: '650M' },
      { tag: 'finance', volume: '590M' },
      { tag: 'investing', volume: '520M' },
      { tag: 'sidehustle', volume: '480M' },
      { tag: 'passiveincome', volume: '410M' },
      { tag: 'smallbusiness', volume: '370M' },
    ],
  },
  {
    name: 'education',
    keywords: ['education', 'study', 'learning', 'school', 'college', 'exam', 'student', 'university', 'course', 'tutorial', 'how to', 'learn'],
    tags: [
      { tag: 'study', volume: '1.2B' },
      { tag: 'learning', volume: '980M' },
      { tag: 'education', volume: '920M' },
      { tag: 'student', volume: '780M' },
      { tag: 'studygram', volume: '560M' },
      { tag: 'exams', volume: '420M' },
      { tag: 'studywithme', volume: '380M' },
      { tag: 'onlinelearning', volume: '340M' },
      { tag: 'studytips', volume: '290M' },
      { tag: 'university', volume: '260M' },
    ],
  },
  {
    name: 'beauty',
    keywords: ['beauty', 'makeup', 'skincare', 'hair', 'nails', 'cosmetic', 'fashion', 'style', 'lipstick', 'foundation', 'tutorial beauty'],
    tags: [
      { tag: 'beauty', volume: '2.5B' },
      { tag: 'makeup', volume: '1.8B' },
      { tag: 'skincare', volume: '1.4B' },
      { tag: 'fashion', volume: '1.1B' },
      { tag: 'hair', volume: '890M' },
      { tag: 'makeuptutorial', volume: '620M' },
      { tag: 'skincareroutine', volume: '510M' },
      { tag: 'nails', volume: '450M' },
      { tag: 'beautytips', volume: '380M' },
      { tag: 'selfcare', volume: '350M' },
    ],
  },
  {
    name: 'music',
    keywords: ['music', 'guitar', 'piano', 'singing', 'rapper', 'beat', 'producer', 'song', 'audio', 'instrumental', 'dj'],
    tags: [
      { tag: 'music', volume: '4.5B' },
      { tag: 'guitar', volume: '890M' },
      { tag: 'piano', volume: '720M' },
      { tag: 'singing', volume: '580M' },
      { tag: 'producer', volume: '420M' },
      { tag: 'beatmaking', volume: '310M' },
      { tag: 'songwriting', volume: '280M' },
      { tag: 'musician', volume: '260M' },
      { tag: 'dj', volume: '240M' },
      { tag: 'musicproduction', volume: '220M' },
    ],
  },
  {
    name: 'default',
    keywords: [''],
    tags: [
      { tag: 'viral', volume: '1.5B' },
      { tag: 'trending', volume: '1.2B' },
      { tag: 'tutorial', volume: '980M' },
      { tag: 'howto', volume: '850M' },
      { tag: 'tips', volume: '720M' },
      { tag: 'beginners', volume: '580M' },
      { tag: 'hacks', volume: '520M' },
      { tag: 'guide', volume: '490M' },
      { tag: 'mustwatch', volume: '380M' },
      { tag: '2026', volume: '150M' },
    ],
  },
];

// ──────────────────────── DOM REFS ────────────────────────
const topicInput = document.getElementById('topic-input');
const generateBtn = document.getElementById('generate-btn');
const resultsSection = document.getElementById('results');
const titlesList = document.getElementById('titles-list');
const hashtagsGrid = document.getElementById('hashtags-grid');
const copyTitlesBtn = document.getElementById('copy-titles-btn');
const copyHashtagsBtn = document.getElementById('copy-hashtags-btn');

// ──────────────────────── CORE LOGIC ────────────────────────

/** Capitalize first letter */
function cap(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/** Clean and normalize topic input */
function normalizeTopic(input) {
  return input.trim().replace(/\s+/g, ' ').replace(/[^\w\s-]/g, '').substring(0, 100);
}

/** Find the best-matching niche for a topic */
function detectNiche(topic) {
  const lower = topic.toLowerCase();
  let bestMatch = { niche: HASHTAG_NICHES[HASHTAG_NICHES.length - 1], score: 0 };

  for (const niche of HASHTAG_NICHES) {
    if (niche.name === 'default') continue;
    let score = 0;
    for (const kw of niche.keywords) {
      if (lower.includes(kw)) {
        score += kw.length;
      }
    }
    if (score > bestMatch.score) {
      bestMatch = { niche, score };
    }
  }

  return bestMatch.niche;
}

/** Generate 5 title suggestions from template patterns */
function generateTitles(topic) {
  const cleaned = cap(normalizeTopic(topic));
  if (!cleaned) return [];

  // Shuffle templates and pick 5 unique ones
  const shuffled = [...TITLE_TEMPLATES].sort(() => Math.random() - 0.5);
  const used = new Set();
  const titles = [];

  for (const template of shuffled) {
    if (titles.length >= 5) break;
    const title = template(cleaned);
    // Ensure no duplicates
    if (!used.has(title)) {
      used.add(title);
      titles.push(title);
    }
  }

  return titles;
}

/** Get hashtags for a detected niche */
function getHashtags(topic) {
  const niche = detectNiche(topic);
  return niche.tags;
}

// ──────────────────────── RENDER FUNCTIONS ────────────────────────

function renderTitles(titles) {
  titlesList.innerHTML = '';
  titles.forEach((title) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="title-text">${escapeHtml(title)}</span>
      <span class="copy-icon">📋</span>
    `;
    li.addEventListener('click', () => {
      copyToClipboard(title, 'Title copied!');
    });
    titlesList.appendChild(li);
  });
}

function renderHashtags(hashtags) {
  hashtagsGrid.innerHTML = '';
  hashtags.forEach(({ tag, volume }) => {
    const chip = document.createElement('span');
    chip.className = 'hashtag-chip';
    chip.innerHTML = `#${tag} <span class="tag-count">${volume}</span>`;
    chip.addEventListener('click', () => {
      copyToClipboard(`#${tag}`, 'Hashtag copied!');
    });
    hashtagsGrid.appendChild(chip);
  });
}

// ──────────────────────── UTILITY ────────────────────────

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function copyToClipboard(text, message) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(message || 'Copied!');
  }).catch(() => {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast(message || 'Copied!');
  });
}

function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);

  setTimeout(() => {
    el.classList.add('fade-out');
    setTimeout(() => el.remove(), 300);
  }, 2500);
}

// ──────────────────────── EVENT HANDLERS ────────────────────────

function generate() {
  const topic = normalizeTopic(topicInput.value);

  if (!topic) {
    showToast('⚠️ Please enter a topic first!');
    topicInput.focus();
    return;
  }

  // Show loading state
  generateBtn.innerHTML = '<span class="spinner"></span> Generating...';
  generateBtn.disabled = true;

  // Simulate a brief processing delay for UX
  setTimeout(() => {
    const titles = generateTitles(topic);
    const hashtags = getHashtags(topic);

    renderTitles(titles);
    renderHashtags(hashtags);
    resultsSection.classList.remove('hidden');

    generateBtn.innerHTML = '✨ Generate';
    generateBtn.disabled = false;

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 400);
}

// Generate button
generateBtn.addEventListener('click', generate);

// Enter key in input field
topicInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') generate();
});

// Copy all titles
copyTitlesBtn.addEventListener('click', () => {
  const items = titlesList.querySelectorAll('li .title-text');
  const text = Array.from(items).map(el => el.textContent).join('\n');
  if (text) {
    copyToClipboard(text, '📋 All titles copied!');
  } else {
    showToast('No titles to copy');
  }
});

// Copy all hashtags
copyHashtagsBtn.addEventListener('click', () => {
  const chips = hashtagsGrid.querySelectorAll('.hashtag-chip');
  const text = Array.from(chips).map(el => {
    const tag = el.textContent.trim().split(' ')[0];
    return tag;
  }).join(' ');
  if (text) {
    copyToClipboard(text, '📋 All hashtags copied!');
  } else {
    showToast('No hashtags to copy');
  }
});

// ──────────────────────── INIT ────────────────────────

// Focus the input on load
topicInput.focus();
console.log('🎬 YouTube Title & Hashtag Optimizer loaded.');
