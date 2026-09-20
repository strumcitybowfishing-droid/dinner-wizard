import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path("tools").resolve()))
from harvest_wildgame import parse_recipe_from_html

pairs = [
    ("https://mdc.mo.gov/discover-nature/recipes/rabbit/rabbit-cacciatore", "https_mdc.mo.gov_discover-nature_recipes_rabbit_rabbit-cacciatore"),
    ("https://mdc.mo.gov/discover-nature/recipes/venison/stroganoff", "https_mdc.mo.gov_discover-nature_recipes_venison_stroganoff"),
    ("https://mdc.mo.gov/discover-nature/recipes/squirrel/squirrel-pot-pie", "https_mdc.mo.gov_discover-nature_recipes_squirrel_squirrel-pot-pie"),
    ("https://tpwd.texas.gov/huntwild/hunt/wildgame-recipes/chicken_fried_venison.phtml", "https_tpwd.texas.gov_huntwild_hunt_wildgame-recipes_chicken_fried_venison.phtml"),
    ("https://tpwd.texas.gov/huntwild/hunt/wildgame-recipes/cook_in_dove.phtml", "https_tpwd.texas.gov_huntwild_hunt_wildgame-recipes_cook_in_dove.phtml"),
    ("https://tpwd.texas.gov/huntwild/hunt/wildgame-recipes/venison_chili.phtml", "https_tpwd.texas.gov_huntwild_hunt_wildgame-recipes_venison_chili.phtml"),
    ("https://tpwd.texas.gov/huntwild/hunt/wildgame-recipes/jalapeno_bird_rice.phtml", "https_tpwd.texas.gov_huntwild_hunt_wildgame-recipes_jalapeno_bird_rice.phtml"),
    ("https://tpwd.texas.gov/huntwild/hunt/wildgame-recipes/venison_kabobs.phtml", "https_tpwd.texas.gov_huntwild_hunt_wildgame-recipes_venison_kabobs.phtml"),
    ("https://tpwd.texas.gov/huntwild/hunt/wildgame-recipes/venison_beer.phtml", "https_tpwd.texas.gov_huntwild_hunt_wildgame-recipes_venison_beer.phtml"),
]
p = Path("data/_cache")
for url, name in pairs:
    f = p / name
    print("\n====", name, f.exists())
    if not f.exists():
        continue
    html = f.read_text(encoding="utf-8", errors="replace")
    rec = parse_recipe_from_html(html, url)
    if rec:
        print("TITLE", rec["title"])
        print("INGS", rec["ingredients"])
        print("STEPS", rec["steps"])
    else:
        m = re.search(r'name="description" content="([^"]+)"', html)
        print("META", m.group(1)[:900] if m else "none")
        # try extract instructions from body text
        i = html.lower().find("instructions")
        print("BODY", re.sub(r"<[^>]+>", " ", html[i:i+800])[:600] if i >= 0 else "no instructions")
