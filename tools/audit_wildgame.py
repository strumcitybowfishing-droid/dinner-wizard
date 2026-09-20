import json
from pathlib import Path

recs = json.loads(Path("data/wildgame.json").read_text(encoding="utf-8"))
print("count", len(recs))
for r in recs:
    issues = []
    if len(r["ingredients"]) < 3:
        issues.append("few-ing")
    if len(r["steps"]) < 2:
        issues.append("few-steps")
    if any(len(i) > 220 for i in r["ingredients"]):
        issues.append("long-ing")
    if "Cookbook:" in r["title"] or r["title"] == "Can":
        issues.append("bad-title")
    nav = [i for i in r["ingredients"] if any(x in i.lower() for x in ["skip to", "javascript", "learn more", "click here"])]
    if nav:
        issues.append("nav")
    if issues:
        print("ISSUE", r["id"], r["title"][:70], issues, "ings", len(r["ingredients"]), "steps", len(r["steps"]))

print("\n--- sample full records of concern ---")
want = {
    "Can",
    "Cookbook:Chicken and Dumplings",
    "Cookbook:Fried Chicken",
    "Cookbook:Shepherd's Pie I",
    "Cookbook:Jambalaya I",
    "Cookbook:Chicken and Andouille Sausage Gumbo",
    "Sliced Venison Saute",
    "Green Chile Bake",
    "Wild Game Chili",
    "Duck Breast with Red Chili Glaze",
    "Venison Stew with Wild Mushroom and Biscuits",
    "Grilled Venison Loin with Herbs and Horseradish Cream",
    "Texas Bandera Smoked Quail Egg Roll",
    "Turkey Fruit Salad",
    "Crawfish Salad",
    "Venison-Bacon Appetizer",
    "Red Pepper Ravioli with Morel Sauce",
    "Canned Venison",
    "Summer Sausage",
}
for r in recs:
    if r["title"] in want:
        print("\n====", r["title"], r["sourceUrl"])
        print("INGS:")
        for i in r["ingredients"][:12]:
            print(" -", i[:140])
        print("STEPS:")
        for s in r["steps"][:8]:
            print(" -", s[:180])
