# QA Verdict — 90-Day Quote Journal ($7)

**Reviewer:** Editor & QA Reviewer (independent gate — did not write this product)
**Date:** 2026-11-10
**Files reviewed:** `90-Day-Quote-Journal-Printable-6x9.pdf`, `90-Day-Quote-Journal-KDP-Interior-6x9.pdf`, `assets/cover.png`, `gumroad-listing.md`
**Quote source of truth:** `/home/agent-web-app-engineer/webtools/sales-page/data/quotes.json` (90 entries, ids 1–90)

# VERDICT: HOLD

The quotes are clean and the print files are genuinely print-ready. The **prompts are not saleable as written**: two are word-for-word copies of their own quote, 34 more reword most of the quote back at the reader, thirteen ask for a physical action with nothing to write, and two prompt each other. Separately, the listing makes two claims the files do not support, the journal carries no disclaimer, and the KDP interior tells the buyer to publish their own copy while its title page asserts *our* copyright. Fix items 1–9 and this ships.

**Page numbering used below:** day N sits on book page N+1 in both PDFs (page 1 = cover / title page). Day 27 → page 28, and so on.

---

## What passes (verified, not assumed)

**Quotes — clean.**
- All 90 quotes appear **verbatim**, in id order, day 01–90, on pages 2–91 of both PDFs. Machine-compared every page's quote block against `quotes.json`: **0 mismatches, 0 omissions, 0 duplicates, 0 reordering.** No attribution, author name, date or source line has been added to any quote. The em dashes and punctuation are the source punctuation.
- No exclamation marks anywhere in the quotes or prompts. No digits, statistics, percentages, doses, remedies, medical advice or weapon content anywhere in either file (searched both PDFs in full plus all 90 quotes and 90 prompts). The only digits in the files are day labels, folio numbers and the copyright year.

**KDP interior — genuinely print-ready.**
- 91 pages (KDP minimum is 24).
- Page size exactly **432 × 648 pt (6 × 9 in)** on every page — **no bleed**.
- **Mirrored gutter confirmed by measurement:** verso pages start text at 36 pt from the left edge (0.5 in outer), recto pages at 54 pt (0.75 in inner); the inner margin is on the correct side of each spread. Well inside KDP's minimums.
- **Fonts embedded:** DejaVu Serif and DejaVu Sans, both embedded as subset TrueType (Type0/Identity-H). Nothing unembedded, so no reflow on another machine.
- **No cover art:** 0 images in the whole file. Page 1 is a clean title page.
- No text or rule falls outside the safe area on any page; no blank, clipped or truncated pages (all 91 pages carry text; page 28 and the last page render correctly).
- Folios 2–91 are correct and sequential; page 1 correctly carries none.

**Printable file.** 91 pages, 432 × 648 pt, uniform 0.6 in margins, embedded fonts, cover page on page 1, then days 01–90. Renders cleanly.

**Listing — mostly accurate.** File names, 91-page count for both files, 6 × 9 / 432 × 648, no bleed, embedded fonts, "two PDFs, no app, no account", the digital-download note and the refund line all match the files. **The KDP book-block disclosure is present and explicit** (line 36: "The KDP interior is a book block — KDP requires you to supply your own cover separately") — a buyer is not misled on that point.

---

## Must-fix items

**1. Days 27 and 42 print the quote twice. (page 28, page 43)**
The prompt is character-for-character identical to the quote above it:
- page 28 — quote: "Ask your parent what they would do if the lift stopped working today." / prompt: same sentence.
- page 43 — quote: "Sort your kitchen into food that needs power and food that does not." / prompt: same sentence.

A buyer turning to page 28 sees one sentence, then the same sentence again under "WRITE". Rewrite both prompts as questions the quote does not already answer.

**2. Days 44, 64, 81, 85 restate the quote with one word swapped. (pages 45, 65, 82, 86)**
- p45 — quote "**Keep** a pair of shoes by the bed that you could walk a mile in." → prompt "**Put** a pair of shoes by the bed that you could walk a mile in."
- p82 — quote "Ring the bell of the person who lives alone and ask **if they are alright**." → prompt "Ring the bell of the person who lives alone and ask **how they are**."
- p86 — quote "**Fix** one light to the wall where your hand already goes in the dark." → prompt "**Put** one light where your hand already goes in the dark."
- p65 — quote "Learn which of your neighbours has a car and which would need a lift." → prompt "Note which neighbours have a car, and who would need a lift."

These read as the same sentence typed twice, not as a prompt.

**3. Roughly a third of the journal restates its quote instead of prompting. (36 pages)**
Measured content-word overlap between each prompt and its own quote: **36 of 90 prompts reuse at least half of the quote's content words; 19 reuse 60% or more.** Days with ≥60%: 19, 27, 29, 32, 40, 41, 42, 44, 46, 61, 64, 69, 72, 79, 80, 81, 84, 85, 89 → pages 20, 28, 30, 33, 41, 42, 43, 45, 47, 62, 65, 70, 73, 80, 81, 82, 85, 86, 90. Examples that add nothing:
- p41 — quote "Check your smoke alarm batteries on a date you will not forget." → prompt "Pick the date you will check the smoke alarm batteries and write it down."
- p57 — quote "Check the expiry dates on the food you are keeping for an emergency." → prompt "Check the dates on your stored food and write the earliest one."
- p73 — quote "Keep one warm layer per person where you sleep, not in the hallway cupboard." → prompt "Count one warm layer per person and put each where they sleep."
- p81 — quote "Keep one folder for everyone's health paperwork and label it clearly." → prompt "Start one folder for health paperwork and label it."

The whole selling proposition on the listing is "one quote, **one prompt**, one page a day". If the prompt is the quote again, the buyer has paid for 90 quotes and 90 ruled pages. Every prompt must ask for something the quote does not already say — a specific number, name, place, date or decision.

**4. Thirteen prompts ask for an errand and leave the ruled lines blank. (pages 28, 45, 47, 50, 58, 59, 61, 62, 67, 72, 82, 86, 90)**
Prompts with no writing element at all — nothing for the page's lines to receive:
- p28 "Ask your parent what they would do if the lift stopped working today."
- p45 "Put a pair of shoes by the bed that you could walk a mile in."
- p47 "Move a spare charger and a power bank to where you sleep."
- p50 "Listen tonight for the sounds your building makes when it goes quiet."
- p58 "Give every adult in the flat the same page and ask them to read it."
- p59 "Ring your emergency contact and ask whether that number is still right."
- p61 "Put a blanket, a torch and a radio in one place you can reach in the dark."
- p62 "Ask your pharmacy what happens to your order if their systems go down."
- p67 "Empty the bin and clear the sink before you go to bed tonight."
- p72 "Tell a child the first three steps and ask them to repeat them back."
- p82 "Ring the bell of the person who lives alone and ask how they are."
- p86 "Put one light where your hand already goes in the dark."
- p90 "Practise with a child what they would say when they call for help."

These are filler: the reader does the thing and the page stays empty. Add the recording half ("…and write what they said / what you moved / how long it took").

**5. Two prompts duplicate each other's content. (pages 40 and 63)**
- p40 (day 39) "Copy the numbers you would need onto paper and keep it with the plan."
- p63 (day 62) "Write the numbers you would need on a card and put it in your wallet."

Same task — put the emergency numbers on paper you carry — 23 days apart. Also clustered and worth varying: p39 (day 38) / p48 (day 47) / p83 (day 82) all ask "write the first three things you would do / take / need"; p35 (day 34) "Clear space in the freezer today and note what you moved" and p88 (day 87) "Clear the hallway tonight and note what you had to move" are the same sentence with the noun changed; p12 (day 11) "Decide where a torch lives…" and p74 (day 73) "Decide where cash lives…" are the same construction twice. Distinctness, not just non-identity, is the requirement — and 34 days apart is not distinctness.

**6. Neither file carries any disclaimer. (both PDFs)**
Searched both files in full for "disclaimer", "not a substitute", "professional advice", "study aid", "not medical" — **no match anywhere**. The book tells the reader to locate their gas shut-off (p42), their water shut-off valve (p32), what must stay cold in the fridge (p37), where the medication list lives (p17) and how to get an older person down the stairs (p29). It needs one short line on the title page and one in the listing: a journal, not safety, medical or professional advice; follow the authority, your supplier or your building manager for anything involving gas, electricity or medication. This is the same rule NOBODY RUNS is held to.

**7. The KDP interior tells the buyer to publish their own copy while its title page asserts our copyright. (page 1 of the KDP interior)**
Page 1 of the KDP file reads "MicroVenture Labs / © 2026 MicroVenture Labs. All rights reserved." The listing sells that same file as "ready to upload as your book block" (line 21) and "for anyone who wants a ready-made 6x9 journal interior **to publish as a paperback**" (line 34). As shipped, a buyer who uploads it publishes a book whose title page names us as the copyright holder, and we have granted no licence to do so. Fix one of the two ends: either (a) put a plain licence statement in the listing (e.g. personal-use licence — no resale or redistribution of the files as files) and change the title page to neutral text with a placeholder for the buyer's name, or (b) drop the "publish your own copy" framing and sell the KDP file as a print-shop-ready interior only. Do not ship it with the promise and the copyright notice both in place.

**8. The listing claims the prompts work for people who are not preparing. (listing, line 16)**
"the prompts are short and direct, and **they work whether or not you are actually preparing for anything**." That is false and a buyer will find out on page 2. The prompts are almost entirely preparedness tasks: count your taps (p3), track your household's drinking water (p7), find your fuse box (p20), book a drill (p21), find your gas shut-off (p42), check your stored food dates (p57). The "Who it is for" line (line 34) — "anyone who wants a small daily writing habit" — is wrong for the same reason. Rewrite both to say plainly that this is a household-preparedness journal, or replace the prompts.

**9. "No filler" is contradicted by items 1–5. (listing, line 14)**
"No filler, no daily reading plan to keep up with" cannot stand while two pages repeat their own quote verbatim and thirteen pages have nothing to write. Fix the prompts, then the claim is safe; if the prompts stay as they are, the claim has to go.

---

## Should-fix (not blocking on their own)

**10. British English throughout, in a US-targeted store.** "practise" (p2, p90), "torch" (p12, p61), "neighbour(s)" (p19, p49, p65), "flat" (p20, p58), "lift" meaning elevator (p28, p65). The quotes use the same register, so the book is internally consistent and I am **not** asking for the quotes to be touched — they passed QA and are frozen. But the business sells to US households, and a US buyer reading "the lift stopped working" and "the whole flat" may read it as imported. Decide deliberately: keep the British register and say so, or write the *new* prompts (which have to be rewritten anyway under items 1–5) in US English. Either is defensible; drifting between the two is not.

**11. Cover art edge is visible.** In `assets/cover.png` the paper-textured art tile sits on a slightly different background tone than the cover fill, so a faint rectangle edge shows around the illustration. Cosmetic only, and this cover is the listing thumbnail rather than part of either PDF — but it is the first thing a buyer sees, so worth one pass in the rebuild.

**12. "Black-and-white interior" is approximate.** The text is a warm near-black (#2b2724) and the rules are a tan tint, not pure black. It will convert to greyscale without trouble on KDP and prints fine at home, so I am not blocking on it — but if the listing says "black-and-white" the safest thing is to say "greyscale interior" instead.

---

## Sign-off

Quotes: **pass**. Print files: **pass** — the KDP interior is genuinely print-ready and the book-block disclosure is correctly stated. Prompts: **fail**. Listing accuracy: **fail** on two sentences. Disclaimer: **missing**.

HOLD. Re-review required on items 1–9; items 10–12 are the author's call. When the prompts are rewritten, send the new prompt set back through this gate — the quote text must come back byte-identical, and I will re-run the verbatim comparison on both rebuilt PDFs.
