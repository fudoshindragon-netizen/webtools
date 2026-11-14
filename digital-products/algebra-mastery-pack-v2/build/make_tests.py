#!/usr/bin/env python3
"""Generate the three printable practice tests and their answer keys.

Questions are drawn from content.json itself, so every printed test question is
one of the pack's 112 questions and its answer key carries the same worked
solution the interactive edition shows. Each test gets 24 questions (at least
one from every topic); no question appears in two tests.

Run from the pack root:  python3 build/make_tests.py
Then render the HTML with chromium (see build/render-pdfs.sh).
"""
import html
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "practice-tests")

LETTERS = "ABCD"
TESTS = [("A", 24), ("B", 24), ("C", 24)]
QUESTIONS_PER_TEST = 24

# Topics whose questions all read from the topic's shared table.
TABLE_REFERRING_TOPICS = {"probability-two-way-tables"}

CSS = """
@page { size: A4; margin: 14mm 13mm 12mm 13mm; }
* { box-sizing: border-box; }
body { font-family: "DejaVu Serif", Georgia, serif; color: #111; font-size: 10.6pt; line-height: 1.42; margin: 0; }
h1 { font-family: "DejaVu Sans", Helvetica, Arial, sans-serif; font-size: 17pt; margin: 0 0 2mm; letter-spacing: -0.2px; }
.sub { font-family: "DejaVu Sans", Helvetica, Arial, sans-serif; font-size: 9.6pt; color: #444; margin: 0 0 4mm; }
.rule { border-top: 2px solid #111; margin: 0 0 4mm; }
.ident { font-family: "DejaVu Sans", Helvetica, Arial, sans-serif; font-size: 9.6pt; color: #222;
         border: 1px solid #999; padding: 3mm 3.5mm; margin: 0 0 5mm; }
.ident span { display: inline-block; margin-right: 8mm; }
.line { display: inline-block; border-bottom: 1px solid #555; width: 55mm; }
.note { font-size: 9.2pt; color: #333; margin: 0 0 5mm; }
.note strong { font-family: "DejaVu Sans", Helvetica, Arial, sans-serif; }
.q { break-inside: avoid; page-break-inside: avoid; margin: 0 0 6mm; padding-bottom: 2mm; }
.qhead { font-family: "DejaVu Sans", Helvetica, Arial, sans-serif; font-weight: bold; font-size: 10.4pt; }
.tag { font-family: "DejaVu Sans", Helvetica, Arial, sans-serif; font-weight: normal; font-size: 8.4pt; color: #666; }
.prompt { margin: 1mm 0 2mm; }
.opts { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6mm 6mm; margin: 0 0 2mm 6mm; }
.opt { font-size: 10.2pt; }
.work { margin: 1mm 0 0 6mm; height: 15mm; border-bottom: 1px dotted #bbb; }
.answerline { margin: 1.5mm 0 0 6mm; font-family: "DejaVu Sans", Helvetica, Arial, sans-serif; font-size: 9.6pt; }
.answerline .blank { display: inline-block; border-bottom: 1px solid #333; width: 45mm; }
.keyhead { font-family: "DejaVu Sans", Helvetica, Arial, sans-serif; font-size: 13pt; margin: 0 0 3mm; }
.k { break-inside: avoid; page-break-inside: avoid; margin: 0 0 4mm; }
.knum { font-family: "DejaVu Sans", Helvetica, Arial, sans-serif; font-weight: bold; font-size: 10pt; }
.kans { font-family: "DejaVu Sans", Helvetica, Arial, sans-serif; font-size: 9.8pt; color: #0b3d16; margin: 0.6mm 0 1mm; }
.ksol { font-size: 9.8pt; color: #222; margin: 0; }
.scoring { border: 1px solid #999; padding: 3.5mm; margin-top: 6mm; font-size: 9.6pt; }
.scoring h2 { font-family: "DejaVu Sans", Helvetica, Arial, sans-serif; font-size: 11pt; margin: 0 0 2mm; }
.scoring ul { margin: 0 0 0 4mm; padding: 0; }
.scoring li { margin: 0 0 1mm; }
.foot { margin-top: 6mm; font-size: 8.6pt; color: #555; border-top: 1px solid #ccc; padding-top: 2mm; }
.dtable { margin: 1mm 0 2.5mm 6mm; break-inside: avoid; page-break-inside: avoid; }
.dcap { font-family: "DejaVu Sans", Helvetica, Arial, sans-serif; font-size: 9pt; color: #333; margin: 0 0 1.2mm; }
.dtable table { border-collapse: collapse; font-family: "DejaVu Sans", Helvetica, Arial, sans-serif; font-size: 9.8pt; }
.dtable th, .dtable td { border: 1px solid #444; padding: 1.2mm 3.5mm; text-align: center; }
.dtable th { background: #eee; font-weight: bold; }
"""


def e(text):
    return html.escape(str(text), quote=False)


def needs_diagram(topic, q):
    """A question that depends on the topic's table must have that table on the page.

    Most topics keep one shared table diagram and the questions refer to it rather
    than repeating it, so the printed paper has to print it above the question.
    A prompt that says "the table" asks for it directly; every question in
    TABLE_REFERRING_TOPICS reads from the table even when the wording does not say
    so ("what is P(late)?" only makes sense with the survey table in front of you).
    """
    diagram = topic.get("diagram") or {}
    if diagram.get("type") != "table":
        return False
    if topic.get("id") in TABLE_REFERRING_TOPICS:
        return True
    return "table" in (q.get("prompt") or "").lower()


def table_html(diagram):
    parts = ['<div class="dtable">']
    if diagram.get("caption"):
        parts.append(f'<div class="dcap">{e(diagram["caption"])}</div>')
    parts.append("<table><thead><tr>")
    for head in diagram.get("headers") or []:
        parts.append(f"<th>{e(head)}</th>")
    parts.append("</tr></thead><tbody>")
    for row in diagram.get("rows") or []:
        parts.append("<tr>")
        for cell in row:
            parts.append(f"<td>{e(cell)}</td>")
        parts.append("</tr>")
    parts.append("</tbody></table></div>")
    return "".join(parts)


def select_questions(topics):
    """Round-robin across topics so every test covers every topic, no repeats."""
    pools = [[q for q in t["questions"]] for t in topics]
    used = [0] * len(pools)
    tests = []
    for _letter, _count in TESTS:
        picked = []
        order = list(range(len(pools)))
        while len(picked) < QUESTIONS_PER_TEST:
            progressed = False
            for i in order:
                if len(picked) >= QUESTIONS_PER_TEST:
                    break
                if used[i] < len(pools[i]):
                    picked.append((topics[i], pools[i][used[i]]))
                    used[i] += 1
                    progressed = True
            if not progressed:
                break
            order = order[6:] + order[:6]  # rotate the starting topic each pass
        tests.append(picked)
    return tests


def test_html(letter, items):
    total = len(items)
    parts = [
        "<!doctype html>",
        '<html lang="en"><head><meta charset="utf-8">',
        f"<title>Algebra Mastery Pack \u2014 Practice Test {letter}</title>",
        f"<style>{CSS}</style></head><body>",
        f"<h1>Algebra Mastery Pack \u2014 Practice Test {letter}</h1>",
        '<p class="sub">Grade 11 algebra, functions &amp; data analysis &middot; '
        f"{total} questions &middot; suggested time 45 minutes &middot; no calculator needed</p>",
        '<div class="rule"></div>',
        '<div class="ident"><span>Name: <span class="line"></span></span>'
        '<span>Date: <span class="line" style="width:32mm"></span></span>'
        f'<span>Score: <span class="line" style="width:16mm"></span> / {total}</span></div>',
        '<p class="note"><strong>Instructions.</strong> Write full working in the space under each question; '
        "answers alone do not show how you got there. Circle one letter for a multiple-choice question and write "
        "a single value on the answer line for a short-answer question. Answer every question \u2014 a blank scores zero. "
        "The answer key with a worked solution for every question is a separate PDF; mark your own paper only after you finish.</p>",
    ]
    for n, (topic, q) in enumerate(items, start=1):
        parts.append('<div class="q">')
        parts.append(
            f'<div class="qhead">{n}. <span class="tag">[{e(topic["title"])}]</span></div>'
        )
        if needs_diagram(topic, q):
            parts.append(table_html(topic["diagram"]))
        parts.append(f'<div class="prompt">{e(q["prompt"])}</div>')
        if q["type"] == "multiple-choice":
            parts.append('<div class="opts">')
            for i, opt in enumerate(q["options"]):
                parts.append(f'<div class="opt">{LETTERS[i]}) {e(opt)}</div>')
            parts.append("</div>")
            parts.append('<div class="work"></div>')
        else:
            parts.append('<div class="work"></div>')
            parts.append(
                '<div class="answerline">Answer: <span class="blank"></span></div>'
            )
        parts.append("</div>")
    parts.append(
        '<p class="foot">Algebra Mastery Pack (paid edition) \u2014 practice test '
        f"{letter}. A self-study aid, not an exam paper from any school or board.</p>"
    )
    parts.append("</body></html>")
    return "\n".join(parts)


def key_html(letter, items):
    total = len(items)
    parts = [
        "<!doctype html>",
        '<html lang="en"><head><meta charset="utf-8">',
        f"<title>Algebra Mastery Pack \u2014 Practice Test {letter} Answer Key</title>",
        f"<style>{CSS}</style></head><body>",
        f'<h1 class="keyhead">Practice Test {letter} \u2014 Answer Key &amp; Worked Solutions</h1>',
        '<p class="sub">One worked solution per question. Mark the working as well as the final answer.</p>',
        '<div class="rule"></div>',
    ]
    for n, (topic, q) in enumerate(items, start=1):
        parts.append('<div class="k">')
        parts.append(
            f'<div class="knum">{n}. <span class="tag">[{e(topic["title"])}]</span></div>'
        )
        if q["type"] == "multiple-choice":
            correct = f'{LETTERS[q["answer"]]}) {e(q["options"][q["answer"]])}'
        else:
            correct = e(q["answer"])
        parts.append(f'<div class="kans">Answer: {correct}</div>')
        parts.append(f'<p class="ksol"><em>Worked solution:</em> {e(q["explanation"])}</p>')
        parts.append("</div>")
    parts.append(
        '<div class="scoring"><h2>Marking your test</h2><ul>'
        f"<li>One mark per question, {total} marks in total. Give the mark only if the working supports the answer.</li>"
        "<li>20 or more: the topics are solid \u2014 move on to timed mixed practice.</li>"
        "<li>15 to 19: reread the method for each topic you dropped a mark in, then redo those questions in the app.</li>"
        "<li>14 or fewer: work through the topic list in the app one topic at a time, then take the next practice test.</li>"
        "<li>Re-take any test after a week. If your score has not moved, that topic needs a different explanation, not more repetition.</li>"
        "</ul></div>"
    )
    parts.append(
        '<p class="foot">Algebra Mastery Pack (paid edition) \u2014 answer key for practice test '
        f"{letter}.</p>"
    )
    parts.append("</body></html>")
    return "\n".join(parts)


def main():
    with open(os.path.join(ROOT, "content.json"), encoding="utf-8") as fh:
        content = json.load(fh)
    topics = content["topics"]
    os.makedirs(OUT, exist_ok=True)

    tests = select_questions(topics)
    seen = set()
    for (letter, _count), items in zip(TESTS, tests):
        ids = [q["id"] for _t, q in items]
        overlap = seen.intersection(ids)
        if overlap:
            raise SystemExit(f"test {letter} repeats questions: {sorted(overlap)}")
        seen.update(ids)
        with open(os.path.join(OUT, f"Practice-Test-{letter}.html"), "w", encoding="utf-8") as fh:
            fh.write(test_html(letter, items))
        with open(os.path.join(OUT, f"Practice-Test-{letter}-Answer-Key.html"), "w", encoding="utf-8") as fh:
            fh.write(key_html(letter, items))
        print(f"test {letter}: {len(items)} questions, {len({t['id'] for t, _q in items})} topics")
    print(f"{len(seen)} distinct questions used of "
          f"{sum(len(t['questions']) for t in topics)}")


if __name__ == "__main__":
    main()
