# Electrical Deeper Understanding — Formula & Reference Sheets (Printable)

> **Study aid only** — not a substitute for your course, employer training, or governing standards (NEC, NFPA 70E, OSHA). Print for quick recall during practice. Verify against your course materials and the latest standards.

---

## Sheet 1 — DC Foundations: Ohm's Law & Power

| Quantity | Formula |
|---|---|
| Ohm's Law | **V = I × R** |
| Current | **I = V ÷ R** |
| Resistance | **R = V ÷ I** |
| Power | **P = V × I** |
| Power (via I) | **P = I² × R** |
| Power (via V) | **P = V² ÷ R** |

**Units:** V (volts), I (amps), R (ohms), P (watts).

---

## Sheet 2 — AC Reactance & Impedance

| Quantity | Formula |
|---|---|
| Inductive reactance | **XL = 2πƒL** (= ωL, ω = 2πƒ) |
| Capacitive reactance | **XC = 1 / (2πƒC)** |
| Impedance | **Z = R + jX** |
| Impedance magnitude | **\|Z\| = √(R² + X²)** |
| Series R–L | **Z = R + jXL** |
| Series R–C | **Z = R − jXC** |

**Phase:** inductor → current **lags** voltage 90°. Capacitor → current **leads** voltage 90°.
**Frequency:** XL **↑** with ƒ (DC → short, high ƒ → open). XC **↓** with ƒ (DC → open, high ƒ → short).

---

## Sheet 3 — Series & Parallel Circuits

| Configuration | Resistance | Current | Voltage |
|---|---|---|---|
| **Series** | Rₜ = R₁ + R₂ + … | Same everywhere | Divides |
| **Parallel** | 1/Rₜ = 1/R₁ + 1/R₂ + … | Divides | Same across branches |

Two resistors in parallel: **Rₜ = (R₁·R₂) / (R₁ + R₂)**. Two equal resistors in parallel → **half** of one.

---

## Sheet 4 — Transformers & Power Factor

| Quantity | Formula |
|---|---|
| Turns ratio | **Np / Ns = Vp / Vs** |
| Ideal power | **Vp · Ip = Vs · Is** |
| Power factor | **PF = W / VA = cos θ** |
| Apparent power | **VA = W / PF** |

**Step-up** (Ns > Np): voltage **up**, current **down**. **Step-down** (Ns < Np): voltage **down**, current **up**.
Low PF → more current for the same real power.

---

## Sheet 5 — Three-phase Delta & Wye

| Relationship | Wye (Y) | Delta (Δ) |
|---|---|---|
| Line vs phase voltage | V_line = **√3 × V_phase** | V_line = **V_phase** |
| Line vs phase current | I_line = **I_phase** | I_line = **√3 × I_phase** |
| Motor winding voltage | **V_line ÷ √3** | **V_line** |

**Balanced three-phase power:** **P = √3 × V_line × I_line × PF**  (S = √3 × V_line × I_line).

Quick values: 480 V wye winding ≈ **277 V**; 208 V wye winding ≈ **120 V**.

---

## Sheet 6 — Motors (Service Factor, Inrush, Shunt Speed)

| Concept | Reference |
|---|---|
| Service factor | continuous HP ≈ rated HP × SF (typ. **1.0 / 1.15**) |
| Inrush (starting) current | ~ several × (often **~6×**) full-load, decaying as it spins up |
| Shunt motor field | in **parallel** with armature |
| Speed — weaken field | **raises** speed |
| Speed — reduce armature voltage | **lowers** speed |

---

## Sheet 7 — AC Drives & Dynamic Braking

| Concept | Reference |
|---|---|
| VFD flow | **AC → rectifier → DC bus → inverter → variable-freq AC** |
| Synchronous speed | **n ≈ 120·f / poles** |
| Dynamic braking | motor acts as **generator** → energy dumped into **braking resistor** as heat |

4-pole @ 60 Hz → **1,800 rpm** synchronous.

---

## Sheet 8 — Circuit Protection & Current Transformers

| Item | Reference |
|---|---|
| Fuse current rating | continuous current it can carry |
| Fuse voltage rating | circuit voltage class |
| Fuse interrupting (AIC) rating | max fault current it can safely clear |
| Time-delay (dual-element) fuse | rides through motor inrush |
| CT secondary | typically **5 A or 1 A** |
| CT safety rule | **never open-circuit an energized CT secondary** |

---

## Sheet 9 — Switches & Grounding

| Type | Poles | Throws | Function |
|---|---|---|---|
| SPST | 1 | 1 | on / off |
| SPDT | 1 | 2 | common to one of two outputs |
| DPDT | 2 | 2 | two circuits, each common to two outputs |

**Grounding switch** = safely connects a conductor/equipment to ground for maintenance.

---

## Sheet 10 — Logic Gates (two inputs)

| A | B | AND | OR | XOR |
|---|---|-----|----|-----|
| 0 | 0 | 0 | 0 | 0 |
| 0 | 1 | 0 | 1 | 1 |
| 1 | 0 | 0 | 1 | 1 |
| 1 | 1 | 1 | 1 | 0 |

**NOT** inverts its input. **NAND** = NOT-AND, **NOR** = NOT-OR, **XNOR** = NOT-XOR.

---

## Sheet 11 — PLC Reference (Contacts, Data Types, Sinking/Sourcing)

**Ladder instructions:**
- **Coil ─( )─** → output, energized when rung true.
- **NO contact ─┤ ├─** → true when input energized.
- **NC contact ─┤/├─** → true when input **not** energized.
- **Seal-in** → output-coil contact in **parallel with Start**.

**Data types:**

| Type | Bits | Range |
|---|---|---|
| BOOL | 1 | true / false |
| INT | 16 | −32,768 … 32,767 |
| DINT | 32 | signed integer |
| REAL | 32 | floating point |
| UINT | 16 | 0 … 65,535 |
| UDINT | 32 | 0 … 4,294,967,295 |

**Sinking/sourcing:** Sourcing (PNP) **supplies** current out; Sinking (NPN) **receives** current in.

---

## Sheet 12 — Analog Inputs & Scaling

| Concept | Formula / value |
|---|---|
| Counts | **2ⁿ** (12-bit = **4,096**; 16-bit = **65,536**) |
| Resolution | ≈ full-scale span ÷ 2ⁿ |
| Scaling | **EU = (raw − raw_min)/(raw_max − raw_min) × (EU_max − EU_min) + EU_min** |

0–10 V on 12-bit → ~**2.44 mV** per count.

---

## Sheet 13 — Binary, Hex & Bit-Weight Reference

**Binary place values (8 bits, MSB → LSB):**

| Bit | 7 | 6 | 5 | 4 | 3 | 2 | 1 | 0 |
|---|---|---|---|---|---|---|---|---|
| Weight | 128 | 64 | 32 | 16 | 8 | 4 | 2 | 1 |

8 bits = 1 byte = **256** distinct values; a **nibble** is 4 bits (0–15).

**Hex ↔ binary nibble:**

| Hex | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Binary | 0000 | 0001 | 0010 | 0011 | 0100 | 0101 | 0110 | 0111 | 1000 | 1001 | 1010 | 1011 | 1100 | 1101 | 1110 | 1111 |

Convert binary → hex by grouping bits into nibbles from the right.

---

*For worked examples and pitfalls, see `study-guide.md`. Drill recall with `flashcards.csv`.*
