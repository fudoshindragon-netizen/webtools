#!/usr/bin/env bash
# Package the Algebra Mastery Pack (paid edition) into one zip.
# Run from the pack root:  bash build/make_zip.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STAGE="$(mktemp -d)"
OUT="$ROOT/Algebra-Mastery-Pack-v2.zip"

python3 "$ROOT/build/standalone.py"

mkdir -p "$STAGE/folder-edition" "$STAGE/practice-tests"
cp "$ROOT/Algebra-Mastery-Pack.html" "$STAGE/"
cp "$ROOT/Welcome-and-Instructions.md" "$STAGE/"
cp "$ROOT/index.html" "$ROOT/app.js" "$ROOT/styles.css" "$ROOT/content.json" "$STAGE/folder-edition/"
cp "$ROOT"/practice-tests/*.pdf "$STAGE/practice-tests/"

rm -f "$OUT"
( cd "$STAGE" && zip -q -r "$OUT" . -x '.*' )
rm -rf "$STAGE"
echo "wrote $OUT ($(du -h "$OUT" | cut -f1))"
unzip -l "$OUT"
