#!/usr/bin/env bash
# Render the practice tests and answer keys to PDF with chromium headless.
# Run from the pack root after `python3 build/make_tests.py`.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/practice-tests"

for f in *.html; do
  chromium --headless --disable-gpu --no-sandbox \
    --print-to-pdf="${f%.html}.pdf" --no-pdf-header-footer \
    "file://$ROOT/practice-tests/$f" >/dev/null 2>&1
  echo "rendered ${f%.html}.pdf"
done
