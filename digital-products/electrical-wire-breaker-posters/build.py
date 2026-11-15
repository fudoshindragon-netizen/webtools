#!/usr/bin/env python3
"""Build the wire & breaker cheat-sheet posters as print-ready PDFs.

Renders poster-a-ampacity.html and poster-b-gfci-afci.html through chromium,
once at US Letter (8.5 x 11 in) and once at A4 (210 x 297 mm).
Run:  python3 build.py
"""
import pathlib
import re
import subprocess
import sys

HERE = pathlib.Path(__file__).resolve().parent
CHROMIUM = "/usr/local/bin/chromium"

SIZES = {
    "Letter": {"size": "8.5in 11in", "w": "8.5in", "h": "11in"},
    "A4": {"size": "210mm 297mm", "w": "210mm", "h": "297mm"},
}

POSTERS = [
    ("poster-a-ampacity.html", "Poster-A-Ampacity-Copper-Aluminum"),
    ("poster-b-gfci-afci.html", "Poster-B-GFCI-AFCI"),
]


def render(src: pathlib.Path, label: str, out: pathlib.Path) -> None:
    html = src.read_text(encoding="utf-8")
    html = html.replace("/*SIZE*/", label["size"])
    html = html.replace("/*W*/", label["w"]).replace("/*H*/", label["h"])
    tmp = HERE / f".tmp-{out.stem}.html"
    tmp.write_text(html, encoding="utf-8")
    cmd = [
        CHROMIUM,
        "--headless",
        "--no-sandbox",
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--no-pdf-header-footer",
        "--virtual-time-budget=4000",
        f"--print-to-pdf={out}",
        tmp.as_uri(),
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
    tmp.unlink(missing_ok=True)
    if not out.exists() or out.stat().st_size < 5000:
        sys.exit(f"FAILED {out.name}\n{res.stdout}\n{res.stderr}")
    print(f"  {out.name}  {out.stat().st_size / 1024:.0f} KB")


def main() -> None:
    for filename, stem in POSTERS:
        src = HERE / filename
        for size_name, spec in SIZES.items():
            out = HERE / f"{stem}-{size_name}.pdf"
            render(src, spec, out)
    print("done")


if __name__ == "__main__":
    main()
