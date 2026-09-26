# Electrical Deeper Understanding — Exam-Focused Study Guide

> **Study aid only.** This guide is not a substitute for a formal course, your employer's or state's required training, on-the-job instruction, the National Electrical Code, NFPA 70E, OSHA requirements, or any certification exam. Content may contain errors; verify against your course materials and the latest standards. Always follow your employer's and local authority having jurisdiction (AHJ) requirements for actual electrical work.

**How to use this guide:** Read each section top-to-bottom, work the examples by hand, then self-test with the companion flashcards (`flashcards.csv`) and the practice questions in the free app.

---

## 1. Binary & Number Systems

**The big idea:** PLCs and computers store numbers in base 2. Each bit position is a power of two, and reading the set bits gives the decimal value.

### Key concepts
- Place values (right to left): **1, 2, 4, 8, 16, 32, 64, 128 …**
- The **leftmost** bit is the **MSB** (most significant bit); the **rightmost** is the **LSB**.
- A single binary digit is a **bit**; **8 bits = 1 byte**.
- An **n-bit** value has **2ⁿ** distinct values (8 bits → 256).
- Convert binary → decimal by **adding the place values of every 1**.

### Worked example
- **1010₂** = (1×8) + (0×4) + (1×2) + (0×1) = **10**.
- **13 → binary:** 13 = 8 + 4 + 1, so the 8, 4, and 1 bits are set: **1101**.

---

## 2. Ohm's Law, Power & Energy

**The big idea:** Voltage, current, resistance, and power are locked together by two equations that underpin conductor sizing, fusing, and load calculations.

### Key concepts
- **V = I × R** (volts = amps × ohms) → **I = V ÷ R**, **R = V ÷ I**.
- **P = V × I**; combined with Ohm's Law: **P = I² × R** and **P = V² ÷ R**.

### Worked example
- A **6 Ω** load on **24 V**: I = 24 ÷ 6 = **4 A**.
- A heater drawing **10 A** on **120 V**: P = 120 × 10 = **1,200 W**.

---

## 3. Reactance & Impedance

**The big idea:** Inductors and capacitors oppose AC current with frequency-dependent reactance; impedance is their total combined with resistance.

### Key concepts
- **XL = 2πƒL** (inductive reactance). In a pure inductor, current **lags** voltage by 90°. XL **rises** with frequency (DC → short; high ƒ → open).
- **XC = 1/(2πƒC)** (capacitive reactance). In a pure capacitor, current **leads** voltage by 90°. XC **falls** as frequency rises.
- **Z = R + jX**, magnitude **|Z| = √(R² + X²)**. Series R-L: **Z = R + jXL**; series R-C: **Z = R − jXC**.

### Worked examples
- XL of **0.5 H @ 60 Hz**: 2π × 60 × 0.5 ≈ **188 Ω**.
- XC of **10 µF @ 50 Hz**: 1/(2π × 50 × 10⁻⁵) ≈ **318 Ω**.
- Series R-L with **R = 3 Ω, XL = 4 Ω**: |Z| = √(3² + 4²) = **5 Ω**.

---

## 4. Series & Parallel Circuits

**The big idea:** Series shares one current path and adds resistance; parallel shares one voltage and adds conductance.

### Key concepts
- **Series:** Rₜ = R₁ + R₂ + … ; same **current** everywhere; voltage **divides**.
- **Parallel:** 1/Rₜ = 1/R₁ + 1/R₂ + … ; same **voltage** across branches; current **divides**.
- Two equal resistors in parallel give **half** of one (10 Ω ∥ 10 Ω = 5 Ω).

### Worked examples
- Two **10 Ω** in series = **20 Ω**; in parallel = **5 Ω**.

---

## 5. Transformers & Power Factor

**The big idea:** Turns ratio sets voltage ratio; ideal transformers conserve power; power factor measures how efficiently current becomes real work.

### Key concepts
- **Np / Ns = Vp / Vs**.
- **Step-up** (Ns > Np) → voltage up, current down. **Ideal** transformer: **Vp·Ip = Vs·Is**.
- **PF = W / VA = cos θ** → **VA = W / PF**. Low PF → more current for the same real power.

### Worked examples
- **100:1,000 turns, 120 V primary:** Vs = 120 × (1000/100) = **1,200 V**.
- **1,200 W @ PF 0.8:** VA = 1200 / 0.8 = **1,500 VA**.

---

## 6. Three-phase: Delta & Wye

**The big idea:** Line and phase quantities relate by √3, and the connection (Y or Δ) decides what voltage each winding sees.

### Key concepts
- **Wye (Y):** V_line = √3 × V_phase; I_line = I_phase.
- **Delta (Δ):** V_line = V_phase; I_line = √3 × I_phase.
- Motor windings: **wye** winding sees **V_line ÷ √3**; **delta** winding sees **full V_line**.
- Balanced three-phase power: **P = √3 × V_line × I_line × PF**.

### Worked example
- **480 V wye motor:** each winding sees 480 ÷ √3 ≈ **277 V**.
- **208 V wye motor:** each winding sees 208 ÷ √3 ≈ **120 V**.

---

## 7. Motors: Service Factor, Inrush & Shunt Speed

**The big idea:** Service factor sets overload margin; induction motors surge current on start; a shunt motor's speed is set by field and armature voltage.

### Key concepts
- **Service factor (SF):** multiplier on rated HP (NEMA). Typical **1.0 or 1.15**. 10 HP × 1.15 → up to **~11.5 HP** continuous (reduces life margin).
- **Inrush:** starting current ~ several × (often **~6×**) full-load, decaying as the motor spins up.
- **Shunt motor** (field ∥ armature): weaken field → **raise** speed; reduce armature voltage → **lower** speed.

### Worked example
- A 10 HP motor with SF 1.15 runs continuously to about **11.5 HP** under rated conditions.

---

## 8. AC Drives & Dynamic Braking

**The big idea:** A VFD changes motor speed by changing frequency; dynamic braking dumps the motor's kinetic energy into a resistor.

### Key concepts
- VFD: **AC → DC (rectifier) → AC (inverter)**.
- Synchronous speed **n ≈ 120·f / poles**; lower ƒ → lower speed.
- **Dynamic braking:** motor acts as a **generator**; energy dumped into a **braking resistor** as heat → retarding torque.

### Worked example
- A **4-pole** motor at **60 Hz**: n ≈ 120 × 60 / 4 = **1,800 rpm**.

---

## 9. Circuit Protection: Fusing & Current Transformers

**The big idea:** Fuses clear overcurrent within their ratings; CTs step current down safely — and their secondary must never be opened.

### Key concepts
- Fuse ratings: **current** (continuous carry), **voltage** (circuit class), **interrupting/AIC** (fault current it can safely clear).
- **Dual-element (time-delay)** fuses ride through motor inrush; **fast-acting** suit loads without inrush.
- **CT:** steps primary current down to ~**5 A or 1 A** for meters/relays.
- **Never open-circuit an energized CT secondary** (dangerously high voltage); keep it shorted or on a burden.

---

## 10. Switches & Grounding

**The big idea:** Poles = circuits controlled; throws = output positions per pole.

### Key concepts
- **SPST** = on/off (1 pole, 1 throw).
- **SPDT** = common to one of two outputs (1 pole, 2 throws).
- **DPDT** = two circuits, each common to two outputs (2 poles, 2 throws).
- **Grounding switch:** safely connects a conductor/equipment to ground for maintenance.

---

## 11. Logic Gates

**The big idea:** Seven standard gates implement Boolean logic; each has a defined truth table.

### Key concepts (two inputs, 1 = true)
- **AND** = 1 only when **both** inputs are 1.
- **OR** = 1 when **at least one** input is 1.
- **NOT** = inverts its single input.
- **XOR** = 1 when inputs **differ**.
- **NAND / NOR / XNOR** = the inverses of AND / OR / XOR.

| A | B | AND | OR | XOR |
|---|---|-----|----|-----|
| 0 | 0 | 0 | 0 | 0 |
| 0 | 1 | 0 | 1 | 1 |
| 1 | 0 | 0 | 1 | 1 |
| 1 | 1 | 1 | 1 | 0 |

---

## 12. PLC Fundamentals: Contacts, Data Types, Sinking/Sourcing

**The big idea:** Ladder logic reads contacts and drives coils; PLC data is typed; DC devices either source or sink current.

### Key concepts
- **Coil** = output (energized when the rung is true). **NO contact** = true when input energized; **NC contact** = true when input **not** energized.
- **Seal-in (latch):** a contact driven by the output coil in **parallel with Start** holds the coil on after Start releases.
- **Data types:** BOOL (1 bit), INT (16-bit signed, **−32,768…32,767**), DINT (32-bit), REAL (32-bit float), UINT/UDINT (unsigned).
- **Sourcing (PNP)** supplies current out; **sinking (NPN)** receives current in. Inputs are described from the opposite perspective.

---

## 13. Analog Inputs & Scaling

**The big idea:** An analog card turns a continuous signal into a digital count; bit depth sets resolution; scaling maps counts to engineering units.

### Key concepts
- **n-bit → 2ⁿ counts** (12-bit = **4,096**; 16-bit = **65,536**).
- Resolution ≈ **full-scale span ÷ 2ⁿ**.
- Scaling: **EU = (raw − raw_min)/(raw_max − raw_min) × (EU_max − EU_min) + EU_min**.

### Worked example
- **0–10 V on 12-bit (4,096 counts):** resolution ≈ 10/4096 ≈ **2.44 mV** per count.

---

## 14. Ladder Logic & Application

**The big idea:** A motor start/stop rung combines Start, seal-in, Stop, and overload to control a coil safely.

### Key concepts
- **Start (NO)** in parallel with the **seal-in contact** (from the Run coil) starts and latches the motor.
- **Stop (NC)** and **overload (NC)** are **in series** with the coil — opening either drops the motor out.
- The **overload** contact protects the motor from sustained overcurrent.

### Worked example
- Pressing **Stop** opens its NC contact, breaking the rung and de-energizing the Run coil. An **overload trip** does the same via its series NC contact.

---

*See `formula-sheets.md` for the one-page formula reference and `flashcards.csv` for rapid self-testing.*
