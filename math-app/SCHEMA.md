# Algebra, Functions & Data Analysis — App Schema

Reuses the 8P2 electrical study-app architecture (static SPA: `index.html` +
`app.js` + `styles.css` + `content.json`). No backend, no API keys, $0 to run.

## File structure
- `index.html` — static shell (header, topic list, topic detail, Algebra Mastery Pack upsell, disclaimer footer).
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
| `diagram`   | object | no       | Optional visual — use `type: "text"` for step-by-step METHOD blocks |
| `resources` | array  | no       | Optional curated free tutorial links |
| `questions` | array  | yes      | At least one question (see below) |

## `diagram` (optional) — available at BOTH topic and question level
No molecules here, so **no SmilesDrawer**. Three author-supplied types:

### `type: "svg"` — inline SVG (original art)
Coordinate planes and line/parabola graphs are drawn as **original SVG**
(author-authored; do not rip figures from textbooks).
```json
"diagram": {
  "type": "svg",
  "svg": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 480 360'>…</svg>",
  "caption": "Graph of y = 2x + 1"
}
```
- `svg`: the raw `<svg>` markup string (use single-quoted attributes so the JSON
  needs no escaping). Inserted as trusted author content — never user input.
- `caption`: optional human-readable caption shown under the figure.

### `type: "table"` — HTML table
Function tables (x → f(x)), data tables, etc.
```json
"diagram": {
  "type": "table",
  "headers": ["x", "f(x) = 2x + 1"],
  "rows": [["-1", "-1"], ["0", "1"], ["1", "3"]],
  "caption": "Values for f(x) = 2x + 1"
}
```
- `headers` (optional): array of column headings.
- `rows` (required): array of row arrays (all strings; rendered via text-safe escaping).

### `type: "text"` (or `"formula"`) — monospace block
Formulas and the **step-by-step METHOD** blocks, rendered as a `<pre>` block
(newlines preserved). This is the primary way to satisfy the "spell out the exact
ordered procedure" requirement.
```json
"diagram": {
  "type": "text",
  "code": "METHOD — Solve a linear equation for x\n1) …\n2) …\n3) …",
  "caption": "The method, in order"
}
```
- `code`: the monospace text (newlines preserved).
- `caption`: optional caption.

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
For negative answers, `-4` normalizes to `4` (the `-` is stripped) — use
multiple-choice for negative answers instead.

## Monetization (Algebra Mastery Pack)
`app.js` has a `MASTER_CLASS` config. The paid companion (working name **Algebra
Mastery Pack**) mirrors the OChem free-app → Mastery Pack and Electrical →
"Deeper Understanding" model: a printable study guide + step-by-step method
sheets + flashcard deck.
- `checkoutUrl` is currently **empty** → the upsell renders an honest
  "coming soon — the drills stay free" note.
- When a live Stripe Payment Link ($15 one-time) exists, set `checkoutUrl` +
  `price`, and add a `mastery-pack/` download page (analogous to
  `ochem-app/mastery-pack/` and `8p2-app/master-class/`).

## Hard requirements (from `/home/team/shared/math/SCOPE.md`)
- **Neurodivergent-friendly:** clean, consistent, predictable layout; low visual
  clutter; high contrast; one idea per step. The light theme and short,
  ordered method blocks support this.
- **Step-by-step methodology is the core value:** every problem type must spell
  out the exact ordered procedure (see the "METHOD" `type: "text"` blocks).
- **Deep detail** on: solving linear equations for x; solving systems of
  equations for x and y (substitution, elimination, graphing).
- **Free, source-verified references only** (no paywalls, no textbook rips).

## Planned topics (full 12-topic set — follow-up content task)
This scaffold ships 3 sample topics. The remaining 9 are a follow-up:
1. Solving linear equations (for x) — METHOD. ✅ (in scaffold)
2. Literal equations & solving for y (rewrite/rearrange).
3. Linear inequalities. ✅ (in scaffold)
4. Systems of linear equations (x and y) — substitution/elimination/graphing. ✅ (in scaffold)
5. Functions: notation, domain & range, evaluating f(x).
6. Linear functions: slope, intercepts, graphing, equation of a line.
7. Quadratic functions & equations: factoring, quadratic formula, graphing.
8. Polynomials: operations & factoring.
9. Radical & rational expressions/equations.
10. Exponential functions & growth/decay.
11. Data analysis: measures of center (mean/median/mode) & spread (range/IQR/standard deviation).
12. Data analysis: scatter plots, line of best fit, correlation.

## Guardrails (non-negotiable)
- **Accuracy is critical.** Source-verify every fact against free material
  (Khan Academy, OpenStax, Purplemath, etc.).
- **No textbook rips, no paywalled content, no actual exam questions.**
- **Original diagrams only** — author-authored SVG, or clear text/table.
- **Disclaimer:** keep the study-aid disclaimer in `content.json` `app.disclaimer`.
- **No fabricated results, testimonials, or scarcity** anywhere in the copy.
