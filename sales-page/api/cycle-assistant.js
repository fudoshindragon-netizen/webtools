// POST /api/cycle-assistant  { messages: [{ role: "user", content }] }
//
// The browser already shows a library answer. This endpoint optionally
// rewrites that library context with the Vercel AI Gateway. It reads only the
// question text. It does not read tracker, medication, or lab storage.
//
// Env:
//   AI_GATEWAY_API_KEY   required for local `vite` / `vercel dev`
//   VERCEL_OIDC_TOKEN    provided automatically on Vercel (no key to paste)
//   CYCLE_ASSISTANT_MODEL  optional, default openai/gpt-5.4-mini
//
// If neither credential is present, the handler returns mode "unconfigured"
// and does not call a model.

import { readCycleJson } from './lib/cycle-data.js';
import { searchPassages } from '../src/cycle/match.js';

const DEFAULT_MODEL = 'openai/gpt-5.4-mini';

function passagesFor(question) {
  const symptoms = readCycleJson('symptoms.json');
  const meta = readCycleJson('meta.json');
  const found = searchPassages(symptoms.passages, question, 4);
  const block = found.map((passage) => {
    const cites = (passage.sourceIds || []).map((id) => {
      const source = meta.sources[id];
      return source ? `${source.publisher}: ${source.title} — ${source.url}` : id;
    }).join('\n');
    const see = passage.clinicianIf?.length ? `See a clinician if: ${passage.clinicianIf.join(' ')}` : '';
    return `## ${passage.title}\n${passage.body}\n${see}\nSources:\n${cites}`;
  }).join('\n\n');
  return { block, reviewed: symptoms.lastReviewed, count: found.length };
}

export async function answerQuestion(body) {
  const messages = Array.isArray(body?.messages) ? body.messages : [];
  const question = String(messages.filter((message) => message?.role === 'user').slice(-1)[0]?.content || '').trim().slice(0, 2000);
  if (!question) return { status: 400, body: { ok: false, message: 'Type a question first.' } };

  const { block, reviewed, count } = passagesFor(question);
  const setup = 'The hosted assistant is not configured. Set AI_GATEWAY_API_KEY locally, or deploy on Vercel where VERCEL_OIDC_TOKEN is provided. Optional: CYCLE_ASSISTANT_MODEL (default openai/gpt-5.4-mini). The on-device library answer does not need a key.';
  const key = (process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN || '').trim();
  if (!key || count === 0) {
    return {
      status: 200,
      body: {
        ok: true,
        mode: count === 0 ? 'no-passage' : 'unconfigured',
        setup: count === 0 ? 'No library passage matched, so a model was not called.' : setup,
      },
    };
  }

  try {
    const { generateText } = await import('ai');
    const result = await generateText({
      model: (process.env.CYCLE_ASSISTANT_MODEL || DEFAULT_MODEL).trim(),
      maxOutputTokens: 700,
      temperature: 0.2,
      system: `You explain common period, discharge, and birth-control questions for an adult educational app. Use ONLY the reference passages. Do not invent statistics, doses, or diagnoses. If the passages do not cover the question, say so in one sentence. For each topic, put the heading alone on the first line wrapped in double asterisks, like **Water-based lube**, then a blank line, then the explanation. When the passages discuss lubricants, use these headings when they apply: **Water-based lube**, **Silicone-based lube**, and **Oil-based lube (including coconut oil)**. Do not use HTML. Include the source name and URL for each claim you use. Include a "See a clinician if" line when the passages do. Say that this is not medical advice. Reference library last reviewed ${reviewed}.`,
      prompt: `Question:\n${question}\n\nReference passages:\n${block}`,
    });
    return { status: 200, body: { ok: true, mode: 'model', answer: result.text, reviewed } };
  } catch (error) {
    console.error(`[cycle-assistant] ${error.message}`);
    return {
      status: 200,
      body: {
        ok: true,
        mode: 'unconfigured',
        warning: 'The model did not answer. Use the library text already on the page.',
        setup,
      },
    };
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, message: 'Use POST.' });
  }
  const raw = typeof req.body === 'string' ? safeJson(req.body) : (req.body || {});
  const result = await answerQuestion(raw);
  return res.status(result.status).json(result.body);
}

function safeJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}
