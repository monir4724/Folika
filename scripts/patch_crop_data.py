import json
import re
from pathlib import Path

p = Path(r"e:\Project\Folika 2\js\crop-data.js")
text = p.read_text(encoding="utf-8")
m = re.search(r"global.FOLIKA_CROP_DATASET = (\{.*\});", text, re.S)
d = json.loads(m.group(1))
d["varieties"].pop("মাদারীপুর", None)
for z in d["zones"].values():
    for c in z["crops"]:
        if "ধান" in c.get("crop", "") and c.get("yield_t_ha") and c["yield_t_ha"] > 15:
            c["yield_t_ha"] = round(c["yield_t_ha"] / 100, 2) if c["yield_t_ha"] >= 100 else 6.0
for crop, vs in d["varieties"].items():
    for v in vs:
        if "ধান" in crop and v.get("yield_t_ha") and v["yield_t_ha"] > 15:
            v["yield_t_ha"] = round(v["yield_t_ha"] / 100, 2) if v["yield_t_ha"] >= 100 else 6.0
js = (
    "/** FOLIKA crop recommendation dataset — generated, do not edit by hand */\n"
    "(function (global) {\n"
    "  'use strict';\n"
    "  global.FOLIKA_CROP_DATASET = "
    + json.dumps(d, ensure_ascii=False, separators=(",", ":"))
    + ";\n"
    "})(window);\n"
)
p.write_text(js, encoding="utf-8")
print("ok", p.stat().st_size, "madaripur", "মাদারীপুর" in d["varieties"])
