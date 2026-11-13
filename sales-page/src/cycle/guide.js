/** Symptom-guide rendering. One result at a time, headings in bold, no raw HTML. */

export function blocksFromPassages(passages) {
  const blocks = [];
  for (const passage of passages || []) {
    const sections = Array.isArray(passage.sections) ? passage.sections.filter((section) => section?.title && section?.body) : [];
    if (sections.length) {
      sections.forEach((section, index) => {
        const last = index === sections.length - 1;
        blocks.push({
          title: String(section.title),
          body: String(section.body),
          clinician: last ? passage.clinicianIf || [] : [],
          sourceIds: last ? passage.sourceIds || [] : [],
        });
      });
    } else if (passage?.title && passage?.body) {
      blocks.push({
        title: String(passage.title),
        body: String(passage.body),
        clinician: passage.clinicianIf || [],
        sourceIds: passage.sourceIds || [],
      });
    }
  }
  return blocks;
}

/** The visible guide is only this search. The previous result is not kept. */
export function latestGuideResult(question, blocks, modelText = '') {
  return {
    question: String(question || ''),
    blocks: blocks || [],
    model: String(modelText || ''),
  };
}

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[ch]));
}

function linkifyEscaped(escaped) {
  return escaped.replace(/https:\/\/[^\s<]+/g, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
}

function inlineMarkdown(text) {
  const escaped = escapeHtml(text);
  const bold = escaped.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  return linkifyEscaped(bold);
}

/** Hosted answers may use **Heading** on its own line. Everything else is escaped. */
export function renderMarkdownSafe(text) {
  const chunks = String(text || '').trim().split(/\n{2,}/);
  if (!chunks[0]) return '';
  return chunks.map((chunk) => {
    const lines = chunk.split('\n');
    const heading = /^\*\*([^*\n]+)\*\*$/.exec(lines[0].trim());
    if (heading) {
      const rest = lines.slice(1).join('\n').trim();
      return `<h3 class="cy-explain-title">${escapeHtml(heading[1])}</h3>${rest ? `<p>${inlineMarkdown(rest)}</p>` : ''}`;
    }
    return `<p>${inlineMarkdown(chunk)}</p>`;
  }).join('');
}

export function renderGuideBlocks(blocks, sourceLabel) {
  return (blocks || []).map((block) => {
    const see = (block.clinician || []).length
      ? `<p><strong>See a clinician if:</strong> ${escapeHtml(block.clinician.join(' '))}</p>`
      : '';
    const sources = sourceLabel ? sourceLabel(block.sourceIds) : '';
    return `<section class="cy-explain"><h3 class="cy-explain-title">${escapeHtml(block.title)}</h3><p>${linkifyEscaped(escapeHtml(block.body))}</p>${see}${sources ? `<p class="cy-sources">${sources}</p>` : ''}</section>`;
  }).join('');
}
