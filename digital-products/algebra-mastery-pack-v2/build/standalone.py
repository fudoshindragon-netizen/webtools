#!/usr/bin/env python3
"""Build the single-file edition of the Algebra Mastery Pack.

The folder edition (index.html + app.js + styles.css + content.json) needs a web
server, because browsers refuse fetch() on file:// URLs. Buyers unzip a download
and double-click, so we also ship one self-contained HTML file with the same
content inlined.

Run:  python3 build/standalone.py   ->  ../Algebra-Mastery-Pack.html
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "Algebra-Mastery-Pack.html")


def read(name):
    with open(os.path.join(ROOT, name), encoding="utf-8") as fh:
        return fh.read()


def main():
    html = read("index.html")
    css = read("styles.css")
    js = read("app.js")
    content = json.loads(read("content.json"))

    payload = json.dumps(content, ensure_ascii=False, separators=(",", ":"))
    for bad in ("</script", "<!--"):
        if bad in payload:
            raise SystemExit(f"content.json contains {bad!r}; refusing to inline")

    html = html.replace(
        '<link rel="stylesheet" href="styles.css" />',
        "<style>\n" + css + "\n</style>",
    )
    html = html.replace(
        '<script src="app.js"></script>',
        "<script>\nwindow.ALGEBRA_CONTENT = " + payload + ";\n</script>\n<script>\n" + js + "\n</script>",
    )
    if "styles.css" in html or "app.js" in html:
        raise SystemExit("inlining failed: external references remain")

    with open(OUT, "w", encoding="utf-8") as fh:
        fh.write(html)
    print(f"wrote {OUT} ({os.path.getsize(OUT)} bytes)")


if __name__ == "__main__":
    main()
