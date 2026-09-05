# -*- coding: utf-8 -*-
"""Parse the pasted upazila crop recommendation text into compact JS."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(r"e:\Project\Folika 2")
RAW = ROOT / "data" / "_raw_crop_dataset.txt"
OUT_JS = ROOT / "js" / "crop-data.js"

BN_DIGITS = str.maketrans("০১২৩৪৫৬৭৮৯", "0123456789")

ZONE_META = {
    "fertile": {
        "id": "fertile",
        "bn": "সমতল উর্বর পলি অঞ্চল",
        "en": "Fertile floodplain",
        "soil_bn": "ভালো নিষ্কাশনযুক্ত উর্বর পলিমাটি, স্বাভাবিক বন্যা ও লবণাক্ততা ঝুঁকি কম।",
        "soil_en": "Well-drained fertile silt loam with low flood and salinity risk.",
        "challenge": "favorable",
    },
    "barind": {
        "id": "barind",
        "bn": "বরেন্দ্র / খরাপ্রবণ অঞ্চল",
        "en": "Barind / drought-prone",
        "soil_bn": "কম আর্দ্রতাধারণ ক্ষমতাসম্পন্ন মাটি, বৃষ্টিপাত কম, শুষ্ক মৌসুমে খরার ঝুঁকি বেশি।",
        "soil_en": "Low moisture-holding soil with high drought risk in the dry season.",
        "challenge": "drought",
    },
    "coastal": {
        "id": "coastal",
        "bn": "উপকূলীয় লবণাক্ত অঞ্চল",
        "en": "Coastal saline",
        "soil_bn": "জোয়ার-ভাটা প্রভাবিত মাটি, শুষ্ক মৌসুমে লবণাক্ততা বেশি।",
        "soil_en": "Tidal soils with high dry-season salinity.",
        "challenge": "saline",
    },
    "haor": {
        "id": "haor",
        "bn": "হাওর / জলাবদ্ধ অঞ্চল",
        "en": "Haor / waterlogged",
        "soil_bn": "নিচু হাওর/বিল, বর্ষায় দীর্ঘস্থায়ী জলাবদ্ধতা ও আকস্মিক বন্যা।",
        "soil_en": "Low basins with prolonged monsoon waterlogging and flash floods.",
        "challenge": "waterlog",
    },
    "hill": {
        "id": "hill",
        "bn": "পার্বত্য অঞ্চল",
        "en": "Hill tracts",
        "soil_bn": "পাহাড়ি ঢালু জমি, দ্রুত পানি নিষ্কাশন, ক্ষয়প্রবণ অম্লীয় মাটি।",
        "soil_en": "Sloping acidic soils with rapid drainage and erosion risk.",
        "challenge": "hill",
    },
    "char": {
        "id": "char",
        "bn": "চর / সক্রিয় বন্যাপ্রবণ পলি অঞ্চল",
        "en": "Char / active floodplain",
        "soil_bn": "নদীর প্লাবনভূমি/চর, বর্ষায় নিয়মিত বন্যা ও পলি সঞ্চয়।",
        "soil_en": "Active river chars with regular monsoon flooding and silt deposit.",
        "challenge": "flood",
    },
}

DISTRICT_ZONES = {
    "কুমিল্লা": "fertile", "কুষ্টিয়া": "fertile", "গাজীপুর": "fertile", "ঝিনাইদহ": "fertile",
    "টাঙ্গাইল": "fertile", "ঠাকুরগাঁও": "fertile", "ঢাকা": "fertile", "দিনাজপুর": "fertile",
    "নড়াইল": "fertile", "নরসিংদী": "fertile", "নারায়ণগঞ্জ": "fertile", "পঞ্চগড়": "fertile",
    "পাবনা": "fertile", "বগুড়া": "fertile", "ব্রাহ্মণবাড়িয়া": "fertile", "মাগুরা": "fertile",
    "মুন্সিগঞ্জ": "fertile", "ময়মনসিংহ": "fertile", "যশোর": "fertile", "শেরপুর": "fertile",
    "চাঁপাইনবাবগঞ্জ": "barind", "চুয়াডাঙ্গা": "barind", "জয়পুরহাট": "barind", "নওগাঁ": "barind",
    "নাটোর": "barind", "মেহেরপুর": "barind", "রাজশাহী": "barind",
    "কক্সবাজার": "coastal", "খুলনা": "coastal", "চট্টগ্রাম": "coastal", "ঝালকাঠি": "coastal",
    "নোয়াখালী": "coastal", "পটুয়াখালী": "coastal", "পিরোজপুর": "coastal", "ফেনী": "coastal",
    "বরগুনা": "coastal", "বরিশাল": "coastal", "বাগেরহাট": "coastal", "ভোলা": "coastal",
    "লক্ষ্মীপুর": "coastal", "সাতক্ষীরা": "coastal",
    "কিশোরগঞ্জ": "haor", "গোপালগঞ্জ": "haor", "নেত্রকোণা": "haor", "মৌলভীবাজার": "haor",
    "সিলেট": "haor", "সুনামগঞ্জ": "haor", "হবিগঞ্জ": "haor",
    "খাগড়াছড়ি": "hill", "বান্দরবান": "hill", "রাঙ্গামাটি": "hill",
    "কুড়িগ্রাম": "char", "গাইবান্ধা": "char", "চাঁদপুর": "char", "জামালপুর": "char",
    "নীলফামারী": "char", "ফরিদপুর": "char", "মাদারীপুর": "char", "মানিকগঞ্জ": "char",
    "রংপুর": "char", "রাজবাড়ী": "char", "লালমনিরহাট": "char", "শরীয়তপুর": "char",
    "সিরাজগঞ্জ": "char",
}

CROP_SEASON = {
    "বোরো ধান": "rabi",
    "আমন ধান (রোপা)": "kharif_2",
    "আমন ধান": "kharif_2",
    "আউশ ধান (উফশী)": "kharif_1",
    "আউশ ধান (বোনা)": "kharif_1",
    "আউশ ধান": "kharif_1",
    "গম": "rabi",
    "ভূট্টা": "rabi",
    "সরিষা": "rabi",
    "আলু": "rabi",
    "টমেটো": "rabi",
    "পাট": "kharif_1",
    "মসুর": "rabi",
    "আখ": "kharif_2",
    "সয়াবিন": "kharif_1",
    "সয়াবিন": "kharif_1",
    "চীনাবাদাম": "kharif_1",
    "নারিকেল": "all",
    "কেনাফ": "kharif_1",
    "কাউন": "kharif_1",
    "মিষ্টি আলু": "rabi",
    "চিনা": "kharif_1",
    "মেস্তা": "kharif_1",
    "আদা": "kharif_2",
    "হলুদ": "kharif_2",
    "আম": "all",
    "কাঁঠাল": "all",
    "লিচু": "all",
    "কলা": "all",
}

PRICE_PER_KG = {
    "বোরো ধান": 38, "আমন ধান (রোপা)": 38, "আমন ধান": 38, "আউশ ধান (উফশী)": 38, "আউশ ধান": 38,
    "গম": 42, "ভূট্টা": 28, "সরিষা": 95, "আলু": 25, "টমেটো": 30, "পাট": 75, "মসুর": 110,
    "আখ": 6, "সয়াবিন": 70, "সয়াবিন": 70, "চীনাবাদাম": 85,     "নারিকেল": 40, "কেনাফ": 65,
    "কাউন": 55, "মিষ্টি আলু": 22, "চিনা": 50, "মেস্তা": 60,
    "আদা": 180, "হলুদ": 90, "আম": 50, "কাঁঠাল": 30, "লিচু": 80, "কলা": 25,
}

CROP_EN = {
    "বোরো ধান": "Boro rice", "আমন ধান (রোপা)": "Transplanted Aman rice", "আমন ধান": "Aman rice",
    "আউশ ধান (উফশী)": "Aus rice", "আউশ ধান": "Aus rice", "গম": "Wheat", "ভূট্টা": "Maize",
    "সরিষা": "Mustard", "আলু": "Potato", "টমেটো": "Tomato", "পাট": "Jute", "মসুর": "Lentil",
    "আখ": "Sugarcane", "সয়াবিন": "Soybean", "সয়াবিন": "Soybean", "চীনাবাদাম": "Groundnut",
    "নারিকেল": "Coconut", "কেনাফ": "Kenaf", "কাউন": "Foxtail millet", "মিষ্টি আলু": "Sweet potato",
    "চিনা": "Proso millet", "মেস্তা": "Mesta", "আদা": "Ginger", "হলুদ": "Turmeric",
    "আম": "Mango", "কাঁঠাল": "Jackfruit", "লিচু": "Litchi", "কলা": "Banana",
    "আউশ ধান (বোনা)": "Broadcast Aus rice",
}


def norm(s: str) -> str:
    s = (s or "").strip()
    s = s.replace("\u200c", "").replace("\u200d", "").replace("\xa0", " ")
    s = s.replace("য়", "য়").replace("ড়", "ড়").replace("ঢ়", "ঢ়")
    s = re.sub(r"\s+", " ", s)
    return s


def fold(s: str) -> str:
    s = norm(s).lower()
    s = s.replace("\u09bc", "").replace("\u09c7", "ে").replace("\u09be", "া")
    s = s.replace(" ", "").replace("-", "")
    s = s.replace("ী", "ি").replace("ূ", "ু").replace("ো", "ো")
    return s


def canonical_district(name: str, known_fold: dict[str, str]) -> str | None:
    n = norm(name)
    if n in DISTRICT_ZONES:
        return n
    f = fold(n)
    return known_fold.get(f)


def to_ascii_num(s: str) -> str:
    return (s or "").translate(BN_DIGITS)


def parse_yield(s: str):
    s = to_ascii_num(s).replace(",", ".")
    m = re.search(r"(\d+(?:\.\d+)?)", s)
    return float(m.group(1)) if m else None


def parse_year(s: str):
    s = to_ascii_num(s)
    m = re.search(r"(19|20)\d{2}", s)
    return int(m.group(0)) if m else None


def zone_id(text: str) -> str:
    t = text or ""
    if "বরেন্দ্র" in t or "খরা" in t:
        return "barind"
    if "উপকূল" in t or "লবণ" in t:
        return "coastal"
    if "হাওর" in t or "জলাবদ্ধ" in t:
        return "haor"
    if "পার্বত্য" in t or "পাহাড়" in t or "পাহাড়" in t:
        return "hill"
    if "চর" in t or "বন্যাপ্রবণ" in t:
        return "char"
    return "fertile"


def crop_season(name: str) -> str:
    name = norm(name)
    if name in CROP_SEASON:
        return CROP_SEASON[name]
    for k, v in CROP_SEASON.items():
        if k in name or name in k:
            return v
    return "rabi"


def main() -> None:
    text = RAW.read_text(encoding="utf-8")
    # strip chat wrapper
    if "<user_query>" in text:
        text = text.split("<user_query>", 1)[1]
    if "</user_query>" in text:
        text = text.split("</user_query>", 1)[0]

    lines = text.splitlines()
    rec_start = None
    cat_start = None
    for i, line in enumerate(lines):
        if rec_start is None and "উপজেলাভিত্তিক ফসল" in line:
            rec_start = i
        if "সম্পূর্ণ জাত তালিকা" in line:
            cat_start = i
            break

    rec_lines = lines[rec_start:cat_start] if rec_start is not None else []
    cat_lines = lines[cat_start:] if cat_start is not None else []

    districts: dict[str, str] = {norm(k): v for k, v in DISTRICT_ZONES.items()}
    known_fold = {fold(k): k for k in districts}
    zone_crops: dict[str, dict[str, dict]] = {k: {} for k in ZONE_META}
    parsed_rows = 0

    for line in rec_lines:
        if "\t" not in line:
            continue
        parts = [p.strip() for p in line.split("\t")]
        # skip header-ish
        if parts[0] in ("বিভাগ", "জেলা") or "এলাকার ধরন" in parts[0]:
            continue
        if len(parts) < 8:
            continue

        # With division: 11 cols; without: 10 cols
        # Detect: if parts[3] looks like a zone
        if len(parts) >= 10 and any(x in parts[3] for x in ("সমতল", "বরেন্দ্র", "উপকূল", "হাওর", "পার্বত্য", "চর")):
            division, district, upazila, zone, ctype, crop, variety, reason = parts[:8]
            rest = parts[8:]
        elif len(parts) >= 9 and any(x in parts[2] for x in ("সমতল", "বরেন্দ্র", "উপকূল", "হাওর", "পার্বত্য", "চর")):
            district, upazila, zone, ctype, crop, variety, reason = parts[:7]
            rest = parts[7:]
        else:
            continue

        duration = rest[0] if len(rest) > 0 else ""
        yld = parse_yield(rest[1] if len(rest) > 1 else "")
        year = parse_year(rest[2] if len(rest) > 2 else "")
        if "ধান" in crop and yld and yld > 15:
            yld = round(yld / 100, 2) if yld >= 100 else 6.0

        district = canonical_district(district, known_fold)
        crop = norm(crop)
        variety = norm(variety)
        ctype = norm(ctype)
        reason = norm(reason)
        if not district or not crop or not variety:
            continue
        zid = districts[district]
        key = crop
        if key not in zone_crops[zid]:
            zone_crops[zid][key] = {
                "crop": crop,
                "crop_en": CROP_EN.get(crop, crop),
                "type": ctype,
                "season": crop_season(crop),
                "variety": variety,
                "reason": reason,
                "duration": to_ascii_num(duration).strip(),
                "yield_t_ha": yld,
                "year": year,
                "price_per_kg": PRICE_PER_KG.get(crop, 40),
            }
        parsed_rows += 1

    # Variety catalog
    varieties: dict[str, list] = {}
    for line in cat_lines:
        if "\t" not in line:
            continue
        parts = [p.strip() for p in line.split("\t")]
        if len(parts) < 4:
            continue
        if parts[0] in ("ফসলের ধরন", "৪. সম্পূর্ণ জাত তালিকা"):
            continue
        ctype, crop, situation, vname = parts[:4]
        rest = parts[4:]
        crop = norm(crop)
        vname = norm(vname)
        if not crop or not vname:
            continue
        if crop in DISTRICT_ZONES or fold(crop) in known_fold:
            continue
        if any(x in crop for x in ("সমতল", "বরেন্দ্র", "উপকূল", "হাওর", "পার্বত্য", "চর /")):
            continue
        varieties.setdefault(crop, [])
        rec = {
            "name": vname,
            "situation": norm(situation),
            "duration": to_ascii_num(rest[0]).strip() if rest else "",
            "yield_t_ha": parse_yield(rest[1]) if len(rest) > 1 else None,
            "year": parse_year(rest[2]) if len(rest) > 2 else None,
        }
        if "ধান" in crop and rec["yield_t_ha"] and rec["yield_t_ha"] > 15:
            rec["yield_t_ha"] = round(rec["yield_t_ha"] / 100, 2) if rec["yield_t_ha"] >= 100 else 6.0
        if not any(x["name"] == rec["name"] for x in varieties[crop]):
            varieties[crop].append(rec)

    payload = {
        "zones": {},
        "districts": districts,
        "varieties": varieties,
    }
    for zid, meta in ZONE_META.items():
        payload["zones"][zid] = {
            **meta,
            "crops": list(zone_crops[zid].values()),
        }

    js = (
        "/** FOLIKA crop recommendation dataset — generated, do not edit by hand */\n"
        "(function (global) {\n"
        "  'use strict';\n"
        f"  global.FOLIKA_CROP_DATASET = {json.dumps(payload, ensure_ascii=False, separators=(',', ':'))};\n"
        "})(window);\n"
    )
    OUT_JS.write_text(js, encoding="utf-8")
    print("parsed_rows", parsed_rows)
    print("districts", len(districts))
    print("zones", {k: len(v) for k, v in zone_crops.items()})
    print("variety_crops", len(varieties), "varieties", sum(len(v) for v in varieties.values()))
    print("js_bytes", OUT_JS.stat().st_size)


if __name__ == "__main__":
    main()
