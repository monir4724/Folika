#!/usr/bin/env python3
"""Import office talika from Word doc into js/community-offices-data.js."""
from __future__ import annotations

import json
import re
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

DOCX = Path(r"E:\project 2\Folika\bangladesh_krishi_matsya_pranisampad_office_talika.docx")
OUT = Path(__file__).resolve().parents[1] / "js" / "community-offices-data.js"
NS = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
DEPTS = ("DAE", "DLS", "DoF")

DISTRICT_BN = {
    "Bogura": "বগুড়া",
    "Gazipur": "গাজীপুর",
    "Dhaka": "ঢাকা",
    "Rajshahi": "রাজশাহী",
    "Sherpur": "শেরপুর",
}

UPAZILA_BN = {
    "Kaliakair": "কালিয়াকৈর",
    "Gazipur Sadar": "গাজীপুর সদর",
    "Kapasia": "কাপাসিয়া",
    "Sreepur": "শ্রীপুর",
    "Kaliganj": "কালীগঞ্জ",
    "Sherpur": "শেরপুর",
    "Bogura Sadar": "বগুড়া সদর",
}


def extract_lines(docx: Path) -> list[str]:
    with zipfile.ZipFile(docx) as zf:
        root = ET.fromstring(zf.read("word/document.xml"))
    lines: list[str] = []
    for para in root.iter(f"{NS}p"):
        text = "".join(node.text for node in para.iter(f"{NS}t") if node.text).strip()
        if text:
            lines.append(text)
    return lines


def is_website(line: str) -> bool:
    return ".gov.bd" in line or line.endswith(".bd")


def parse_office(lines: list[str], index: int) -> tuple[dict | None, int]:
    if index >= len(lines) or lines[index] not in DEPTS:
        return None, index
    dept = lines[index]
    name = lines[index + 1] if index + 1 < len(lines) else ""
    address = lines[index + 2] if index + 2 < len(lines) else ""
    third = lines[index + 3] if index + 3 < len(lines) else ""
    fourth = lines[index + 4] if index + 4 < len(lines) else ""

    if is_website(third):
        contact = ""
        website = third
        next_index = index + 4
    else:
        contact = third
        website = fourth if is_website(fourth) else ""
        next_index = index + 5

    if not website:
        return None, index + 1

    return {
        "dept": dept,
        "name": name,
        "address": address,
        "contact": contact,
        "website": website,
    }, next_index


def parse_upazilas(lines: list[str], index: int) -> tuple[list[str], int]:
    if index >= len(lines):
        return [], index
    line = lines[index]
    if "উপজেলাসমূহ" not in line:
        return [], index
    if index + 1 < len(lines) and "," in lines[index + 1]:
        upas = [part.strip() for part in lines[index + 1].split(",") if part.strip()]
        return upas, index + 2
    if "আছে:" in line:
        tail = line.split("আছে:")[-1]
        upas = [part.strip() for part in tail.split(",") if part.strip()]
        return upas, index + 1
    return [], index + 1


def upazila_slug(name: str) -> str:
    return re.sub(r"[^a-z0-9]", "", name.lower())


def build_data(lines: list[str]) -> dict:
    data: dict = {
        "hotlines": [
            {"label_bn": "কৃষি কল সেন্টার (কৃষক বন্ধু)", "phone": "16123"},
            {"label_bn": "প্রাণিসম্পদ সেবা", "phone": "333"},
            {"label_bn": "জাতীয় তথ্য বাতায়ন", "phone": "333"},
        ],
        "note_bn": (
            "সরকারি অফিসে কর্মকর্তার নাম ও মোবাইল প্রায়ই বদলায়। "
            "হালনাগাদ তথ্যের জন্য নিচের ওয়েবসাইট লিংক ব্যবহার করুন। "
            "জেলা সাইটে Upazila Offices মেনু থেকে উপজেলা অফিস পাবেন।"
        ),
        "central": [
            {
                "name_bn": "কৃষি মন্ত্রণালয়",
                "address": "বাংলাদেশ সচিবালয়, ঢাকা",
                "website": "moa.gov.bd",
                "contact": "16123",
            },
            {
                "name_bn": "কৃষি সম্প্রসারণ অধিদপ্তর (DAE)",
                "address": "খামারবাড়ি, ফার্মগেট, ঢাকা-১২১৫",
                "website": "dae.gov.bd",
                "contact": "16123",
            },
            {
                "name_bn": "মৎস্য ও প্রাণিসম্পদ মন্ত্রণালয়",
                "address": "বাংলাদেশ সচিবালয়, ঢাকা",
                "website": "mofl.gov.bd",
                "contact": "",
            },
            {
                "name_bn": "মৎস্য অধিদপ্তর (DoF)",
                "address": "সেগুনবাগিচা, শাহবাগ, ঢাকা",
                "website": "fisheries.gov.bd",
                "contact": "",
            },
            {
                "name_bn": "প্রাণিসম্পদ অধিদপ্তর (DLS)",
                "address": "পশুসম্পদ ভবন, কৃষি খামার সড়ক, ঢাকা",
                "website": "dls.gov.bd",
                "contact": "333",
            },
        ],
        "divisions": [],
        "district_bn": DISTRICT_BN,
        "upazila_bn": UPAZILA_BN,
    }

    current_div: dict | None = None
    current_dist: dict | None = None
    i = 0
    while i < len(lines):
        line = lines[i]

        if " বিভাগ (" in line and line.endswith("Division)"):
            bn = line.split("(")[0].strip()
            en = line.split("(")[-1].rstrip(")").strip()
            current_div = {"name_bn": bn, "name_en": en, "offices": [], "districts": []}
            data["divisions"].append(current_div)
            current_dist = None
            i += 1
            continue

        if line.endswith(" জেলা") and "উপজেলাসমূহ" not in line:
            dist_en = line[:-len(" জেলা")].strip()
            if current_div is not None:
                current_dist = {
                    "name_en": dist_en,
                    "name_bn": DISTRICT_BN.get(dist_en, dist_en),
                    "slug": dist_en.lower().replace(" ", ""),
                    "offices": [],
                    "upazilas": [],
                }
                current_div["districts"].append(current_dist)
            i += 1
            continue

        upas, next_i = parse_upazilas(lines, i)
        if upas and current_dist is not None:
            current_dist["upazilas"] = [
                {
                    "name_en": name,
                    "name_bn": UPAZILA_BN.get(name, name),
                    "slug": upazila_slug(name),
                }
                for name in upas
            ]
            i = next_i
            continue

        office, next_i = parse_office(lines, i)
        if office:
            if current_dist is not None:
                current_dist["offices"].append(office)
            elif current_div is not None:
                current_div["offices"].append(office)
            i = next_i
            continue

        i += 1

    return data


def main() -> None:
    if not DOCX.is_file():
        raise SystemExit(f"Missing source file: {DOCX}")
    data = build_data(extract_lines(DOCX))
    OUT.write_text(
        "/** Imported from bangladesh_krishi_matsya_pranisampad_office_talika.docx */\n"
        f"window.FOLIKA_COMMUNITY_OFFICES = {json.dumps(data, ensure_ascii=False, indent=2)};\n",
        encoding="utf-8",
    )
    districts = sum(len(div["districts"]) for div in data["divisions"])
    print(f"Wrote {OUT} — {len(data['divisions'])} divisions, {districts} districts")


if __name__ == "__main__":
    main()
