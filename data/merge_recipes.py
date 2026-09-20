"""Combine harvested recipe JSON files into data/recipes.json."""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SOURCES = [
    ROOT / "mealdb.json",
    ROOT / "usda.json",
    ROOT / "wildgame.json",
]
OUT = ROOT / "recipes.json"
SUMMARY = ROOT / "recipes-summary.txt"


def load_list(path: Path) -> list:
    if not path.exists():
        return []
    data = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        for key in ("recipes", "meals", "items", "data"):
            if isinstance(data.get(key), list):
                return data[key]
    return []


def main() -> None:
    merged = []
    seen = set()
    by_source = Counter()
    by_protein = Counter()
    for path in SOURCES:
        rows = load_list(path)
        kept = 0
        for row in rows:
            if not isinstance(row, dict):
                continue
            title = str(row.get("title") or "").strip()
            title = title.replace("Cookbook:", "").strip()
            row["title"] = title
            rid = str(row.get("id") or title.lower())
            if len(title) < 4 or title.lower() in {"can", "recipe", "untitled"}:
                continue
            if not title or rid in seen:
                continue
            ings = row.get("ingredients") or []
            steps = row.get("steps") or []
            if not ings or not steps:
                continue
            seen.add(rid)
            merged.append(row)
            kept += 1
            by_source[row.get("source") or path.stem] += 1
            by_protein[str(row.get("protein") or "other")] += 1
        print(f"{path.name}: {len(rows)} raw, {kept} kept")

    OUT.write_text(json.dumps(merged, ensure_ascii=False, indent=2), encoding="utf-8")
    lines = [
        f"Merged {len(merged)} dinner recipes",
        "Sources: " + ", ".join(f"{k}={v}" for k, v in by_source.most_common()),
        "Proteins: " + ", ".join(f"{k}={v}" for k, v in by_protein.most_common()),
    ]
    SUMMARY.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("\n".join(lines))
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
