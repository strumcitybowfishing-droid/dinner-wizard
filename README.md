# DINNER WIZARD

A family dinner picker. You tap. The hat decides.

This is a static, mobile-first PWA — vanilla HTML, CSS, and JavaScript. No Node, no build step.

## Open locally

Browsers often block `fetch()` on `file://`, so serve the folder over HTTP if you want the recipe library to load.

**Windows, if Python is installed:**

```
py -3 -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080).

On a phone, open that page and use the browser menu to **Add to Home Screen**.

Opening `index.html` directly still shows the app; the recipe files under `data/` just may not load until it is served.

## Recipe library

The app reads `data/recipes.json` first. If that file is missing, it combines `data/mealdb.json`, `data/usda.json`, and `data/wildgame.json`. If none of those exist yet, the UI still works and shows a “library loading” state.

Recipes are from public sources (TheMealDB, USDA MyPlate, state wildlife agencies), with attribution. Nothing is copied from copyrighted cookbooks.

## Live site

Bookmark: **https://strumcitybowfishing-droid.github.io/dinner-wizard/**

This app is a **new** public GitHub repo (`dinner-wizard`). It is **not** Line & Dock. Do not push these files to `strumcity-line-dock`.
