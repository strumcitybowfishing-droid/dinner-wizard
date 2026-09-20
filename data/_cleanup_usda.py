"""Post-filter USDA harvest: drop snacks/mixes, fix protein from broth/binders."""
from __future__ import annotations

import json
import re
from collections import Counter

PATH = r"C:\Users\johnn\Desktop\Dinner Wizard\data\usda.json"
SUMMARY = r"C:\Users\johnn\Desktop\Dinner Wizard\data\usda-summary.txt"

PROTEIN_VOCAB_ORDER = [
    "chicken", "turkey", "beef", "steak", "ground-beef", "pork", "ham", "bacon",
    "sausage", "ribs", "lamb", "goat", "venison", "elk", "wild-hog", "duck",
    "goose", "pheasant", "quail", "dove", "rabbit", "squirrel", "fish",
    "catfish", "salmon", "trout", "tuna", "shrimp", "crawfish", "crab",
    "scallops", "lobster", "eggs", "beans", "tofu", "vegetarian", "other",
]

MEAT = {
    "chicken", "turkey", "beef", "steak", "ground-beef", "pork", "ham", "bacon",
    "sausage", "ribs", "lamb", "goat", "venison", "elk", "wild-hog", "duck",
    "goose", "pheasant", "quail", "dove", "rabbit", "squirrel", "fish",
    "catfish", "salmon", "trout", "tuna", "shrimp", "crawfish", "crab",
    "scallops", "lobster",
}

# Specific proteins beat generic ones when both appear in the title.
SPECIFIC = {
    "ground-beef", "steak", "sausage", "bacon", "ham", "ribs", "catfish",
    "salmon", "trout", "tuna", "shrimp", "crawfish", "crab", "scallops",
    "lobster",
}

PROTEIN_PATTERNS = [
    ("ground-beef", r"\bground[- ]beef\b|\bhamburger(?:\s+meat)?\b|\bground chuck\b"),
    ("steak", r"\bsteaks?\b|\bsirloin\b|\brib[- ]?eye\b|\bflank steak\b"),
    ("bacon", r"\bbacon\b"),
    ("ham", r"\bhams?\b|\bham hock"),
    ("sausage", r"\bsausages?\b|\bchorizo\b|\bandouille\b|\bkielbasa\b|\bchicken sausage\b|\bturkey sausage\b"),
    ("ribs", r"\bribs\b|\bspareribs?\b"),
    ("pork", r"\bpork\b"),
    ("turkey", r"\bturkey\b"),
    ("chicken", r"\bchicken\b"),
    ("duck", r"\bduck\b"),
    ("lamb", r"\blamb\b"),
    ("goat", r"\bgoat\b"),
    ("venison", r"\bvenison\b"),
    ("beef", r"\bbeef\b|\bbrisket\b|\bpot roast\b|\bchuck roast\b"),
    ("catfish", r"\bcatfish\b"),
    ("salmon", r"\bsalmon\b"),
    ("trout", r"\btrout\b"),
    ("tuna", r"\btuna\b"),
    ("shrimp", r"\bshrimp\b|\bprawns?\b"),
    ("crawfish", r"\bcrawfish\b|\bcrayfish\b"),
    ("crab", r"\bcrab\b"),
    ("scallops", r"\bscallops?\b"),
    ("lobster", r"\blobster\b"),
    ("fish", r"\b(?:fish|tilapia|cod|halibut|perch|whitefish|haddock|flounder|snapper|mahi|whiting|pollock|basa|sardines?|anchov|walleye|clams?|oysters?|mussels?|chowder clams?)\b"),
    ("eggs", r"\beggs?\b|\bomelets?\b|\bomelettes?\b|\bquiche\b|\bfrittatas?\b"),
    ("tofu", r"\btofu\b|\btempeh\b"),
    ("beans", r"\bbeans?\b|\blentils?\b|\bchickpeas?\b|\bgarbanzo\b|\bblack-eyed peas?\b|\bsplit peas?\b|\bedamame\b"),
]

IGNORE_ING_RE = re.compile(
    r"("
    r"\b(?:chicken|beef|turkey|fish|ham|pork|vegetable|veggie)?\s*"
    r"(?:broth|stock|bouillon|base|consomme)\b"
    r"|\bcream of (?:chicken|celery|mushroom|broccoli) soup\b"
    r"|\bfish sauce\b"
    r"|\banchovy(?:ies)?\b"
    r")",
    re.I,
)

DROP_TITLE_RE = re.compile(
    r"("
    r"baked bananas|blueberry baked oats|butterfly bite|"
    r"chocolate peanut butter frozen bars|cinnamon raisin almond balls|"
    r"frozen pear pops|fruit dippers|fruit milk shakes|fruit pizza|"
    r"fruit salad|fudgy fruit|hiding rabbits|honey milk balls|"
    r"orange cow|purple cow|party mix|peanut butter ['’n]+ fruit|"
    r"peanut butter and apple wraps|peanut butter bananas|"
    r"peanut, peach|pear pb|pears in a pod|very berry muesli|"
    r"wobbly wonders|chili popcorn|chilled blueberry|chilled cantaloupe|"
    r"watermelon gazpacho|mango cucumber soup|"
    r"chili and spice seasoning|salt-free all purpose|hot ['’n]+ spicy seasoning|"
    r"basic soup and sauce mix|mock sour cream|homemade pizza crust|"
    r"^corn bread$|coleslaw|scallion rice|spicy cucumber|"
    r"corn and green chili salad|harvest vegetable salad|"
    r"pinwheel appetizers|^shirini$|taco flavored potatoes|"
    r"green bean and mushroom medley|avocado pita pockets|"
    r"fruity thai pita|sweet potato casserole|corn casserole|"
    r"green bean casserole|corn and bean medley|^bronco beans$|"
    r"chili cheese hominy|^sunshine rice$|corn bread"
    r")",
    re.I,
)

DROP_IDS = {
    "usda-fiesta-mix",
    "usda-corn-bread",
    "usda-hot-n-spicy-seasoning",
    "usda-salt-free-all-purpose-blend",
    "usda-chili-and-spice-seasoning",
    "usda-basic-soup-and-sauce-mix",
    "usda-mock-sour-cream",
    "usda-homemade-pizza-crust",
    "usda-turkey-pinwheel-appetizers",
}


def clean_ingredient_text(ings):
    kept = []
    for ing in ings or []:
        s = IGNORE_ING_RE.sub(" ", ing)
        kept.append(s)
    return " ".join(kept)


def detect_proteins(title, ingredients):
    title_l = title or ""
    ing_blob = clean_ingredient_text(ingredients)
    found = []
    title_hits = []
    for key, pat in PROTEIN_PATTERNS:
        if re.search(pat, title_l, re.I):
            title_hits.append(key)
        if re.search(pat, title_l, re.I) or re.search(pat, ing_blob, re.I):
            found.append(key)
    if not found:
        return ["vegetarian"]

    def rank(k):
        in_title = 0 if k in title_hits else 1
        meat = 0 if k in MEAT else 1
        spec = 0 if k in SPECIFIC else 1
        # beans over eggs when both are binders/protein in a veg dish
        veg_pref = 0 if k in ("beans", "tofu") else 1 if k == "eggs" else 2
        order = PROTEIN_VOCAB_ORDER.index(k) if k in PROTEIN_VOCAB_ORDER else 99
        return (in_title, meat, spec, veg_pref, order)

    found_sorted = sorted(dict.fromkeys(found), key=rank)
    meats = [k for k in found_sorted if k in MEAT]
    if meats:
        return meats[:3]
    return found_sorted[:3]


def budget_from(ingredients, proteins):
    n = len(ingredients or [])
    pset = set(proteins or [])
    score = 2
    if pset & {"lobster", "crab", "scallops"}:
        score = 5
    elif pset & {"shrimp", "salmon", "steak", "lamb", "duck"}:
        score = 4
    elif pset & {"beef", "pork", "ribs", "fish", "tuna", "catfish", "trout"}:
        score = 3
    elif pset & {"chicken", "turkey", "ground-beef", "sausage", "ham", "bacon"}:
        score = 2
    elif pset & {"beans", "eggs", "tofu", "vegetarian"}:
        score = 1
    blob = " ".join(ingredients or []).lower()
    if re.search(r"\b(shrimp|salmon|fresh mozzarella|pine nuts|asparagus)\b", blob):
        score = max(score, 3)
    if n >= 14:
        score += 1
    elif n <= 5:
        score -= 1
    return max(1, min(5, score))


def main():
    recipes = json.load(open(PATH, encoding="utf-8"))
    kept = []
    dropped = []
    for r in recipes:
        title = r.get("title") or ""
        rid = r.get("id") or ""
        if rid in DROP_IDS or DROP_TITLE_RE.search(title):
            dropped.append("%s | %s" % (rid, title))
            continue
        ings = r.get("ingredients") or []
        steps = r.get("steps") or []
        if not ings or not steps:
            dropped.append("%s | incomplete" % rid)
            continue
        proteins = detect_proteins(title, ings)
        r["proteins"] = proteins
        r["protein"] = proteins[0]
        r["budget"] = budget_from(ings, proteins)
        kept.append(r)

    kept.sort(key=lambda x: (x["title"].lower(), x["id"]))
    with open(PATH, "w", encoding="utf-8") as f:
        json.dump(kept, f, indent=2, ensure_ascii=False)
        f.write("\n")

    protein_counts = Counter(r["protein"] for r in kept)
    cat_counts = Counter()
    for r in kept:
        cat = "unknown"
        for t in r.get("tags") or []:
            if t in ("main-dish", "soup", "salad", "side-dish"):
                cat = t
                break
        cat_counts[cat] += 1

    lines = [
        "USDA MyPlate Kitchen harvest",
        "Source: USDA MyPlate Kitchen (US government public domain)",
        "List API: https://myplate.food/api/v1/recipes (1072 cards total in collection)",
        "Details: JSON-LD / HTML from https://myplate.food/recipes/{slug}",
        "Canonical sourceUrl: https://www.myplate.gov/recipes/{slug}",
        "Official myplate.gov fetches returned HTTP 403 (site retired Jan 2026).",
        "",
        "Complete dinner-like recipes (ingredients AND steps): %s" % len(kept),
        "Fetched then dropped as snack/dessert/beverage/seasoning/side: %s" % len(dropped),
        "All kept recipes have both ingredients and steps.",
        "",
        "Collection categories on the list API:",
        "  Main dish: 318, Soup: 107, Salad: 135, Side dish: 190,",
        "  Sauce: 99, Dessert: 81, Breakfast: 53, Bread: 43, Snack: 26, Beverage: 20",
        "",
        "Kept by category tag:",
    ]
    for k, v in cat_counts.most_common():
        lines.append("  %s: %s" % (k, v))
    lines.append("")
    lines.append("Primary protein counts:")
    for k, v in protein_counts.most_common():
        lines.append("  %s: %s" % (k, v))
    lines.append("")
    lines.append("Dropped titles:")
    for d in dropped:
        lines.append("  " + d)
    lines.append("")
    lines.append("Sample titles:")
    for r in kept[:30]:
        lines.append(
            "  %s [%s] ings=%s steps=%s %s"
            % (r["title"], r["protein"], len(r["ingredients"]), len(r["steps"]), r["id"])
        )
    with open(SUMMARY, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    print("kept", len(kept), "dropped", len(dropped))
    print("proteins", dict(protein_counts.most_common()))


if __name__ == "__main__":
    main()
