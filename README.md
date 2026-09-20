# DINNER WIZARD

A family dinner picker. You tap. The hat decides.

Static mobile-first PWA — vanilla HTML, CSS, and JavaScript. No Node, no build step.

This is a **new** app and repo. It is **not** Line & Dock. Never push these files to `strumcity-line-dock`.

## Live site

GitHub repo: https://github.com/strumcitybowfishing-droid/dinner-wizard

**Render (recommended, same account as Line & Dock):**

1. Open [Render Dashboard](https://dashboard.render.com) (stay signed into the same account that hosts Line & Dock).
2. **New + → Static Site** (or **Blueprint**).
3. Connect repo **`dinner-wizard`**. Do **not** select `strumcity-line-dock`.
4. Name the service **`dinner-wizard`**. Publish directory `.`
5. Create. Bookmark the URL (usually `https://dinner-wizard.onrender.com`).

Leave the existing **`strumcity-line-dock`** service alone so Line & Dock stays live.

## Open locally

```
cd "C:\Users\johnn\Desktop\Dinner Wizard"
py -3 -m http.server 8765
```

Then open http://localhost:8765

On a phone: browser menu → **Add to Home Screen**.

## Recipe library

`data/recipes.json` is the combined library (TheMealDB, USDA MyPlate Kitchen, Missouri Conservation, Texas Parks & Wildlife, Connecticut DEEP, Ohio DNR, Wikibooks). Each recipe keeps its source name and link. Nothing is copied from MeatEater or other copyrighted cookbooks.
