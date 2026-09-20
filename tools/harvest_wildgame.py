#!/usr/bin/env python3
"""Harvest public-domain / government / extension wild-game dinner recipes."""
from __future__ import annotations

import json
import os
import re
import ssl
import time
import urllib.error
import urllib.parse
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
CACHE = DATA / "_cache"
DATA.mkdir(exist_ok=True)
CACHE.mkdir(exist_ok=True)

UA = "DinnerWizardHarvest/1.0 (personal recipe archive; public-agency sources)"
CTX = ssl.create_default_context()
SLEEP = 0.35

SKIP_TITLE_RE = re.compile(
    r"(cake|cookie|square|pie crust|dog biscuit|pesto|pine needle tea|"
    r"pawpaw bread|marinade|sauce only|white chocolate|guava sour|"
    r"pickled radish|tomatillo|apple cider brandy|manchurian|"
    r"spring lemon herb|nutrition)",
    re.I,
)
SKIP_BODY_RE = re.compile(
    r"(from ['\"]?afield|cooking fearlessly|hudson's on the bend|"
    r"jesse griffiths|jeff blank|hank shaw|paleo newbie|"
    r"wild rice goose and other dishes|john motoviloff|"
    r"country secrets)",
    re.I,
)
DESSERT_RE = re.compile(r"\b(dessert|cake|cookie|brownie|ice cream)\b", re.I)
JERKY_RE = re.compile(r"\bjerky\b", re.I)

PROTEIN_PATTERNS = [
    ("wild-hog", re.compile(r"\b(feral hog|wild hog|wild boar|boar)\b", re.I)),
    ("catfish", re.compile(r"\bcatfish\b", re.I)),
    ("venison", re.compile(r"\b(venison|deer meat|deer steak|backstrap)\b", re.I)),
    ("elk", re.compile(r"\belk\b", re.I)),
    ("duck", re.compile(r"\b(duck|mallard)\b", re.I)),
    ("goose", re.compile(r"\b(goose|geese)\b", re.I)),
    ("pheasant", re.compile(r"\bpheasant\b", re.I)),
    ("quail", re.compile(r"\bquail\b", re.I)),
    ("dove", re.compile(r"\bdove\b", re.I)),
    ("rabbit", re.compile(r"\b(rabbit|cottontail|hare)\b", re.I)),
    ("squirrel", re.compile(r"\bsquirrel\b", re.I)),
    ("turkey", re.compile(r"\b(wild turkey|turkey breast|turkey leg|turkey)\b", re.I)),
    ("crawfish", re.compile(r"\b(crawfish|crayfish)\b", re.I)),
    ("salmon", re.compile(r"\bsalmon\b", re.I)),
    ("trout", re.compile(r"\btrout\b", re.I)),
    ("shrimp", re.compile(r"\bshrimp\b", re.I)),
    ("fish", re.compile(r"\b(fish|walleye|bass|redfish|snapper|carp|panfish|crappie)\b", re.I)),
    ("sausage", re.compile(r"\bsausage\b", re.I)),
    ("bacon", re.compile(r"\bbacon\b", re.I)),
    ("pork", re.compile(r"\bpork\b", re.I)),
    ("chicken", re.compile(r"\bchicken\b", re.I)),
    ("other", re.compile(r"\b(woodcock|rail|beaver|alligator|frog)\b", re.I)),
]

OHIO_URLS = [
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/venison-recipes/venison-butternut-squash",
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/venison-recipes/venison-roast-pastrami",
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/venison-recipes/venison-ragu",
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/venison-recipes/venison-curry",
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/venison-recipes/stuffed-venison-roast",
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/venison-recipes/venison-wellington",
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/small-game-recipes/oven-fried-squirrel",
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/small-game-recipes/squirrel-and-dumplings",
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/small-game-recipes/squirrel-yaki-mandu",
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/small-game-recipes/rabbit-enchiladas",
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/waterfowl-recipes/stuffed-grilled-duck",
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/waterfowl-recipes/wild-duck-cranberry-wild-rice",
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/upland-game-recipes/pheasant-taco-chili",
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/upland-game-recipes/cheddar-pheasant-soup",
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/upland-game-recipes/pheasant-noodle-soup",
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/upland-game-recipes/sauteed-woodcock",
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/upland-game-recipes/pheasant-and-jalepeno-cheddar-waffles",
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/wild-turkey-recipes/apricot-chevre-stuffed-turkey-breast",
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/wild-turkey-recipes/slow-cooked-spicy-honey-wild-turkey-leg",
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/wild-turkey-recipes/wild-turkey-jambalaya",
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/wild-turkey-recipes/wild-turkey-schnitzel",
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/wild-turkey-recipes/grilled-turkey-vanilla-cranberry-sauce",
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/wild-turkey-recipes/southwest-turkey-shrimp-soup",
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/wild-turkey-recipes/wild-turkey-leg-tagine",
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/wild-turkey-recipes/greek-turkey",
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/wild-turkey-recipes/bacon-and-cheese-topped-wild-turkey",
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/wild-turkey-recipes/bacon-cheese-topped-wild-turkey",
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/wild-turkey-recipes/pickled-barbecue-pulled-turkey",
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/wild-turkey-recipes/pickled-bbq-pulled-turkey",
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/wild-turkey-recipes/paleo-turkey-caesar-salad",
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/venison-recipes/venison-chili",
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/venison-recipes/venison-meatloaf",
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/venison-recipes/venison-stroganoff",
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/venison-recipes/venison-stew",
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/small-game-recipes/fried-squirrel",
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/small-game-recipes/squirrel-pot-pie",
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/small-game-recipes/hasenpfeffer",
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/waterfowl-recipes/duck-poppers",
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/waterfowl-recipes/goose-chili",
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/waterfowl-recipes/goose-tacos",
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/upland-game-recipes/dove-poppers",
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/upland-game-recipes/grilled-dove",
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/upland-game-recipes/quail-with-mushrooms",
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/fish-recipes/catfish",
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/fish-recipes/fried-catfish",
    "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/fish-recipes/walleye-cakes",
]

TPWD_KEEP = [
    # Hunter-submitted / agency-hosted mains; skip Afield + Hudson's cookbooks.
    "https://tpwd.texas.gov/huntwild/hunt/wildgame-recipes/venison_chili.phtml",
    "https://tpwd.texas.gov/huntwild/hunt/wildgame-recipes/venison_sausage.phtml",
    "https://tpwd.texas.gov/huntwild/hunt/wildgame-recipes/venison_kabobs.phtml",
    "https://tpwd.texas.gov/huntwild/hunt/wildgame-recipes/venison_sliced.phtml",
    "https://tpwd.texas.gov/huntwild/hunt/wildgame-recipes/venison_beer.phtml",
    "https://tpwd.texas.gov/huntwild/hunt/wildgame-recipes/chicken_fried_venison.phtml",
    "https://tpwd.texas.gov/huntwild/hunt/wildgame-recipes/cook_in_dove.phtml",
    "https://tpwd.texas.gov/huntwild/hunt/wildgame-recipes/jalapeno_bird_rice.phtml",
    "https://tpwd.texas.gov/huntwild/hunt/wildgame-recipes/jalapeno-dove-poppers.phtml",
    "https://tpwd.texas.gov/huntwild/hunt/wildgame-recipes/dove-empanadas.phtml",
    "https://tpwd.texas.gov/huntwild/hunt/wildgame-recipes/pheasant_tortilla_soup.phtml",
    "https://tpwd.texas.gov/huntwild/hunt/wildgame-recipes/roasted_quail_mushrooms.phtml",
    "https://tpwd.texas.gov/huntwild/hunt/wildgame-recipes/green_chile_bake.phtml",
    "https://tpwd.texas.gov/huntwild/hunt/wildgame-recipes/game_chili.phtml",
    "https://tpwd.texas.gov/huntwild/hunt/wildgame-recipes/blackened_catfish_tacos.phtml",
    "https://tpwd.texas.gov/huntwild/hunt/wildgame-recipes/grilled_venison.phtml",
    "https://tpwd.texas.gov/huntwild/hunt/wildgame-recipes/hog_guisada.phtml",
    "https://tpwd.texas.gov/huntwild/hunt/wildgame-recipes/wild_boar_schnitzel.phtml",
    "https://tpwd.texas.gov/huntwild/hunt/wildgame-recipes/hog_tacos.phtml",
    "https://tpwd.texas.gov/huntwild/hunt/wildgame-recipes/duck_yakitori.phtml",
    "https://tpwd.texas.gov/huntwild/hunt/wildgame-recipes/duck_breast_red_chili_glaze.phtml",
    "https://tpwd.texas.gov/huntwild/hunt/wildgame-recipes/venison_stew.phtml",
    "https://tpwd.texas.gov/huntwild/hunt/wildgame-recipes/bandera_quail.phtml",
]

WIKIBOOKS = [
    "https://en.wikibooks.org/wiki/Cookbook:Brunswick_Stew",
    "https://en.wikibooks.org/wiki/Cookbook:Hasenpfeffer",
    "https://en.wikibooks.org/wiki/Cookbook:Fried_Catfish",
    "https://en.wikibooks.org/wiki/Cookbook:Chicken_and_Dumplings",
    "https://en.wikibooks.org/wiki/Cookbook:Jambalaya",
    "https://en.wikibooks.org/wiki/Cookbook:Chicken_Fried_Steak",
    "https://en.wikibooks.org/wiki/Cookbook:Country_Captain",
    "https://en.wikibooks.org/wiki/Cookbook:Rabbit_Stew",
    "https://en.wikibooks.org/wiki/Cookbook:Venison_Stew",
    "https://en.wikibooks.org/wiki/Cookbook:Pot_Roast",
    "https://en.wikibooks.org/wiki/Cookbook:Meatloaf",
    "https://en.wikibooks.org/wiki/Cookbook:Chili_con_Carne",
    "https://en.wikibooks.org/wiki/Cookbook:Gumbo",
    "https://en.wikibooks.org/wiki/Cookbook:Fried_Chicken",
    "https://en.wikibooks.org/wiki/Cookbook:Shepherd%27s_Pie",
]

OTHER = [
    "https://www.agfc.com/hunting/deer/venison-recipes/",
    "https://extension.missouri.edu/publications/n670",
]


class TextExtractor(HTMLParser):
    SKIP_TAGS = {"script", "style", "noscript", "svg", "nav", "footer", "header", "form"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.skip = 0
        self.parts: list[str] = []
        self.links: list[tuple[str, str]] = []
        self._href = ""
        self._link_text: list[str] = []
        self.title = ""
        self.in_title = False
        self.lis: list[str] = []
        self._li: list[str] = []
        self.in_li = 0
        self.headings: list[tuple[str, str]] = []
        self._h: list[str] = []
        self.in_h = ""
        self.paras: list[str] = []
        self._p: list[str] = []
        self.in_p = False
        self.ordered: list[str] = []
        self.in_ol = 0

    def handle_starttag(self, tag, attrs):
        ad = dict(attrs)
        if tag in self.SKIP_TAGS:
            self.skip += 1
            return
        if self.skip:
            return
        if tag == "br":
            self.parts.append("\n")
            if self.in_li:
                self._li.append(" ")
            if self.in_p:
                self._p.append(" ")
            return
        if tag in {"p", "div", "section", "article", "h1", "h2", "h3", "h4", "h5", "li", "tr"}:
            self.parts.append("\n")
        if tag == "title":
            self.in_title = True
        if tag in {"h1", "h2", "h3", "h4", "h5"}:
            self.in_h = tag
            self._h = []
        if tag == "li":
            self.in_li += 1
            self._li = []
        if tag == "p":
            self.in_p = True
            self._p = []
        if tag == "ol":
            self.in_ol += 1
        if tag == "a":
            self._href = ad.get("href") or ""
            self._link_text = []

    def handle_endtag(self, tag):
        if tag in self.SKIP_TAGS:
            if self.skip:
                self.skip -= 1
            return
        if self.skip:
            return
        if tag == "title":
            self.in_title = False
        if tag in {"h1", "h2", "h3", "h4", "h5"} and self.in_h:
            txt = clean_ws("".join(self._h))
            if txt:
                self.headings.append((tag, txt))
            self.in_h = ""
        if tag == "li" and self.in_li:
            txt = clean_ws("".join(self._li))
            if txt:
                self.lis.append(txt)
                if self.in_ol:
                    self.ordered.append(txt)
            self.in_li -= 1
        if tag == "p" and self.in_p:
            txt = clean_ws("".join(self._p))
            if txt:
                self.paras.append(txt)
            self.in_p = False
        if tag == "ol" and self.in_ol:
            self.in_ol -= 1
        if tag == "a":
            txt = clean_ws("".join(self._link_text))
            if self._href:
                self.links.append((self._href, txt))
            self._href = ""

    def handle_data(self, data):
        if self.skip:
            return
        self.parts.append(data)
        if self.in_title:
            self.title += data
        if self.in_h:
            self._h.append(data)
        if self.in_li:
            self._li.append(data)
        if self.in_p:
            self._p.append(data)
        if self._href:
            self._link_text.append(data)

    def text(self) -> str:
        return clean_ws("".join(self.parts), keep_newlines=True)


def clean_ws(s: str, keep_newlines: bool = False) -> str:
    s = s.replace("\xa0", " ").replace("\u200b", "")
    if keep_newlines:
        s = re.sub(r"[ \t]+", " ", s)
        s = re.sub(r"\n[ \t]+", "\n", s)
        s = re.sub(r"\n{3,}", "\n\n", s)
        return s.strip()
    return re.sub(r"\s+", " ", s).strip()


def slugify(s: str) -> str:
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")[:60]


def cache_name(url: str) -> Path:
    h = re.sub(r"[^a-zA-Z0-9._-]+", "_", url)[:180]
    return CACHE / h


def fetch(url: str, retries: int = 2) -> str | None:
    path = cache_name(url)
    if path.exists() and path.stat().st_size > 200:
        return path.read_text(encoding="utf-8", errors="replace")
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html,application/xhtml+xml"})
    last = None
    for i in range(retries + 1):
        try:
            with urllib.request.urlopen(req, context=CTX, timeout=30) as r:
                raw = r.read()
            html = raw.decode("utf-8", errors="replace")
            path.write_text(html, encoding="utf-8")
            time.sleep(SLEEP)
            return html
        except Exception as e:
            last = e
            time.sleep(0.8 + i)
    print("FAIL", url, last)
    return None


def abs_url(href: str, base: str) -> str:
    return urllib.parse.urljoin(base, href)


def detect_proteins(title: str, blob: str) -> list[str]:
    found = []
    text = f"{title}\n{blob}"
    for name, pat in PROTEIN_PATTERNS:
        if pat.search(text) and name not in found:
            found.append(name)
    if not found:
        found = ["other"]
    # Prefer wild-game proteins as primary
    priority = [
        "venison", "elk", "wild-hog", "duck", "goose", "pheasant", "quail",
        "dove", "rabbit", "squirrel", "turkey", "catfish", "fish", "crawfish",
        "trout", "salmon", "shrimp", "other",
    ]
    found.sort(key=lambda x: priority.index(x) if x in priority else 99)
    return found[:4]


def estimate_time(steps: list[str], ingredients: list[str]) -> int:
    blob = " ".join(steps + ingredients).lower()
    hours = [int(x) for x in re.findall(r"(\d+)\s*(?:to|-)\s*\d+\s*hours?", blob)]
    hours += [int(x) for x in re.findall(r"(\d+)\s*hours?", blob)]
    mins = [int(x) for x in re.findall(r"(\d+)\s*(?:to|-)\s*\d+\s*min", blob)]
    mins += [int(x) for x in re.findall(r"(\d+)\s*minutes?", blob)]
    t = 0
    if hours:
        t += max(hours) * 60
    if mins:
        t += max(mins) if not hours else min(max(mins), 90)
    if "overnight" in blob or "refrigerate overnight" in blob:
        t = max(t, 60)
    if "slow cooker" in blob or "crock" in blob:
        t = max(t, 240)
    if t == 0:
        t = 45 if len(steps) <= 5 else 60
    return min(max(t, 20), 720)


def estimate_servings(blob: str) -> int:
    m = re.search(r"(?:serves?|servings?|yield|makes)\s*(?:about\s*)?(\d+)\s*(?:to|-)\s*(\d+)", blob, re.I)
    if m:
        return int(round((int(m.group(1)) + int(m.group(2))) / 2))
    m = re.search(r"(?:serves?|servings?|yield[:\s]*|makes)\s*(?:about\s*)?(\d+)", blob, re.I)
    if m:
        n = int(m.group(1))
        if 1 <= n <= 24:
            return n
    return 4


def estimate_difficulty(steps: list[str], blob: str) -> int:
    hard = re.search(r"\b(brine|smoke|pastry|wellington|pressure cook|debon|tagine|canning)\b", blob, re.I)
    if hard or len(steps) >= 10:
        return 3
    if len(steps) <= 4 and not re.search(r"overnight|marinate", blob, re.I):
        return 1
    return 2


def looks_like_ingredient(line: str) -> bool:
    line = line.strip()
    if not line or len(line) > 180:
        return False
    if re.match(r"^(ingredients?|directions?|instructions?|method|notes?|serving|tools?|equipment|yield|makes)\b", line, re.I):
        return False
    if re.match(r"^\d+[.)]\s", line):
        return False
    qty = r"^[\d¼½¾⅓⅔⅛⅜⅝⅞]+|^[0-9./]+\s|^a\s+(?:pinch|dash|few)|^salt|^pepper|^oil|^water|^optional"
    words = r"\b(cup|cups|tbsp|tsp|tablespoon|teaspoon|ounce|oz|pound|lb|clove|can|package|stick|slice|bunch|pinch|dash|quart|pint|gallon|large|medium|small|whole|boneless|ground|chopped|diced|minced|sliced)\b"
    return bool(re.search(qty, line, re.I) or re.search(words, line, re.I))


def looks_like_step(line: str) -> bool:
    line = line.strip()
    if len(line) < 20:
        return False
    if re.match(r"^\d+[.)]\s", line):
        return True
    verbs = r"^(mix|add|place|heat|cook|bake|simmer|brown|stir|season|combine|pour|remove|serve|preheat|cover|bring|drain|cut|slice|dredge|grill|roast|shred|return|deglaze|whisk|brush|form|thread|marinate|refrigerate|smoke|stuff|wrap|secure|reduce|saute|sauté|fry|boil|strain|taste|adjust|repeat|layer|seal|check|let|allow|transfer|spread|roll|pound|tenderize|fillet|rinse|pat|coat|dip|fry|drop|shape|lock|set)\b"
    return bool(re.match(verbs, line, re.I))


def split_section(text: str, start_re: str, end_res: list[str]) -> str:
    m = re.search(start_re, text, re.I)
    if not m:
        return ""
    rest = text[m.end():]
    ends = []
    for er in end_res:
        em = re.search(er, rest, re.I)
        if em:
            ends.append(em.start())
    return rest[: min(ends)] if ends else rest


def parse_list_block(block: str) -> list[str]:
    lines = []
    for raw in re.split(r"[\n\r]+", block):
        line = raw.strip(" \t-•*\u2022")
        line = re.sub(r"^\d+[.)]\s+", "", line).strip()
        if not line:
            continue
        if re.match(r"^(notes?|tips?|serving suggestions?|tools?|equipment|see how|expand all)\b", line, re.I):
            break
        lines.append(clean_ws(line))
    return lines


def parse_recipe_from_html(html: str, url: str) -> dict | None:
    p = TextExtractor()
    try:
        p.feed(html)
        p.close()
    except Exception:
        return None
    title = ""
    for tag, h in p.headings:
        if tag == "h1" and h and "department" not in h.lower() and "ohio" not in h.lower() and "missouri" not in h.lower():
            title = h
            break
    if not title:
        t = clean_ws(p.title)
        t = re.split(r"\s*[|\-–]\s*", t)[0]
        title = t
    title = re.sub(r"\s+", " ", title).strip()
    title = re.sub(r"\s*\|\s*.*$", "", title)
    if not title or len(title) < 3:
        return None
    if SKIP_TITLE_RE.search(title):
        return None
    if JERKY_RE.search(title):
        return None

    text = p.text()
    low = text.lower()
    if SKIP_BODY_RE.search(text[:2500]):
        # still allow unless it is clearly from a commercial cookbook
        head = text[:1200]
        if SKIP_BODY_RE.search(head):
            return None

    # Ingredients: prefer list items near ingredients heading
    ingredients: list[str] = []
    steps: list[str] = []

    # Collect lis after an ingredients-like heading by scanning headings + subsequent lis via text blocks
    ing_block = split_section(
        text,
        r"(?:^|\n)\s*(?:ingredients?|soup ingredients?|for the brine|you will need)\s*[:\n]",
        [r"(?:^|\n)\s*(?:directions?|instructions?|method|cooking instructions|steps?|preparation)\s*[:\n]",
         r"(?:^|\n)\s*(?:notes?|tips?|serving|tools|equipment|see how)\s*[:\n]"],
    )
    dir_block = split_section(
        text,
        r"(?:^|\n)\s*(?:directions?|instructions?|method|cooking instructions|steps?|preparation)\s*[:\n]",
        [r"(?:^|\n)\s*(?:notes?|tips?|variation|serving suggestions?|tools?|equipment|see how it|we protect and manage|expand all|complementary)\s*[:\n]"],
    )

    if ing_block:
        ingredients = [x for x in parse_list_block(ing_block) if looks_like_ingredient(x) or len(x) < 120]
        ingredients = [x for x in ingredients if not looks_like_step(x) or looks_like_ingredient(x)]
    if dir_block:
        raw_steps = parse_list_block(dir_block)
        steps = []
        buf = []
        for s in raw_steps:
            if looks_like_step(s) or re.match(r"^\d+", s) or len(s) > 40:
                if buf and not looks_like_step(s) and len(s) < 40:
                    steps[-1] = steps[-1] + " " + s if steps else s
                else:
                    steps.append(re.sub(r"^\d+[.)]\s*", "", s))
            elif steps:
                steps[-1] = steps[-1] + " " + s
        steps = [clean_ws(s) for s in steps if len(clean_ws(s)) > 12]

    # Fallback: list items that look like ingredients
    if len(ingredients) < 3:
        cand = [x for x in p.lis if looks_like_ingredient(x)]
        # drop nav-like
        cand = [x for x in cand if len(x) < 160 and not re.search(r"click|learn more|skip to", x, re.I)]
        if len(cand) >= 3:
            ingredients = cand[:30]

    if len(steps) < 2:
        cand = [x for x in (p.ordered or p.lis) if looks_like_step(x) or (len(x) > 40 and re.search(r"\b(cook|bake|simmer|brown|stir|heat|add)\b", x, re.I))]
        cand = [x for x in cand if not looks_like_ingredient(x) or len(x) > 50]
        if len(cand) >= 2:
            steps = [re.sub(r"^\d+[.)]\s*", "", x) for x in cand[:20]]

    if len(steps) < 2:
        paras = [x for x in p.paras if looks_like_step(x) and not re.search(r"skip to|protect and manage|javascript", x, re.I)]
        if len(paras) >= 2:
            steps = paras[:16]
        elif len(paras) == 1 and len(paras[0]) > 80:
            # split sentences into steps
            bits = re.split(r"(?<=[.!?])\s+", paras[0])
            steps = [b for b in bits if len(b) > 20][:16]

    # Drop junk ingredients
    junk = re.compile(r"(skip to|javascript|cookie|sign up|expand all|complementary|ibm websphere|official website)", re.I)
    ingredients = [i for i in ingredients if not junk.search(i) and len(i) > 1]
    steps = [s for s in steps if not junk.search(s) and "we protect and manage" not in s.lower()]

    # Dedupe preserve order
    def uniq(xs):
        out, seen = [], set()
        for x in xs:
            k = x.lower()
            if k not in seen:
                seen.add(k)
                out.append(x)
        return out

    ingredients = uniq(ingredients)
    steps = uniq(steps)

    if len(ingredients) < 3 or len(steps) < 2:
        return None

    blob = title + " " + " ".join(ingredients) + " " + " ".join(steps)
    proteins = detect_proteins(title, blob)
    # Must be a dinner-ish wild game / country main
    dinner_ok = any(p in proteins for p in [
        "venison", "elk", "wild-hog", "duck", "goose", "pheasant", "quail",
        "dove", "rabbit", "squirrel", "turkey", "catfish", "fish", "crawfish",
        "trout", "salmon", "other", "pork", "sausage", "chicken",
    ])
    if not dinner_ok:
        return None
    if DESSERT_RE.search(title):
        return None

    servings = estimate_servings(text[:4000] + " " + blob)
    time_min = estimate_time(steps, ingredients)
    diff = estimate_difficulty(steps, blob)

    source, source_name = source_for(url)
    tags = ["wild-game"]
    if any(x in proteins for x in ["venison", "elk", "wild-hog"]):
        tags.append("big-game")
    if any(x in proteins for x in ["duck", "goose", "pheasant", "quail", "dove", "turkey"]):
        tags.append("game-bird")
    if any(x in proteins for x in ["rabbit", "squirrel"]):
        tags.append("small-game")
    if any(x in proteins for x in ["fish", "catfish", "trout", "salmon", "crawfish"]):
        tags.append("fish")
    if re.search(r"camp|foil|grill|smoker|dutch oven", blob, re.I):
        tags.append("camp")
    if re.search(r"slow cooker|crock", blob, re.I):
        tags.append("slow-cooker")

    rid = "game-" + slugify(title)
    return {
        "id": rid,
        "title": title,
        "protein": proteins[0],
        "proteins": proteins,
        "budget": 2,
        "difficulty": diff,
        "timeMin": time_min,
        "servings": servings,
        "style": "Wild game / camp",
        "source": source_name,
        "sourceUrl": url,
        "image": "",
        "ingredients": ingredients,
        "steps": steps,
        "tags": tags,
    }


def source_for(url: str) -> tuple[str, str]:
    u = url.lower()
    if "portal.ct.gov" in u:
        return "ct", "Connecticut DEEP"
    if "mdc.mo.gov" in u:
        return "mo", "Missouri Department of Conservation"
    if "ohiodnr.gov" in u:
        return "oh", "Ohio DNR Wild Ohio Harvest Cookbook"
    if "tpwd.texas.gov" in u:
        return "tx", "Texas Parks & Wildlife"
    if "agfc.com" in u:
        return "ar", "Arkansas Game & Fish Commission"
    if "extension.missouri.edu" in u:
        return "muext", "University of Missouri Extension"
    if "wikibooks.org" in u:
        return "wiki", "Wikibooks Cookbook (CC BY-SA)"
    if "canr.msu.edu" in u or "msu.edu" in u:
        return "msu", "Michigan State University Extension"
    if "extension.umn.edu" in u:
        return "umn", "University of Minnesota Extension"
    return "gov", "US public wildlife agency"


def mdc_listing_urls() -> list[str]:
    urls = set()
    bases = [
        "https://mdc.mo.gov/discover-nature/recipes",
        "https://mdc.mo.gov/hunting-trapping/recipes",
    ]
    for base in bases:
        for page in range(0, 18):
            q = base if page == 0 else f"{base}?page={page}"
            html = fetch(q)
            if not html:
                continue
            p = TextExtractor()
            p.feed(html)
            p.close()
            found = 0
            for href, _ in p.links:
                full = abs_url(href, base)
                if re.search(r"/discover-nature/recipes/(turkey|venison|dove|squirrel|rabbit|waterfowl|fish|crayfish)/[a-z0-9-]+", full):
                    urls.add(full.split("?")[0])
                    found += 1
            if page > 0 and found == 0:
                break
    return sorted(urls)


def wikibooks_parse(html: str, url: str) -> dict | None:
    rec = parse_recipe_from_html(html, url)
    if rec:
        rec["source"] = "Wikibooks Cookbook (CC BY-SA)"
        rec["style"] = "Country / camp"
        if "wild-game" not in rec["tags"]:
            rec["tags"].append("wild-game")
        rec["tags"].append("country")
        return rec
    return None


CT_RECIPES = [
    {
        "title": "Chicken of the Woods Marsala (Wild Turkey)",
        "protein": "turkey",
        "proteins": ["turkey"],
        "budget": 2,
        "difficulty": 2,
        "timeMin": 40,
        "servings": 4,
        "sourceUrl": "https://portal.ct.gov/DEEP/Hunting/Cooking-with-Wild-Game",
        "ingredients": [
            "1/4 cup all-purpose flour for coating",
            "1 tablespoon Cajun seasoning",
            "1/2 teaspoon salt",
            "1/4 teaspoon ground black pepper",
            "2 wild turkey breasts, filleted and pounded 1/4 inch thick (venison or other game may be substituted)",
            "4 tablespoons butter",
            "4 tablespoons olive oil",
            "1 cup sliced Chicken of the Woods mushrooms (or shiitake/bella)",
            "1 cup dry Marsala wine",
            "Chopped parsley for garnish",
        ],
        "steps": [
            "In a shallow bowl, mix together flour and Cajun seasoning.",
            "Fillet turkey into approximately 1/2-inch pieces then pound flat to about 1/4 inch.",
            "Coat turkey in flour mixture.",
            "In a large skillet, add butter and olive oil. Melt butter completely.",
            "Lightly brown turkey on both sides and remove.",
            "Add Marsala wine and bring to a simmer. Lower heat and allow wine to reduce about 5 minutes.",
            "Add mushrooms and cook until tender.",
            "Add turkey back to skillet and cook until 165 F internal temperature (140 F for venison medium-rare/medium).",
            "Garnish with chopped parsley and serve with or without pasta.",
        ],
    },
    {
        "title": "Orange-Clove Smoked Wild Turkey",
        "protein": "turkey",
        "proteins": ["turkey"],
        "budget": 2,
        "difficulty": 3,
        "timeMin": 240,
        "servings": 4,
        "sourceUrl": "https://portal.ct.gov/DEEP/Hunting/Cooking-with-Wild-Game",
        "ingredients": [
            "1 wild turkey breast (about 2 lb), or a whole turkey with brine scaled up",
            "Brine: 1 cup water, 1/4 cup kosher salt, 1 tbsp brown sugar",
            "3 large garlic cloves",
            "3 slices fresh ginger",
            "5 large fresh sage leaves",
            "1 tbsp fresh thyme leaves",
            "1 tbsp fresh rosemary leaves",
            "1/2 tbsp whole cloves",
            "1/2 tbsp anise seed",
            "Zest from 1 orange, divided",
            "6 red potatoes, quartered",
            "3 large carrots, roughly chopped",
            "1 red onion, quartered",
            "1/2 cup water for the pan plus 5 smashed garlic cloves",
            "Handfuls of fresh thyme and rosemary sprigs, 5 sage leaves",
            "Glaze: 1/2 cup brown sugar mixed with 1/4 cup water",
        ],
        "steps": [
            "Combine brine ingredients and bring to a boil, stirring until salt and sugar dissolve. Cool completely.",
            "Place turkey in a sealed bag or container, cover with cooled brine, and refrigerate overnight.",
            "Soak wood chips 30 minutes. Preheat smoker to 250 F with the water bowl filled.",
            "Rinse brined turkey under cold water about 5 minutes. Arrange potatoes, carrots, onions, and garlic in a foil pan; set turkey on top and add 1/2 cup water.",
            "Sprinkle herbs, cloves, anise, and orange zest over turkey and vegetables.",
            "Smoke about 3 hours until turkey reaches 165 F and vegetables are tender.",
            "Heat oven to 400 F. Brush brown-sugar glaze over turkey and vegetables and roast about 10 minutes until the glaze sets. Serve hot.",
        ],
    },
    {
        "title": "Wild Turkey Barbecue",
        "protein": "turkey",
        "proteins": ["turkey"],
        "budget": 2,
        "difficulty": 1,
        "timeMin": 420,
        "servings": 6,
        "sourceUrl": "https://portal.ct.gov/DEEP/Hunting/Cooking-with-Wild-Game",
        "ingredients": [
            "2 wild turkey leg/thigh quarters",
            "1/2 cup Sprite",
            "1/2 cup apple cider vinegar",
            "1/2 cup barbecue sauce",
            "1 onion, thinly sliced",
            "1 heaping tablespoon Traeger Big Game or favorite BBQ dry rub",
        ],
        "steps": [
            "Add turkey, Sprite, vinegar, barbecue sauce, onion, and dry rub to a slow cooker.",
            "Cook on low 6 to 8 hours, until the meat falls from the bones.",
            "Remove bones, tendons, and connective tissue.",
            "Return meat to the cooker and shred into the juices. Serve.",
        ],
    },
    {
        "title": "Stuffed Wild Turkey Cutlets with Green Beans, Cranberries, and Pecans",
        "protein": "turkey",
        "proteins": ["turkey"],
        "budget": 2,
        "difficulty": 2,
        "timeMin": 35,
        "servings": 4,
        "sourceUrl": "https://portal.ct.gov/DEEP/Hunting/Cooking-with-Wild-Game",
        "ingredients": [
            "8 turkey cutlets, about 1/4 inch thick",
            "Salt and pepper",
            "3 cups fresh green beans, trimmed",
            "1 tablespoon butter, melted",
            "1 tablespoon minced garlic",
            "1 tablespoon chopped fresh sage",
            "1/4 cup dried cranberries",
            "1/4 cup chopped pecans",
            "1 cup chicken stock or broth",
            "1 teaspoon paprika",
            "1/4 teaspoon poultry seasoning",
        ],
        "steps": [
            "Season both sides of turkey cutlets with salt and pepper.",
            "Combine green beans, melted butter, garlic, sage, cranberries, and pecans for the filling.",
            "Add filling to the center of each cutlet, roll up, and secure with toothpicks.",
            "Place a rack in a pressure cooker, pour in chicken stock, and set stuffed cutlets on the rack. Sprinkle with paprika and poultry seasoning.",
            "Lock the lid and cook 10 minutes on HIGH. Quick-release pressure and rest 5 minutes before serving.",
        ],
    },
    {
        "title": "Smoked Wild Turkey Legs",
        "protein": "turkey",
        "proteins": ["turkey"],
        "budget": 2,
        "difficulty": 3,
        "timeMin": 240,
        "servings": 4,
        "sourceUrl": "https://portal.ct.gov/DEEP/Hunting/Cooking-with-Wild-Game",
        "ingredients": [
            "2 wild turkey legs (skin on or off)",
            "Cajun dry rub: 4 tsp salt, 4 tsp garlic powder, 6 tsp smoked paprika, 2 tsp black pepper, 2 tsp onion powder, 2 tsp cayenne, 2 1/2 tsp oregano, 2 1/2 tsp thyme, 1/2-1 tsp red pepper flakes",
            "Wet brine: 1/4 cup kosher salt, 2 tablespoons brown sugar, 2 cups hot water, 2 cups ice",
            "2 tablespoons peppercorns, 2 lemon slices, 2 orange slices, 2 onion slices, 2 minced garlic cloves, 1 bay leaf",
            "Olive oil for coating",
        ],
        "steps": [
            "Dissolve salt and brown sugar in hot water. Add citrus, peppercorns, onion, garlic, and bay leaf, then ice to cool.",
            "Submerge turkey legs in brine, cover, and refrigerate up to 24 hours.",
            "Heat smoker to 225 F (cherry or apple for mild smoke; hickory or mesquite for stronger).",
            "Dry legs, coat with oil, and season with Cajun rub.",
            "Smoke at 225 F until internal temperature reaches 165 F. Tent with foil and rest 10 minutes before serving.",
        ],
    },
    {
        "title": "Wild Goose Barbacoa with Spicy Peach Pico",
        "protein": "goose",
        "proteins": ["goose"],
        "budget": 2,
        "difficulty": 3,
        "timeMin": 120,
        "servings": 6,
        "sourceUrl": "https://portal.ct.gov/DEEP/Hunting/Cooking-with-Wild-Game",
        "ingredients": [
            "2 pounds goose breast (about 2 Canada goose breasts)",
            "1/4 large red onion, sliced",
            "4 cloves garlic, smashed and roughly chopped",
            "2 tbsp apple cider vinegar",
            "1/2 lime, juiced",
            "1 cup sliced peaches (fresh or frozen)",
            "1 can chile in adobo",
            "1 cup chicken stock",
            "2 tsp kosher salt",
            "1/2 tsp cumin",
            "1 tsp oregano",
            "1/4 tsp cloves",
            "1 cinnamon stick",
            "Oil for browning",
            "Tortillas, cilantro, diced red onion, and sliced peaches for serving",
        ],
        "steps": [
            "Season meat with kosher salt and pepper.",
            "Heat a pressure cooker on saute. Brown goose in oil in batches; set aside. Saute red onion until soft, then garlic 1 minute.",
            "Deglaze with vinegar, lime juice, and chicken stock. Add peaches, spices, and chile in adobo. Return meat and stir.",
            "Pressure cook on high 60 minutes plus full natural release (about 25 minutes).",
            "When fork-tender, shred the meat. Strain cooking liquid, reduce on the stove about 10 minutes, and pour over shredded goose.",
            "Serve in tacos with cilantro, onion, and peaches.",
        ],
    },
    {
        "title": "Rabbit Cacciatore",
        "protein": "rabbit",
        "proteins": ["rabbit"],
        "budget": 2,
        "difficulty": 2,
        "timeMin": 90,
        "servings": 4,
        "sourceUrl": "https://portal.ct.gov/DEEP/Hunting/Cooking-with-Wild-Game",
        "ingredients": [
            "2 small rabbits or 1 large rabbit, quartered and sectioned",
            "1 can Italian whole tomatoes (stems removed)",
            "1/3 to 1/2 cup dry white wine",
            "1/2 red pepper",
            "1/2 green pepper",
            "1 large onion, coarse chopped",
            "Fresh parsley, chopped fine",
            "1 cup fresh mushrooms, sliced",
            "2 bay leaves",
            "1 tsp oregano",
            "Salt and pepper to taste",
            "Crushed red pepper to taste (optional)",
            "1/3 to 1/2 cup olive oil",
            "2 garlic cloves, sliced",
        ],
        "steps": [
            "Season rabbit with salt and pepper and brown in olive oil with one clove garlic until golden.",
            "Add onions and wine and allow to reduce.",
            "Add tomatoes, peppers, parsley, mushrooms, bay leaves, oregano, remaining garlic, and seasonings.",
            "Simmer covered until rabbit is tender. Serve with or without rice or pasta.",
        ],
    },
    {
        "title": "Squirrel Potpie",
        "protein": "squirrel",
        "proteins": ["squirrel"],
        "budget": 2,
        "difficulty": 3,
        "timeMin": 150,
        "servings": 6,
        "sourceUrl": "https://portal.ct.gov/DEEP/Hunting/Cooking-with-Wild-Game",
        "ingredients": [
            "4 squirrels, cleaned and quartered",
            "2 cloves garlic, minced",
            "1 large onion, chopped",
            "5 carrots, sliced",
            "1/2 bunch celery, chopped",
            "1 lb frozen peas",
            "2 quarts game stock (or chicken or vegetable)",
            "1 pint heavy cream",
            "1 bay leaf",
            "Flour",
            "Salt and pepper to taste",
            "Pie crust",
        ],
        "steps": [
            "In a stockpot combine 1 quart stock, squirrel, bay leaf, salt, and pepper (add water to cover). Boil until meat is tender.",
            "Remove squirrel, pick meat from bones, and strain/reserve stock.",
            "In a large pot add remaining stock plus strained stock, carrots, garlic, onions, and celery. Boil until vegetables are tender.",
            "Add picked squirrel meat, heavy cream, and peas. Stir in flour gradually to thicken.",
            "Fill pie crust with filling and bake until golden brown.",
        ],
    },
    {
        "title": "Squirrel Dumplings",
        "protein": "squirrel",
        "proteins": ["squirrel"],
        "budget": 2,
        "difficulty": 3,
        "timeMin": 150,
        "servings": 6,
        "sourceUrl": "https://portal.ct.gov/DEEP/Hunting/Cooking-with-Wild-Game",
        "ingredients": [
            "2 squirrels, cleaned, with heart and kidneys",
            "About 2 quarts chicken stock",
            "4 or 5 carrots, diced about 1/2 inch",
            "1 or 2 white onions, diced about 1/2 inch",
            "3 or 4 garlic cloves, finely diced",
            "Egg noodles",
            "Fresh thyme and sage, dried cayenne, celery seed, red pepper flakes, basil, salt, crushed peppercorns, bay leaves",
            "Butter or bacon grease",
            "Dumplings: 2 cups flour, 4 tsp baking powder, 1 tsp baking soda, pinch of salt, 3/4 cup milk, 2 tbsp butter or lard",
        ],
        "steps": [
            "Simmer squirrels in lightly salted water until meat is falling off the bones; skim foam. Reserve cooking liquid and pick all meat from bones.",
            "Sweat onion and garlic in bacon fat or butter until translucent. Add squirrel meat, giblets, and spices; saute briefly.",
            "Add reserved squirrel broth (1-2 cups), stock, vegetables, and bay leaf. Simmer until well blended.",
            "Cook noodles separately and add just before serving.",
            "Mix dumpling dry ingredients. Warm milk with butter or lard until melted and stir into dry mix to a sticky dough.",
            "Drop loose balls into simmering soup, cover, and cook 10-12 minutes. Serve immediately.",
        ],
    },
    {
        "title": "Kentucky Burgoo (Squirrel, Beaver, and Pheasant)",
        "protein": "squirrel",
        "proteins": ["squirrel", "pheasant", "other"],
        "budget": 2,
        "difficulty": 3,
        "timeMin": 180,
        "servings": 10,
        "sourceUrl": "https://portal.ct.gov/DEEP/Hunting/Cooking-with-Wild-Game",
        "ingredients": [
            "3 tablespoons vegetable oil",
            "1 to 2 squirrels, cut into serving pieces",
            "2 to 3 pounds beaver, cut into large pieces (or substitute venison or goose)",
            "4 to 6 pheasant legs/thighs, bone-in",
            "1 green pepper, chopped",
            "1 large onion, chopped",
            "2 carrots, chopped",
            "2 celery stalks, chopped",
            "6 garlic cloves, chopped",
            "1 quart chicken stock",
            "1 quart beef stock",
            "1 28-ounce can crushed tomatoes",
            "2 large potatoes",
            "1 bag frozen corn",
            "1 bag frozen green beans",
            "Salt and pepper",
            "1/4 cup Worcestershire sauce",
        ],
        "steps": [
            "Brown meats in batches in oil in a large Dutch oven; salt as they cook and set aside.",
            "Brown onions, carrots, celery, and green pepper; add garlic 1 minute. Return meats with stocks and tomatoes. Simmer covered 2 hours.",
            "Remove meat, strip from bones, tear large pieces, and return to the pot.",
            "Add peeled potato chunks and simmer until tender. Stir in Worcestershire and adjust seasoning.",
            "Add corn and green beans; cook 15 minutes until heated through.",
        ],
    },
    {
        "title": "Venison Kabobs",
        "protein": "venison",
        "proteins": ["venison"],
        "budget": 2,
        "difficulty": 1,
        "timeMin": 45,
        "servings": 4,
        "sourceUrl": "https://portal.ct.gov/DEEP/Hunting/Cooking-with-Wild-Game",
        "ingredients": [
            "Venison loin or round, cut into 1 1/2-inch chunks",
            "Teriyaki marinade",
            "1/2 chopped green pepper",
            "1 medium chopped onion, plus extra onion pieces for skewers",
            "Pineapple chunks (fresh or canned without syrup)",
            "Mushrooms and/or cherry tomatoes",
            "Cooked rice, for serving",
        ],
        "steps": [
            "Marinate venison chunks 8 hours or overnight in teriyaki marinade with chopped green pepper and onion.",
            "On long skewers, alternate onion, green pepper, pineapple, venison, mushrooms, and/or cherry tomatoes.",
            "Cook over charcoal, turning often and basting with marinade, until browned outside but rare in the center. Serve with rice.",
        ],
    },
]


def wrap_manual(rec: dict, source_name: str) -> dict:
    title = rec["title"]
    return {
        "id": "game-" + slugify(title),
        "title": title,
        "protein": rec["protein"],
        "proteins": rec["proteins"],
        "budget": rec.get("budget", 2),
        "difficulty": rec.get("difficulty", 2),
        "timeMin": rec.get("timeMin", 60),
        "servings": rec.get("servings", 4),
        "style": "Wild game / camp",
        "source": source_name,
        "sourceUrl": rec["sourceUrl"],
        "image": "",
        "ingredients": rec["ingredients"],
        "steps": rec["steps"],
        "tags": rec.get("tags") or ["wild-game"],
    }


def harvest():
    recipes = []
    seen_ids = set()
    seen_titles = set()
    skipped = []
    sources_count: dict[str, int] = {}

    def add(rec: dict | None, why_skip: str = ""):
        if not rec:
            if why_skip:
                skipped.append(why_skip)
            return
        key = rec["title"].strip().lower()
        if rec["id"] in seen_ids or key in seen_titles:
            skipped.append(f"dup:{rec['title']}")
            return
        seen_ids.add(rec["id"])
        seen_titles.add(key)
        recipes.append(rec)
        sources_count[rec["source"]] = sources_count.get(rec["source"], 0) + 1
        print("OK", rec["protein"], rec["title"], "<-", rec["source"])

    for rec in CT_RECIPES:
        add(wrap_manual(rec, "Connecticut DEEP"))

    print("Listing MDC recipes...")
    mdc_urls = mdc_listing_urls()
    print("MDC urls", len(mdc_urls))
    for url in mdc_urls:
        html = fetch(url)
        if not html:
            skipped.append("fetch:" + url)
            continue
        rec = parse_recipe_from_html(html, url)
        add(rec, "parse:" + url)

    print("Ohio DNR...")
    for url in OHIO_URLS:
        html = fetch(url)
        if not html:
            skipped.append("fetch:" + url)
            continue
        rec = parse_recipe_from_html(html, url)
        add(rec, "parse:" + url)

    print("TPWD...")
    for url in TPWD_KEEP:
        html = fetch(url)
        if not html:
            skipped.append("fetch:" + url)
            continue
        rec = parse_recipe_from_html(html, url)
        add(rec, "parse:" + url)

    print("Wikibooks...")
    for url in WIKIBOOKS:
        html = fetch(url)
        if not html:
            skipped.append("fetch:" + url)
            continue
        rec = wikibooks_parse(html, url)
        add(rec, "parse:" + url)

    print("Other agency...")
    for url in OTHER:
        html = fetch(url)
        if not html:
            skipped.append("fetch:" + url)
            continue
        rec = parse_recipe_from_html(html, url)
        add(rec, "parse:" + url)

    # unique-ify ids if collisions
    used = {}
    for rec in recipes:
        base = rec["id"]
        n = used.get(base, 0)
        used[base] = n + 1
        if n:
            rec["id"] = f"{base}-{n+1}"

    recipes.sort(key=lambda r: (r["protein"], r["title"].lower()))
    out = DATA / "wildgame.json"
    out.write_text(json.dumps(recipes, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    from collections import Counter
    prot = Counter(r["protein"] for r in recipes)
    src = Counter(r["source"] for r in recipes)
    lines = [
        f"Wild-game dinner harvest: {len(recipes)} complete recipes",
        "",
        "By protein:",
    ]
    for k, v in sorted(prot.items(), key=lambda kv: (-kv[1], kv[0])):
        lines.append(f"  {k}: {v}")
    lines += ["", "By source:"]
    for k, v in sorted(src.items(), key=lambda kv: (-kv[1], kv[0])):
        lines.append(f"  {k}: {v}")
    lines += [
        "",
        "Rules: public US state DNR / wildlife agency / university extension / CC-BY-SA Wikibooks only.",
        "Skipped commercial cookbooks (MeatEater, AllRecipes, Food Network, NYT, ATK, BBC, Afield, Hudson's).",
        "Each recipe has title, ingredients, and step-by-step instructions.",
        f"Skipped incomplete/duplicate/non-dinner fetches: {len(skipped)}",
        "",
        "Titles:",
    ]
    for r in recipes:
        lines.append(f"  - [{r['protein']}] {r['title']}  ({r['source']})")
        lines.append(f"    {r['sourceUrl']}")
    (DATA / "wildgame-summary.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("Wrote", len(recipes), "recipes")
    print(prot)
    print(src)


if __name__ == "__main__":
    harvest()
