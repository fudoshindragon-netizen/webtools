#!/usr/bin/env python3
"""Build the US-spelling editions of the 90-Day Quote Journal.

Identical layout to build/make.py: printable 6x9 (cover + 90 day pages = 91) and
KDP interior 6x9 (title page + 90 day pages = 91). British spellings are
normalised to US spellings in the quote text, and British vocabulary and idiom
are converted too (flat -> apartment, torch -> flashlight, the lift -> the
elevator, queue -> line, taps -> faucets, mains -> water, expiry -> expiration,
bin -> trash can, shop -> store, boiler/serviced/engineer -> water heater/
maintained/technician, tank or boiler -> water heater tank, cupboard -> cabinet
or closet, smoke alarm -> smoke detector, fuse box -> breaker box, ring the bell
-> ring the doorbell, alright -> all right). Day 64's "which would need a lift"
means a ride and is left alone.

Outputs go to us-spelling/ (PDFs) and us-spelling/build/ (HTML + US quotes json).
The live British PDFs in the parent folder are never written to.
"""
import json, html, pathlib, re

ROOT = pathlib.Path("/home/team/shared/digital-products/quote-journal")
US = ROOT / "us-spelling"
OUT = US / "build"
QUOTES = pathlib.Path("/home/agent-web-app-engineer/webtools/sales-page/data/quotes.json")
ART = ROOT / "assets" / "cover-art-soft.png"

# British -> US spellings. Word-boundary matched, case preserved.
SPELLING = {
    "practise": "practice", "practised": "practiced", "practises": "practices",
    "practising": "practicing",
    "neighbour": "neighbor", "neighbours": "neighbors",
    "neighbourhood": "neighborhood", "neighbourhoods": "neighborhoods",
    "neighbouring": "neighboring", "neighbourly": "neighborly",
    "colour": "color", "colours": "colors", "coloured": "colored",
    "colourful": "colorful", "colouring": "coloring",
    "favour": "favor", "favours": "favors", "favoured": "favored",
    "favourite": "favorite", "favourites": "favorites", "favourable": "favorable",
    "honour": "honor", "honours": "honors", "honoured": "honored",
    "behaviour": "behavior", "behaviours": "behaviors",
    "labour": "labor", "labours": "labors",
    "humour": "humor", "rumour": "rumor", "rumours": "rumors",
    "vapour": "vapor", "armour": "armor", "endeavour": "endeavor",
    "saviour": "savior", "splendour": "splendor", "odour": "odor",
    "whilst": "while", "amongst": "among", "amidst": "amid",
    "learnt": "learned", "spelt": "spelled", "dreamt": "dreamed",
    "leant": "leaned", "burnt": "burned", "smelt": "smelled",
    "grey": "gray", "greys": "grays", "greyish": "grayish",
    "realise": "realize", "realised": "realized", "realising": "realizing",
    "organise": "organize", "organised": "organized", "organising": "organizing",
    "organisation": "organization", "recognise": "recognize",
    "recognised": "recognized", "recognising": "recognizing",
    "apologise": "apologize", "apologised": "apologized",
    "prioritise": "prioritize", "prioritised": "prioritized",
    "memorise": "memorize", "memorised": "memorized",
    "summarise": "summarize", "summarised": "summarized",
    "customise": "customize", "customised": "customized",
    "utilise": "utilize", "utilised": "utilized",
    "authorise": "authorize", "authorised": "authorized",
    "criticise": "criticize", "criticised": "criticized",
    "emphasise": "emphasize", "emphasised": "emphasized",
    "minimise": "minimize", "minimised": "minimized",
    "maximise": "maximize", "maximised": "maximized",
    "normalise": "normalize", "normalised": "normalized",
    "specialise": "specialize", "specialised": "specialized",
    "analyse": "analyze", "analysed": "analyzed", "analysing": "analyzing",
    "paralyse": "paralyze", "paralysed": "paralyzed",
    "centre": "center", "centres": "centers", "centred": "centered",
    "metre": "meter", "metres": "meters", "litre": "liter", "litres": "liters",
    "theatre": "theater", "fibre": "fiber", "calibre": "caliber",
    "travelled": "traveled", "travelling": "traveling", "traveller": "traveler",
    "labelled": "labeled", "labelling": "labeling",
    "modelled": "modeled", "modelling": "modeling",
    "cancelled": "canceled", "cancelling": "canceling",
    "signalled": "signaled", "signalling": "signaling",
    "fuelled": "fueled", "fuelling": "fueling",
    "jewellery": "jewelry", "defence": "defense", "offence": "offense",
    "licence": "license", "pretence": "pretense",
    "programme": "program", "programmes": "programs",
    "catalogue": "catalog", "catalogues": "catalogs",
    "dialogue": "dialog", "cheque": "check", "cheques": "checks",
    "draught": "draft", "plough": "plow", "sceptic": "skeptic",
    "sceptical": "skeptical", "storey": "story", "storeys": "stories",
    "kerb": "curb", "tyre": "tire", "tyres": "tires", "aluminium": "aluminum",
    "ageing": "aging", "judgement": "judgment", "acknowledgement": "acknowledgment",
    "fulfil": "fulfill", "fulfilled": "fulfilled", "enrol": "enroll",
    "skilful": "skillful", "wilful": "willful", "practitioner": "practitioner",
    "adviser": "adviser", "speciality": "specialty", "mould": "mold",
    "moulds": "molds", "mouldy": "moldy", "smoulder": "smolder",
    "towards": "toward", "afterwards": "afterward", "forwards": "forward",
    "cosy": "cozy", "mum": "mom", "maths": "math",
}

_word = {b: re.compile(r"\b%s\b" % re.escape(b), re.I) for b in SPELLING}
_changes = {}


def normalise(text):
    def sub(m):
        w = m.group(0)
        rep = SPELLING[w.lower()]
        if w.isupper():
            rep = rep.upper()
        elif w[0].isupper():
            rep = rep[0].upper() + rep[1:]
        _changes[w] = _changes.get(w, 0) + 1
        return rep
    for b, rx in _word.items():
        text = rx.sub(sub, text)
    return text


# British vocabulary and idiom -> US vocabulary. Ordered: the specific phrases
# come before the general words, so a phrase is never half-replaced. Patterns
# allow any whitespace (\s+) because the plain-text edition is hard-wrapped.
# Day 64's "which would need a lift" is a ride, not an elevator: only "the lift"
# is converted, so that line is deliberately left alone.
VOCAB = [
    (r"\bthe\s+queue\s+at\s+the\s+machine\b", "the line at the ATM"),
    (r"\bText\s+messages\s+queue\b", "Text messages back up"),
    (r"\bthe\s+mains\s+pressure\b", "the water pressure"),
    (r"\bthe\s+heating\s+stops\b", "the heat goes off"),
    (r"\bthe\s+date\s+the\s+boiler\s+was\s+last\s+serviced,\s+and\s+the\s+name\s+of\s+the\s+engineer\b",
     "the date the water heater was last maintained, and the name of the technician"),
    (r"\bthe\s+water\s+in\s+your\s+tank\s+or\s+boiler\b", "the water in your water heater tank"),
    (r"\bRing\s+the\s+bell\b", "Ring the doorbell"),
    (r"\balright\b", "all right"),
    (r"\bexpiry\s+dates\b", "expiration dates"),
    (r"\bfuse\s+box\b", "breaker box"),
    (r"\bsmoke\s+alarm\b", "smoke detector"),
    (r"\bthe\s+lift\b", "the elevator"),
    (r"\btorches\b", "flashlights"),
    (r"\btorch\b", "flashlight"),
    (r"\bhallway\s+cupboard\b", "hallway closet"),
    (r"\bcupboard\b", "cabinet"),
    (r"\bbin\s+it\b", "throw it out"),
    (r"\bthe\s+bin\b", "the trash can"),
    (r"\bshop\b", "store"),
    (r"\bin\s+notes\s+you\s+can\s+actually\s+spend\b", "in bills you can actually spend"),
    (r"\bsmallest\s+note\b", "smallest bill"),
    (r"\ba\s+note\s+into\s+smaller\s+ones\b", "a bill into smaller ones"),
    (r"\btaps\b", "faucets"),
    (r"\btap\b", "faucet"),
    (r"\bflat\b", "apartment"),
]

_vocab_changes = {}


def american(text):
    """Swap British vocabulary for the US word, keeping a leading capital."""
    def sub(m):
        old = m.group(0)
        rep = m.group(0)
        for pat, new in VOCAB:
            if re.fullmatch(pat, old, re.I):
                rep = new
                break
        if old[0].isupper() and rep[0].islower():
            rep = rep[0].upper() + rep[1:]
        _vocab_changes[old] = _vocab_changes.get(old, 0) + 1
        return rep

    combined = "|".join("(?:%s)" % pat for pat, _ in VOCAB)
    return re.sub(combined, sub, text, flags=re.I)


DISCLAIMER = ("A journal, not safety, medical or professional advice. For anything "
              "involving gas, electricity, water or medication, follow your supplier, "
              "your building manager or the relevant authority.")

PROMPTS = {
1: "Name the step in your plan you have never once tried, and why you have put it off.",
2: "Write how many containers you own that could hold water, and where they are now.",
3: "Name one person you would want beside you on a bad night, and say why.",
4: "Write where you would stop to rest on the way down, and who you would meet there.",
5: "Write where the largest container sits now, and what you would have to move to reach it.",
6: "Name the store you would go to first, and how far it is on foot.",
7: "Write what your household would eat on a bad night, and who would refuse it.",
8: "List the three things you would notice missing first, and where you would get them.",
9: "Write which room you would sleep in if the heat went off for three nights, and who would sleep there with you.",
10: "Write how many people sleep in your home, and what each one would put on.",
11: "Write the last time you needed a light in the dark, and what you used instead.",
12: "Name the one device you would give up first, and what you would lose with it.",
13: "Write where the second set of papers is kept, and who else has been told.",
14: "Write the one paper you would hate to lose, and where you last saw it.",
15: "Name your parent's doctor, and the day you last spoke to them.",
16: "Write which door a stranger would try first in your home, and why that one.",
17: "Write the name of the person across the hall, and one thing they would need from you.",
18: "Write what you would say in the first ten seconds, word for word.",
19: "Write who would do it if you were away, and the day you showed them.",
20: "Write who would take part in it, and how long it would run.",
21: "Write the smallest bill you would accept, and what you would refuse to pay for.",
22: "Name one store that would take cash only, and how you know.",
23: "Write the hour you would stop making decisions, and who would take over.",
24: "Write what you would use instead, and where it is kept right now.",
25: "Write the day you would sit down with them, and who else would be in the room.",
26: "Write the age of each child in your home, and the job that fits each one.",
27: "Write who would go up to your parent first, and how long it would take them to get there.",
28: "Write what you would pack for them, and who would bring it up.",
29: "Write their name, their number, and the hour they are easiest to reach.",
30: "Write the second route you would try, and who owns that account.",
31: "Write who you would call first, and the words you would use.",
32: "Write where you would go if you had to leave the door open all night, and who you would tell.",
33: "Write the two stations you would try, and the time of day you would try them.",
34: "Name a neighbor with a freezer you could share, and what you would offer them.",
35: "Write how many portions your largest pot holds, and who would eat the last one.",
36: "Write the name of the pharmacy that fills the prescription, and the hour it opens.",
37: "Write the weight of your bag, and the item you would leave out to make it lighter.",
38: "Write the one sentence you would want a stranger to read first.",
39: "Write the three things you would copy by hand tonight, and where they would go.",
40: "Write how many alarms your home has, and which one you cannot reach.",
41: "Write what you would do instead of touching it, and who you would call.",
42: "Write where you would put the second pile, and how you would label it.",
43: "Name the store that sells one, and the day you would go.",
44: "Write what you would put beside them so you could dress in the dark.",
45: "Write the number you would have to remember if the screen went black, and why that one.",
46: "Write how many charges your bank holds, and which device you would charge last.",
47: "Name the person who would carry your bag if you could not, and where they live.",
48: "Write who holds your key now, and who you would ask if they said no.",
49: "Write the three sounds you heard, and which one you could not place.",
50: "Write the name of the street behind yours, and what is on it.",
51: "Write what sits above your storage now, and where it would go.",
52: "Write the one job you could not finish in the dark, and who could finish it.",
53: "Write the last warning you received, and what you did about it.",
54: "Write the size each child wears now, and the day you last checked.",
55: "Write the name beside each job, and the one job nobody has taken.",
56: "Write the three oldest items you found, and what you did with each.",
57: "Write who you would tell first, and the one thing they must remember.",
58: "Name your backup contact, and why you chose them over the first.",
59: "Write the date the water heater was last maintained, and the name of the technician.",
60: "Write the one thing you would add to that pile, and why it is missing.",
61: "Name a second pharmacy, and how far it is from the first.",
62: "Write where your wallet is at this moment, and what is in it.",
63: "Write the outdoor spot you would use, and how you would keep it dry.",
64: "Name the neighbor with the largest vehicle, and what you could offer in return.",
65: "Write the three questions you would ask at the table, and who would answer each.",
66: "Write what you would clear first, and who would help you clear it.",
67: "Name the person who last used it, and the day they did.",
68: "Write which devices in your home take batteries, and which ones you would miss.",
69: "Write which faucet you would fill from first, and how long one pot takes.",
70: "Write the three things a stranger would not know about your home.",
71: "Write the words you would use to explain it, and the first question they would ask.",
72: "Write the name of each person and the layer they would need most.",
73: "Write how much you would keep at home, and who else knows.",
74: "Write what your policy leaves out, and the day it renews.",
75: "Write who calls whom if the first number does not answer.",
76: "Write the name of the network you would borrow, and whose password you would need.",
77: "Write what you would save first if it started to thaw, and what you would let go.",
78: "Write the one cabinet you have never opened, and what you expect is in it.",
79: "Write what you would take on the second trip, and what would stay.",
80: "Write what goes in it first, and who else needs a copy.",
81: "Write their name, their door number, and one thing they need.",
82: "Write the one thing you could not find in under a minute, and where it turned out to be.",
83: "Write the name of that person, and the second name you would add.",
84: "Write the strongest objection to your own plan, and who would raise it.",
85: "Write which wall, and what you would need to put it there.",
86: "Write the one job you would not start yourself, and who you would pay to do it.",
87: "Write what is in the way now, and who put it there.",
88: "Write the figure you could set aside each month, and what it would cover.",
89: "Write the address a child would have to say out loud, and whether they can.",
90: "Write what you would do in the second hour, and who would be in charge.",
}

quotes = json.loads(QUOTES.read_text())
quotes.sort(key=lambda q: q["id"])
assert len(quotes) == 90, len(quotes)
assert sorted(PROMPTS) == list(range(1, 91))
for q in quotes:
    q["text"] = normalise(american(q["text"]))
    if q.get("note"):
        q["note"] = normalise(american(q["note"]))
    assert q["text"].strip(), q
    assert PROMPTS[q["id"]].strip()

OUT.mkdir(parents=True, exist_ok=True)

# Plain-text edition: build/Journal.txt with the same spelling normalisation.
_journal = (ROOT / "build" / "Journal.txt").read_text(encoding="utf-8")
(US / "Journal.txt").write_text(normalise(american(_journal)), encoding="utf-8")
(OUT / "quotes-us.json").write_text(json.dumps(quotes, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

BASE_CSS = """
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: "DejaVu Serif", serif;
    color: #2b2724;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  @page { size: 6in 9in; margin: 0; }
  .page {
    width: 6in; height: 9in;
    overflow: hidden;
    position: relative;
    page-break-after: always;
    break-after: page;
    display: flex; flex-direction: column;
  }
  .page:last-child { page-break-after: auto; break-after: auto; }
  .label {
    font-family: "DejaVu Sans", sans-serif;
    font-size: 7.5pt; letter-spacing: 0.22em; text-transform: uppercase;
    color: #8a7f6d;
  }
  .quote {
    font-size: 13pt; line-height: 1.55; letter-spacing: 0.005em;
    margin: 0.16in 0 0 0;
    text-align: left;
    hyphens: none;
  }
  .rule { border: 0; border-top: 0.6pt solid #c9bfa9; margin: 0.26in 0 0 0; width: 1.1in; }
  .prompt { font-family: "DejaVu Sans", sans-serif; font-size: 8.6pt; line-height: 1.5; color: #4a443c; margin: 0.08in 0 0 0; }
  .lines {
    flex: 1 1 auto; margin-top: 0.22in;
    background-image: linear-gradient(#ded7c8 0.5pt, transparent 0.5pt);
    background-size: 100% 0.3in;
    background-repeat: repeat-y;
  }
  .folio {
    position: absolute; left: 0; right: 0; bottom: 0.4in;
    text-align: center; font-family: "DejaVu Sans", sans-serif;
    font-size: 7.5pt; color: #a2988a;
  }
"""

def day_page(q, folio, folio_show):
    pid = q["id"]
    return f"""
  <section class="page">
    <div class="label">Day {pid:02d}</div>
    <p class="quote">{html.escape(q['text'])}</p>
    <hr class="rule">
    <p class="label" style="margin-top:0.2in">Write</p>
    <p class="prompt">{html.escape(PROMPTS[pid])}</p>
    <div class="lines"></div>
    {f'<div class="folio">{folio}</div>' if folio_show else ''}
  </section>"""

def build(kdp: bool):
    if kdp:
        inner, outer, top, bottom = 0.75, 0.5, 0.5, 0.55
    else:
        inner = outer = 0.6
        top, bottom = 0.55, 0.6
    css = BASE_CSS + f"""
  .page {{ padding: {top}in {outer}in {bottom}in {inner}in; }}
  .page.verso {{ padding-left: {outer}in; padding-right: {inner}in; }}
  .page.recto {{ padding-left: {inner}in; padding-right: {outer}in; }}
"""
    pages = []
    if not kdp:
        pages.append(f"""
  <section class="page cover">
    <img class="art" src="{ART.as_uri()}" alt="">
    <div class="ctitle">90-Day<br>Quote Journal</div>
    <div class="csub">One quote, one prompt, one page a day</div>
    <div class="cnote">Ninety pages for ninety days. Read the quote, answer the prompt, keep the page. Works with any pen.</div>
    <div class="cowner">This journal belongs to <span class="fill"></span></div>
    <div class="cdisc">{html.escape(DISCLAIMER)}</div>
  </section>""")
    else:
        pages.append(f"""
  <section class="page recto titlepage">
    <div class="tlabel">90-Day</div>
    <div class="ttitle">Quote Journal</div>
    <div class="tsub">One quote, one prompt, one page a day</div>
    <div class="tnote">Ninety quotes, ninety short prompts, ninety pages to write on.<br>Read the quote. Answer the prompt in your own words. Keep the page.</div>
    <div class="towner">This journal belongs to <span class="fill"></span></div>
    <div class="tdisc">{html.escape(DISCLAIMER)}</div>
    <div class="tfoot">Interior designed by MicroVenture Labs.</div>
  </section>""")

    for q in quotes:
        book_page = (len(pages) + 1)
        cls = "recto" if book_page % 2 == 1 else "verso"
        body = day_page(q, book_page, True)
        body = body.replace('<section class="page">', f'<section class="page {cls}">')
        pages.append(body)

    cover_css = """
  .page.cover { background: #ece1cd; padding: 0.5in 0.6in 0.55in 0.6in; }
  .cover .art {
    width: 3.25in; height: 4.87in; object-fit: cover;
    margin: 0 auto 0.3in auto; display: block;
  }
  .cover .ctitle { font-family: "DejaVu Serif", serif; font-size: 25pt; line-height: 1.16; text-align: center; letter-spacing: 0.01em; }
  .cover .csub { font-family: "DejaVu Sans", sans-serif; font-size: 9pt; letter-spacing: 0.16em; text-transform: uppercase; color: #7b7160; text-align: center; margin-top: 0.16in; }
  .cover .cnote { font-family: "DejaVu Sans", sans-serif; font-size: 8.4pt; line-height: 1.55; color: #55503f; text-align: center; margin-top: 0.26in; }
  .cover .cowner { font-family: "DejaVu Sans", sans-serif; font-size: 8.4pt; color: #55503f; text-align: center; margin-top: 0.26in; }
  .cover .fill { display: inline-block; width: 1.9in; border-bottom: 0.6pt solid #9a907c; }
  .cover .cdisc { font-family: "DejaVu Sans", sans-serif; font-size: 7.2pt; line-height: 1.5; color: #6d6555; text-align: center; margin-top: 0.24in; }
  .titlepage { justify-content: center; }
  .titlepage .tlabel { font-family: "DejaVu Sans", sans-serif; font-size: 10pt; letter-spacing: 0.3em; text-transform: uppercase; color: #8a7f6d; }
  .titlepage .ttitle { font-size: 27pt; line-height: 1.1; margin-top: 0.1in; }
  .titlepage .tsub { font-family: "DejaVu Sans", sans-serif; font-size: 9pt; letter-spacing: 0.12em; text-transform: uppercase; color: #7b7160; margin-top: 0.2in; }
  .titlepage .tnote { font-family: "DejaVu Sans", sans-serif; font-size: 8.8pt; line-height: 1.65; color: #4a443c; margin-top: 0.45in; }
  .titlepage .towner { font-family: "DejaVu Sans", sans-serif; font-size: 8.8pt; color: #4a443c; margin-top: 0.42in; }
  .titlepage .fill { display: inline-block; width: 2.2in; border-bottom: 0.6pt solid #9a907c; }
  .titlepage .tdisc { font-family: "DejaVu Sans", sans-serif; font-size: 7.6pt; line-height: 1.55; color: #6d6555; margin-top: 0.4in; max-width: 4.1in; }
  .titlepage .tfoot { font-family: "DejaVu Sans", sans-serif; font-size: 8pt; line-height: 1.6; color: #8a7f6d; position: absolute; left: 0.75in; right: 0.5in; bottom: 0.9in; }
"""
    doc = f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<title>{'90-Day Quote Journal - KDP Interior 6x9 (US spelling)' if kdp else '90-Day Quote Journal - Printable 6x9 (US spelling)'}</title>
<style>{css}{cover_css}</style></head>
<body>{''.join(pages)}
</body></html>"""
    out = OUT / ("kdp-us.html" if kdp else "printable-us.html")
    out.write_text(doc, encoding="utf-8")
    return out

for kdp in (False, True):
    print(build(kdp))

print("spellings changed:", dict(sorted(_changes.items())))
print("vocabulary changed:", dict(sorted(_vocab_changes.items())))
