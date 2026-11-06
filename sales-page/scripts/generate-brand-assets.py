#!/usr/bin/env python3
"""Placeholder Luna Cycle icon and splash in the site's dark/pink palette.

These are generated marks, not a finished logo. Replace
resources/icon.png and resources/splash.png, then run
`npx @capacitor/assets generate`.
"""
import struct
import zlib
from pathlib import Path

BG = (10, 10, 18, 255)
PINK = (255, 107, 157, 255)
BLUE = (107, 197, 255, 255)


def write_png(path, width, height, pixel):
    raw = bytearray()
    for y in range(height):
        raw.append(0)
        for x in range(width):
            raw.extend(pixel(x, y, width, height))

    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xFFFFFFFF)

    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    png = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr) + chunk(b'IDAT', zlib.compress(bytes(raw), 9)) + chunk(b'IEND', b'')
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(png)


def mark(x, y, width, height):
    cx, cy = width / 2, height / 2
    dx, dy = (x - cx) / width, (y - cy) / height
    r = (dx * dx + dy * dy) ** 0.5
    # Outer pink disc, with a dark bite so it reads as a crescent.
    if r < 0.28 and ((x - (cx + width * 0.08)) ** 2 + (y - (cy - height * 0.04)) ** 2) ** 0.5 > width * 0.22:
        return PINK
    if r < 0.06:
        return BLUE
    return BG


root = Path(__file__).resolve().parents[1] / 'resources'
write_png(root / 'icon.png', 1024, 1024, mark)
write_png(root / 'splash.png', 2732, 2732, mark)
print(f'Wrote {root / "icon.png"} and {root / "splash.png"}')
