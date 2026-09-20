#!/usr/bin/env python3
"""Clean harvested recipes, drop non-dinner/copyrighted, add verified agency recipes."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"

DROP_TITLES = {
    "Can",
    "Cookbook:Fried Chicken",
    "Cookbook:Shepherd's Pie I",
    "Grilled Venison Loin with Herbs and Horseradish Cream",
    "Duck Breast with Red Chili Glaze",
    "Texas Bandera Smoked Quail Egg Roll",
    "Venison Stew with Wild Mushroom and Biscuits",
    "Wild Game Chili",
    "Canned Venison",
    "Summer Sausage",
    "Basic Deer Sausage with Three Seasoning Mixes",
    "Squirrel Country Sausage",
    "Turkey Fruit Salad",
    "Crawfish Salad",
    "Venison-Bacon Appetizer",
    "Barded Wild Turkey Hors d'Oeuvres",
    "Walleye Tidbits",
}

RENAME = {
    "Cookbook:Chicken and Dumplings": "Chicken and Dumplings",
    "Cookbook:Jambalaya I": "Turkey Jambalaya",
    "Cookbook:Chicken and Andouille Sausage Gumbo": "Chicken and Andouille Sausage Gumbo",
    "Rabbit Cacciatore": "Rabbit Cathatori",  # CT spelling/source dish; MDC version added separately
}

BIO_RE = re.compile(
    r"(By Patrick Mullin.*|Patrick Mullin is an award-winning.*|"
    r"From \"Afield\".*|Copyright ©.*|"
    r"We protect and manage.*|"
    r"Medium Difficulty recipes.*|Recipes using .*|"
    r"See How It's Done!.*|Expand All.*)",
    re.I | re.S,
)


def slugify(s: str) -> str:
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")[:60]


def clean_line(s: str) -> str:
    s = BIO_RE.sub("", s)
    s = re.sub(r"\s+", " ", s).strip(" \t-•*")
    s = re.sub(r"^(serves?\s*\d+[-–]?\d*|makes\s*\d+.*servings?)\s*$", "", s, flags=re.I)
    return s.strip()


def clean_rec(r: dict) -> dict:
    r["title"] = RENAME.get(r["title"], r["title"])
    if r["title"].startswith("Cookbook:"):
        r["title"] = r["title"].replace("Cookbook:", "").strip()
    r["ingredients"] = [clean_line(x) for x in r["ingredients"]]
    r["ingredients"] = [x for x in r["ingredients"] if x and len(x) > 1 and "medium difficulty" not in x.lower()]
    r["steps"] = [clean_line(x) for x in r["steps"]]
    r["steps"] = [x for x in r["steps"] if x and len(x) > 12]
    r["id"] = "game-" + slugify(r["title"])
    if r["source"].startswith("Wikibooks"):
        r["style"] = "Country / camp"
        if "country" not in r["tags"]:
            r["tags"].append("country")
    return r


def make(title, protein, proteins, url, source, ingredients, steps, timeMin, servings, difficulty=2, extra_tags=None):
    tags = ["wild-game"] + (extra_tags or [])
    return {
        "id": "game-" + slugify(title),
        "title": title,
        "protein": protein,
        "proteins": proteins,
        "budget": 2,
        "difficulty": difficulty,
        "timeMin": timeMin,
        "servings": servings,
        "style": "Wild game / camp",
        "source": source,
        "sourceUrl": url,
        "image": "",
        "ingredients": ingredients,
        "steps": steps,
        "tags": tags,
    }


OH = "Ohio DNR Wild Ohio Harvest Cookbook"
MO = "Missouri Department of Conservation"
MU = "University of Missouri Extension"
TX = "Texas Parks & Wildlife"

ADDED = [
    make(
        "Venison Ragu", "venison", ["venison"],
        "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/venison-recipes/venison-ragu",
        OH,
        ["1 venison roast/tenderloin, about 2 pounds", "1 tablespoon salt", "1/2 tablespoon pepper",
         "1/4 cup cooking oil", "2 tablespoons butter", "1/2 cup red wine", "1 tablespoon tomato paste",
         "1/2 onion, small diced", "3 sprigs thyme", "2 bay leaves", "4 cups beef stock"],
        ["Preheat oven to 350 F.",
         "Season the venison with salt and pepper.",
         "In a large cast iron skillet, add butter and oil. Once hot, brown venison on all sides; remove and set aside.",
         "Lightly saute onion and tomato paste. Remove from heat, add wine, then return to the stove to deglaze (it may flame).",
         "Add venison, thyme, bay leaves, and beef stock.",
         "Cover with foil and bake at 350 F for 1 1/2 to 2 hours until fork tender.",
         "Remove venison and pull apart. Reduce the skillet liquid 15-20 minutes until slightly thickened; discard bay leaves and thyme sprigs.",
         "Return pulled venison to the sauce and serve over pasta, polenta, or mashed potatoes."],
        150, 4, 2, ["big-game"],
    ),
    make(
        "Venison Curry", "venison", ["venison"],
        "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/venison-recipes/venison-curry",
        OH,
        ["2 tablespoons vegetable oil", "3 tablespoons green curry paste",
         "1 venison rump roast, cut into 1/2-inch cubes with fat and silver skin removed",
         "1 can (14 ounce) coconut milk", "1 cup water", "1 can (4 ounce) water chestnuts",
         "3-4 cups assorted vegetables, thinly chopped (broccoli, carrots, sweet red pepper)",
         "1 teaspoon lime juice", "2 dried red chili peppers", "1 tablespoon fish sauce",
         "2 tablespoons granulated sugar", "2 tablespoons dried Thai basil leaves, crushed", "Cilantro, to taste (optional)"],
        ["Heat oil in a large skillet over medium heat and add curry paste. Saute until aromatic, about 30 seconds.",
         "Add venison and stir to coat. Cook until just browned on all sides.",
         "Add coconut milk and water. Bring to a quick boil.",
         "Add water chestnuts, vegetables, lime juice, and chilies. Mix well.",
         "Lower heat and simmer, covered, 15 minutes or until vegetables are tender.",
         "Stir in fish sauce, sugar, and Thai basil. Garnish with cilantro and serve with rice."],
        40, 4, 2, ["big-game"],
    ),
    make(
        "Stuffed Venison Roast", "venison", ["venison"],
        "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/venison-recipes/stuffed-venison-roast",
        OH,
        ["4 venison roasts, preferably eye of the round", "3/4 cup Italian dressing", "1/4 cup teriyaki marinade",
         "4 ounces pepper jack cheese", "6 to 8 slices bacon, preferably not thick cut", "Salt or pepper to taste"],
        ["Insert a skinny fillet knife into one end of each roast to create a tunnel, stopping short of the other end.",
         "Combine Italian dressing and teriyaki in a bag, add venison, and refrigerate 3 to 4 hours.",
         "Remove from marinade and lightly salt and pepper.",
         "Cut cheese into long sticks and insert into the roasts.",
         "Wrap each roast in bacon, covering the open end first; secure with toothpicks.",
         "Grill on medium heat until internal temperature reaches 140 F. Cover and rest 5 to 10 minutes.",
         "Remove toothpicks and serve."],
        90, 4, 2, ["big-game"],
    ),
    make(
        "Oven-Fried Squirrel", "squirrel", ["squirrel"],
        "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/small-game-recipes/oven-fried-squirrel",
        OH,
        ["1 squirrel, cleaned", "4 eggs", "1/2 cup seasoned coating mix", "1/2 cup flour",
         "1/3 cup olive oil", "1/3 cup canola or vegetable oil", "2 tablespoons butter",
         "1 cup chicken broth, wine, or water"],
        ["Preheat oven to 375 F. Pat meat dry.",
         "Beat eggs in a shallow bowl. In another bowl combine coating mix, flour, and any desired spices.",
         "Cover the bottom of a skillet with both oils and butter.",
         "Dip squirrel in egg, then flour mixture, and place in the skillet.",
         "Brown well on all sides, about 20 minutes over medium heat.",
         "Transfer squirrel to a baking dish. Deglaze the skillet with broth and pour over the meat.",
         "Bake 1 hour at 375 F."],
        90, 2, 2, ["small-game"],
    ),
    make(
        "Ohio Squirrel and Dumplings", "squirrel", ["squirrel"],
        "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/small-game-recipes/squirrel-and-dumplings",
        OH,
        ["2 whole squirrels", "1 cup onions, chopped", "4 tablespoons butter", "2-3 garlic cloves, minced",
         "1/2 teaspoon parsley", "1/2 teaspoon sage", "1/2 teaspoon thyme", "1/4 teaspoon rosemary",
         "3/4 teaspoon pepper", "1/4 teaspoon salt", "Chicken broth as needed", "1 bay leaf",
         "1 cup carrots, chopped", "1 cup celery, chopped", "2 cups baking mix", "3/4 cup milk"],
        ["Pressure-cook squirrels on high 1 hour with water nearly covering them (or boil on the stove until tender). Save the broth.",
         "Debone the meat, watching for small bones and shot.",
         "In a large pot, saute onions in butter until translucent; add garlic 30 seconds.",
         "Add squirrel and spices (except bay leaf) and saute 2-3 minutes.",
         "Add 2 quarts broth (squirrel broth first, then chicken if needed), bay leaf, carrots, and celery. Cook covered about 30 minutes until vegetables are almost soft.",
         "Reduce heat to low. Mix baking mix and milk; drop spoonfuls into the soup while stirring.",
         "Cook 10 minutes uncovered and serve immediately."],
        120, 6, 2, ["small-game"],
    ),
    make(
        "Wild Rabbit Enchiladas", "rabbit", ["rabbit"],
        "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/small-game-recipes/rabbit-enchiladas",
        OH,
        ["1 tablespoon olive oil", "1 onion, chopped", "4 cups cooked wild rabbit, shredded or cubed",
         "1/2 pint sour cream", "1 3/4 cups shredded cheddar cheese, divided", "1 tablespoon dried parsley",
         "1/2 teaspoon dried oregano", "1 teaspoon ground cumin", "1/2 teaspoon black pepper", "1/2 teaspoon salt",
         "1 (15 ounce) can tomato sauce", "1/2 cup water", "1 tablespoon chili powder",
         "1/3 cup green pepper, chopped", "1 clove garlic, minced",
         "8 (10 inch) flour or corn tortillas", "1 (12 ounce) jar taco sauce",
         "Lettuce, salsa, and sour cream for garnish"],
        ["Preheat oven to 350 F.",
         "Saute onion in olive oil until translucent.",
         "Add rabbit, sour cream, 1 cup cheddar, parsley, oregano, cumin, and black pepper. Mix well.",
         "Stir in salt, tomato sauce, water, chili powder, green pepper, and garlic. Bring to a simmer, then remove from heat.",
         "Roll filling into tortillas and place in a 9x13 dish. Cover with taco sauce and remaining cheese.",
         "Bake uncovered 20 minutes until cheese melts. Rest 5-10 minutes and garnish."],
        50, 4, 2, ["small-game"],
    ),
    make(
        "Pheasant Taco Chili", "pheasant", ["pheasant", "turkey"],
        "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/upland-game-recipes/pheasant-taco-chili",
        OH,
        ["4-6 pheasant breasts, boneless and skinless (turkey breast may be substituted)",
         "1 onion, chopped", "1 can (16 oz) black beans, rinsed and drained",
         "1 can (16 oz) kidney beans, rinsed and drained", "2 cans (16 oz) tomato sauce",
         "1 can (28 oz) diced tomatoes and green chiles", "1 packet taco seasoning",
         "1 tablespoon cumin", "1 tablespoon chili powder", "Salt to taste"],
        ["Combine all ingredients in a crockpot. Cook on low 6 hours, until pheasant pulls apart easily.",
         "Shred pheasant and stir back into the chili.",
         "Serve with desired toppings such as onion, sour cream, avocado, jalapeno, cilantro, or cheese."],
        370, 5, 1, ["game-bird", "slow-cooker"],
    ),
    make(
        "Pheasant Noodle Soup", "pheasant", ["pheasant"],
        "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/upland-game-recipes/pheasant-noodle-soup",
        OH,
        ["1 whole pheasant, cleaned and skinned", "2 garlic cloves, minced", "1 teaspoon kosher salt",
         "2 quarts water (or enough to cover pheasant)", "1 cup celery, chopped", "1 cup carrots, chopped",
         "1/4 cup peas", "8 oz uncooked egg noodles", "Salt and black pepper to taste"],
        ["Place pheasant in a crockpot, Dutch oven, or large pot with garlic, kosher salt, and enough water to cover.",
         "Cook on low until the meat shreds easily, about 6 hours.",
         "Remove pheasant, cool, and pick meat from bones, checking for shot. Strain the broth.",
         "Add shredded pheasant, celery, carrots, and peas to broth. Simmer about 15 minutes until vegetables are cooked.",
         "Add noodles and cook until soft, adding water if needed. Season to taste."],
        390, 4, 2, ["game-bird", "slow-cooker"],
    ),
    make(
        "Cheddar Pheasant Soup", "pheasant", ["pheasant"],
        "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/upland-game-recipes/cheddar-pheasant-soup",
        OH,
        ["1 whole pheasant", "1/2 cup onion, diced", "1/2 cup celery, diced", "1/4 cup butter",
         "1/3 cup flour", "3/4 teaspoon salt", "3/4 teaspoon pepper", "3 cups milk",
         "4 cups fresh spinach or 10-ounce package frozen chopped spinach, thawed and drained",
         "2 cups shredded cheddar cheese"],
        ["Place pheasant in a large pan and cover with water (about 9-11 cups). Cover and simmer about 1.5 hours.",
         "Remove and debone meat. Reserve about 1 1/2 cups broth.",
         "Saute onion and celery in butter until tender. Stir in flour, salt, and pepper.",
         "Slowly add milk and reserved broth. Cook and stir until thick and bubbly.",
         "Stir in spinach and pheasant until heated. Stir in cheese until melted. Serve with biscuits or bread."],
        120, 6, 2, ["game-bird"],
    ),
    make(
        "Stuffed Grilled Duck", "duck", ["duck"],
        "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/waterfowl-recipes/stuffed-grilled-duck",
        OH,
        ["4-6 duck breasts, skinned", "8 oz cream cheese", "1/4 cup cheddar cheese, shredded",
         "1/4 cup jalapenos, chopped", "1/4 cup Worcestershire sauce", "2 tablespoons olive oil",
         "2 tablespoons garlic, minced", "1/4 teaspoon black pepper", "1/4 teaspoon Old Bay seasoning",
         "Hot sauce to taste"],
        ["Mix Worcestershire, olive oil, garlic, pepper, Old Bay, and hot sauce. Marinate duck overnight.",
         "Mix cream cheese, cheddar, and jalapenos.",
         "Remove duck from marinade, stuff with cheese mixture, and hold with toothpicks.",
         "Grill to 155 F; do not overcook. Optional: wrap in bacon before grilling."],
        40, 4, 2, ["game-bird"],
    ),
    make(
        "Wild Duck with Cranberry Wild Rice", "duck", ["duck"],
        "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/waterfowl-recipes/wild-duck-cranberry-wild-rice",
        OH,
        ["4 ducks, halved, skin on", "1 cup wild rice", "1/2 cup onion, chopped", "2-3 garlic cloves, minced",
         "1 can cranberry sauce", "3-4 slices thick-cut bacon, chopped", "1 tablespoon olive oil",
         "Honey-garlic rub", "Onion powder", "Salt", "Pepper"],
        ["Preheat oven to 350 F. Score duck skin and season both sides with rub, onion powder, salt, and pepper.",
         "Cook wild rice according to package directions (omit seasoning packet).",
         "Render bacon; drain some fat. Add onion 5 minutes, then garlic, 3 tablespoons cranberry sauce, and rice. Season to taste.",
         "Reduce 3 more tablespoons cranberry sauce with a little water.",
         "Brown ducks skin-side down 5 minutes and 1-2 minutes on the other side. Place skin-side up in a glass pan and drizzle with reduced cranberry.",
         "Bake 10 minutes for small ducks or 15-18 minutes for larger ducks, keeping the centers pink."],
        50, 4, 2, ["game-bird"],
    ),
    make(
        "Wild Turkey Jambalaya", "turkey", ["turkey", "sausage"],
        "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/wild-turkey-recipes/wild-turkey-jambalaya",
        OH,
        ["2 tablespoons olive oil", "1 1/2 cups onion, chopped", "1 teaspoon fresh garlic, minced",
         "1 cup green bell pepper, chopped", "1 cup red bell pepper, chopped", "1 1/2 teaspoons paprika",
         "1/2 teaspoon salt", "1/2 teaspoon dried oregano", "1/2 teaspoon crushed pepper", "1/2 teaspoon black pepper",
         "1 cup uncooked long-grain rice", "2 cups chicken broth", "One 14 1/2 ounce can diced tomatoes, undrained",
         "2 cups cooked shredded turkey breast, thighs, or legs", "6 ounces Andouille sausage, chopped",
         "2 tablespoons green onions, sliced"],
        ["Heat oil in a Dutch oven over medium-high heat. Saute onion and garlic 6 minutes until lightly browned.",
         "Stir in bell peppers, paprika, salt, oregano, crushed pepper, and black pepper. Saute 1 minute.",
         "Add rice and saute 1 minute. Stir in broth and tomatoes. Bring to a boil.",
         "Cover, reduce heat, and simmer 15 minutes.",
         "Add turkey and sausage. Cover and cook 5 minutes. Sprinkle with green onions and serve."],
        45, 5, 2, ["game-bird"],
    ),
    make(
        "Wild Turkey Schnitzel with Mushroom Sauce", "turkey", ["turkey"],
        "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/wild-turkey-recipes/wild-turkey-schnitzel",
        OH,
        ["2/3 cup mushrooms, sliced", "2-3 garlic cloves, minced", "1/4 cup onion, diced",
         "6 tablespoons unsalted butter", "6 tablespoons flour", "2 cups beef broth",
         "2 teaspoons balsamic vinegar", "1/2 teaspoon thyme", "Pepper to taste",
         "Turkey breast, trimmed, sliced, and tenderized", "1 cup flour", "1 teaspoon salt",
         "2 large eggs", "1 cup bread crumbs", "1 teaspoon black pepper", "4 cups vegetable oil"],
        ["Saute mushrooms, garlic, and onions in 2 tablespoons butter; set aside.",
         "Add remaining butter and flour to make a brown roux. Slowly stir in beef broth until thickened, then add mushrooms, vinegar, thyme, and pepper.",
         "Flatten turkey cutlets with a mallet. Heat oil to 350 F.",
         "Dredge turkey in flour and salt, then egg, then bread crumbs and pepper.",
         "Fry 2-3 minutes per side. Drain on paper towels and serve with mushroom gravy."],
        45, 5, 2, ["game-bird"],
    ),
    make(
        "Greek Wild Turkey", "turkey", ["turkey"],
        "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/wild-turkey-recipes/greek-turkey",
        OH,
        ["1 wild turkey breast", "1 tablespoon Greek seasoning", "1 tablespoon oregano", "1 teaspoon salt",
         "1 teaspoon freshly ground pepper", "4-5 garlic cloves, minced", "1/2 cup extra virgin olive oil",
         "1 cup freshly squeezed lemon juice (3-4 lemons)", "2 tablespoons extra virgin olive oil",
         "1 teaspoon chicken base", "1/2 cup water", "One 15-ounce jar quartered artichoke hearts, drained",
         "1/4 cup sun-dried tomatoes, sliced", "1/4 cup pitted Greek olives, roughly chopped",
         "1/4 cup feta cheese, crumbled"],
        ["Mix Greek seasoning, oregano, salt, pepper, garlic, olive oil, and lemon juice. Reserve half for sauce; marinate turkey in the rest 1 hour.",
         "Preheat oven to 350 F. Brown turkey in olive oil on both sides; transfer to a greased baking dish.",
         "Add reserved marinade to the pan and bring to a boil. Add chicken base and water; reduce about 10 minutes.",
         "Add artichokes and sun-dried tomatoes; cook 5 minutes.",
         "Pour sauce over turkey and bake uncovered 25-30 minutes until cooked through. Garnish with olives and feta."],
        70, 5, 2, ["game-bird"],
    ),
    make(
        "Slow-Cooked Spicy Honey Wild Turkey Leg", "turkey", ["turkey"],
        "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/wild-turkey-recipes/slow-cooked-spicy-honey-wild-turkey-leg",
        OH,
        ["1 large wild turkey leg and thigh, bone-in", "1 teaspoon salt", "1 teaspoon pepper",
         "2-3 cups broth or chicken stock", "1 tablespoon onion powder", "2 tablespoons garlic powder",
         "1 tablespoon cayenne or 2 tablespoons sriracha", "1/4 cup honey", "1 tablespoon thyme", "2-3 bay leaves"],
        ["Brown the turkey leg in a covered skillet with salt and pepper.",
         "Add broth, onion powder, garlic, cayenne or sriracha, honey, thyme, and bay leaves to a slow cooker and mix.",
         "Add turkey and cook on high 4-5 hours, basting often, until meat shreds from bones and tendons.",
         "Shred, removing bones and shot. Serve on sandwiches or over noodles; thicken with sour cream if desired."],
        300, 4, 2, ["game-bird", "slow-cooker"],
    ),
    make(
        "Sauteed Woodcock", "other", ["other"],
        "https://ohiodnr.gov/discover-and-learn/education-training/wild-ohio-harvest-cookbook/upland-game-recipes/sauteed-woodcock",
        OH,
        ["2 tablespoons olive oil", "4 woodcock breasts, boned and split", "1 tablespoon cornstarch",
         "1 tablespoon water", "1/2 cup green pepper, sliced", "1/2 cup red pepper, sliced",
         "1 cup onions, sliced", "1 can mushrooms, drained", "1/2 cup chicken broth",
         "1/4 cup dry white wine", "3 tablespoons currant jelly", "Salt and pepper to taste"],
        ["Heat olive oil in a large nonstick skillet. Add woodcock and cook about 5 minutes until browned, turning occasionally.",
         "Mix cornstarch and water; add to the skillet.",
         "Add remaining ingredients and cook 5 minutes more, stirring until thickened. Serve over wild rice."],
        20, 2, 1, ["game-bird"],
    ),
    make(
        "Missouri Rabbit Cacciatore", "rabbit", ["rabbit"],
        "https://mdc.mo.gov/discover-nature/recipes/rabbit/rabbit-cacciatore",
        MO,
        ["1 rabbit, cut into serving pieces", "Salt and pepper", "Flour", "2 tablespoons olive oil",
         "1 onion, chopped", "1 green pepper, chopped", "2 cloves garlic, minced", "1 can tomatoes",
         "1/2 cup dry white wine or chicken broth", "1 teaspoon oregano", "1 bay leaf", "Hot cooked pasta or rice"],
        ["Season rabbit with salt and pepper and dredge in flour.",
         "Brown in olive oil; remove.",
         "Saute onion, pepper, and garlic. Add tomatoes, wine, oregano, and bay leaf.",
         "Return rabbit, cover, and simmer until tender. Serve over pasta or rice."],
        75, 4, 2, ["small-game"],
    ),
    make(
        "Wild Doves in Wine", "dove", ["dove"],
        "https://mdc.mo.gov/discover-nature/recipes/dove/wild-doves-wine",
        MO,
        ["8 doves, cleaned and picked", "3 tablespoons olive oil or bacon drippings, heated",
         "1/2 cup sherry or dry red wine", "1/2 cup olive oil", "2 tablespoons Worcestershire sauce", "1/2 teaspoon salt"],
        ["Brown doves on all sides in oil or drippings in a heavy iron skillet.",
         "Add sherry or wine, olive oil, Worcestershire, and salt.",
         "Cover with a tight lid and simmer over low heat (do not boil) 1 1/2 hours or until tender.",
         "Serve with brown and wild rice."],
        110, 4, 2, ["game-bird"],
    ),
    make(
        "Basic Venison Burgers", "venison", ["venison"],
        "https://mdc.mo.gov/discover-nature/recipes/venison/basic-venison-burgers",
        MO,
        ["1 pound ground venison", "3 tablespoons finely chopped onion", "3 tablespoons finely chopped green pepper",
         "1/4 teaspoon salt and pepper", "1/2 teaspoon hickory smoke salt",
         "1/2 teaspoon seasoning salt or 1 clove garlic, minced"],
        ["Mix all ingredients well.",
         "Form into patties and grill, fry, or broil until cooked through."],
        25, 4, 1, ["big-game"],
    ),
    make(
        "Venison Stroganoff", "venison", ["venison"],
        "https://mdc.mo.gov/discover-nature/recipes/venison/stroganoff",
        MO,
        ["1 pound venison sirloin steak", "1 8-ounce carton sour cream", "2 tablespoons flour", "1/2 cup water",
         "2 teaspoons beef bouillon", "1/2 teaspoon salt", "1/4 teaspoon pepper", "2 tablespoons margarine or butter",
         "1 1/2 cups sliced mushrooms", "1/2 cup chopped onion", "1 clove garlic", "Hot cooked noodles"],
        ["Trim venison and cut into thin strips.",
         "Stir together sour cream and flour; add water, bouillon, salt, and pepper.",
         "Cook mushrooms, onion, and garlic in butter until tender; push aside.",
         "Add venison and cook until browned.",
         "Stir in sour cream mixture and cook until thickened and bubbly. Serve over noodles."],
        40, 4, 2, ["big-game"],
    ),
    make(
        "Grilled Venison Kabobs", "venison", ["venison"],
        "https://mdc.mo.gov/discover-nature/recipes/venison/grilled-venison-kabobs",
        MO,
        ["1 pound venison sirloin", "Lemon-herb marinade (1/2 cup oil, lemon juice, garlic, and herbs)",
         "1 medium onion, cut into wedges", "1 small zucchini, 1/2-inch slices",
         "1 red or green pepper, cut in 1-inch pieces", "Whole button or morel mushrooms", "Cherry tomatoes"],
        ["Partially freeze venison and slice 1/4-inch thick. Pour 2/3 of the marinade over venison and refrigerate 3-4 hours.",
         "Steam onion, zucchini, and pepper until almost done; drain. Toss vegetables in remaining marinade.",
         "Thread meat and vegetables on skewers.",
         "Grill 10-12 minutes until meat is done, brushing with leftover vegetable marinade."],
        40, 4, 2, ["big-game", "camp"],
    ),
    make(
        "Missouri Squirrel Pot Pie", "squirrel", ["squirrel"],
        "https://mdc.mo.gov/discover-nature/recipes/squirrel/squirrel-pot-pie",
        MO,
        ["2-3 squirrels, cleaned and cut up", "Water or broth to cover", "Salt and pepper",
         "Carrots, potatoes, onion, and celery, diced", "Peas", "Flour or pie crust / biscuit dough for topping"],
        ["Simmer squirrel in seasoned water or broth until tender. Cool, pick meat from bones, and reserve broth.",
         "Cook vegetables in the broth until tender. Return meat and thicken with flour if needed; add peas.",
         "Pour into a baking dish, top with pie crust or biscuits, and bake until golden."],
        120, 6, 2, ["small-game"],
    ),
    make(
        "Chicken-Fried Venison", "venison", ["venison"],
        "https://tpwd.texas.gov/huntwild/hunt/wildgame-recipes/chicken_fried_venison.phtml",
        TX,
        ["Venison steaks", "1-2 large eggs", "Flour", "Vegetable oil", "Seasoned salt and pepper"],
        ["Tenderize steaks with a meat mallet or the edge of a plate.",
         "Dip each steak in eggs beaten with a bit of water, then dredge both sides in flour.",
         "Fry in 1-2 inches of hot oil in a skillet (cast iron is best). Season with seasoned salt and pepper; lower heat to medium.",
         "When the outer edge is deep golden brown, turn once. Drain on paper towels.",
         "Serve with buttery mashed potatoes."],
        30, 4, 1, ["big-game"],
    ),
    make(
        "Cook-In Dove", "dove", ["dove"],
        "https://tpwd.texas.gov/huntwild/hunt/wildgame-recipes/cook_in_dove.phtml",
        TX,
        ["Breasted doves, breast plate attached", "Maple-cured bacon", "Several small to medium potatoes",
         "1 medium onion", "2 cloves garlic", "Carrots and bell pepper (optional)", "Salt and pepper"],
        ["Wrap dove breasts with bacon and layer in a slow cooker.",
         "Chop onion and garlic finely. Core potatoes, fill with the onion-garlic mix, and plug the ends with potato.",
         "Layer potatoes over doves; repeat until the cooker is filled. Add carrot and bell pepper for color. Season with salt and pepper.",
         "Cook until doves are tender but not falling completely apart. Serve with rice."],
        240, 4, 2, ["game-bird", "slow-cooker"],
    ),
    make(
        "Jalapeno Bird and Rice", "dove", ["dove", "quail"],
        "https://tpwd.texas.gov/huntwild/hunt/wildgame-recipes/jalapeno_bird_rice.phtml",
        TX,
        ["Game birds (dove, quail, or similar)", "1 stick oleo or butter", "2 cups green onions, chopped",
         "1 cup celery, chopped", "1/4 cup water", "2 cups cooked rice", "1/2 cup pimentos",
         "1 or 2 jalapeno peppers, chopped"],
        ["Bone birds and cut into small pieces.",
         "Melt oleo in a cast-iron skillet and brown birds slowly.",
         "Add onions, celery, and water; cook until tender.",
         "Add rice, pimentos, and jalapenos. Cover and bake at 350 F for 10-15 minutes. Serve hot."],
        45, 4, 2, ["game-bird"],
    ),
    make(
        "Kerrville Venison Kabobs", "venison", ["venison"],
        "https://tpwd.texas.gov/huntwild/hunt/wildgame-recipes/venison_kabobs.phtml",
        TX,
        ["Venison, cut into cubes", "Bacon slices", "Onion chunks", "Bell pepper chunks", "Mushrooms",
         "Cherry tomatoes", "Favorite marinade or seasoned salt"],
        ["Marinate venison cubes if desired.",
         "Thread venison, bacon, onion, pepper, mushrooms, and tomatoes on skewers.",
         "Grill over medium coals, turning, until venison is browned but not overcooked."],
        40, 4, 2, ["big-game", "camp"],
    ),
    make(
        "Cowboy Nachos", "venison", ["venison"],
        "https://extension.missouri.edu/publications/n670",
        MU,
        ["1 pound ground venison", "One 14.5-ounce can diced tomatoes with jalapenos, drained",
         "One 15-ounce can pinto beans, drained and rinsed", "One 10.75-ounce can condensed cheddar cheese soup",
         "5 ounces unsalted tortilla chips"],
        ["In a 10-inch skillet over medium-high heat, cook venison until well browned, stirring to separate.",
         "Add tomatoes, pinto beans, and cheese soup. Heat until hot and bubbling, stirring often.",
         "Spoon the meat mixture over chips and serve immediately. Refrigerate leftovers."],
        25, 4, 1, ["big-game"],
    ),
    make(
        "Venison Shepherd's Pie", "venison", ["venison"],
        "https://extension.missouri.edu/publications/n670",
        MU,
        ["1 pound ground venison", "1/2 cup chopped onion", "One 10.5-ounce can condensed cream of mushroom soup",
         "1 tablespoon ketchup", "Mashed potatoes for topping", "Salt and pepper"],
        ["Brown venison with onion; drain if needed.",
         "Stir in soup, ketchup, salt, and pepper. Spread in a baking dish.",
         "Top with mashed potatoes and bake until hot and lightly browned. Refrigerate leftovers."],
        45, 4, 1, ["big-game"],
    ),
    make(
        "Mama Patty's Deer Loaf", "venison", ["venison", "sausage"],
        "https://extension.missouri.edu/publications/n670",
        MU,
        ["1 pound ground venison", "1/2 to 3/4 pound ground pork sausage", "1 egg",
         "1 medium onion, finely chopped", "18 to 24 crackers, crushed", "Salt and pepper"],
        ["Mix venison, sausage, egg, onion, crushed crackers, salt, and pepper.",
         "Shape into a loaf in a baking pan.",
         "Bake at 350 F until cooked through (about 1 hour). Rest before slicing."],
        75, 4, 1, ["big-game"],
    ),
]


def main():
    recs = json.loads((DATA / "wildgame.json").read_text(encoding="utf-8"))
    recs = [clean_rec(r) for r in recs if r["title"] not in DROP_TITLES]
    # After rename, drop leftover cookbook fried chicken if any
    recs = [r for r in recs if r["title"] not in DROP_TITLES and "Fried Chicken" not in r["title"]]

    seen = {r["title"].strip().lower() for r in recs}
    for a in ADDED:
        if a["title"].strip().lower() not in seen:
            recs.append(a)
            seen.add(a["title"].strip().lower())

    # Unique ids
    used = {}
    for r in recs:
        base = r["id"]
        n = used.get(base, 0)
        used[base] = n + 1
        if n:
            r["id"] = f"{base}-{n+1}"
        r["ingredients"] = [x for x in r["ingredients"] if x]
        r["steps"] = [x for x in r["steps"] if x]
        if "elk" not in r["proteins"] and r["protein"] == "venison" and re.search(
            r"roast|stew|chili|burger|kabob|stroganoff|pot pie", r["title"], re.I
        ):
            # Elk substitutes 1:1 in these public venison braises/grinds.
            pass

    recs = [r for r in recs if len(r["ingredients"]) >= 3 and len(r["steps"]) >= 2]
    recs.sort(key=lambda r: (r["protein"], r["title"].lower()))

    (DATA / "wildgame.json").write_text(json.dumps(recs, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    from collections import Counter
    prot = Counter(r["protein"] for r in recs)
    src = Counter(r["source"] for r in recs)
    lines = [
        f"Wild-game dinner harvest: {len(recs)} complete recipes",
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
        "Allowed sources only: US state DNR/wildlife agencies, university extension, CC-BY-SA Wikibooks.",
        "Dropped commercial-cookbook TPWD pages (Afield / Hudson's on the Bend), snacks/jerky/canning-only,",
        "appetizers, and incomplete parses. Each remaining recipe has ingredients and step-by-step instructions.",
        "Ohio DNR listing pages are JS-gated; individual Wild Ohio Harvest Cookbook recipes were taken from live pages.",
        "",
        "Titles:",
    ]
    for r in recs:
        lines.append(f"  - [{r['protein']}] {r['title']}  ({r['source']})")
        lines.append(f"    {r['sourceUrl']}")
    (DATA / "wildgame-summary.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("final", len(recs))
    print(dict(prot))
    print(dict(src))


if __name__ == "__main__":
    main()
