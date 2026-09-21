# OChem Mastery Pack — Exam-Focused Study Guide

> **Study aid only.** This guide is not a substitute for your course, textbook, or instructor. Content may contain errors; verify against your course materials. It summarizes the eight core topics in the MicroVenture Labs Organic Chemistry Practice app.

**How to use this guide:** Read each section top-to-bottom, work the examples by hand, then self-test with the companion flashcards (`flashcards.csv`) and drill the practice questions in the app.

---

## 1. Structure & Bonding

**The big idea:** How a molecule's atoms are connected and hybridized determines its shape, polarity, and reactivity.

### Key concepts

- **Carbon** has **4 valence electrons** and forms **4 bonds** to complete its octet.
- **Lewis structures** use lines for bonding pairs and dots for lone pairs. Check charge with **formal charge = (valence e⁻) − (lone-pair e⁻) − ½(bonding e⁻)**.
- **Hybridization** explains geometry:

| Hybridization | Geometry | Bond angle | Example |
|---|---|---|---|
| sp³ | Tetrahedral | 109.5° | Methane (CH₄) |
| sp² | Trigonal planar | 120° | Ethene (C₂H₄) |
| sp | Linear | 180° | Ethyne (HC≡CH) |

- **Lone pairs compress bond angles.** Water (H₂O) is ~104.5° (two lone pairs); ammonia (NH₃) is ~107° (one lone pair).
- **Bond polarity** comes from electronegativity. Key Pauling values: **F 4.0 > O 3.5 > N 3.0 > Cl 3.2 > C 2.5 > H 2.2**. A larger difference = a more polar (δ+/δ−) bond.

### Worked examples

1. **Methane (CH₄):** 4 single bonds → sp³, tetrahedral, 109.5°.
2. **Formal charge of N in NH₄⁺:** 5 (valence) − 0 (lone pairs) − ½(8 bonding e⁻) = **+1**.

---

## 2. Nomenclature

**The big idea:** IUPAC names describe an unambiguous structure. Name the **parent chain**, number it for **lowest locants**, then add **substituent prefixes** and a **family suffix**.

### Key facts

- **Roots** (number of carbons): meth- (1), eth- (2), prop- (3), but- (4), pent- (5), hex- (6), hept- (7), oct- (8), non- (9), dec- (10).
- **Suffixes:** -ane (alkane), -ene (alkene, C=C), -yne (alkyne, C≡C), -ol (alcohol), -al (aldehyde), -one (ketone), -oic acid (carboxylic acid).
- **Substituents** end in -yl (methyl, ethyl, propyl). Multiples use di- (2), tri- (3), tetra- (4). List substituents alphabetically (ignoring di-/tri-).

### Worked examples

1. **CH₃CH₂CH₃** → 3 carbons, saturated → **propane**.
2. **CH₃CH₂OH** → 2 carbons + –OH → **ethanol**.
3. **(CH₃)₂CHCH₃** → 3-carbon parent (propane) + methyl on C2 → **2-methylpropane**.

---

## 3. Functional Groups

**The big idea:** A functional group is the atom(s) that give a molecule its characteristic reactions. Recognizing them is the #1 OChem skill.

### Key groups to memorize

| Group | Structure | Suffix |
|---|---|---|
| Alcohol | R–OH | -ol |
| Carboxylic acid | R–COOH | -oic acid |
| Amine | R–NH₂ / R₂NH / R₃N | -amine |
| Ketone | R–CO–R′ (carbonyl C bonded to 2 carbons) | -one |
| Aldehyde | R–CHO (carbonyl C bonded to H) | -al |
| Ester | R–COO–R′ | -oate |
| Amide | R–CO–NR₂ | -amide |
| Ether | R–O–R′ | (alkoxy- prefix) |
| Alkyl halide | R–X | (halo- prefix) |

### Easy-to-miss distinctions

- **Aldehyde vs ketone:** the carbonyl carbon is bonded to **H** (aldehyde) vs **two carbons** (ketone).
- **Ester vs ether:** an ester **has a carbonyl**; an ether does **not**.

### Worked examples

1. **CH₃COOH** → –COOH → **carboxylic acid**.
2. **CH₃COCH₃** (acetone) → C=O bonded to two carbons → **ketone**.
3. **CH₃OCH₃** → O bonded to two carbons, no carbonyl → **ether**.

---

## 4. Stereochemistry

**The big idea:** Molecules with the same connectivity can differ in 3D arrangement.

### Key facts

- A **chiral center (stereocenter)** is a carbon bonded to **4 different groups**.
- **Enantiomers** are **non-superimposable mirror images** (identical physical properties except opposite optical rotation).
- **Diastereomers** are stereoisomers that are **not mirror images** (different physical properties).
- **Racemic mixture** = 50:50 enantiomers → optically inactive.
- **Meso compound** = has chiral centers but an internal mirror plane → achiral, optically inactive.
- **CIP (R/S):** priority by **atomic number** of the attached atom (O > N > C > H); orient lowest priority away; trace 1→2→3 — **clockwise = R**, counterclockwise = S.
- **E/Z (alkenes):** **E** = higher-priority groups on **opposite** sides; **Z** = same side.

### Worked examples

1. **2-Butanol (CH₃CH(OH)CH₂CH₃):** carbon 2 has –OH, –CH₃, –CH₂CH₃, –H → **1 chiral center**.
2. **CIP priority** among –OH, –NH₂, –CH₃, –H: **OH > NH₂ > CH₃ > H** (by atomic number of O/N/C/H).

---

## 5. Nucleophilic Substitution (SN1 & SN2)

**The big idea:** A nucleophile replaces a leaving group. Two mechanisms, two very different profiles.

### SN1 vs SN2 at a glance

| Feature | SN2 | SN1 |
|---|---|---|
| Meaning | Bimolecular | Unimolecular |
| Rate law | rate = k[Nu][RX] | rate = k[RX] |
| Steps | 1 (concerted) | 2 (carbocation intermediate) |
| Stereochemistry | **Inversion** (Walden) | **Racemization** |
| Substrate | methyl > 1° > 2° (3° no) | 3° > 2° (1°/methyl no) |
| Nucleophile | Strong required | Weak is fine |
| Solvent | Polar aprotic | Polar protic |

- **Leaving group:** a good one is a **weak base** — I⁻ > Br⁻ > Cl⁻ > F⁻ (OH⁻ and NH₂⁻ are poor).
- **SN2** needs backside attack (180° from the leaving group).
- **SN1** can rearrange (1,2-hydride/alkyl shifts).

### Worked examples

1. **CH₃Br + NaCN (acetone)** → methyl, strong nucleophile → **SN2**.
2. **tert-butyl bromide + H₂O** → tertiary, weak nucleophile → **SN1**.

---

## 6. Elimination Reactions (E1 & E2)

**The big idea:** Removal of a leaving group + a β-hydrogen forms an alkene.

### E1 vs E2 at a glance

| Feature | E2 | E1 |
|---|---|---|
| Rate law | rate = k[base][RX] | rate = k[RX] |
| Steps | 1 (concerted) | 2 (carbocation intermediate) |
| Base | Strong required | Weak is fine |
| Geometry | **Anti-periplanar** (H and LG 180°) | None required |

- **Zaitsev's rule:** the **more substituted** alkene is the major product.
- **Hofmann product** (less substituted alkene) forms with a **bulky base** (e.g., t-BuO⁻).
- E1 competes with SN1 (shared carbocation); E2 competes with SN2.

### Worked examples

1. **E2 of 2-bromobutane** (small base) → **but-2-ene** (Zaitsev, more substituted).
2. **t-BuO⁻ + tertiary halide** → **Hofmann** (less substituted) alkene.

---

## 7. Alkene Addition Reactions

**The big idea:** π electrons attack an electrophile, and two groups add across C=C. Regiochemistry follows **Markovnikov's rule**: H adds to the **less substituted** carbon (more hydrogens), the other group to the **more substituted** carbon (more stable carbocation).

### Reaction summary

| Reaction | Reagents | Regiochemistry | Stereochem | Product |
|---|---|---|---|---|
| Hydrogenation | H₂ / Pt, Pd, Ni | — | syn | Alkane |
| Hydrohalogenation | HX | Markovnikov | — (carbocation) | Alkyl halide |
| Acid-catalyzed hydration | H₂O / H₂SO₄ | Markovnikov | — (carbocation) | Alcohol |
| Halogenation | Br₂ or Cl₂ | — | anti | Vicinal dihalide |
| Halohydrin | X₂ / H₂O | OH → more substituted C | anti | Halohydrin |
| Hydroboration-oxidation | 1. BH₃; 2. H₂O₂/NaOH | **Anti-Markovnikov** | syn | Alcohol |
| Oxymercuration-demercuration | 1. Hg(OAc)₂/H₂O; 2. NaBH₄ | Markovnikov | — | Alcohol (no rearrangement) |

### Worked example

**HBr + propene (CH₃CH=CH₂)** → H adds to the terminal carbon, Br to the middle carbon → **2-bromopropane**.

---

## 8. SN vs E: Predicting the Mechanism

**The big idea:** Predict the dominant mechanism from **substrate + reagent + conditions**.

### Decision rules

1. **Methyl / primary** substrate → no stable carbocation → **SN2** (or E2 with a bulky base).
2. **Tertiary** substrate → too hindered for SN2 → **SN1/E1** (weak base) or **E2** (strong base).
3. **Strong nucleophile + weak base** (I⁻, Br⁻, CN⁻, N₃⁻, RS⁻) → **substitution (SN2)**.
4. **Strong bulky base** (t-BuO⁻) → **elimination (E2)**.
5. **Weak nucleophile/base** (H₂O, ROH) → **SN1/E1**.
6. **Heat** favors **elimination**.

### Worked examples

1. **Primary halide + NaCN (polar aprotic)** → **SN2**.
2. **Tertiary halide + t-BuOK** → **E2**.
3. **Tertiary halide + H₂O (weak Nu/base)** → **SN1/E1** (carbocation).

---

*End of study guide. Pair with `reaction-summary-sheets.md` (quick reference) and `flashcards.csv` (Anki deck).*
