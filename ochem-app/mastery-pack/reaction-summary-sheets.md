# OChem Reaction Summary Sheets (Printable Cheat Sheets)

> **Study aid only** — not a substitute for your course or textbook. Print this reference for quick recall during practice.

---

## Sheet 1 — SN1 vs SN2 (Nucleophilic Substitution)

| Feature | SN2 | SN1 |
|---|---|---|
| Full name | Substitution, Nucleophilic, **Bimolecular** | Substitution, Nucleophilic, **Unimolecular** |
| Rate law | rate = k[nucleophile][substrate] | rate = k[substrate] |
| Mechanism | One concerted step (no intermediate) | Two steps (carbocation intermediate) |
| Stereochemistry | **Inversion** (backside attack, Walden inversion) | **Racemization** (planar carbocation attacked from either face) |
| Substrate order | methyl > 1° > 2° (3° unreactive — steric) | 3° > 2° (1°/methyl unreactive — unstable carbocation) |
| Nucleophile | Strong required | Weak is fine (solvent often acts as Nu) |
| Leaving group | Weak base is best: I⁻ > Br⁻ > Cl⁻ > F⁻ | Same preference (I⁻ > Br⁻ > Cl⁻ > F⁻) |
| Solvent | Polar **aprotic** (DMSO, acetone, DMF, acetonitrile) | Polar **protic** (water, alcohols) |
| Key complication | None | Carbocation **rearrangement** (1,2-hydride/alkyl shift) |

**Memory hook:** SN2 = "**2** things collide, backside, **in**version." SN1 = "**1** thing first (carbocation), **racem**ization."

---

## Sheet 2 — E1 vs E2 (Elimination)

| Feature | E2 | E1 |
|---|---|---|
| Rate law | rate = k[base][substrate] | rate = k[substrate] |
| Mechanism | One concerted step | Two steps (carbocation intermediate) |
| Base strength | **Strong** base required | **Weak** base is fine |
| Geometry requirement | **Anti-periplanar** (β-H and leaving group 180° apart) | None (planar carbocation) |
| Regiochemistry (small base) | **Zaitsev** — more substituted alkene | **Zaitsev** — more substituted alkene |
| Bulky base effect | Bulky base (t-BuO⁻) → **Hofmann** (less substituted) | Not applicable |
| Substrate | 3° > 2° (also 1° with bulky base) | 3° > 2° |
| Key complication | None | Carbocation **rearrangement** |
| Competes with | SN2 | SN1 |

**Memory hook:** E2 = "**2** things leave together, **anti**." E1 = "carbocation **1**st, then lose a β-H."

---

## Sheet 3 — Alkene Addition Reactions

**Markovnikov's rule:** in HX/H₂O addition, **H adds to the less substituted carbon** (more hydrogens) and the other group to the **more substituted carbon** (more stable carbocation).

| Reaction | Reagents | Regiochemistry | Stereochemistry | Product |
|---|---|---|---|---|
| Hydrogenation | H₂ / Pt, Pd, or Ni | — | **syn** | Alkane |
| Hydrohalogenation | HX (HBr, HCl, HI) | **Markovnikov** | — (carbocation) | Alkyl halide |
| Acid-catalyzed hydration | H₂O / H₂SO₄ | **Markovnikov** | — (carbocation, can rearrange) | Alcohol |
| Halogenation | Br₂ or Cl₂ | — | **anti** (bromonium ion) | Vicinal dihalide |
| Halohydrin formation | X₂ / H₂O | OH → **more substituted** C; X → less substituted | **anti** | Halohydrin |
| Hydroboration-oxidation | 1. BH₃·THF; 2. H₂O₂/NaOH | **Anti-Markovnikov** | **syn** | Alcohol |
| Oxymercuration-demercuration | 1. Hg(OAc)₂/H₂O; 2. NaBH₄ | **Markovnikov** | — (no rearrangement) | Alcohol |

### How to remember syn vs anti

- **syn** (same side): hydrogenation, hydroboration-oxidation.
- **anti** (opposite sides): halogenation (Br₂), halohydrin formation — because the halonium ion blocks one face.
- **carbocation (mixed/racemized)** for hydrohalogenation and acid-catalyzed hydration.

### Worked example

**HBr + propene (CH₃CH=CH₂):**
- H → terminal (less substituted) carbon.
- Br → middle (more substituted) carbon.
- Product: **2-bromopropane** (CH₃CHBrCH₃).

---

*For mechanism details and full explanations, see `study-guide.md`. Drill recall with `flashcards.csv`.*
