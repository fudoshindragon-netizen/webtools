# Electrical Deeper Understanding — Exam-Focused Study Guide

> **Study aid only.** This guide is not a substitute for a formal course, your employer's or state's required training, on-the-job instruction, the National Electrical Code, NFPA 70E, OSHA requirements, or any certification exam. Neither MicroVenture Labs nor the author is providing legal advice, engineering certification, or exam-preparation guarantees. Content may contain errors; verify against your course materials and the latest standards. Always follow your employer's and local authority having jurisdiction (AHJ) requirements for actual electrical work.

**How to use this guide:** Read each section top-to-bottom, work the example by hand, and review the pitfalls before self-testing with `flashcards.csv` and the practice questions in the free app.

---

## 1. Binary & Number Systems

**The big idea:** PLCs and computers store numbers in base 2. Each bit position is a power of two, and the decimal value is the sum of the set bits.

**Must-know facts:**
- Place values (right to left): **1, 2, 4, 8, 16, 32, 64, 128 …**
- **MSB** = leftmost bit; **LSB** = rightmost bit. **8 bits = 1 byte** (a nibble is 4 bits).
- An **n-bit** value has **2ⁿ** distinct values (8 bits → 256).

**Worked example:** Binary **1010** = (1×8) + (0×4) + (1×2) + (0×1) = **10**. Decimal **13** = 8 + 4 + 1 → **1101**.

**Common pitfalls:** Reading place values left-to-right as if the leftmost were "1"; forgetting the leftmost 8-bit place is 128 (not 256); off-by-one on 2ⁿ (8 bits = 256 values, not 255).

---

## 2. Ohm's Law, Power & Energy

**The big idea:** Voltage, current, resistance, and power are locked together; these two equations underpin conductor sizing, fusing, and load calculations.

**Must-know formulas:**
- **V = I × R** → **I = V ÷ R**, **R = V ÷ I**.
- **P = V × I = I² × R = V² ÷ R**.

**Worked example:** A **6 Ω** load on **24 V**: I = 24 ÷ 6 = **4 A**. A heater drawing **10 A** on **120 V**: P = 120 × 10 = **1,200 W**.

**Common pitfalls:** Multiplying V × R instead of dividing (the "144 A" trap); unit confusion (mA vs A); forgetting the I²R form when only current and resistance are given.

---

## 3. Reactance & Impedance

**The big idea:** Inductors and capacitors oppose AC with frequency-dependent reactance; impedance combines resistance and reactance.

**Must-know formulas:**
- **XL = 2πƒL** (inductor: current **lags** voltage 90°; XL **rises** with ƒ).
- **XC = 1/(2πƒC)** (capacitor: current **leads** voltage 90°; XC **falls** as ƒ rises).
- **Z = R + jX**; magnitude **|Z| = √(R² + X²)**. Series R-L: **Z = R + jXL**; series R-C: **Z = R − jXC**.

**Worked example:** Series R-L with **R = 3 Ω, XL = 4 Ω**: |Z| = √(3² + 4²) = **5 Ω**.

**Common pitfalls:** Mixing up "lags" vs "leads" (mnemonic: ELI the ICE man); forgetting XL ∝ ƒ but XC ∝ 1/ƒ; entering C in µF instead of farads (10 µF = 10×10⁻⁶ F).

---

## 4. Series & Parallel Circuits

**The big idea:** Series shares one current path and adds resistance; parallel shares one voltage and adds conductance.

**Must-know formulas:**
- **Series:** Rₜ = R₁ + R₂ + … ; same **current**; voltage **divides**.
- **Parallel:** 1/Rₜ = 1/R₁ + 1/R₂ + … ; same **voltage**; current **divides**.
- Two-resistor shortcut: **Rₜ = (R₁·R₂)/(R₁ + R₂)**; two equal in parallel → **half** of one.

**Worked example:** Two **10 Ω** resistors: series = **20 Ω**; parallel = **5 Ω**.

**Common pitfalls:** Applying the series sum to parallel branches; confusing "same current" (series) with "same voltage" (parallel).

---

## 5. Transformers & Power Factor

**The big idea:** Turns ratio sets the voltage ratio; ideal transformers conserve power; power factor measures how efficiently current becomes real work.

**Must-know formulas:**
- **Np / Ns = Vp / Vs**.
- **Ideal:** **Vp · Ip = Vs · Is** (step-up → voltage up, current down).
- **PF = W / VA = cos θ** → **VA = W / PF**.

**Worked example:** **100:1,000 turns, 120 V primary:** Vs = 120 × (1000/100) = **1,200 V**. **1,200 W @ PF 0.8:** VA = 1200 / 0.8 = **1,500 VA**.

**Common pitfalls:** Inverting the turns ratio; forgetting a step-up lowers current; confusing watts (real) with volt-amps (apparent).

---

## 6. Three-phase: Delta & Wye

**The big idea:** Line and phase quantities relate by √3, and the connection (Y or Δ) decides what voltage each winding sees.

**Must-know formulas:**
- **Wye (Y):** V_line = **√3 × V_phase**; I_line = **I_phase**.
- **Delta (Δ):** V_line = **V_phase**; I_line = **√3 × I_phase**.
- Motor windings: **wye** sees **V_line ÷ √3**; **delta** sees **full V_line**.
- **P = √3 × V_line × I_line × PF**.

**Worked example:** A **480 V** wye motor: each winding sees 480 ÷ √3 ≈ **277 V**. A **208 V** wye motor: ≈ **120 V**.

**Common pitfalls:** Mixing up where √3 goes (wye voltage vs delta current); forgetting that a wye winding sees only phase voltage.

---

## 7. Motors: Service Factor, Inrush & Shunt Speed

**The big idea:** Service factor sets overload margin; induction motors surge on start; a shunt motor's speed follows field and armature voltage.

**Must-know facts:**
- **Service factor (SF):** NEMA multiplier on rated HP (typ. **1.0 / 1.15**). 10 HP × 1.15 → up to **~11.5 HP** continuous (reduces life margin).
- **Inrush:** ~ several × (often **~6×**) full-load current, decaying as the motor spins up.
- **Shunt motor** (field ∥ armature): weaken field → **raise** speed; reduce armature voltage → **lower** speed.

**Worked example:** A 10 HP motor with SF 1.15 runs continuously to about **11.5 HP** under rated conditions.

**Common pitfalls:** Forgetting that relying on SF reduces insulation/life margin; treating inrush as exactly 6× (it's an order-of-magnitude); reversing field-weakening's effect on speed.

---

## 8. AC Drives & Dynamic Braking

**The big idea:** A VFD changes motor speed by changing frequency; dynamic braking dumps kinetic energy into a resistor.

**Must-know facts:**
- VFD: **AC → rectifier → DC bus → inverter → variable-frequency AC**.
- **n ≈ 120·f / poles** (lower ƒ → lower speed).
- **Dynamic braking:** motor acts as a **generator**; energy dumped into a **braking resistor** as heat.

**Worked example:** A **4-pole** motor at **60 Hz**: n ≈ 120 × 60 / 4 = **1,800 rpm**.

**Common pitfalls:** Getting the rectifier→inverter order backwards; miscounting poles in the speed formula.

---

## 9. Circuit Protection: Fusing & Current Transformers

**The big idea:** Fuses clear overcurrent within their ratings; CTs step current down safely, and their secondary must never be opened.

**Must-know facts:**
- Fuse ratings: **current** (continuous carry), **voltage** (circuit class), **interrupting/AIC** (fault current it can safely clear).
- **Dual-element (time-delay)** fuses ride through motor inrush; **fast-acting** suit loads without inrush.
- **CT:** steps primary down to ~**5 A or 1 A**; **never open-circuit an energized CT secondary**.

**Common pitfalls:** Confusing AIC (fault-clearing) with the continuous current rating; opening a live CT secondary.

---

## 10. Switches & Grounding

**The big idea:** Poles = circuits controlled; throws = output positions per pole.

**Must-know facts:**
- **SPST** = on/off (1 pole, 1 throw). **SPDT** = common to one of two outputs. **DPDT** = two circuits, each common to two outputs.
- **Grounding switch:** safely connects a conductor/equipment to ground for maintenance.

**Common pitfalls:** Confusing poles (circuits) with throws (positions).

---

## 11. Logic Gates

**The big idea:** Seven standard gates implement Boolean logic, each with a defined truth table.

**Must-know truth table (two inputs):**

| A | B | AND | OR | XOR |
|---|---|-----|----|-----|
| 0 | 0 | 0 | 0 | 0 |
| 0 | 1 | 0 | 1 | 1 |
| 1 | 0 | 0 | 1 | 1 |
| 1 | 1 | 1 | 1 | 0 |

**NOT** inverts its input. **NAND** = NOT-AND, **NOR** = NOT-OR, **XNOR** = NOT-XOR.

**Common pitfalls:** Confusing XOR (inputs differ) with OR (any 1); forgetting the NAND/NOR/XNOR inverses.

---

## 12. PLC Fundamentals: Contacts, Data Types, Sinking/Sourcing

**The big idea:** Ladder logic reads contacts and drives coils; PLC data is typed; DC devices either source or sink current.

**Must-know facts:**
- **Coil** = output. **NO contact** = true when input energized; **NC contact** = true when input **not** energized.
- **Seal-in:** an output-coil contact in **parallel with Start** holds the coil on after Start releases.
- **Data types:** BOOL (1 bit), INT (16-bit signed, **−32,768…32,767**), DINT (32-bit), REAL (32-bit float), UINT/UDINT (unsigned).
- **Sourcing (PNP)** supplies current out; **sinking (NPN)** receives current in.

**Common pitfalls:** Reversing NO/NC truth; misquoting the INT range; mixing up PNP (source) vs NPN (sink).

---

## 13. Analog Inputs & Scaling

**The big idea:** An analog card turns a continuous signal into a digital count; bit depth sets resolution; scaling maps counts to engineering units.

**Must-know formulas:**
- **n-bit → 2ⁿ counts** (12-bit = **4,096**; 16-bit = **65,536**).
- Resolution ≈ **full-scale span ÷ 2ⁿ**.
- **EU = (raw − raw_min)/(raw_max − raw_min) × (EU_max − EU_min) + EU_min**.

**Worked example:** **0–10 V on 12-bit (4,096 counts):** resolution ≈ 10/4096 ≈ **2.44 mV** per count.

**Common pitfalls:** Writing 12-bit as 4,095 (it's 4,096 counts, values 0–4095); using n× instead of 2ⁿ.

---

## 14. Ladder Logic & Application

**The big idea:** A motor start/stop rung combines Start, seal-in, Stop, and overload to control a coil safely.

**Must-know facts:**
- **Start (NO)** in parallel with the **seal-in** contact (from the Run coil) starts and latches the motor.
- **Stop (NC)** and **overload (NC)** are **in series** with the coil — opening either drops the motor out.

**Worked example:** Pressing **Stop** opens its NC contact, breaking the rung and de-energizing the Run coil. An **overload trip** does the same via its series NC contact.

**Common pitfalls:** Placing the overload in parallel (it belongs in series); putting the seal-in in series with Start (it belongs in parallel).

---

*See `formula-sheets.md` for the one-page reference and `flashcards.csv` for rapid self-testing.*
