# content.json schema (Organic Chemistry Practice)

The app loads all content from this single file. The full pre-generated content
bank will be dropped in later with zero code changes — just add more entries to
`topics`.

## Top-level

```json
{
  "app": {
    "title": "Organic Chemistry Practice",
    "subtitle": "Free study & practice drills",
    "disclaimer": "Study aid only — not a substitute for your course..."
  },
  "topics": [ /* ... */ ]
}
```

## Topic object

| Field       | Type     | Required | Notes |
|-------------|----------|----------|-------|
| `id`        | string   | yes      | Unique slug, e.g. `"nomenclature"` |
| `title`     | string   | yes      | Display name |
| `icon`      | string   | no       | Single emoji shown on the card |
| `concept`   | string   | yes      | Plain-English concept explanation |
| `diagram`   | object   | no       | Optional visual (see below) |
| `resources` | array    | no       | Optional curated free tutorial links |
| `questions` | array    | yes      | At least one question (see below) |

### `diagram` (optional) — available at BOTH topic and question level

A molecule rendered as a 2D structure from a SMILES string (SmilesDrawer,
MIT-licensed, vendored locally — rendered client-side, no backend/API calls).

```json
"diagram": {
  "smiles": "CCO",
  "caption": "Ethanol (CH₃CH₂OH) — an alcohol"
}
```

- `smiles`: the SMILES string to render
- `caption`: optional human-readable caption shown under the structure

### `resources` (optional) — available at BOTH topic and question level

Curated free tutorial links, rendered as clickable links
(`target="_blank" rel="noopener nofollow"`). At topic level they render under
the concept; at question level they render after the worked solution.

```json
"resources": [
  {
    "title": "IUPAC nomenclature of organic chemistry",
    "url": "https://www.khanacademy.org/science/organic-chemistry"
  }
]
```

- `title`: link text
- `url`: destination URL

## Question object

| Field         | Type     | Notes |
|---------------|----------|-------|
| `id`          | string   | Unique within the topic |
| `type`        | string   | `"multiple-choice"` or `"short-answer"` |
| `prompt`      | string   | The question text |
| `diagram`     | object   | Optional `{ smiles, caption }` rendered with the prompt |
| `options`     | string[] | **multiple-choice only** — answer choices |
| `answer`      | int/string | **MC:** index into `options` (0-based). **Short-answer:** correct text (matched case/whitespace-insensitively) |
| `explanation` | string   | Worked solution shown after answering |
| `resources`   | array    | Optional `[{ title, url }]` shown after the solution |
