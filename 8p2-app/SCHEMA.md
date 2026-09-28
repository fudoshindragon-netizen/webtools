# 8P2 Electrical Controls & Power — App Schema

Reuses the OChem study-app architecture (static SPA: `index.html` + `app.js` +
`styles.css` + `content.json`). No backend, no API keys, $0 to run.

## File structure
- `index.html` — static shell (header, topic list, topic detail, Electrical Deeper Understanding upsell, disclaimer footer).
- `app.js` — loads `content.json`, renders topics/questions, checks answers, persists progress in `localStorage`.
- `styles.css` — light theme, electrical-blue accent.
- `content.json` — all study content (see below).
- `SCHEMA.md` — this file.

## content.json top level
```json
{
  "app": { "title": "…", "subtitle": "…", "disclaimer": "…" },
  "topics": [ … ]
}
```

## Topic object
| Field       | Type   | Required | Notes |
|-------------|--------|----------|-------|
| `id`        | string | yes      | Unique slug, e.g. `"binary"` |
| `title`     | string | yes      | Display name |
| `icon`      | string | no       | Single emoji shown on the card |
| `concept`   | string | yes      | Plain-English concept explanation |
| `diagram`   | object | no       | Optional visual (see below) |
| `resources` | array  | no       | Optional curated free tutorial links |
| `questions` | array  | yes      | At least one question (see below) |

## `diagram` (optional) — available at BOTH topic and question level
**Important difference from the OChem app:** there are no molecules here, so we
do **not** use SmilesDrawer. Use one of three author-supplied types:

### `type: "svg"` — inline SVG (original art)
Circuit, ladder, delta/wye, and logic-gate diagrams are drawn as **original SVG**
(author-authored; do not rip figures from textbooks or Ugly's Book).
```json
"diagram": {
  "type": "svg",
  "svg": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 480 360'>…</svg>",
  "caption": "Series (top) vs. parallel (bottom)"
}
```
- `svg`: the raw `<svg>` markup string (use single-quoted attributes so the JSON
  needs no escaping). Inserted as trusted author content — never user input.
- `caption`: optional human-readable caption shown under the figure.

### `type: "table"` — HTML table
Truth tables, binary/decimal conversions, tap tables, etc.
```json
"diagram": {
  "type": "table",
  "headers": ["Binary", "Decimal"],
  "rows": [["0000", "0"], ["0001", "1"]],
  "caption": "4-bit binary vs. decimal"
}
```
- `headers` (optional): array of column headings.
- `rows` (required): array of row arrays (all strings; rendered via `textContent`-safe escaping).

### `type: "text"` (or `"formula"`) — monospace block
Formulas and short reference text, rendered as a `<pre>` block.
```json
"diagram": {
  "type": "text",
  "code": "V = I × R\nP = V × I",
  "caption": "The core relationships"
}
```
- `code`: the monospace text (newlines preserved).
- `caption`: optional caption.

## `resources` (optional) — available at BOTH topic and question level
Curated free tutorial links, rendered as clickable links
(`target="_blank" rel="noopener nofollow"`).
```json
"resources": [
  { "title": "Learn how to read binary in 5 minutes", "url": "https://…" }
]
```

## Question object
| Field         | Type       | Notes |
|---------------|------------|-------|
| `id`          | string     | Unique within the topic |
| `type`        | string     | `"multiple-choice"` or `"short-answer"` |
| `prompt`      | string     | The question text |
| `diagram`     | object     | Optional `{ type: … }` rendered with the prompt |
| `options`     | string[]   | **multiple-choice only** — answer choices |
| `answer`      | int/string | **MC:** index into `options` (0-based). **Short-answer:** correct text (matched case/whitespace/punctuation-insensitively) |
| `explanation` | string     | Worked solution shown after answering |
| `resources`   | array      | Optional `[{ title, url }]` shown after the solution |

**Short-answer tip:** keep `answer` a bare value (a number or single word). The
normalizer strips whitespace/case/punctuation, so `"30"` matches `"30"` but not
`"30 ohms"`. Phrase prompts to ask for the bare value (e.g. "Enter a number.").

## Monetization (Electrical Deeper Understanding)
`app.js` has a `MASTER_CLASS` config. The paid companion is a **Electrical Deeper Understanding**
(study guide + formula/reference sheets + flashcard deck), mirroring the OChem
free-app → Mastery Pack model.
- `checkoutUrl` is currently **empty** → the upsell renders an honest
  "Electrical Deeper Understanding coming soon — the drills stay free." note.
- When a live Stripe Payment Link exists, set `checkoutUrl` + `price`, and add a
  `master-class/` download page (analogous to `ochem-app/mastery-pack/`).

## Planned topics (from the owner's 8P2 source list — `/home/team/shared/8p2/8P2_SOURCES.md`)
This scaffold ships 3 sample topics. The full 25-topic set is a follow-up content
task. Planned list:
Binary, Inductance, Capacitance, Motor Service Factor, Fusing, Current
Transformers, Step-up Transformer, Three-phase Motor Connection, Delta & Wye
(phase/line currents & voltages), Series/Parallel Circuits, AC Drives, Switches
(SPST/DPDT & grounding), PLC Coils & Contacts, Sinking & Sourcing, Impedance &
Reactance, Dynamic Braking, Ohm's Law review, Induction Motors & Inrush Current,
Speed Control of Shunt Motor, Transformer Power Factor (VA = W/PF), Logic Gates,
Analog Input Resolution & Scaling, PLC Data Types, Ladder Logic (original
practice), and Review questions (original equivalents).

## Guardrails (non-negotiable)
- **Accuracy is critical.** Source-verify every fact against free material.
- **No proprietary reproduction:** no Ugly's Book content, no actual exam
  questions (items 24–25 of the source list), no ripped textbook figures.
- **Original diagrams only** — author-authored SVG or clear text/table.
- **Disclaimer:** keep the study-aid disclaimer in `content.json` `app.disclaimer`.
- **No fabricated results, testimonials, or scarcity** anywhere in the copy.

## Known source-list issues (flag to lead / for content team to resolve)
- `swtc.edu …/parallel_circuits.htm` returned **404** on check.
- The "Step-up Transformer" link is actually a **VFD** article (mismatched).
- "Three-phase Motor Connection" points to Ugly's Book (proprietary — excluded).
- Items 24–25 are proprietary exam items (excluded — create original equivalents).
