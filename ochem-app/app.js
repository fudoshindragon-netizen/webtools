/**
 * Organic Chemistry Practice — single-page app.
 * Loads content from content.json, renders topics + questions,
 * and persists progress in localStorage. No backend, no API keys.
 */

const STORAGE_KEY = 'ochem-practice-progress-v1';

let content = null;
let currentTopicId = null;

// ─── State / localStorage ──────────────────────────────────────
function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore corrupted storage
  }
  return { topics: {} };
}

function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    // ignore (private mode / quota)
  }
}

// Normalize a short answer for loose matching (case/whitespace/underscore).
function normalize(s) {
  return String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '')
    .replace(/[^a-z0-9]/g, '');
}

// ─── Mastery helpers ───────────────────────────────────────────
function topicStats(progress, topicId, topic) {
  const total = topic.questions.length;
  const record = progress.topics[topicId];
  if (!record) {
    return { attempted: 0, correct: 0, total };
  }
  const attempted = Object.keys(record.answers).length;
  const correct = Object.values(record.answers).filter(Boolean).length;
  return { attempted, correct, total };
}

function masteryBadge(percentCorrect, attempted) {
  if (!attempted) return '—';
  if (percentCorrect >= 90) return '🏆 Master';
  if (percentCorrect >= 75) return '💪 Solid';
  if (percentCorrect >= 50) return '📈 Progressing';
  return '🌱 Starting';
}

function percent(correct, attempted) {
  if (!attempted) return 0;
  return Math.round((correct / attempted) * 100);
}

// ─── Rendering: topic list ─────────────────────────────────────
function renderTopicList() {
  const progress = loadProgress();
  const grid = document.getElementById('topic-grid');
  grid.innerHTML = '';

  content.topics.forEach((topic) => {
    const stats = topicStats(progress, topic.id, topic);
    const pct = percent(stats.correct, stats.attempted);
    const badge = masteryBadge(pct, stats.attempted);

    const card = document.createElement('div');
    card.className = 'topic-card';
    card.setAttribute('role', 'button');
    card.tabIndex = 0;
    card.innerHTML = `
      <div class="topic-card-icon">${topic.icon}</div>
      <div class="topic-card-title">${topic.title}</div>
      <div class="topic-card-meta">
        <span>${stats.attempted}/${stats.total} attempted</span>
        <span class="topic-mastery-badge" title="Topic mastery">${badge}</span>
      </div>
      <div class="topic-progress-track" style="margin-top:10px">
        <div class="topic-progress-fill" style="width:${pct}%"></div>
      </div>
    `;
    card.addEventListener('click', () => openTopic(topic.id));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openTopic(topic.id);
      }
    });
    grid.appendChild(card);
  });

  updateOverallMastery();
}

function updateOverallMastery() {
  const progress = loadProgress();
  let correct = 0;
  let attempted = 0;
  content.topics.forEach((topic) => {
    const stats = topicStats(progress, topic.id, topic);
    correct += stats.correct;
    attempted += stats.attempted;
  });
  const pct = percent(correct, attempted);
  const badge = masteryBadge(pct, attempted);
  document.getElementById('overall-badge').textContent = badge;
  document.getElementById('overall-percent').textContent = pct + '%';
}

// ─── Rendering: topic detail ───────────────────────────────────
function openTopic(topicId) {
  currentTopicId = topicId;
  const topic = content.topics.find((t) => t.id === topicId);
  if (!topic) return;

  document.getElementById('topic-list-view').classList.add('hidden');
  document.getElementById('topic-detail-view').classList.remove('hidden');

  const container = document.getElementById('topic-detail');
  container.innerHTML = `
    <div class="topic-detail-header">
      <span class="topic-detail-icon">${topic.icon}</span>
      <h2>${topic.title}</h2>
    </div>
    <div class="concept-box">
      <h3>Concept</h3>
      <p>${topic.concept}</p>
    </div>
    <h3 class="questions-heading">Practice Questions</h3>
    <div id="questions-container"></div>
  `;

  const qc = document.getElementById('questions-container');
  const progress = loadProgress();

  topic.questions.forEach((q) => {
    qc.appendChild(renderQuestion(q, topic.id, progress));
  });
}

function renderQuestion(q, topicId, progress) {
  const card = document.createElement('div');
  card.className = 'question-card';
  card.dataset.questionId = q.id;

  const prevAnswer = progress.topics[topicId]?.answers?.[q.id];
  const answered = prevAnswer !== undefined;

  const typeLabel = q.type === 'multiple-choice' ? 'Multiple choice' : 'Short answer';

  let body = '';
  if (q.type === 'multiple-choice') {
    body = `<div class="options-list">${q.options
      .map((opt, i) => {
        return `
          <label class="option" data-index="${i}">
            <input type="radio" name="${q.id}" value="${i}" ${answered && prevAnswer === i ? 'checked' : ''} ${answered ? 'disabled' : ''} />
            <span>${opt}</span>
          </label>`;
      })
      .join('')}</div>`;
  } else {
    body = `<input type="text" class="short-answer-input" placeholder="Type your answer…" autocomplete="off" ${answered ? 'value="' + escapeHtml(String(prevAnswer)) + '" disabled' : ''} />`;
  }

  card.innerHTML = `
    <p class="question-prompt">${q.prompt}</p>
    <div class="question-type">${typeLabel}</div>
    ${body}
    <button class="check-btn" type="button" ${answered ? 'disabled' : ''}>Check answer</button>
    <div class="feedback" id="feedback-${q.id}"></div>
  `;

  // If already answered, show the stored result immediately.
  if (answered) {
    const correct = prevAnswer === q.answer;
    showFeedback(q, correct, true);
  } else {
    card.querySelector('.check-btn').addEventListener('click', () => {
      handleAnswer(card, q, topicId);
    });
    card.querySelector('.check-btn').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleAnswer(card, q, topicId);
    });
  }

  return card;
}

function getSelectedOption(card) {
  const checked = card.querySelector('input[type="radio"]:checked');
  return checked ? Number(checked.value) : null;
}

function handleAnswer(card, q, topicId) {
  let userAnswer;
  let isCorrect;

  if (q.type === 'multiple-choice') {
    const selected = getSelectedOption(card);
    if (selected === null) {
      // No option selected — gently nudge, don't count an attempt.
      const fb = card.querySelector('.feedback');
      fb.className = 'feedback visible wrong';
      fb.innerHTML = `<div class="feedback-head wrong">Please select an answer.</div>`;
      return;
    }
    userAnswer = selected;
    isCorrect = selected === q.answer;
  } else {
    const input = card.querySelector('.short-answer-input');
    userAnswer = input.value;
    isCorrect = normalize(input.value) === normalize(q.answer);
  }

  // Mark the correct option(s) visually.
  if (q.type === 'multiple-choice') {
    card.querySelectorAll('.option').forEach((optEl) => {
      const idx = Number(optEl.dataset.index);
      optEl.classList.remove('selected');
      if (idx === q.answer) optEl.classList.add('correct');
      if (idx === userAnswer && !isCorrect) optEl.classList.add('wrong');
      optEl.querySelector('input').disabled = true;
    });
  } else {
    card.querySelector('.short-answer-input').disabled = true;
  }

  card.querySelector('.check-btn').disabled = true;
  showFeedback(q, isCorrect, false);

  // Persist progress.
  const progress = loadProgress();
  if (!progress.topics[topicId]) progress.topics[topicId] = { answers: {} };
  if (!progress.topics[topicId].answers) progress.topics[topicId].answers = {};
  progress.topics[topicId].answers[q.id] = isCorrect;
  saveProgress(progress);

  updateOverallMastery();
}

function showFeedback(q, isCorrect, alreadyAnswered) {
  const fb = document.getElementById('feedback-' + q.id);
  if (!fb) return;
  fb.className = 'feedback visible ' + (isCorrect ? 'correct' : 'wrong');
  const head = isCorrect ? '✓ Correct' : '✗ Not quite';
  fb.innerHTML = `
    <div class="feedback-head ${isCorrect ? 'correct' : 'wrong'}">${head}</div>
    <p class="worked"><strong>Worked solution:</strong> ${q.explanation}</p>
    ${!isCorrect ? `<p class="worked"><strong>Correct answer:</strong> ${q.type === 'multiple-choice' ? q.options[q.answer] : escapeHtml(q.answer)}</p>` : ''}
  `;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Init ───────────────────────────────────────────────────────
function init() {
  fetch('content.json')
    .then((res) => {
      if (!res.ok) throw new Error('content.json failed to load');
      return res.json();
    })
    .then((data) => {
      content = data;
      document.getElementById('app-title').textContent = data.app.title;
      document.getElementById('app-subtitle').textContent = data.app.subtitle;
      document.getElementById('app-disclaimer').textContent = data.app.disclaimer;
      renderTopicList();
    })
    .catch((err) => {
      document.getElementById('topic-grid').innerHTML =
        '<p style="color:#b23a48">Could not load study content. Please refresh or try again.</p>';
      console.error(err);
    });

  document.getElementById('back-btn').addEventListener('click', () => {
    document.getElementById('topic-detail-view').classList.add('hidden');
    document.getElementById('topic-list-view').classList.remove('hidden');
    renderTopicList();
    window.scrollTo(0, 0);
  });
}

document.addEventListener('DOMContentLoaded', init);
