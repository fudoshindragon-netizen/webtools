import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { searchPassages } from './match.js';
import { blocksFromPassages, latestGuideResult, renderGuideBlocks, renderMarkdownSafe } from './guide.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'data', 'cycle');
const symptoms = JSON.parse(readFileSync(path.join(root, 'symptoms.json'), 'utf8'));

test('a lubricant search opens with the three bold topic headings', () => {
  const passages = searchPassages(symptoms.passages, 'lube coconut oil', 3);
  const blocks = blocksFromPassages(passages.filter((passage) => passage.id === 'lube'));
  const html = renderGuideBlocks(blocks);
  assert.match(html, /<h3 class="cy-explain-title">Water-based lube<\/h3>/);
  assert.match(html, /<h3 class="cy-explain-title">Silicone-based lube<\/h3>/);
  assert.match(html, /<h3 class="cy-explain-title">Oil-based lube \(including coconut oil\)<\/h3>/);
  assert.match(html, /latex/);
  assert.equal(html.includes('<script'), false);
});

test('a later search replaces the previous result', () => {
  const lube = blocksFromPassages(searchPassages(symptoms.passages, 'lube coconut oil', 1));
  const yeast = blocksFromPassages(searchPassages(symptoms.passages, 'yeast infection Monistat', 1));
  let visible = latestGuideResult('lube coconut oil', lube, '**Old hosted note**\n\nprevious');
  visible = latestGuideResult('yeast infection Monistat', yeast, '');
  assert.equal(visible.question, 'yeast infection Monistat');
  assert.equal(visible.model, '');
  const html = renderGuideBlocks(visible.blocks);
  assert.match(html, /Monistat|Yeast|yeast/i);
  assert.equal(html.includes('Water-based lube'), false);
  assert.equal(html.includes('coconut'), false);
});

test('hosted markdown bold is rendered and raw HTML is not', () => {
  const html = renderMarkdownSafe('**Yeast infection and Monistat**\n\nOTC azoles such as miconazole. <script>alert(1)</script>\nhttps://www.cdc.gov/candidiasis/treatment/index.html');
  assert.match(html, /<h3 class="cy-explain-title">Yeast infection and Monistat<\/h3>/);
  assert.match(html, /<a href="https:\/\/www\.cdc\.gov\/candidiasis\/treatment\/index\.html"/);
  assert.match(html, /&lt;script&gt;/);
  assert.equal(html.includes('<script>'), false);
});
