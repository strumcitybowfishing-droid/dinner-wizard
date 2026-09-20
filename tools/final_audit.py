import json
from pathlib import Path

recs = json.loads(Path("data/wildgame.json").read_text(encoding="utf-8"))
print("count", len(recs))
drop = []
for r in recs:
    issues = []
    if len(r["ingredients"]) < 3:
        issues.append("few-ing")
    if len(r["steps"]) < 2:
        issues.append("few-steps")
    blob = " ".join(r["ingredients"] + r["steps"]).lower()
    if any(x in blob for x in ["from \"afield", "cooking fearlessly", "jesse griffiths", "hank shaw"]):
        issues.append("copyright")
    if any(x in r["title"].lower() for x in ["popper", "rumake", "hors d"]):
        issues.append("appetizer-title")
    nav = [i for i in r["ingredients"] + r["steps"] if "skip to" in i.lower() or "javascript" in i.lower()]
    if nav:
        issues.append("nav")
    if "Cookbook:" in r["title"] or r["title"] == "Can":
        issues.append("bad-title")
    if issues:
        print("ISSUE", r["title"][:70], issues)
        drop.append(r["title"])

print("\nprotein coverage:")
prots = set()
for r in recs:
    prots.update(r["proteins"])
print(sorted(prots))
print("missing from request", set("venison duck goose rabbit squirrel dove pheasant quail turkey catfish elk wild-hog".split()) - prots)
