/* DINNER WIZARD — family dinner picker. Vanilla JS, no build. */

const STORAGE_KEY = 'dinner-wizard-v1';
const SCREENS = ['home', 'protein', 'budget', 'people', 'difficulty', 'recipe', 'rate', 'folders'];
const KID_SERVING = 0.6;

const PROTEINS = [
  { id: 'chicken', label: 'Chicken', emoji: '🐔' },
  { id: 'turkey', label: 'Turkey', emoji: '🦃' },
  { id: 'ground beef', label: 'Ground beef', emoji: '🍔' },
  { id: 'steak', label: 'Steak', emoji: '🥩' },
  { id: 'beef roast', label: 'Beef roast', emoji: '🐄' },
  { id: 'pork chops', label: 'Pork chops', emoji: '🍖' },
  { id: 'pork', label: 'Pork', emoji: '🐖' },
  { id: 'ham', label: 'Ham', emoji: '🍖' },
  { id: 'bacon', label: 'Bacon', emoji: '🥓' },
  { id: 'sausage', label: 'Sausage', emoji: '🌭' },
  { id: 'ribs', label: 'Ribs', emoji: '🍖' },
  { id: 'lamb', label: 'Lamb', emoji: '🐑' },
  { id: 'venison', label: 'Venison', emoji: '🦌' },
  { id: 'elk', label: 'Elk', emoji: '🦌' },
  { id: 'wild hog', label: 'Wild hog', emoji: '🐗' },
  { id: 'duck', label: 'Duck', emoji: '🦆' },
  { id: 'goose', label: 'Goose', emoji: '🪿' },
  { id: 'pheasant', label: 'Pheasant', emoji: '🪶' },
  { id: 'quail', label: 'Quail', emoji: '🐦' },
  { id: 'dove', label: 'Dove', emoji: '🕊️' },
  { id: 'rabbit', label: 'Rabbit', emoji: '🐇' },
  { id: 'squirrel', label: 'Squirrel', emoji: '🐿️' },
  { id: 'fish', label: 'Fish', emoji: '🐟' },
  { id: 'catfish', label: 'Catfish', emoji: '🐟' },
  { id: 'salmon', label: 'Salmon', emoji: '🍣' },
  { id: 'trout', label: 'Trout', emoji: '🐠' },
  { id: 'tuna', label: 'Tuna', emoji: '🐟' },
  { id: 'shrimp', label: 'Shrimp', emoji: '🦐' },
  { id: 'crawfish', label: 'Crawfish', emoji: '🦞' },
  { id: 'crab', label: 'Crab', emoji: '🦀' },
  { id: 'scallops', label: 'Scallops', emoji: '🐚' },
  { id: 'eggs', label: 'Eggs', emoji: '🥚' },
  { id: 'beans', label: 'Beans', emoji: '🫘' },
  { id: 'vegetarian', label: 'Vegetarian', emoji: '🥬' },
  { id: 'leftovers', label: 'Leftovers', emoji: '🍱' }
];

const PROTEIN_ALIASES = {
  chicken: ['chicken', 'poultry'],
  turkey: ['turkey'],
  'ground beef': ['ground beef', 'hamburger', 'beef mince', 'ground chuck', 'minced beef'],
  steak: ['steak', 'ribeye', 'sirloin', 'filet mignon', 'fillet mignon', 'new york strip', 't-bone', 'tbone'],
  'beef roast': ['beef roast', 'pot roast', 'chuck roast', 'rump roast', 'brisket'],
  'pork chops': ['pork chop'],
  pork: ['pork', 'pulled pork', 'pork loin', 'pork shoulder', 'pork tenderloin'],
  ham: ['ham'],
  bacon: ['bacon'],
  sausage: ['sausage', 'kielbasa', 'andouille', 'bratwurst', 'chorizo'],
  ribs: ['rib', 'spare rib', 'baby back'],
  lamb: ['lamb', 'mutton'],
  venison: ['venison', 'deer'],
  elk: ['elk', 'wapiti'],
  'wild hog': ['wild hog', 'feral hog', 'wild pig', 'wild boar', 'boar'],
  duck: ['duck'],
  goose: ['goose'],
  pheasant: ['pheasant'],
  quail: ['quail'],
  dove: ['dove'],
  rabbit: ['rabbit', 'hare'],
  squirrel: ['squirrel'],
  fish: ['fish', 'whitefish', 'cod', 'tilapia', 'haddock', 'halibut', 'bass', 'perch', 'walleye', 'snapper', 'catfish', 'salmon', 'trout', 'tuna'],
  catfish: ['catfish'],
  salmon: ['salmon'],
  trout: ['trout'],
  tuna: ['tuna'],
  shrimp: ['shrimp', 'prawn'],
  crawfish: ['crawfish', 'crayfish', 'crawdad'],
  crab: ['crab'],
  scallops: ['scallop'],
  eggs: ['egg'],
  beans: ['bean', 'lentil', 'chickpea', 'garbanzo', 'black bean', 'pinto', 'kidney bean'],
  vegetarian: ['vegetarian', 'vegan', 'veggie', 'meatless'],
  leftovers: ['leftover']
};

const BUDGETS = [
  { n: 1, label: 'Tight / pantry', blurb: 'What we already have' },
  { n: 2, label: 'Cheap weeknight', blurb: 'Simple grocery run' },
  { n: 3, label: 'Normal grocery', blurb: 'Regular dinner spend' },
  { n: 4, label: 'Nice dinner', blurb: 'A little extra' },
  { n: 5, label: 'Splurge', blurb: 'Worth it tonight' }
];

const DIFFS = [
  { n: 1, label: 'Easy', blurb: 'Low effort, weeknight-proof' },
  { n: 2, label: 'Weeknight', blurb: 'Normal cooking energy' },
  { n: 3, label: 'Project', blurb: 'I have time to cook' }
];

const UNICODE_FRAC = {
  '½': 0.5, '⅓': 1 / 3, '⅔': 2 / 3, '¼': 0.25, '¾': 0.75,
  '⅛': 0.125, '⅜': 0.375, '⅝': 0.625, '⅞': 0.875,
  '⅕': 0.2, '⅖': 0.4, '⅗': 0.6, '⅘': 0.8, '⅙': 1 / 6, '⅚': 5 / 6
};

const FRAC_GLYPH = {
  0.125: '⅛', 0.25: '¼', 0.375: '⅜', 0.5: '½',
  0.625: '⅝', 0.75: '¾', 0.875: '⅞'
};

const state = {
  screen: 'home',
  recipes: [],
  libraryStatus: 'loading',
  filters: {
    protein: null,
    budget: 3,
    adults: 2,
    children: 0,
    difficulty: 2
  },
  skippedIds: new Set(),
  currentRecipe: null,
  pickMeta: null,
  recipeMode: 'pick',
  folderFilter: 'loved',
  store: { ratings: {}, tonight: null, history: [] }
};

let libraryTimer = null;

/* ---------- tiny utils ---------- */

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

function safeUrl(raw) {
  if (!raw) return '';
  try {
    const url = new URL(String(raw), location.href);
    if (url.protocol === 'http:') url.protocol = 'https:';
    if (url.protocol === 'https:') return url.href;
  } catch (err) {
    return '';
  }
  return '';
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function eaters() {
  return state.filters.adults + state.filters.children * KID_SERVING;
}

function tidyProtein(value) {
  return String(value || '').toLowerCase().replace(/-/g, ' ').trim();
}

const BEEF_IDS = new Set(['ground beef', 'steak', 'beef roast']);

function proteinLabel(protein) {
  if (!protein || protein === 'surprise') return 'Surprise me';
  if (typeof protein === 'object') return protein.custom || 'Other';
  const found = PROTEINS.find((p) => p.id === protein);
  return found ? found.label : protein;
}

function budgetLabel(n) {
  const row = BUDGETS.find((b) => b.n === Number(n));
  return row ? row.label : 'Budget ' + n;
}

function diffLabel(n) {
  const row = DIFFS.find((d) => d.n === Number(n));
  return row ? row.label : 'Level ' + n;
}

function byId(id) {
  return state.recipes.find((r) => r.id === id) || null;
}

function folderCount(kind) {
  return Object.values(state.store.ratings).filter((v) => v === kind).length;
}

function folderIds(kind) {
  return Object.keys(state.store.ratings).filter((id) => state.store.ratings[id] === kind);
}

function formatTime(value) {
  if (value == null || value === '') return '';
  if (typeof value === 'number' && isFinite(value)) return value + ' min';
  const text = String(value).trim();
  if (/^\d+$/.test(text)) return text + ' min';
  return text;
}

function parseMinutes(value) {
  if (typeof value === 'number' && isFinite(value)) return value;
  const m = String(value || '').match(/(\d+)\s*(h|hr|hour)/i);
  const n = String(value || '').match(/(\d+)\s*(m|min)?/i);
  let mins = 0;
  if (m) mins += Number(m[1]) * 60;
  if (n && !m) mins += Number(n[1]);
  else if (n && m && /min/i.test(String(value))) mins += Number(n[1]);
  return mins || 0;
}

/* ---------- storage ---------- */

function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    state.store = {
      ratings: data.ratings && typeof data.ratings === 'object' ? data.ratings : {},
      tonight: data.tonight || null,
      history: Array.isArray(data.history) ? data.history : []
    };
    const last = state.store.tonight || state.store.history[state.store.history.length - 1];
    if (last && last.filters) {
      const f = last.filters;
      if (typeof f.adults === 'number') state.filters.adults = clamp(f.adults, 0, 20);
      if (typeof f.children === 'number') state.filters.children = clamp(f.children, 0, 20);
      if (eaters() < 1) state.filters.adults = 2;
    }
  } catch (err) {
    state.store = { ratings: {}, tonight: null, history: [] };
  }
}

function saveStore() {
  const payload = {
    ratings: state.store.ratings,
    tonight: state.store.tonight,
    history: state.store.history.slice(-80)
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    /* quota — keep going */
  }
}

/* ---------- recipe loading ---------- */

function extractList(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.recipes)) return data.recipes;
  if (Array.isArray(data.meals)) return data.meals;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.data)) return data.data;
  if (typeof data === 'object' && (data.title || data.strMeal || data.name || data.idMeal)) {
    return [data];
  }
  const vals = Object.values(data);
  if (vals.length && vals.every((v) => v && typeof v === 'object' && !Array.isArray(v))) {
    return vals;
  }
  return [];
}

function asStringList(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item === 'string') return item.trim();
      if (!item || typeof item !== 'object') return String(item);
      const name = item.name || item.item || item.ingredient || item.text || '';
      const qty = [item.amount, item.measure, item.quantity, item.qty, item.unit]
        .filter((p) => p != null && String(p).trim() !== '')
        .join(' ');
      return (qty + ' ' + name).trim();
    }).filter(Boolean);
  }
  return String(value).split(/\r?\n|;/).map((s) => s.trim()).filter(Boolean);
}

function mealDbIngredients(raw) {
  const list = [];
  for (let n = 1; n <= 30; n += 1) {
    const ing = raw['strIngredient' + n];
    const mea = raw['strMeasure' + n];
    if (ing && String(ing).trim()) {
      list.push((String(mea || '').trim() + ' ' + String(ing).trim()).trim());
    }
  }
  return list;
}

function toSteps(raw) {
  if (Array.isArray(raw.steps)) return raw.steps.map((s) => String(s).trim()).filter(Boolean);
  if (Array.isArray(raw.instructions)) return raw.instructions.map((s) => String(s).trim()).filter(Boolean);
  if (Array.isArray(raw.directions)) return raw.directions.map((s) => String(s).trim()).filter(Boolean);
  const text = raw.strInstructions || raw.instructions || raw.directions || raw.method || '';
  return String(text)
    .split(/\r?\n+/)
    .map((line) => line.replace(/^\s*\d+[\.\)]\s*/, '').trim())
    .filter(Boolean);
}

function slugId(title, fallback) {
  const base = String(title || fallback || 'recipe')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
  return base || fallback || 'recipe';
}

function inferProteins(hay) {
  const found = [];
  PROTEINS.forEach((p) => {
    const aliases = PROTEIN_ALIASES[p.id] || [p.id];
    if (aliases.some((a) => includesTerm(hay, a))) found.push(p.id);
  });
  return found;
}

function inferBudget(hay, given) {
  const n = Number(given);
  if (n >= 1 && n <= 5) return n;
  if (/lobster|scallop|filet|prime rib|crab cake|lamb rack/.test(hay)) return 5;
  if (/steak|salmon|shrimp|prime|brisket|crab|lamb/.test(hay)) return 4;
  if (/leftover|pantry/.test(hay)) return 1;
  if (/bean|lentil|rice|pasta|egg|potato|chickpea|tuna can|canned/.test(hay)) return 2;
  return 3;
}

function inferDifficulty(raw, hay, steps, minutes) {
  const n = Number(raw.difficulty ?? raw.level ?? raw.skill);
  if (n >= 1 && n <= 3) return n;
  const label = String(raw.difficulty || raw.strTags || hay).toLowerCase();
  if (/project|advanced|slow.?cook|overnight|braise/.test(label) || minutes >= 90 || steps.length >= 12) return 3;
  if (/easy|quick|simple|30 minute/.test(label) || (minutes && minutes <= 30) || steps.length <= 5) return 1;
  return 2;
}

function normalizeRecipe(raw, sourceTag) {
  if (!raw || typeof raw !== 'object') return null;
  const title = raw.title || raw.strMeal || raw.name || raw.recipeName || '';
  if (!title) return null;
  const ingredients = asStringList(raw.ingredients).length
    ? asStringList(raw.ingredients)
    : mealDbIngredients(raw);
  const steps = toSteps(raw);
  const hay = [title, raw.style, raw.strCategory, raw.strArea, raw.strTags, ...(raw.proteins || []), ...ingredients]
    .join(' ')
    .toLowerCase();
  const proteins = Array.isArray(raw.proteins)
    ? raw.proteins.map(tidyProtein)
    : raw.protein
      ? [tidyProtein(raw.protein)]
      : inferProteins(hay);
  const servings = Number(raw.servings || raw.baseServings || raw.yield || raw.strYield || raw.serves) || 4;
  const sourceUrl = raw.sourceUrl || raw.url || raw.link || raw.strSource || raw.strYoutube || '';
  let source = raw.source || sourceTag || 'Public source';
  if (!raw.source && raw.strSource && !/^https?:/i.test(String(raw.strSource))) {
    source = raw.strSource;
  } else if (typeof source === 'string' && /^https?:/i.test(source)) {
    try { source = new URL(source).hostname.replace(/^www\./, ''); } catch (err) { source = sourceTag; }
  }
  const time = raw.time || raw.timeMin || raw.timeMinutes || raw.minutes || raw.readyInMinutes || raw.cookTime || raw.totalTime || raw.strTime || '';
  const id = String(raw.id || raw.idMeal || slugId(title, sourceTag));
  return {
    id,
    title: String(title).trim(),
    source: String(source || sourceTag),
    sourceUrl: String(sourceUrl || ''),
    time,
    servings,
    style: raw.style || raw.category || raw.strCategory || raw.cuisine || raw.strArea || '',
    proteins,
    budget: inferBudget(hay, raw.budget ?? raw.cost ?? raw.price),
    difficulty: inferDifficulty(raw, hay, steps, parseMinutes(time)),
    ingredients,
    steps,
    image: raw.image || raw.strMealThumb || raw.imageUrl || raw.thumb || '',
    tags: asStringList(raw.tags || raw.strTags)
  };
}

function normalizeAll(list, sourceTag) {
  const out = [];
  list.forEach((raw) => {
    const rec = normalizeRecipe(raw, sourceTag);
    if (rec) out.push(rec);
  });
  return out;
}

function dedupe(recipes) {
  const seen = new Set();
  return recipes.filter((r) => {
    const key = r.id || r.title.toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function fetchJson(url) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('missing ' + url);
  return res.json();
}

async function loadRecipes() {
  try {
    const data = await fetchJson('./data/recipes.json');
    return dedupe(normalizeAll(extractList(data), 'library'));
  } catch (err) {
    /* fall through to source files */
  }

  const files = [
    ['./data/mealdb.json', 'TheMealDB'],
    ['./data/usda.json', 'USDA MyPlate'],
    ['./data/wildgame.json', 'Wildlife agency']
  ];
  const results = await Promise.allSettled(files.map(([url]) => fetchJson(url)));
  const recipes = [];
  results.forEach((result, i) => {
    if (result.status !== 'fulfilled') return;
    recipes.push(...normalizeAll(extractList(result.value), files[i][1]));
  });
  return dedupe(recipes);
}

async function refreshLibrary() {
  state.libraryStatus = state.recipes.length ? 'ready' : 'loading';
  try {
    const recipes = await loadRecipes();
    state.recipes = recipes;
    state.libraryStatus = recipes.length ? 'ready' : 'empty';
  } catch (err) {
    state.libraryStatus = state.recipes.length ? 'ready' : 'empty';
  }
  if (!state.currentRecipe && state.store.tonight) {
    const rec = byId(state.store.tonight.id);
    if (rec && (state.screen === 'rate' || state.screen === 'recipe')) state.currentRecipe = rec;
  }
  render();
  if (state.recipes.length && libraryTimer) {
    clearInterval(libraryTimer);
    libraryTimer = null;
  }
}

function startLibraryWatch() {
  if (libraryTimer) return;
  let ticks = 0;
  libraryTimer = setInterval(() => {
    ticks += 1;
    if (state.recipes.length || ticks > 40) {
      clearInterval(libraryTimer);
      libraryTimer = null;
      return;
    }
    refreshLibrary();
  }, 15000);
}

/* ---------- matching & scaling ---------- */

function canon(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function includesTerm(hay, term) {
  const t = canon(term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (!t) return false;
  return new RegExp('(^|[^a-z])' + t + 's?(?![a-z])', 'i').test(canon(hay));
}

function haystack(recipe) {
  return [
    recipe.title,
    recipe.style,
    ...(recipe.proteins || []),
    ...(recipe.ingredients || []),
    ...(recipe.tags || [])
  ].join(' ').toLowerCase();
}

function matchesProtein(recipe, protein) {
  if (!protein || protein === 'surprise') return true;
  const needle = tidyProtein(typeof protein === 'object' ? protein.custom : protein);
  if (!needle) return true;
  const recProts = (recipe.proteins || []).map(tidyProtein);
  if (recProts.includes(needle)) return true;
  if (BEEF_IDS.has(needle) && recProts.includes('beef')) return true;
  if (needle === 'pork chops' && recProts.includes('pork')) return true;
  const hay = haystack(recipe).replace(/-/g, ' ');
  const aliases = PROTEIN_ALIASES[needle] || [needle];
  return aliases.some((alias) => includesTerm(hay, alias));
}

function getPool(maxBudget, maxDiff) {
  const never = new Set(
    Object.keys(state.store.ratings).filter((id) => state.store.ratings[id] === 'never')
  );
  return state.recipes.filter((recipe) => {
    if (state.skippedIds.has(recipe.id) || never.has(recipe.id)) return false;
    if (!matchesProtein(recipe, state.filters.protein)) return false;
    if ((recipe.budget || 3) > maxBudget) return false;
    if ((recipe.difficulty || 2) > maxDiff) return false;
    return true;
  });
}

function pickNext() {
  if (!state.recipes.length) {
    state.currentRecipe = null;
    state.pickMeta = { emptyLibrary: true };
    return;
  }

  let maxB = state.filters.budget;
  let maxD = state.filters.difficulty;
  const loosened = { budget: false, difficulty: false };

  let pool = getPool(maxB, maxD);
  if (!pool.length) {
    maxB = 5;
    loosened.budget = true;
    pool = getPool(maxB, maxD);
  }
  if (!pool.length) {
    maxD = 3;
    loosened.difficulty = true;
    pool = getPool(maxB, maxD);
  }

  if (!pool.length) {
    state.currentRecipe = null;
    state.pickMeta = { noMatch: true, loosened, skippedAll: state.skippedIds.size > 0 };
    return;
  }

  const want = state.filters.budget;
  let pick = null;
  for (let dist = 0; dist <= 5; dist += 1) {
    const group = pool.filter((r) => Math.abs((r.budget || 3) - want) === dist);
    if (group.length) {
      pick = group[Math.floor(Math.random() * group.length)];
      break;
    }
  }

  state.currentRecipe = pick || pool[0];
  state.pickMeta = { loosened, remaining: pool.length };
}

function parseLeadingQty(str) {
  const s = String(str).trim();
  const re = /^(?:(\d+)\s+)?(?:(\d+)\s*\/\s*(\d+)|([½⅓⅔¼¾⅛⅜⅝⅞⅕⅖⅗⅘⅙⅚])|(\d+\.\d+)|(\d+))/u;
  const m = s.match(re);
  if (!m) return null;
  let value = 0;
  if (m[1]) value += Number(m[1]);
  if (m[2]) value += Number(m[2]) / Number(m[3]);
  else if (m[4]) value += UNICODE_FRAC[m[4]];
  else if (m[5]) value += Number(m[5]);
  else if (m[6] && !m[1]) value += Number(m[6]);
  return { value, length: m[0].length };
}

function formatQty(n) {
  if (!isFinite(n) || n <= 0) return n === 0 ? '0' : '';
  const rounded = Math.round(n * 8) / 8;
  if (rounded === 0 && n > 0) return 'pinch';
  const whole = Math.floor(rounded + 1e-9);
  const frac = Math.round((rounded - whole) * 8) / 8;
  if (Math.abs(frac) < 0.01) return String(whole);
  const glyph = FRAC_GLYPH[frac] || String(frac);
  return whole ? whole + ' ' + glyph : glyph;
}

function scaleIngredient(text, factor) {
  if (!text || !isFinite(factor) || factor === 1) return text;
  const parsed = parseLeadingQty(text);
  if (!parsed) return text;
  return formatQty(parsed.value * factor) + text.slice(parsed.length);
}

function scaleFactor(recipe) {
  const serves = Number(recipe.servings) || 4;
  const need = eaters() || 1;
  return need / serves;
}

/* ---------- navigation ---------- */

function go(screen, push) {
  if (!SCREENS.includes(screen)) screen = 'home';
  state.screen = screen;
  if (push !== false) {
    const hash = '#' + screen;
    if (location.hash !== hash) history.pushState({ screen }, '', hash);
  }
  window.scrollTo(0, 0);
  render();
}

function back() {
  const order = ['home', 'protein', 'budget', 'people', 'difficulty', 'recipe', 'rate'];
  if (state.screen === 'folders') {
    go('home');
    return;
  }
  if (state.screen === 'recipe' && state.recipeMode === 'browse') {
    go('folders');
    return;
  }
  const i = order.indexOf(state.screen);
  go(i > 0 ? order[i - 1] : 'home');
}

function startDinner() {
  state.skippedIds = new Set();
  state.currentRecipe = null;
  state.pickMeta = null;
  state.recipeMode = 'pick';
  state.filters.protein = null;
  go('protein');
}

function chooseProtein(id) {
  state.filters.protein = id;
  go('budget');
}

function chooseOtherProtein() {
  const input = document.getElementById('other-protein');
  const value = (input && input.value || '').trim();
  if (!value) {
    if (input) input.focus();
    return;
  }
  state.filters.protein = { custom: value };
  go('budget');
}

function chooseBudget(n) {
  state.filters.budget = Number(n);
  go('people');
}

function chooseDifficulty(n) {
  state.filters.difficulty = Number(n);
  state.recipeMode = 'pick';
  pickNext();
  go('recipe');
}

function skipRecipe() {
  if (state.currentRecipe) state.skippedIds.add(state.currentRecipe.id);
  pickNext();
  render();
  window.scrollTo(0, 0);
}

function cookThis() {
  const rec = state.currentRecipe;
  if (!rec) return;
  const entry = {
    id: rec.id,
    pickedAt: new Date().toISOString(),
    filters: {
      protein: state.filters.protein,
      budget: state.filters.budget,
      adults: state.filters.adults,
      children: state.filters.children,
      difficulty: state.filters.difficulty
    }
  };
  state.store.tonight = entry;
  state.store.history.push(entry);
  saveStore();
  go('home');
}

function rateTonight(kind) {
  const rec = state.currentRecipe || (state.store.tonight && byId(state.store.tonight.id));
  if (!rec) {
    go('home');
    return;
  }
  state.store.ratings[rec.id] = kind;
  const hist = state.store.history;
  for (let i = hist.length - 1; i >= 0; i -= 1) {
    if (hist[i].id === rec.id) {
      hist[i].rating = kind;
      break;
    }
  }
  if (state.store.tonight && state.store.tonight.id === rec.id) {
    state.store.tonight.rating = kind;
  }
  saveStore();
  go('home');
}

function openFolders(kind) {
  state.folderFilter = kind || 'loved';
  go('folders');
}

function openFolderRecipe(id) {
  const rec = byId(id);
  if (!rec) return;
  state.currentRecipe = rec;
  state.recipeMode = 'browse';
  state.pickMeta = { browse: true };
  go('recipe');
}

function nudge(field, delta) {
  const next = clamp((state.filters[field] || 0) + delta, 0, 20);
  const other = field === 'adults' ? 'children' : 'adults';
  const otherVal = state.filters[other] || 0;
  if (field === 'adults' && next + otherVal * KID_SERVING < 1 && delta < 0) return;
  if (field === 'children' && state.filters.adults + next * KID_SERVING < 1 && delta < 0) return;
  state.filters[field] = next;
  if (eaters() < 1) return;
  render();
}

/* ---------- render ---------- */

function iconSrc() {
  return './icons/wizard.jpg';
}

function stepDots(step) {
  return '<div class="step-dots" aria-hidden="true">' +
    [1, 2, 3, 4].map((n) => {
      const cls = n === step ? 'on' : (n < step ? 'done' : '');
      return '<span class="' + cls + '"></span>';
    }).join('') +
    '</div>';
}

function renderTop() {
  const top = document.getElementById('top');
  if (state.screen === 'home') {
    top.innerHTML =
      '<div class="hero">' +
        '<img class="hero-icon" src="' + iconSrc() + '" alt="DINNER WIZARD" width="148" height="148" onerror="this.src=\'./icons/icon.svg\'">' +
        '<h1>DINNER WIZARD</h1>' +
        '<p class="tagline">You tap. The hat decides.</p>' +
      '</div>';
    return;
  }
  const backLabel = state.screen === 'folders' || state.recipeMode === 'browse' ? 'Home' : 'Back';
  top.innerHTML =
    '<div class="topbar">' +
      '<button class="icon-btn" data-act="back" aria-label="' + backLabel + '">←</button>' +
      '<p class="brand">DINNER WIZARD</p>' +
      '<img class="mark" src="' + iconSrc() + '" alt="" width="36" height="36" onerror="this.src=\'./icons/icon.svg\'">' +
    '</div>';
}

function renderHome() {
  const n = state.recipes.length;
  const status = n
    ? '<span class="status-pill ready">' + n + ' recipe' + (n === 1 ? '' : 's') + ' ready</span>'
    : '<span class="status-pill loading">Library loading… pantry is being stocked</span>';
  const tonight = state.store.tonight && byId(state.store.tonight.id);
  const tonightRated = tonight && state.store.ratings[tonight.id];
  let tonightHtml = '';
  if (tonight) {
    tonightHtml =
      '<article class="tonight-card">' +
        '<p class="kicker">Tonight</p>' +
        '<h3>' + esc(tonight.title) + '</h3>' +
        (tonightRated
          ? '<p class="muted">Filed under ' + esc(tonightRated === 'loved' ? 'Loved it' : tonightRated === 'maybe' ? 'Maybe' : 'Never again') + '.</p>'
          : '<p class="muted">Pending a rating — whenever you are ready.</p>') +
        '<div class="btn-row">' +
          '<button class="btn gold" data-act="open-recipe" data-id="' + esc(tonight.id) + '">See the recipe</button>' +
          (tonightRated ? '' : '<button class="btn forest" data-act="go-rate">Rate tonight’s dinner</button>') +
        '</div>' +
      '</article>';
  }

  return (
    '<div class="home-pad">' +
      status +
      '<p class="lead">No scrolling ten tabs. No “what do you want?” One button.</p>' +
      '<button class="btn-dinner" data-act="start">What’s for dinner?</button>' +
      tonightHtml +
      '<p class="kicker">Folders</p>' +
      '<div class="folder-grid">' +
        folderButton('loved', '💛', 'Loved it') +
        folderButton('maybe', '🤔', 'Maybe') +
        folderButton('never', '🚫', 'Never again') +
      '</div>' +
      '<p class="install-hint">Add DINNER WIZARD to your home screen from the browser menu. It works like a little kitchen app.</p>' +
    '</div>'
  );
}

function folderButton(kind, emoji, name) {
  return (
    '<button class="folder-card" data-act="folders" data-kind="' + kind + '">' +
      '<span class="emoji">' + emoji + '</span>' +
      '<span class="name">' + name + '</span>' +
      '<span class="count">' + folderCount(kind) + '</span>' +
    '</button>'
  );
}

function renderProtein() {
  return (
    stepDots(1) +
    '<h2 class="screen-title">What’s the protein?</h2>' +
    '<p class="lead">Pick one. Or let the hat surprise you.</p>' +
    '<button class="btn surprise" data-act="protein" data-id="surprise">✨ Surprise me</button>' +
    '<div class="protein-grid">' +
      PROTEINS.map((p) =>
        '<button class="protein" data-act="protein" data-id="' + esc(p.id) + '" aria-label="' + esc(p.label) + '">' +
          '<span class="emoji">' + p.emoji + '</span>' +
          '<span class="plabel">' + esc(p.label) + '</span>' +
        '</button>'
      ).join('') +
    '</div>' +
    '<div class="other-card">' +
      '<label for="other-protein">Other</label>' +
      '<div class="other-row">' +
        '<input id="other-protein" type="text" maxlength="40" placeholder="e.g. bison, tofu, goat…" autocomplete="off">' +
        '<button class="btn gold" data-act="protein-other">Use</button>' +
      '</div>' +
    '</div>'
  );
}

function renderBudget() {
  return (
    stepDots(2) +
    '<h2 class="screen-title">What’s the budget?</h2>' +
    '<p class="lead">We’ll stay at or under this. Closer is better.</p>' +
    '<div class="choice-list">' +
      BUDGETS.map((b) =>
        '<button class="choice" data-act="budget" data-n="' + b.n + '">' +
          '<span class="num">' + b.n + '</span>' +
          '<span class="clabel">' + esc(b.label) + '</span>' +
          '<span class="blurb">' + esc(b.blurb) + '</span>' +
        '</button>'
      ).join('') +
    '</div>'
  );
}

function renderPeople() {
  const a = state.filters.adults;
  const c = state.filters.children;
  const total = eaters();
  const canMinusAdults = a > 0 && (a - 1 + c * KID_SERVING) >= 1;
  const canMinusKids = c > 0 && (a + (c - 1) * KID_SERVING) >= 1;
  return (
    stepDots(3) +
    '<h2 class="screen-title">Who’s eating?</h2>' +
    '<p class="lead">Kids count as 0.6 servings when we scale the recipe.</p>' +
    '<div class="stepper-card">' +
      stepperRow('adults', 'Adults', 'Full servings', a, canMinusAdults) +
      stepperRow('children', 'Children', '0.6 serving each', c, canMinusKids) +
    '</div>' +
    '<p class="scale-note">That’s about <strong>' + (Math.round(total * 10) / 10) + ' servings</strong>.</p>' +
    '<button class="btn gold" data-act="go" data-screen="difficulty">Continue</button>'
  );
}

function stepperRow(field, label, sub, value, canMinus) {
  return (
    '<div class="stepper">' +
      '<div><span class="who">' + label + '</span><span class="sub">' + sub + '</span></div>' +
      '<button class="nudge" data-act="nudge" data-field="' + field + '" data-delta="-1" aria-label="Fewer ' + label + '"' + (canMinus ? '' : ' disabled') + '>−</button>' +
      '<span class="n" aria-live="polite">' + value + '</span>' +
      '<button class="nudge" data-act="nudge" data-field="' + field + '" data-delta="1" aria-label="More ' + label + '">+</button>' +
    '</div>'
  );
}

function renderDifficulty() {
  return (
    stepDots(4) +
    '<h2 class="screen-title">How ambitious?</h2>' +
    '<p class="lead">This is the <em>most</em> effort you’re willing to cook tonight.</p>' +
    '<div class="choice-list">' +
      DIFFS.map((d) =>
        '<button class="choice" data-act="difficulty" data-n="' + d.n + '">' +
          '<span class="num">' + d.n + '</span>' +
          '<span class="clabel">' + esc(d.label) + '</span>' +
          '<span class="blurb">' + esc(d.blurb) + '</span>' +
        '</button>'
      ).join('') +
    '</div>'
  );
}

function renderRecipe() {
  if (state.pickMeta && state.pickMeta.emptyLibrary) {
    return (
      '<div class="empty">' +
        '<img class="hat" src="' + iconSrc() + '" alt="" onerror="this.src=\'./icons/icon.svg\'">' +
        '<h2 class="screen-title">Library loading</h2>' +
        '<p class="lead">Other wizards are stocking the pantry. Try again in a moment.</p>' +
        '<button class="btn gold" data-act="retry">Try again</button>' +
        '<button class="linkish" data-act="go" data-screen="home">Back home</button>' +
      '</div>'
    );
  }

  if (state.pickMeta && state.pickMeta.noMatch) {
    const note = state.pickMeta.skippedAll
      ? 'You’ve skipped the rest of the matches.'
      : (state.pickMeta.loosened && (state.pickMeta.loosened.budget || state.pickMeta.loosened.difficulty)
        ? 'We already loosened budget and difficulty.'
        : '');
    return (
      '<div class="empty">' +
        '<h2 class="screen-title">Nothing in the hat</h2>' +
        '<p class="lead">No matches for ' + esc(proteinLabel(state.filters.protein)) + '. ' + note + ' Try another protein, or Surprise Me.</p>' +
        '<div class="btn-row">' +
          '<button class="btn gold" data-act="go" data-screen="protein">Pick a protein</button>' +
          '<button class="btn forest" data-act="protein" data-id="surprise">✨ Surprise me</button>' +
        '</div>' +
      '</div>'
    );
  }

  const recipe = state.currentRecipe;
  if (!recipe) {
    return '<div class="empty"><p class="lead">No recipe yet.</p><button class="btn gold" data-act="go" data-screen="home">Home</button></div>';
  }

  const browse = state.recipeMode === 'browse';
  const factor = browse ? 1 : scaleFactor(recipe);
  const scaledServings = browse
    ? recipe.servings
    : Math.max(1, Math.round((recipe.servings || 4) * factor * 10) / 10);
  const img = safeUrl(recipe.image);
  const url = safeUrl(recipe.sourceUrl);
  const time = formatTime(recipe.time);
  let banner = '';
  if (!browse && state.pickMeta && state.pickMeta.loosened) {
    const bits = [];
    if (state.pickMeta.loosened.budget) bits.push('budget');
    if (state.pickMeta.loosened.difficulty) bits.push('difficulty');
    if (bits.length) {
      banner = '<p class="banner">We loosened the ' + bits.join(' and ') + ' to find a match.</p>';
    }
  }

  const chips = browse
    ? ''
    : '<div class="chips">' +
        '<span class="chip">' + esc(proteinLabel(state.filters.protein)) + '</span>' +
        '<span class="chip">' + esc(budgetLabel(state.filters.budget)) + '</span>' +
        '<span class="chip">' + esc(diffLabel(state.filters.difficulty)) + '</span>' +
        '<span class="chip">' + state.filters.adults + ' adult' + (state.filters.adults === 1 ? '' : 's') +
          (state.filters.children ? ' · ' + state.filters.children + ' kid' + (state.filters.children === 1 ? '' : 's') : '') +
        '</span>' +
      '</div>';

  const ingredients = (recipe.ingredients || []).map((line) =>
    '<li>' + esc(browse ? line : scaleIngredient(line, factor)) + '</li>'
  ).join('');

  const steps = (recipe.steps || []).map((line) => '<li><span>' + esc(line) + '</span></li>').join('');

  const actions = browse
    ? '<div class="btn-row">' +
        '<button class="btn gold" data-act="go" data-screen="folders">Back to folders</button>' +
      '</div>' +
      renderRateButtons(true)
    : '<div class="btn-row">' +
        '<button class="btn ghost" data-act="skip">Skip — try another</button>' +
        '<button class="btn gold" data-act="cook">We’ll cook this</button>' +
      '</div>';

  return (
    '<article class="recipe">' +
      banner +
      chips +
      (img ? '<img class="dish" src="' + esc(img) + '" alt="" onerror="this.remove()">' : '') +
      '<h2>' + esc(recipe.title) + '</h2>' +
      '<p class="meta">' +
        (time ? '<span>⏱ ' + esc(time) + '</span>' : '') +
        '<span>🍽 Serves ' + esc(String(scaledServings)) + (browse || factor === 1 ? '' : ' (scaled)') + '</span>' +
        (recipe.style ? '<span>✦ ' + esc(recipe.style) + '</span>' : '') +
      '</p>' +
      '<p class="source">Source: ' +
        (url
          ? '<a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + esc(recipe.source || 'Open link') + '</a>'
          : esc(recipe.source || 'Public source')) +
      '</p>' +
      '<h3 class="block-title">Ingredients</h3>' +
      (ingredients ? '<ul class="ingredients">' + ingredients + '</ul>' : '<p class="muted">No ingredient list in this record.</p>') +
      '<h3 class="block-title">Steps</h3>' +
      (steps ? '<ol class="steps">' + steps + '</ol>' : '<p class="muted">No steps in this record.</p>') +
      actions +
    '</article>'
  );
}

function renderRateButtons(compact) {
  return (
    '<div class="rate-grid' + (compact ? ' compact' : '') + '">' +
      '<button class="rate-btn never" data-act="rate" data-kind="never">🚫 Never again</button>' +
      '<button class="rate-btn maybe" data-act="rate" data-kind="maybe">🤔 Maybe</button>' +
      '<button class="rate-btn loved" data-act="rate" data-kind="loved">💛 Loved it</button>' +
    '</div>'
  );
}

function renderRate() {
  const rec = state.currentRecipe || (state.store.tonight && byId(state.store.tonight.id));
  if (!rec) {
    return (
      '<div class="empty">' +
        '<h2 class="screen-title">Nothing to rate yet</h2>' +
        '<p class="lead">Pick tonight’s dinner first. You can rate it later from home.</p>' +
        '<button class="btn gold" data-act="start">What’s for dinner?</button>' +
      '</div>'
    );
  }
  return (
    '<p class="kicker">How was it?</p>' +
    '<h2 class="screen-title">' + esc(rec.title) + '</h2>' +
    '<p class="lead">This files it into a folder so the hat learns the house rules.</p>' +
    renderRateButtons(false) +
    '<button class="linkish" data-act="go" data-screen="home">I’ll rate later</button>'
  );
}

function renderFolders() {
  const kind = state.folderFilter;
  const names = { loved: 'Loved it', maybe: 'Maybe', never: 'Never again' };
  const ids = folderIds(kind);
  const tabs =
    '<div class="btn-row two" style="margin-bottom:16px">' +
      '<button class="btn ' + (kind === 'loved' ? 'gold' : 'ghost') + '" data-act="folders" data-kind="loved">Loved</button>' +
      '<button class="btn ' + (kind === 'maybe' ? 'gold' : 'ghost') + '" data-act="folders" data-kind="maybe">Maybe</button>' +
    '</div>' +
    '<button class="btn ' + (kind === 'never' ? 'gold' : 'ghost') + '" data-act="folders" data-kind="never" style="margin-bottom:16px">Never again</button>';

  if (!ids.length) {
    return (
      '<h2 class="screen-title">' + esc(names[kind]) + '</h2>' +
      tabs +
      '<div class="empty"><p class="lead">Nothing here yet. Cook something, then tell the hat how it went.</p></div>'
    );
  }

  const rows = ids.map((id) => {
    const rec = byId(id);
    const title = rec ? rec.title : 'Recipe unavailable (library still loading)';
    const img = rec ? safeUrl(rec.image) : '';
    return (
      '<button class="recipe-row" data-act="open-recipe" data-id="' + esc(id) + '">' +
        (img
          ? '<img class="thumb" src="' + esc(img) + '" alt="" onerror="this.remove()">'
          : '<span class="thumb" aria-hidden="true"></span>') +
        '<span><span class="title">' + esc(title) + '</span>' +
        (rec && rec.style ? '<span class="sub"><br>' + esc(rec.style) + '</span>' : '') +
        '</span>' +
      '</button>'
    );
  }).join('');

  return '<h2 class="screen-title">' + esc(names[kind]) + '</h2>' + tabs + rows;
}

function renderMain() {
  const main = document.getElementById('main');
  const screens = {
    home: renderHome,
    protein: renderProtein,
    budget: renderBudget,
    people: renderPeople,
    difficulty: renderDifficulty,
    recipe: renderRecipe,
    rate: renderRate,
    folders: renderFolders
  };
  const view = screens[state.screen] || renderHome;
  main.innerHTML = view();
}

function render() {
  renderTop();
  renderMain();
  document.title = state.screen === 'home' ? 'DINNER WIZARD' : 'DINNER WIZARD · ' + state.screen;
}

/* ---------- events ---------- */

function onClick(event) {
  const btn = event.target.closest('[data-act]');
  if (!btn) return;
  const act = btn.dataset.act;
  if (act === 'start') startDinner();
  else if (act === 'back') back();
  else if (act === 'go') go(btn.dataset.screen);
  else if (act === 'protein') {
    if (btn.dataset.id === 'surprise' && state.screen === 'recipe') {
      state.filters.protein = 'surprise';
      state.skippedIds = new Set();
      state.recipeMode = 'pick';
      pickNext();
      go('recipe');
    } else {
      chooseProtein(btn.dataset.id);
    }
  }
  else if (act === 'protein-other') chooseOtherProtein();
  else if (act === 'budget') chooseBudget(btn.dataset.n);
  else if (act === 'difficulty') chooseDifficulty(btn.dataset.n);
  else if (act === 'nudge') nudge(btn.dataset.field, Number(btn.dataset.delta));
  else if (act === 'skip') skipRecipe();
  else if (act === 'cook') cookThis();
  else if (act === 'rate') rateTonight(btn.dataset.kind);
  else if (act === 'folders') openFolders(btn.dataset.kind);
  else if (act === 'open-recipe') {
    state.recipeMode = 'browse';
    openFolderRecipe(btn.dataset.id);
  }
  else if (act === 'go-rate') {
    if (state.store.tonight) state.currentRecipe = byId(state.store.tonight.id);
    go('rate');
  }
  else if (act === 'retry') refreshLibrary();
}

function onKey(event) {
  if (event.key === 'Enter' && event.target && event.target.id === 'other-protein') {
    event.preventDefault();
    chooseOtherProtein();
  }
}

function onHash() {
  const hash = (location.hash || '#home').slice(1);
  const screen = SCREENS.includes(hash) ? hash : 'home';
  if (screen === 'recipe' && !state.currentRecipe) {
    if (state.filters.protein) {
      state.recipeMode = 'pick';
      pickNext();
    } else if (state.store.tonight) {
      state.currentRecipe = byId(state.store.tonight.id);
      state.recipeMode = 'browse';
    } else {
      state.screen = 'home';
      render();
      return;
    }
  }
  if (screen === 'rate' && !state.currentRecipe && state.store.tonight) {
    state.currentRecipe = byId(state.store.tonight.id);
  }
  state.screen = screen;
  render();
}

/* ---------- boot ---------- */

function boot() {
  loadStore();
  const hash = (location.hash || '').slice(1);
  state.screen = SCREENS.includes(hash) ? hash : 'home';
  render();

  document.getElementById('app').addEventListener('click', onClick);
  document.getElementById('app').addEventListener('keydown', onKey);
  window.addEventListener('hashchange', onHash);
  window.addEventListener('popstate', onHash);

  refreshLibrary().then(() => {
    if (!state.recipes.length) startLibraryWatch();
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

boot();
