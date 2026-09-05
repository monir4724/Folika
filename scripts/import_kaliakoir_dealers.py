#!/usr/bin/env python3
"""Import Kaliakoir dealer list from Word doc into js/dealers-kaliakoir.js."""
from __future__ import annotations

import json
import re
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCX = Path(r"E:\project 2\Folika\dealer_information_kaliakoir.docx")
OUT_JS = ROOT / "js" / "dealers-kaliakoir.js"
OUT_JSON = ROOT / "scripts" / "kaliakoir_dealers_seed.json"
NS = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"


def extract_lines(docx: Path) -> list[str]:
    with zipfile.ZipFile(docx) as zf:
        xml = zf.read("word/document.xml")
    root = ET.fromstring(xml)
    lines: list[str] = []
    for para in root.iter(f"{NS}p"):
        text = "".join(t.text for t in para.iter(f"{NS}t") if t.text)
        if text:
            lines.append(text)
    return lines


def parse_dealers(lines: list[str]) -> list[dict]:
    start = next((i for i, line in enumerate(lines) if line.strip() == "1"), 0)
    dealers: list[dict] = []
    i = start
    while i + 6 < len(lines):
        if not lines[i].strip().isdigit():
            i += 1
            continue
        serial = int(lines[i].strip())
        name = lines[i + 1].strip()
        shop = lines[i + 2].strip()
        category = lines[i + 3].strip()
        product = lines[i + 4].strip()
        phone = re.sub(r"\D", "", lines[i + 5].strip())
        location = lines[i + 6].strip()
        if len(phone) < 10:
            i += 1
            continue
        cat_lower = category.lower()
        if "মাছ" in category:
            sector = "fish"
        elif "জীবন্ত" in category or "livestock" in cat_lower:
            sector = "livestock"
        else:
            sector = "crop"
        dealers.append(
            {
                "id": serial,
                "name": name,
                "shop": shop,
                "category": category,
                "product": product,
                "phone": phone,
                "location": location,
                "sector": sector,
            }
        )
        i += 7
    return dealers


def main() -> None:
    if not DOCX.is_file():
        raise SystemExit(f"Source file not found: {DOCX}")
    dealers = parse_dealers(extract_lines(DOCX))
    OUT_JS.write_text(
        "/** Kaliakoir upazila dealer directory — imported from dealer_information_kaliakoir.docx */\n"
        f"window.FOLIKA_DEALERS_KALIAKOIR = {json.dumps(dealers, ensure_ascii=False, indent=2)};\n",
        encoding="utf-8",
    )
    OUT_JSON.write_text(json.dumps(dealers, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Imported {len(dealers)} dealers -> {OUT_JS}")


if __name__ == "__main__":
    main()
