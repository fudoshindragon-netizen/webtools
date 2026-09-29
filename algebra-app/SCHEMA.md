# Algebra, Functions & Data Analysis — App Schema

Reuses the 8P2 electrical study-app architecture (static SPA: `index.html` +
`app.js` + `styles.css` + `content.json`). No backend, no API keys, $0 to run.
**Free study app — no monetization** (no upsell, no paid companion, no Stripe).

## File structure
- `index.html` — static shell (header, topic list, topic detail, disclaimer footer).
- `app.js` — loads `content.json`, renders topics/questions, checks answers, persists progress in `localStorage`.
- `styles.css` — light, high-contrast theme (reused from 8P2).
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
| `id`        | string | yes      | Unique slug, e.g. `"solving-linear-equations"` |
| `title`     | string | yes      | Display name |
| `icon`      | string | no       | Single emoji shown on the card |
| `concept`   | string | yes      | Plain-English concept explanation |
| `diagram`   | object | no       | Optional visual (see below) |
| `resources` | array  | no       | Optional curated free tutorial links |
| `questions` | array  | yes      | At least one question (see below) |

## `diagram` (optional) — available at BOTH topic and question level
No molecules here, so **no SmilesDrawer**. Three author-supplied types (this is
the exact 8P2 diagram system):

### `type: "text"` (or `"formula"`) — monospace block
Equations and the **step-by-step METHOD** blocks, rendered as a `<pre>` block
(newlines preserved). This is the primary way to satisfy the "spell out the
exact ordered procedure, one step per line" requirement.
```json
"diagram": {
  "type": "text",
  "code": "METHOD — Solve a linear equation for x\n1) …\n2) …\n3) …",
  "caption": "The method, one step per line"
}
```
- `code`: the monospace text (newlines preserved).
- `caption`: optional caption.

### `type: "table"` — HTML table
Function tables (x → f(x)), data tables, etc.
```json
"diagram": {
  "type": "table",
  "headers": ["x", "f(x) = 2x + 3"],
  "rows": [["-2", "-1"], ["0", "3"], ["2", "7"]],
  "caption": "Values of f(x) = 2x + 3"
}
```
- `headers` (optional): array of column headings.
- `rows` (required): array of row arrays (all strings; rendered via text-safe escaping).

### `type: "svg"` — inline SVG (original art)
Coordinate planes, line/parabola graphs, and scatter plots are drawn as
**original SVG** (author-authored; do not rip figures from textbooks).
```json
"diagram": {
  "type": "svg",
  "svg": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'>…</svg>",
  "caption": "Graph of y = 2x + 1"
}
```
- `svg`: the raw `<svg>` markup string (use single-quoted attributes so the JSON
  needs no escaping). Inserted as trusted author content — never user input.
  It scales responsively via `.diagram-svg svg { max-width:100%; height:auto }`.
- `caption`: optional human-readable caption shown under the figure.

## `resources` (optional) — available at BOTH topic and question level
Curated free tutorial links, rendered as clickable links
(`target="_blank" rel="noopener nofollow"`).
```json
"resources": [
  { "title": "Solving linear equations (Khan Academy)", "url": "https://…" }
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
| `explanation` | string     | Worked solution shown after answering (show EVERY step) |
| `resources`   | array      | Optional `[{ title, url }]` shown after the solution |

**Short-answer tip:** keep `answer` a bare value (a number or single word). The
normalizer strips whitespace/case/punctuation, so `"6"` matches `"6"` but not
`"x = 6"`. Phrase prompts to ask for the bare value (e.g. "Enter the value of x.").
For **negative** answers, `-4` normalizes to `4` (the `-` is stripped) — use
multiple-choice for negative answers instead.

## Accessibility (critical — the learner is neurodivergent)
- High contrast, generous spacing, minimal visual clutter, consistent/predictable layout.
- Worked solutions render as clearly-ordered steps (numbered), one step per line.
- Calm design — no bright flashing or motion. The light theme + short method
  blocks support this.

## Sample topics (prove all three diagram types end-to-end)
1. **Solving Linear Equations (for x)** — `type: "text"` method block.
2. **Function Tables & Evaluating f(x)** — `type: "table"` diagram.
3. **Graphing a Linear Equation** — `type: "svg"` coordinate plane with a line.

## Planned topics (broader content roadmap — follow-up content task)
This scaffold ships the 3 sample topics above. Candidate additional topics from
the scope doc (`/home/team/shared/math/SCOPE.md`): literal equations & solving
for y, linear inequalities, systems of linear equations, functions (notation,
domain & range), quadratic functions/equations, polynomials & factoring, radical
& rational expressions, exponential functions/growth-decay, and data analysis
(measures of center/spread; scatter plots & line of best fit).

## Guardrails (non-negotiable)
- **Accuracy is critical.** Source-verify every fact against free material
  (Khan Academy, OpenStax, Purplemath, etc.).
- **No textbook rips, no paywalled content, no actual exam questions.**
- **Original diagrams only** — author-authored SVG, or clear text/table.
- **Disclaimer:** keep the study-aid disclaimer in `content.json` `app.disclaimer`.
- **No monetization, no fabricated results, testimonials, or scarcity** anywhere in the copy.
