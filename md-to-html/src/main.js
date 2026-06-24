import './style.css';
import { marked } from 'marked';

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true,
});

// DOM refs
const mdInput = document.getElementById('md-input');
const htmlOutput = document.getElementById('html-output');
const wordCount = document.getElementById('word-count');
const copyBtn = document.getElementById('copy-html-btn');
const downloadBtn = document.getElementById('download-btn');
const clearBtn = document.getElementById('clear-btn');
const insertSampleBtn = document.getElementById('insert-sample-btn');

// Safe escape for display inside a <code> inside a <pre>
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Render markdown → HTML synchronously.
 * We handle errors gracefully: if marked throws, show a helpful message.
 */
function renderMarkdown(text) {
  if (!text || !text.trim()) {
    htmlOutput.innerHTML = '';
    return;
  }

  try {
    const raw = marked.parse(text);
    htmlOutput.innerHTML = raw;
  } catch (err) {
    htmlOutput.innerHTML = `<div class="error">⚠️ Parse error: ${escapeHtml(err.message)}</div>`;
  }
}

/**
 * Count words in the markdown input (approximate).
 */
function updateWordCount(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    wordCount.textContent = '0 words';
    return;
  }
  const words = trimmed.split(/\s+/).filter(Boolean).length;
  wordCount.textContent = `${words} word${words !== 1 ? 's' : ''}`;
}

/**
 * Update everything when the markdown changes.
 */
function handleInput() {
  const text = mdInput.value;
  renderMarkdown(text);
  updateWordCount(text);
}

// ── Event: input ──
mdInput.addEventListener('input', handleInput);

// ── Event: Copy HTML ──
copyBtn.addEventListener('click', async () => {
  const html = htmlOutput.innerHTML;
  if (!html) {
    showToast('Nothing to copy — write some Markdown first!');
    return;
  }

  try {
    // Include a full HTML document for the clipboard
    const fullDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Converted from Markdown</title>
</head>
<body>
${html}
</body>
</html>`;
    await navigator.clipboard.writeText(fullDoc);
    showToast('✅ Full HTML document copied to clipboard!');
  } catch {
    // Fallback: copy just the inner HTML
    try {
      await navigator.clipboard.writeText(html);
      showToast('📋 Copied to clipboard!');
    } catch {
      showToast('❌ Clipboard not available. Try the download button instead.');
    }
  }
});

// ── Event: Download HTML ──
downloadBtn.addEventListener('click', () => {
  const html = htmlOutput.innerHTML;
  if (!html) {
    showToast('Nothing to download — write some Markdown first!');
    return;
  }

  const fullDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Converted from Markdown</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 0 20px;
      line-height: 1.7;
      color: #1a1a2e;
    }
    h1, h2, h3 { color: #0f0f23; }
    code { background: #f0f0f5; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
    pre { background: #f0f0f5; padding: 16px; border-radius: 8px; overflow-x: auto; }
    blockquote { border-left: 3px solid #6366f1; margin-left: 0; padding-left: 16px; color: #555; }
    img { max-width: 100%; }
  </style>
</head>
<body>
${html}
</body>
</html>`;

  const blob = new Blob([fullDoc], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'converted.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('⬇️ File downloaded as converted.html');
});

// ── Event: Clear ──
clearBtn.addEventListener('click', () => {
  if (mdInput.value.trim() && !confirm('Clear all your markdown?')) return;
  mdInput.value = '';
  handleInput();
  mdInput.focus();
});

// ── Event: Insert sample ──
const SAMPLE_MD = `# Welcome to Markdown to HTML! 🎉

This is a **live preview** editor. Type on the left, see the result on the right.

## Why use this?

- **Instant conversion** — no server needed, everything runs in your browser
- **Copy as HTML** — grab the full document for your blog, email, or Gumroad listing
- **Download as file** — save a standalone \`.html\` file

## Formatting examples

> "Markdown is the easiest way to write rich content."

### Lists

1. First item
2. Second item
3. Third item

### Code

Inline \`const x = 42;\` looks like this.

And a code block:

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}! 👋\`;
}
console.log(greet('Creator'));
\`\`\`

### Table

| Feature | Free | Pro |
|---------|------|-----|
| Markdown → HTML | ✅ | ✅ |
| Copy to clipboard | ✅ | ✅ |
| Download as file | ✅ | ✅ |
| Export as PDF | — | ✅ |
| Custom CSS themes | — | ✅ |
| Batch convert | — | ✅ |

---

Happy converting! ✨
`;

insertSampleBtn.addEventListener('click', () => {
  // If there's existing content, ask first
  if (mdInput.value.trim() && mdInput.value.trim() !== SAMPLE_MD.trim()) {
    if (!confirm('Replace current content with sample markdown?')) return;
  }
  mdInput.value = SAMPLE_MD;
  handleInput();
});

// ── Toast system ──
function showToast(message) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  document.body.appendChild(el);

  setTimeout(() => {
    el.classList.add('fade-out');
    setTimeout(() => el.remove(), 300);
  }, 2500);
}

// ── Keyboard shortcuts ──
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + Shift + C → Copy HTML
  if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'c') {
    e.preventDefault();
    copyBtn.click();
  }
  // Escape → focus the editor
  if (e.key === 'Escape' && document.activeElement !== mdInput) {
    mdInput.focus();
  }
});

// ── Init ──
handleInput();
mdInput.focus();
console.log('📝 Markdown to HTML Converter loaded. Happy converting!');
