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

### `diagram` (optional)

A visual for the concept. Two shapes are supported:

1. **SMILES string** (renderer NOT implemented yet — shows a placeholder):

```json
"diagram": {
  "type": "smiles",
  "value": "CCC",
  "render": "smiles",
  "label": "Propane (CH₃CH₂CH₃)"
}
```

- `type`: `"smiles"`
- `value`: the SMILES string
- `render`: render hint for the future renderer (e.g. `"smiles"`, `"svg"`, `"rdkit"`)
- `label`: optional caption / human-readable note

2. **Image URL** (renders directly):

```json
"diagram": {
  "type": "image",
  "value": "https://example.com/propane.png",
  "label": "Propane structure"
}
```

- `type`: `"image"`
- `value`: full image URL
- `label`: optional caption

### `resources` (optional)

Curated free tutorial links shown as an external "Learn more" list.

```json
"resources": [
  {
    "title": "IUPAC nomenclature of organic chemistry",
    "url": "https://www.khanacademy.org/science/organic-chemistry",
    "source": "Khan Academy"
  }
]
```

- `title`: link text
- `url`: destination URL
- `source`: optional short source label

## Question object

| Field         | Type     | Notes |
|---------------|----------|-------|
| `id`          | string   | Unique within the topic |
| `type`        | string   | `"multiple-choice"` or `"short-answer"` |
| `prompt`      | string   | The question text |
| `options`     | string[] | **multiple-choice only** — answer choices |
| `answer`      | int/string | **MC:** index into `options` (0-based). **Short-answer:** the correct text (matched case/whitespace-insensitively) |
| `explanation` | string   | Worked solution shown after answering |
