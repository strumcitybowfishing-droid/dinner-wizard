/* Typical US shelf prices by chain. Baseline is national average
   (USDA/BLS-style 2025–2026 retail: chicken breast ~$4.18/lb,
   ground beef ~$6.83/lb, steak ~$12.88/lb, eggs ~$2.14–3.50/doz, milk ~$4.32/gal).
   Not your local store's live tags. */
(function (root) {
  const STORES = [
    { id: 'walmart', label: 'Walmart', emoji: '⭐', mult: 0.88, club: false, search: 'https://www.walmart.com/search?q=' },
    { id: 'aldi', label: 'Aldi', emoji: '🛒', mult: 0.82, club: false, search: 'https://www.aldi.us/results?q=' },
    { id: 'sams', label: "Sam's Club", emoji: '🏷️', mult: 0.78, club: true, search: 'https://www.samsclub.com/s/' },
    { id: 'costco', label: 'Costco', emoji: '📦', mult: 0.76, club: true, search: 'https://www.costco.com/CatalogSearch?keyword=' },
    { id: 'kroger', label: 'Kroger', emoji: '🔵', mult: 0.98, club: false, search: 'https://www.kroger.com/search?query=' },
    { id: 'heb', label: 'H-E-B', emoji: '🧡', mult: 0.95, club: false, search: 'https://www.heb.com/search/?q=' },
    { id: 'target', label: 'Target', emoji: '🎯', mult: 1.0, club: false, search: 'https://www.target.com/s?searchTerm=' },
    { id: 'meijer', label: 'Meijer', emoji: '🛍️', mult: 0.97, club: false, search: 'https://www.meijer.com/shopping/search.html?query=' },
    { id: 'foodlion', label: 'Food Lion', emoji: '🦁', mult: 0.9, club: false, search: 'https://www.foodlion.com/search?q=' },
    { id: 'publix', label: 'Publix', emoji: '💚', mult: 1.12, club: false, search: 'https://www.publix.com/shop/search?searchTerm=' },
    { id: 'safeway', label: 'Safeway', emoji: '🛒', mult: 1.08, club: false, search: 'https://www.safeway.com/shop/search-results.html?q=' },
    { id: 'albertsons', label: 'Albertsons', emoji: '🛒', mult: 1.08, club: false, search: 'https://www.albertsons.com/shop/search-results.html?q=' },
    { id: 'traderjoes', label: "Trader Joe's", emoji: '🌺', mult: 1.05, club: false, search: 'https://www.traderjoes.com/home/search?q=' },
    { id: 'sprouts', label: 'Sprouts', emoji: '🌱', mult: 1.18, club: false, search: 'https://shop.sprouts.com/store/sprouts/search?q=' },
    { id: 'wholefoods', label: 'Whole Foods', emoji: '🥬', mult: 1.42, club: false, search: 'https://www.wholefoodsmarket.com/search?text=' }
  ];

  /* unit: lb, oz, each, dozen, gal, loaf. price = national avg for that unit. */
  const ITEMS = [
    { id: 'chicken-breast', names: ['chicken breast', 'chicken breasts', 'boneless chicken'], unit: 'lb', price: 4.18, eachLb: 0.5 },
    { id: 'chicken-thigh', names: ['chicken thigh', 'chicken thighs'], unit: 'lb', price: 2.85, eachLb: 0.35 },
    { id: 'chicken-whole', names: ['whole chicken', 'chicken'], unit: 'lb', price: 2.05, eachLb: 4 },
    { id: 'chicken-wing', names: ['chicken wing', 'wings'], unit: 'lb', price: 3.4 },
    { id: 'turkey', names: ['turkey', 'turkey breast', 'ground turkey'], unit: 'lb', price: 3.6 },
    { id: 'ground-beef', names: ['ground beef', 'minced beef', 'beef mince', 'hamburger meat', 'ground chuck'], unit: 'lb', price: 6.83 },
    { id: 'steak', names: ['steak', 'ribeye', 'sirloin', 'new york strip', 't-bone', 'filet', 'fillet steak'], unit: 'lb', price: 12.88 },
    { id: 'beef-roast', names: ['beef roast', 'chuck roast', 'pot roast', 'brisket', 'stew beef', 'beef'], unit: 'lb', price: 7.9 },
    { id: 'pork-chop', names: ['pork chop', 'pork chops'], unit: 'lb', price: 4.55, eachLb: 0.5 },
    { id: 'pork', names: ['pork loin', 'pork shoulder', 'pork tenderloin', 'pulled pork', 'pork'], unit: 'lb', price: 3.85 },
    { id: 'bacon', names: ['bacon'], unit: 'lb', price: 6.4 },
    { id: 'ham', names: ['ham'], unit: 'lb', price: 4.2 },
    { id: 'sausage', names: ['sausage', 'italian sausage', 'breakfast sausage', 'andouille', 'chorizo', 'kielbasa'], unit: 'lb', price: 4.8 },
    { id: 'ribs', names: ['ribs', 'spare rib', 'baby back'], unit: 'lb', price: 5.5 },
    { id: 'lamb', names: ['lamb', 'lamb chop', 'mutton'], unit: 'lb', price: 10.5 },
    { id: 'venison', names: ['venison', 'deer'], unit: 'lb', price: 0, note: 'from the freezer' },
    { id: 'duck', names: ['duck', 'duck breast'], unit: 'lb', price: 7.5 },
    { id: 'fish', names: ['white fish', 'cod', 'tilapia', 'haddock', 'halibut', 'fish fillet', 'fish'], unit: 'lb', price: 7.2 },
    { id: 'salmon', names: ['salmon'], unit: 'lb', price: 9.8 },
    { id: 'catfish', names: ['catfish'], unit: 'lb', price: 6.4 },
    { id: 'trout', names: ['trout'], unit: 'lb', price: 8.2 },
    { id: 'tuna', names: ['tuna steak', 'fresh tuna'], unit: 'lb', price: 11 },
    { id: 'tuna-can', names: ['canned tuna', 'tuna'], unit: 'each', price: 1.35 },
    { id: 'shrimp', names: ['shrimp', 'prawn'], unit: 'lb', price: 8.9 },
    { id: 'crawfish', names: ['crawfish', 'crayfish', 'crawdad'], unit: 'lb', price: 6.5 },
    { id: 'crab', names: ['crab', 'crabmeat'], unit: 'lb', price: 14 },
    { id: 'scallops', names: ['scallop'], unit: 'lb', price: 16 },
    { id: 'eggs', names: ['egg', 'eggs'], unit: 'dozen', price: 2.5, eachPer: 12 },
    { id: 'milk', names: ['milk', 'whole milk'], unit: 'gal', price: 4.32 },
    { id: 'butter', names: ['butter', 'unsalted butter'], unit: 'lb', price: 4.7 },
    { id: 'cheddar', names: ['cheddar', 'cheese', 'shredded cheese', 'mexican cheese', 'halloumi'], unit: 'lb', price: 5.4 },
    { id: 'parmesan', names: ['parmesan', 'parmigiano'], unit: 'lb', price: 8.5 },
    { id: 'mozzarella', names: ['mozzarella'], unit: 'lb', price: 5.2 },
    { id: 'cream', names: ['heavy cream', 'whipping cream', 'cream', 'sour cream'], unit: 'oz', price: 0.18 },
    { id: 'yogurt', names: ['yogurt', 'greek yogurt'], unit: 'oz', price: 0.12 },
    { id: 'rice', names: ['rice', 'white rice', 'brown rice', 'jasmine rice'], unit: 'lb', price: 1.15 },
    { id: 'pasta', names: ['pasta', 'spaghetti', 'penne', 'noodles', 'egg noodles', 'macaroni'], unit: 'lb', price: 1.45 },
    { id: 'grits', names: ['grits', 'cornmeal', 'polenta'], unit: 'lb', price: 1.35 },
    { id: 'bread', names: ['bread', 'loaf', 'sandwich bread'], unit: 'loaf', price: 2.4 },
    { id: 'buns', names: ['bun', 'buns', 'hamburger bun', 'roll', 'rolls'], unit: 'each', price: 0.45 },
    { id: 'tortillas', names: ['tortilla', 'tortillas'], unit: 'each', price: 0.22 },
    { id: 'flour', names: ['flour', 'all-purpose flour', 'plain flour'], unit: 'lb', price: 0.62 },
    { id: 'sugar', names: ['sugar', 'brown sugar', 'white sugar'], unit: 'lb', price: 0.85 },
    { id: 'oil', names: ['oil', 'olive oil', 'vegetable oil', 'canola oil', 'cooking oil'], unit: 'oz', price: 0.22 },
    { id: 'potato', names: ['potato', 'potatoes', 'russet'], unit: 'lb', price: 0.92 },
    { id: 'sweet-potato', names: ['sweet potato', 'yam'], unit: 'lb', price: 1.15 },
    { id: 'onion', names: ['onion', 'onions', 'red onion', 'yellow onion', 'white onion'], unit: 'lb', price: 1.18, eachLb: 0.5 },
    { id: 'garlic', names: ['garlic', 'garlic clove', 'clove garlic'], unit: 'each', price: 0.55 },
    { id: 'carrot', names: ['carrot', 'carrots'], unit: 'lb', price: 1.05 },
    { id: 'celery', names: ['celery'], unit: 'each', price: 1.8 },
    { id: 'broccoli', names: ['broccoli'], unit: 'lb', price: 2.15 },
    { id: 'green-beans', names: ['green bean', 'green beans', 'string beans'], unit: 'lb', price: 2.05 },
    { id: 'asparagus', names: ['asparagus'], unit: 'lb', price: 3.4 },
    { id: 'spinach', names: ['spinach'], unit: 'oz', price: 0.28 },
    { id: 'lettuce', names: ['lettuce', 'romaine', 'salad greens', 'rocket', 'arugula', 'cabbage'], unit: 'each', price: 2.2 },
    { id: 'tomato', names: ['tomato', 'tomatoes', 'roma tomato', 'plum tomato'], unit: 'lb', price: 1.85, eachLb: 0.4 },
    { id: 'pepper', names: ['bell pepper', 'red pepper', 'green pepper', 'yellow pepper', 'capsicum'], unit: 'each', price: 1.15 },
    { id: 'jalapeno', names: ['jalapeno', 'jalapeño', 'chilli', 'chili', 'green chilli'], unit: 'each', price: 0.25 },
    { id: 'corn', names: ['corn', 'corn on the cob', 'sweet corn', 'frozen corn'], unit: 'each', price: 0.55 },
    { id: 'zucchini', names: ['zucchini', 'courgette', 'squash'], unit: 'lb', price: 1.6 },
    { id: 'mushroom', names: ['mushroom', 'mushrooms'], unit: 'oz', price: 0.32 },
    { id: 'avocado', names: ['avocado'], unit: 'each', price: 1.4 },
    { id: 'lemon', names: ['lemon', 'lemon juice', 'lime', 'lime juice'], unit: 'each', price: 0.55 },
    { id: 'apple', names: ['apple', 'apples'], unit: 'lb', price: 1.7 },
    { id: 'banana', names: ['banana'], unit: 'lb', price: 0.62 },
    { id: 'berries', names: ['blueberry', 'strawberry', 'raspberry', 'berries'], unit: 'oz', price: 0.35 },
    { id: 'beans', names: ['black bean', 'pinto', 'kidney bean', 'cannellini', 'chickpea', 'garbanzo', 'lentil', 'beans'], unit: 'each', price: 1.15 },
    { id: 'broth', names: ['chicken broth', 'beef broth', 'stock', 'broth', 'stock cube', 'bouillon'], unit: 'oz', price: 0.06 },
    { id: 'tomato-sauce', names: ['tomato sauce', 'marinara', 'crushed tomato', 'diced tomato', 'tomato paste', 'passata'], unit: 'oz', price: 0.08 },
    { id: 'soy', names: ['soy sauce', 'tamari'], unit: 'oz', price: 0.15 },
    { id: 'hotsauce', names: ['hot sauce', 'hotsauce', 'buffalo', 'sriracha'], unit: 'oz', price: 0.2 },
    { id: 'mayo', names: ['mayonnaise', 'mayo'], unit: 'oz', price: 0.14 },
    { id: 'mustard', names: ['mustard'], unit: 'oz', price: 0.12 },
    { id: 'ketchup', names: ['ketchup', 'catsup'], unit: 'oz', price: 0.1 },
    { id: 'vinegar', names: ['vinegar', 'apple cider vinegar', 'balsamic'], unit: 'oz', price: 0.12 },
    { id: 'honey', names: ['honey', 'maple syrup'], unit: 'oz', price: 0.28 },
    { id: 'breadcrumbs', names: ['breadcrumb', 'panko'], unit: 'oz', price: 0.15 },
    { id: 'tortilla-chips', names: ['tortilla chip', 'chips'], unit: 'oz', price: 0.18 },
    { id: 'tofu', names: ['tofu'], unit: 'oz', price: 0.16 },
    { id: 'salt', names: ['salt', 'kosher salt', 'sea salt'], unit: 'oz', price: 0, pantry: true },
    { id: 'black-pepper', names: ['black pepper', 'pepper', 'ground pepper'], unit: 'oz', price: 0, pantry: true },
    { id: 'spices', names: ['paprika', 'cumin', 'chili powder', 'oregano', 'thyme', 'rosemary', 'basil', 'cinnamon', 'cayenne', 'garlic powder', 'onion powder', 'italian seasoning', 'curry', 'turmeric', 'seasoning', 'spice', 'cilantro', 'parsley', 'baking powder'], unit: 'oz', price: 0.4 },
    { id: 'water', names: ['water', 'ice'], unit: 'oz', price: 0, pantry: true }
  ];

  const UNIT = {
    lb: { lb: 1, oz: 16, g: 453.6, kg: 0.4536 },
    oz: { lb: 1 / 16, oz: 1, g: 28.35, tbsp: 2, tsp: 6, cup: 1 / 8, ml: 29.57 },
    each: { each: 1, piece: 1, clove: 1, slice: 0.1, leaf: 0.05 },
    dozen: { dozen: 1, each: 1 / 12, egg: 1 / 12 },
    gal: { gal: 1, cup: 16, oz: 128, ml: 3785, l: 3.785 },
    loaf: { loaf: 1, slice: 1 / 20 }
  };

  const NAME_UNIT = {
    tbsp: 'tbsp', tablespoon: 'tbsp', tsp: 'tsp', teaspoon: 'tsp',
    cup: 'cup', cups: 'cup',
    lb: 'lb', lbs: 'lb', pound: 'lb', pounds: 'lb',
    oz: 'oz', ounce: 'oz', ounces: 'oz',
    g: 'g', gram: 'g', grams: 'g', kg: 'kg',
    ml: 'ml', l: 'l', litre: 'l', liter: 'l',
    clove: 'clove', cloves: 'clove',
    can: 'can', cans: 'can',
    bunch: 'bunch',
    slice: 'slice', slices: 'slice',
    leaf: 'leaf', leaves: 'leaf',
    pinch: 'pinch', dash: 'dash',
    dozen: 'dozen'
  };

  function storeById(id) {
    return STORES.find((s) => s.id === id) || STORES[0];
  }

  function parseLine(raw) {
    const text = String(raw || '').replace(/\s+/g, ' ').trim();
    if (!text) return null;
    const re = /^(?:(\d+)\s+)?(?:(\d+)\s*\/\s*(\d+)|([½⅓⅔¼¾⅛⅜⅝⅞⅕⅖⅗⅘⅙⅚])|(\d+\.\d+)|(\d+))?\s*([a-zA-Z]+)?\s*(.*)$/u;
    const m = text.match(re);
    let qty = 1;
    if (m) {
      if (m[1]) qty = Number(m[1]);
      else qty = 0;
      if (m[2]) qty += Number(m[2]) / Number(m[3]);
      else if (m[4]) {
        const map = { '½': 0.5, '⅓': 1 / 3, '⅔': 2 / 3, '¼': 0.25, '¾': 0.75, '⅛': 0.125, '⅜': 0.375, '⅝': 0.625, '⅞': 0.875, '⅕': 0.2, '⅖': 0.4, '⅗': 0.6, '⅘': 0.8, '⅙': 1 / 6, '⅚': 5 / 6 };
        qty += map[m[4]] || 0;
      } else if (m[5]) qty += Number(m[5]);
      else if (m[6] && !m[1]) qty += Number(m[6]);
      if (!qty) qty = 1;
    }
    let unitTok = (m && m[7] || '').toLowerCase();
    let name = (m && m[8] || text).trim();
    let unit = NAME_UNIT[unitTok] || '';
    if (!unit) {
      name = (unitTok + ' ' + name).trim();
      if (NAME_UNIT[name.split(' ')[0].toLowerCase()]) {
        unit = NAME_UNIT[name.split(' ')[0].toLowerCase()];
        name = name.split(' ').slice(1).join(' ');
      }
    }
    name = name.replace(/^(of|fresh|large|small|medium|boneless|skinless|chopped|diced|minced|sliced)\s+/i, '').trim();
    return { qty, unit, name: name || text, raw: text };
  }

  function findItem(name) {
    const n = String(name || '').toLowerCase();
    let best = null;
    let bestLen = 0;
    ITEMS.forEach((item) => {
      item.names.forEach((alias) => {
        if (n.includes(alias) && alias.length > bestLen) {
          best = item;
          bestLen = alias.length;
        }
      });
    });
    return best;
  }

  function needInItemUnit(parsed, item) {
    const qty = parsed.qty || 1;
    const u = parsed.unit;
    if (item.unit === 'each') {
      if (!u || u === 'each' || u === 'clove' || u === 'piece') return qty;
      if (u === 'lb' && item.eachLb) return qty / item.eachLb;
      if (u === 'oz') return qty / 4;
      return qty;
    }
    if (item.unit === 'dozen') {
      if (u === 'dozen') return qty;
      return qty / 12;
    }
    if (item.unit === 'loaf') return Math.max(qty / (u === 'slice' ? 20 : 1), qty > 8 ? 1 : qty);
    if (item.unit === 'gal') {
      if (u === 'gal') return qty;
      if (u === 'cup') return qty / 16;
      if (u === 'oz') return qty / 128;
      if (u === 'ml') return qty / 3785;
      if (u === 'tbsp') return qty / 256;
      return qty / 16;
    }
    if (item.unit === 'oz') {
      if (u === 'oz') return qty;
      if (u === 'lb') return qty * 16;
      if (u === 'g') return qty / 28.35;
      if (u === 'cup') return qty * 8;
      if (u === 'tbsp') return qty * 0.5;
      if (u === 'tsp') return qty / 6;
      if (u === 'ml') return qty / 29.57;
      if (u === 'can') return qty * 14;
      return qty;
    }
    /* lb */
    if (u === 'lb') return qty;
    if (u === 'oz') return qty / 16;
    if (u === 'g') return qty / 453.6;
    if (u === 'kg') return qty * 2.204;
    if (u === 'each' || u === 'clove' || !u) {
      if (item.eachLb) return qty * item.eachLb;
      return qty * 0.5;
    }
    if (u === 'can') return qty * 0.9;
    if (u === 'cup') return qty * 0.5;
    return qty * 0.5;
  }

  function packSize(item, club) {
    if (item.pantry || item.price === 0) return 0;
    if (club) {
      if (item.unit === 'lb') return item.id.includes('steak') ? 4 : 5;
      if (item.unit === 'dozen') return 2.5;
      if (item.unit === 'gal') return 2;
      if (item.unit === 'each') return 12;
      if (item.unit === 'oz') return 32;
      if (item.unit === 'loaf') return 2;
    }
    if (item.unit === 'lb') return 1;
    if (item.unit === 'dozen') return 1;
    if (item.unit === 'gal') return 1;
    if (item.unit === 'loaf') return 1;
    if (item.unit === 'each') return 1;
    if (item.unit === 'oz') return item.id === 'oil' ? 16 : 8;
    return 1;
  }

  function priceLines(ingredients, storeId, scale) {
    const store = storeById(storeId);
    const factor = scale && isFinite(scale) ? scale : 1;
    const lines = [];
    (ingredients || []).forEach((raw) => {
      const parsed = parseLine(raw);
      if (!parsed) return;
      const item = findItem(parsed.name);
      const scaledText = raw;
      if (!item) {
        lines.push({ name: parsed.name, raw: scaledText, status: 'unknown', dinner: 0, checkout: 0 });
        return;
      }
      if (item.pantry || item.price === 0) {
        lines.push({
          name: item.names[0],
          raw: scaledText,
          status: item.price === 0 && !item.pantry ? 'hunter' : 'pantry',
          dinner: 0,
          checkout: 0,
          note: item.note || 'pantry'
        });
        return;
      }
      const need = Math.max(needInItemUnit(parsed, item) * factor, 0.02);
      const unitPrice = item.price * store.mult;
      const dinner = need * unitPrice;
      const pack = packSize(item, store.club);
      const packs = pack ? Math.ceil(need / pack - 1e-9) : 1;
      const checkout = packs * pack * unitPrice;
      lines.push({
        name: item.names[0],
        raw: scaledText,
        status: 'priced',
        dinner,
        checkout,
        packs,
        pack,
        unit: item.unit,
        query: item.names[0]
      });
    });
    return lines;
  }

  function money(n) {
    return '$' + (Math.round((n || 0) * 100) / 100).toFixed(2);
  }

  function cart(groups, storeId) {
    const store = storeById(storeId);
    const all = [];
    groups.forEach((g) => {
      (g.lines || []).forEach((line) => all.push(Object.assign({ group: g.label }, line)));
    });
    const dinner = all.reduce((s, l) => s + (l.dinner || 0), 0);
    const checkout = all.reduce((s, l) => s + (l.checkout || 0), 0);
    const unknown = all.filter((l) => l.status === 'unknown').length;
    return { store, lines: all, dinner, checkout, unknown, money };
  }

  root.DWGrocery = { STORES, storeById, priceLines, cart, money };
})(window);
