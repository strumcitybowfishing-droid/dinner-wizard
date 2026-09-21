/* DINNER WIZARD — family dinner picker. Vanilla JS, no build. */

const STORAGE_KEY = 'dinner-wizard-v1';
const SCREENS = ['auth', 'account', 'home', 'protein', 'cut', 'budget', 'people', 'difficulty', 'store', 'pick', 'recipe', 'rate', 'folders'];
const SIGNED_IN_HOST = 'https://dinner-wizard-app.onrender.com';
const SUPABASE_URL = 'https://odnhnrgpqhodmjjekctj.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kbmhucmdwcWhvZG1qamVrY3RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwMTU2NTksImV4cCI6MjEwNTU5MTY1OX0.SJR7G0PHUxXkkBqUeeNXY9Z0yB5EoCnWCsDFqAGMc8A';
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

const CUTS = {
  chicken: [
    { id: 'any', label: 'Any cut', blurb: 'Whatever is in the fridge' },
    { id: 'breast', label: 'Breasts', blurb: 'Boneless or bone-in', aliases: ['breast', 'breasts'] },
    { id: 'thigh', label: 'Thighs', blurb: 'Juicy, hard to overcook', aliases: ['thigh', 'thighs'] },
    { id: 'drumstick', label: 'Drumsticks', blurb: 'Legs', aliases: ['drumstick', 'drumsticks', 'chicken leg'] },
    { id: 'wing', label: 'Wings', aliases: ['wing', 'wings'] },
    { id: 'tender', label: 'Tenders', aliases: ['tender', 'tenders', 'tenderloin'] },
    { id: 'whole', label: 'Whole bird', aliases: ['whole chicken', 'whole bird', 'roast chicken'] },
    { id: 'ground', label: 'Ground', aliases: ['ground chicken'] }
  ],
  turkey: [
    { id: 'any', label: 'Any cut', blurb: 'Whatever you have' },
    { id: 'breast', label: 'Breast', aliases: ['breast', 'breasts'] },
    { id: 'thigh', label: 'Thighs / legs', aliases: ['thigh', 'leg', 'drumstick'] },
    { id: 'ground', label: 'Ground', aliases: ['ground turkey'] },
    { id: 'whole', label: 'Whole bird', aliases: ['whole turkey'] }
  ],
  pork: [
    { id: 'any', label: 'Any cut', blurb: 'Use what’s on hand' },
    { id: 'chop', label: 'Chops', aliases: ['chop', 'chops'] },
    { id: 'tenderloin', label: 'Tenderloin', aliases: ['tenderloin'] },
    { id: 'loin', label: 'Loin roast', aliases: ['pork loin', 'loin roast'] },
    { id: 'shoulder', label: 'Shoulder / butt', aliases: ['shoulder', 'boston butt', 'pork butt', 'picnic'] },
    { id: 'ground', label: 'Ground', aliases: ['ground pork'] }
  ],
  lamb: [
    { id: 'any', label: 'Any cut' },
    { id: 'chop', label: 'Chops', aliases: ['chop', 'chops', 'rack'] },
    { id: 'shoulder', label: 'Shoulder', aliases: ['shoulder'] },
    { id: 'leg', label: 'Leg', aliases: ['leg of lamb', 'lamb leg'] },
    { id: 'ground', label: 'Ground', aliases: ['ground lamb'] }
  ],
  venison: [
    { id: 'any', label: 'Any cut', blurb: 'Use what’s in the freezer' },
    { id: 'backstrap', label: 'Backstrap', blurb: 'Loin — steaks, medallions', aliases: ['backstrap', 'back strap', 'loin', 'medallion'] },
    { id: 'tenderloin', label: 'Tenderloin', aliases: ['tenderloin'] },
    { id: 'shoulder', label: 'Front shoulder', blurb: 'Roast, grind, or braise', aliases: ['shoulder', 'chuck', 'blade'] },
    { id: 'hind', label: 'Hind roast / ham', aliases: ['hind', 'round', 'ham', 'rump'] },
    { id: 'trimmings', label: 'Trimmings', blurb: 'Stew meat, scraps, chili cubes', aliases: ['stew', 'trim', 'trimming', 'cube', 'scrap'] },
    { id: 'ground', label: 'Ground', aliases: ['ground venison', 'ground deer', 'burger'] },
    { id: 'mystery', label: 'Mystery meat', blurb: 'Unlabeled bag. Keep it simple.', aliases: [] }
  ],
  elk: [
    { id: 'any', label: 'Any cut' },
    { id: 'backstrap', label: 'Backstrap', aliases: ['backstrap', 'loin', 'medallion'] },
    { id: 'tenderloin', label: 'Tenderloin', aliases: ['tenderloin'] },
    { id: 'shoulder', label: 'Front shoulder', aliases: ['shoulder', 'chuck'] },
    { id: 'hind', label: 'Hind roast', aliases: ['hind', 'round', 'roast'] },
    { id: 'trimmings', label: 'Trimmings', aliases: ['stew', 'trim', 'cube'] },
    { id: 'ground', label: 'Ground', aliases: ['ground elk', 'burger'] },
    { id: 'mystery', label: 'Mystery meat', aliases: [] }
  ],
  'wild hog': [
    { id: 'any', label: 'Any cut' },
    { id: 'loin', label: 'Loin / chops', aliases: ['loin', 'chop'] },
    { id: 'shoulder', label: 'Shoulder', aliases: ['shoulder', 'butt'] },
    { id: 'ham', label: 'Ham', aliases: ['ham', 'hind'] },
    { id: 'trimmings', label: 'Trimmings', aliases: ['stew', 'trim', 'cube'] },
    { id: 'ground', label: 'Ground', aliases: ['ground', 'sausage', 'burger'] },
    { id: 'mystery', label: 'Mystery meat', aliases: [] }
  ],
  duck: [
    { id: 'any', label: 'Any cut' },
    { id: 'breast', label: 'Breast', aliases: ['breast'] },
    { id: 'leg', label: 'Legs / thighs', aliases: ['leg', 'thigh', 'confit'] },
    { id: 'whole', label: 'Whole bird', aliases: ['whole duck'] }
  ],
  goose: [
    { id: 'any', label: 'Any cut' },
    { id: 'breast', label: 'Breast', aliases: ['breast'] },
    { id: 'leg', label: 'Legs', aliases: ['leg', 'thigh'] },
    { id: 'whole', label: 'Whole bird', aliases: ['whole goose'] }
  ],
  pheasant: [
    { id: 'any', label: 'Any cut' },
    { id: 'breast', label: 'Breast', aliases: ['breast'] },
    { id: 'whole', label: 'Whole bird', aliases: ['whole'] }
  ],
  rabbit: [
    { id: 'any', label: 'Any cut' },
    { id: 'whole', label: 'Whole', aliases: ['whole rabbit'] },
    { id: 'pieces', label: 'Pieces', aliases: ['saddle', 'leg', 'loin'] }
  ],
  fish: [
    { id: 'any', label: 'Any cut' },
    { id: 'fillet', label: 'Fillets', aliases: ['fillet', 'filet'] },
    { id: 'steak', label: 'Steaks', aliases: ['steak'] },
    { id: 'whole', label: 'Whole fish', aliases: ['whole fish'] }
  ],
  salmon: [
    { id: 'any', label: 'Any cut' },
    { id: 'fillet', label: 'Fillet', aliases: ['fillet', 'filet'] },
    { id: 'steak', label: 'Steak', aliases: ['steak'] }
  ],
  tuna: [
    { id: 'any', label: 'Any cut' },
    { id: 'steak', label: 'Steak', aliases: ['steak'] },
    { id: 'can', label: 'Canned', aliases: ['canned', 'tin'] }
  ]
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

const CUISINES = [
  { id: 'southern', label: 'Southern comfort', aliases: ['southern', 'soul food', 'comfort', 'biscuits', 'gravy', 'fried chicken', 'cornbread'] },
  { id: 'mexican', label: 'Mexican', aliases: ['mexican', 'mexico', 'taco', 'enchilada', 'salsa', 'burrito'] },
  { id: 'texmex', label: 'Tex-Mex', aliases: ['tex-mex', 'tex mex', 'southwest', 'fajita', 'queso'] },
  { id: 'italian', label: 'Italian', aliases: ['italian', 'italy', 'pasta', 'risotto', 'parmesan', 'marinara'] },
  { id: 'cajun', label: 'Cajun / Creole', aliases: ['cajun', 'creole', 'louisiana', 'gumbo', 'jambalaya', 'etouffee'] },
  { id: 'bbq', label: 'BBQ', aliases: ['bbq', 'barbecue', 'smoked', 'brisket'] },
  { id: 'asian', label: 'Asian', aliases: ['chinese', 'japanese', 'thai', 'korean', 'vietnamese', 'asian', 'filipino', 'stir fry', 'stir-fry'] },
  { id: 'indian', label: 'Indian', aliases: ['indian', 'curry', 'tikka', 'masala', 'tandoori'] },
  { id: 'mediterranean', label: 'Mediterranean', aliases: ['mediterranean', 'greek', 'moroccan', 'turkish', 'lebanese'] },
  { id: 'american', label: 'American', aliases: ['american', 'united states', 'usa'] },
  { id: 'french', label: 'French', aliases: ['french', 'france'] },
  { id: 'caribbean', label: 'Caribbean', aliases: ['caribbean', 'jamaican', 'cuban', 'jerk'] },
  { id: 'irish', label: 'Irish / British', aliases: ['irish', 'british', 'english', 'scottish'] },
  { id: 'spanish', label: 'Spanish', aliases: ['spanish', 'spain', 'tapas', 'paella'] },
  { id: 'german', label: 'German', aliases: ['german'] },
  { id: 'african', label: 'African', aliases: ['african', 'egyptian', 'kenyan', 'ethiopian'] },
  { id: 'seafood', label: 'Seafood night', aliases: ['seafood', 'fish fry', 'boil', 'shrimp', 'crawfish'] },
  { id: 'chili', label: 'Chili & stew', aliases: ['chili', 'stew', 'soup', 'chowder'] },
  { id: 'skillet', label: 'Skillet / one-pan', aliases: ['skillet', 'one pan', 'one-pot', 'sheet pan'] },
  { id: 'camp', label: 'Camp / wild game', aliases: ['camp', 'wild game', 'venison', 'backcountry'] }
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
    cut: null,
    budget: 3,
    adults: 2,
    children: 0,
    difficulty: 2,
    store: 'walmart',
    cuisine: null
  },
  skippedIds: new Set(),
  currentRecipe: null,
  currentSides: [],
  choices: [],
  pickMeta: null,
  recipeMode: 'pick',
  folderFilter: 'loved',
  user: null,
  authMode: 'login',
  authError: '',
  authBusy: false,
  recoveryCode: '',
  resetToken: '',
  sbClient: null,
  sbRecovery: false,
  store: { ratings: {}, tonight: null, history: [], preferredStore: 'walmart' }
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

function proteinKey(protein) {
  if (!protein || protein === 'surprise') return '';
  const raw = typeof protein === 'object' ? protein.custom : protein;
  const t = tidyProtein(raw);
  if (CUTS[t]) return t;
  if (/deer|venison/.test(t)) return 'venison';
  if (/elk|wapiti/.test(t)) return 'elk';
  if (/hog|boar/.test(t)) return 'wild hog';
  if (/chicken/.test(t)) return 'chicken';
  return t;
}

function cutsFor(protein) {
  return CUTS[proteinKey(protein)] || null;
}

function cutLabel(cut, protein) {
  if (!cut || cut === 'any') return '';
  const list = cutsFor(protein);
  const row = list && list.find((c) => c.id === cut);
  return row ? row.label : cut;
}

function plateLabel() {
  const p = proteinLabel(state.filters.protein);
  const c = cutLabel(state.filters.cut, state.filters.protein);
  return c ? p + ' · ' + c : p;
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
      history: Array.isArray(data.history) ? data.history : [],
      preferredStore: data.preferredStore || 'walmart'
    };
    if (state.store.preferredStore) state.filters.store = state.store.preferredStore;
    const last = state.store.tonight || state.store.history[state.store.history.length - 1];
    if (last && last.filters) {
      const f = last.filters;
      if (typeof f.adults === 'number') state.filters.adults = clamp(f.adults, 0, 20);
      if (typeof f.children === 'number') state.filters.children = clamp(f.children, 0, 20);
      if (f.store) state.filters.store = f.store;
      if (f.cut) state.filters.cut = f.cut;
      if (eaters() < 1) state.filters.adults = 2;
    }
  } catch (err) {
    state.store = { ratings: {}, tonight: null, history: [] };
  }
}

function storePayload() {
  return {
    ratings: state.store.ratings,
    tonight: state.store.tonight,
    history: state.store.history.slice(-80),
    preferredStore: state.filters.store || state.store.preferredStore || 'walmart'
  };
}

function applyStorePayload(data) {
  if (!data || typeof data !== 'object') return;
  state.store = {
    ratings: data.ratings && typeof data.ratings === 'object' ? data.ratings : {},
    tonight: data.tonight || null,
    history: Array.isArray(data.history) ? data.history : [],
    preferredStore: data.preferredStore || state.store.preferredStore || 'walmart'
  };
  if (state.store.preferredStore) state.filters.store = state.store.preferredStore;
}

function saveStore() {
  const payload = storePayload();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    /* quota — keep going */
  }
  if (state.user) {
    fetch('/api/me/store', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {});
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
    ['./data/wildgame.json', 'Wildlife agency'],
    ['./data/wikibooks.json', 'Wikibooks Cookbook'],
    ['./data/publicdomain.json', 'Public domain'],
    ['./data/extra.json', 'Dinner Wizard kitchen']
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

function grindFriendly(hay) {
  return /chili|chilli|stew|taco|burger|sloppy|meatball|casserole|soup|hash|sausage|ragu|bolognese|shepherd|cottage pie|empanada|dumpling/.test(hay);
}

function matchesCut(recipe, protein, cut) {
  const list = cutsFor(protein);
  if (!list || !cut || cut === 'any') return true;
  const spec = list.find((c) => c.id === cut);
  if (!spec) return true;
  const hay = haystack(recipe).replace(/-/g, ' ');
  const mentioned = list.filter((c) =>
    c.id !== 'any' && (c.aliases || []).some((a) => includesTerm(hay, a))
  );
  if (cut === 'mystery' || cut === 'trimmings' || cut === 'ground') {
    if (grindFriendly(hay)) return true;
    if (!mentioned.length) return true;
    return mentioned.some((c) => c.id === cut || c.id === 'trimmings' || c.id === 'ground' || c.id === 'shoulder');
  }
  if (!mentioned.length) return true;
  return mentioned.some((c) => c.id === cut);
}

function matchesCuisine(recipe, cuisine) {
  if (!cuisine) return true;
  const spec = CUISINES.find((c) => c.id === cuisine);
  if (!spec) return true;
  const hay = [
    recipe.style,
    recipe.source,
    recipe.title,
    ...(recipe.tags || []),
    ...(recipe.proteins || [])
  ].join(' ').toLowerCase().replace(/-/g, ' ');
  return spec.aliases.some((alias) => hay.indexOf(alias) !== -1);
}

function getPool(maxBudget, maxDiff, opts) {
  const ignoreCut = opts && opts.ignoreCut;
  const ignoreCuisine = opts && opts.ignoreCuisine;
  const never = new Set(
    Object.keys(state.store.ratings).filter((id) => state.store.ratings[id] === 'never')
  );
  return state.recipes.filter((recipe) => {
    if (state.skippedIds.has(recipe.id) || never.has(recipe.id)) return false;
    if (!matchesProtein(recipe, state.filters.protein)) return false;
    if (!ignoreCut && !matchesCut(recipe, state.filters.protein, state.filters.cut)) return false;
    if (!ignoreCuisine && !matchesCuisine(recipe, state.filters.cuisine)) return false;
    if ((recipe.budget || 3) > maxBudget) return false;
    if ((recipe.difficulty || 2) > maxDiff) return false;
    return true;
  });
}

function matchingPool() {
  if (!state.recipes.length) {
    return { pool: [], emptyLibrary: true, loosened: {} };
  }
  let maxB = state.filters.budget;
  let maxD = state.filters.difficulty;
  const loosened = { budget: false, difficulty: false, cut: false, cuisine: false };
  function opts() {
    return {
      ignoreCut: loosened.cut,
      ignoreCuisine: loosened.cuisine
    };
  }
  let pool = getPool(maxB, maxD);
  if (!pool.length && state.filters.cuisine) {
    loosened.cuisine = true;
    pool = getPool(maxB, maxD, opts());
  }
  if (!pool.length && state.filters.cut && state.filters.cut !== 'any') {
    loosened.cut = true;
    pool = getPool(maxB, maxD, opts());
  }
  if (!pool.length) {
    maxB = 5;
    loosened.budget = true;
    pool = getPool(maxB, maxD, opts());
  }
  if (!pool.length) {
    maxD = 3;
    loosened.difficulty = true;
    pool = getPool(maxB, maxD, opts());
  }
  return { pool, loosened, emptyLibrary: false };
}

function shuffle(list) {
  const arr = list.slice();
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

function pickThree() {
  const found = matchingPool();
  if (found.emptyLibrary) {
    state.choices = [];
    state.currentRecipe = null;
    state.pickMeta = { emptyLibrary: true };
    return;
  }
  if (!found.pool.length) {
    state.choices = [];
    state.currentRecipe = null;
    state.pickMeta = { noMatch: true, loosened: found.loosened, skippedAll: state.skippedIds.size > 0 };
    return;
  }
  const want = state.filters.budget;
  const ranked = found.pool.slice().sort((a, b) => {
    return Math.abs((a.budget || 3) - want) - Math.abs((b.budget || 3) - want);
  });
  const top = ranked.slice(0, Math.max(12, Math.min(ranked.length, 24)));
  state.choices = shuffle(top).slice(0, 3);
  state.pickMeta = { loosened: found.loosened, remaining: found.pool.length };
}

function attachSides(recipe) {
  if (!recipe || !window.DWSides) {
    state.currentSides = [];
    return;
  }
  state.currentSides = DWSides.pickTwo(recipe, {
    maxDiff: state.filters.difficulty,
    maxBudget: state.filters.budget
  });
}

function pickNext() {
  pickThree();
  if (state.choices.length === 1) {
    state.currentRecipe = state.choices[0];
    attachSides(state.currentRecipe);
  }
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
  if (!state.user && screen !== 'auth') screen = 'auth';
  if (state.user && screen === 'auth' && state.authMode !== 'recovery') screen = 'home';
  state.screen = screen;
  if (push !== false) {
    const hash = '#' + screen;
    if (location.hash !== hash) history.pushState({ screen }, '', hash);
  }
  window.scrollTo(0, 0);
  render();
}

function back() {
  const order = ['home', 'protein', 'cut', 'budget', 'people', 'difficulty', 'store', 'pick', 'recipe', 'rate'];
  if (state.screen === 'folders' || state.screen === 'account') {
    go('home');
    return;
  }
  if (state.screen === 'recipe' && state.recipeMode === 'browse') {
    go('folders');
    return;
  }
  const i = order.indexOf(state.screen);
  let prev = i > 0 ? order[i - 1] : 'home';
  if (prev === 'cut' && !cutsFor(state.filters.protein)) prev = 'protein';
  go(prev);
}

function startDinner() {
  state.skippedIds = new Set();
  state.currentRecipe = null;
  state.currentSides = [];
  state.choices = [];
  state.pickMeta = null;
  state.recipeMode = 'pick';
  state.filters.protein = null;
  state.filters.cut = null;
  state.filters.cuisine = null;
  go('protein');
}

function chooseProtein(id) {
  state.filters.protein = id;
  state.filters.cut = null;
  if (id !== 'surprise' && cutsFor(id)) {
    go('cut');
    return;
  }
  go('budget');
}

function chooseCut(id) {
  state.filters.cut = id || 'any';
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
  state.filters.cut = null;
  if (cutsFor(state.filters.protein)) {
    go('cut');
    return;
  }
  go('budget');
}

function chooseBudget(n) {
  state.filters.budget = Number(n);
  go('people');
}

function chooseDifficulty(n) {
  state.filters.difficulty = Number(n);
  go('store');
}

function chooseCuisine(id) {
  state.filters.cuisine = state.filters.cuisine === id ? null : id;
  pickThree();
  if (state.screen === 'pick') render();
  else go('pick');
  window.scrollTo(0, 0);
}

function chooseStore(id) {
  state.filters.store = id;
  state.store.preferredStore = id;
  saveStore();
  state.recipeMode = 'pick';
  pickThree();
  go('pick');
}

function chooseHatName(id) {
  const rec = (state.choices || []).find((r) => r.id === id) || byId(id);
  if (!rec) return;
  state.currentRecipe = rec;
  attachSides(rec);
  go('recipe');
}

function threeMore() {
  (state.choices || []).forEach((r) => state.skippedIds.add(r.id));
  pickThree();
  if (state.screen === 'pick') render();
  else go('pick');
  window.scrollTo(0, 0);
}

function skipRecipe() {
  if (state.currentRecipe) state.skippedIds.add(state.currentRecipe.id);
  pickThree();
  go('pick');
}

function cookThis() {
  const rec = state.currentRecipe;
  if (!rec) return;
  const entry = {
    id: rec.id,
    pickedAt: new Date().toISOString(),
    filters: {
      protein: state.filters.protein,
      cut: state.filters.cut,
      cuisine: state.filters.cuisine,
      budget: state.filters.budget,
      adults: state.filters.adults,
      children: state.filters.children,
      difficulty: state.filters.difficulty,
      store: state.filters.store
    },
    sideIds: (state.currentSides || []).map((s) => s.id)
  };
  state.store.tonight = entry;
  state.store.history.push(entry);
  saveStore();
  go('home');
}

function cancelTonight() {
  const tonight = state.store.tonight;
  if (tonight && tonight.id) state.skippedIds.add(tonight.id);
  if (tonight && tonight.filters) {
    const f = tonight.filters;
    if (f.protein != null) state.filters.protein = f.protein;
    if (f.cut != null) state.filters.cut = f.cut;
    if (typeof f.budget === 'number') state.filters.budget = f.budget;
    if (typeof f.adults === 'number') state.filters.adults = f.adults;
    if (typeof f.children === 'number') state.filters.children = f.children;
    if (typeof f.difficulty === 'number') state.filters.difficulty = f.difficulty;
    if (f.store) state.filters.store = f.store;
  }
  state.store.tonight = null;
  state.currentRecipe = null;
  state.currentSides = [];
  state.recipeMode = 'pick';
  saveStore();
  if (!state.filters.protein) {
    startDinner();
    return;
  }
  pickThree();
  go('pick');
}

function rateTonight(kind) {
  const rec = state.currentRecipe || (state.store.tonight && byId(state.store.tonight.id));
  if (!rec) {
    go('home');
    return;
  }
  if (kind === 'not-cooked') {
    const hist = state.store.history;
    for (let i = hist.length - 1; i >= 0; i -= 1) {
      if (hist[i].id === rec.id) {
        hist[i].rating = 'not-cooked';
        break;
      }
    }
    saveStore();
    cancelTonight();
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
  attachSides(rec);
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
    [1, 2, 3, 4, 5].map((n) => {
      const cls = n === step ? 'on' : (n < step ? 'done' : '');
      return '<span class="' + cls + '"></span>';
    }).join('') +
    '</div>';
}

function renderTop() {
  const top = document.getElementById('top');
  if (state.screen === 'auth') {
    top.innerHTML =
      '<div class="hero">' +
        '<img class="hero-icon" src="' + iconSrc() + '" alt="DINNER WIZARD" width="148" height="148" onerror="this.src=\'./icons/icon.svg\'">' +
        '<h1>DINNER WIZARD</h1>' +
        '<p class="tagline">Sign in so your folders stay with you.</p>' +
      '</div>';
    return;
  }
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
        '<button class="btn ghost" data-act="cancel-tonight" style="margin-top:10px">Cancel tonight — pick another</button>' +
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
      (state.user
        ? '<p class="install-hint">Signed in as ' + esc(state.user.email) +
          ' · free account · folders sync on this login.<br>' +
          '<button class="linkish" data-act="go" data-screen="account" style="display:inline">Account</button>' +
          ' · <button class="linkish" data-act="logout" style="display:inline">Log out</button></p>'
        : '') +
      '<p class="install-hint">Add DINNER WIZARD to your home screen from the browser menu. It works like a little kitchen app.</p>' +
    '</div>'
  );
}

function renderAuth() {
  const mode = state.authMode || 'login';
  if (mode === 'recovery') {
    return (
      '<div class="home-pad">' +
        '<h2 class="screen-title">Save this recovery code</h2>' +
        '<p class="lead">This is the only way to get back in if you forget the password (until email reset is on). Screenshot it.</p>' +
        '<p class="recovery-code">' + esc(state.recoveryCode) + '</p>' +
        '<button class="btn gold" data-act="go" data-screen="home">I saved it — continue</button>' +
      '</div>'
    );
  }
  if (mode === 'forgot') {
    return (
      '<div class="home-pad">' +
        '<h2 class="screen-title">Forgot password</h2>' +
        '<p class="lead">Use the recovery code you saved (DW-XXXX-XXXX), or ask for an email link.</p>' +
        (state.authError ? '<p class="banner">' + esc(state.authError) + '</p>' : '') +
        '<form class="auth-form" data-act="do-reset">' +
          '<label>Email<input id="auth-email" type="email" required placeholder="you@email.com"></label>' +
          '<label>Recovery code<input id="auth-recovery" type="text" autocomplete="off" placeholder="DW-XXXX-XXXX"></label>' +
          '<label>New password<input id="auth-password" type="password" minlength="8" placeholder="at least 8 characters"></label>' +
          '<button class="btn gold" type="submit"' + (state.authBusy ? ' disabled' : '') + '>Set new password</button>' +
        '</form>' +
        '<button class="btn ghost" data-act="do-forgot-email"' + (state.authBusy ? ' disabled' : '') + '>Email me a reset link</button>' +
        '<button class="linkish" data-act="auth-mode" data-mode="login">Back to sign in</button>' +
      '</div>'
    );
  }
  if (mode === 'reset') {
    return (
      '<div class="home-pad">' +
        '<h2 class="screen-title">Choose a new password</h2>' +
        (state.authError ? '<p class="banner">' + esc(state.authError) + '</p>' : '') +
        '<form class="auth-form" data-act="do-reset-token">' +
          '<label>New password<input id="auth-password" type="password" minlength="8" required placeholder="at least 8 characters"></label>' +
          '<button class="btn gold" type="submit"' + (state.authBusy ? ' disabled' : '') + '>Save password</button>' +
        '</form>' +
      '</div>'
    );
  }
  const signup = mode === 'signup';
  return (
    '<div class="home-pad">' +
      '<h2 class="screen-title">' + (signup ? 'Make a free account' : 'Sign in') + '</h2>' +
      '<p class="lead">' +
        (signup
          ? 'Folders, tonight’s pick, and ratings live on your account so they survive a new phone.'
          : 'Welcome back. Your Loved / Maybe / Never again folders are waiting.') +
      '</p>' +
      (state.authError ? '<p class="banner">' + esc(state.authError) + '</p>' : '') +
      '<form class="auth-form" data-act="' + (signup ? 'do-signup' : 'do-login') + '">' +
        '<label>Email<input id="auth-email" type="email" autocomplete="username" required placeholder="you@email.com"></label>' +
        '<label>Password<input id="auth-password" type="password" autocomplete="' +
          (signup ? 'new-password' : 'current-password') +
          '" required minlength="8" placeholder="at least 8 characters"></label>' +
        '<button class="btn gold" type="submit"' + (state.authBusy ? ' disabled' : '') + '>' +
          (state.authBusy ? 'Working…' : (signup ? 'Create free account' : 'Sign in and stay signed in')) +
        '</button>' +
      '</form>' +
      (signup
        ? ''
        : '<button class="linkish" data-act="auth-mode" data-mode="forgot">Forgot password?</button>') +
      '<button class="linkish" data-act="auth-mode" data-mode="' + (signup ? 'login' : 'signup') + '">' +
        (signup ? 'Already have an account? Sign in' : 'New here? Make a free account') +
      '</button>' +
    '</div>'
  );
}

function renderAccount() {
  return (
    '<div class="home-pad">' +
      '<h2 class="screen-title">Account</h2>' +
      '<p class="lead">' + esc(state.user && state.user.email || '') + ' · ' +
        esc((state.user && state.user.plan) || 'free') + '</p>' +
      (state.authError ? '<p class="banner">' + esc(state.authError) + '</p>' : '') +
      (state.recoveryCode
        ? '<p class="muted">New recovery code (save it, it will not show again):</p><p class="recovery-code">' +
          esc(state.recoveryCode) + '</p>'
        : '') +
      '<h3 class="block-title">Change password</h3>' +
      '<form class="auth-form" data-act="do-change-password">' +
        '<label>Current password<input id="acct-old" type="password" required></label>' +
        '<label>New password<input id="acct-new" type="password" minlength="8" required></label>' +
        '<button class="btn gold" type="submit"' + (state.authBusy ? ' disabled' : '') + '>Update password</button>' +
      '</form>' +
      '<h3 class="block-title">Forgot-password backup</h3>' +
      '<p class="muted">A recovery code lets you reset if you lose the password. You only see it once.</p>' +
      '<button class="btn ghost" data-act="do-recovery"' + (state.authBusy ? ' disabled' : '') + '>Make a new recovery code</button>' +
      '<h3 class="block-title">Close account</h3>' +
      '<p class="muted">Deletes the login and synced folders. Type CLOSE and your password.</p>' +
      '<form class="auth-form" data-act="do-close">' +
        '<label>Type CLOSE<input id="acct-close" type="text" placeholder="CLOSE" autocomplete="off"></label>' +
        '<label>Password<input id="acct-close-pass" type="password" required></label>' +
        '<button class="btn ghost" type="submit"' + (state.authBusy ? ' disabled' : '') + '>Close this account</button>' +
      '</form>' +
      '<button class="linkish" data-act="logout">Log out</button>' +
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

function renderCut() {
  const list = cutsFor(state.filters.protein) || [];
  const protein = proteinLabel(state.filters.protein);
  return (
    stepDots(1) +
    '<h2 class="screen-title">Which cut?</h2>' +
    '<p class="lead">' + esc(protein) + ' isn’t one thing. Pick the piece you’ve actually got.</p>' +
    '<div class="choice-list">' +
      list.map((c) =>
        '<button class="choice plain" data-act="cut" data-id="' + esc(c.id) + '">' +
          '<span class="clabel">' + esc(c.label) + '</span>' +
          (c.blurb ? '<span class="blurb">' + esc(c.blurb) + '</span>' : '<span class="blurb">&nbsp;</span>') +
        '</button>'
      ).join('') +
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

function groceryStores() {
  return (window.DWGrocery && DWGrocery.STORES) || [];
}

function renderStore() {
  const selected = state.filters.store;
  return (
    stepDots(5) +
    '<h2 class="screen-title">One store for the cart</h2>' +
    '<p class="lead">We’ll build one cart at this chain using the packs they actually sell (a dozen eggs, a bottle of oil, a tray of chicken — not a pinch or a clove), and add an approx if something is oddball.</p>' +
    '<div class="protein-grid store-grid">' +
      groceryStores().map((s) =>
        '<button class="protein' + (s.id === selected ? ' is-on' : '') + '" data-act="store" data-id="' + esc(s.id) + '">' +
          '<span class="emoji">' + s.emoji + '</span>' +
          '<span class="plabel">' + esc(s.label) + '</span>' +
        '</button>'
      ).join('') +
    '</div>' +
    '<p class="scale-note">Prices are typical national shelf prices for that chain, not your store’s live tags. Pantry salt and pepper count as free.</p>'
  );
}

function renderPick() {
  if (state.pickMeta && state.pickMeta.emptyLibrary) {
    return (
      '<div class="empty">' +
        '<img class="hat" src="' + iconSrc() + '" alt="" onerror="this.src=\'./icons/icon.svg\'">' +
        '<h2 class="screen-title">Library loading</h2>' +
        '<p class="lead">Other wizards are stocking the pantry. Try again in a moment.</p>' +
        '<button class="btn gold" data-act="retry">Try again</button>' +
      '</div>'
    );
  }
  if (state.pickMeta && state.pickMeta.noMatch) {
    return (
      '<div class="empty">' +
        '<h2 class="screen-title">Nothing in the hat</h2>' +
        '<p class="lead">No matches for ' + esc(plateLabel()) + '. Try another protein, or Surprise Me.</p>' +
        '<div class="btn-row">' +
          '<button class="btn gold" data-act="go" data-screen="protein">Pick a protein</button>' +
          '<button class="btn forest" data-act="protein" data-id="surprise">✨ Surprise me</button>' +
        '</div>' +
      '</div>'
    );
  }
  const names = state.choices || [];
  if (!names.length) {
    pickThree();
  }
  const cards = (state.choices || []).map((r) =>
    '<button class="hat-name" data-act="hat" data-id="' + esc(r.id) + '">' + esc(r.title) + '</button>'
  ).join('');
  let banner = '';
  if (state.pickMeta && state.pickMeta.loosened && (state.pickMeta.loosened.budget || state.pickMeta.loosened.difficulty || state.pickMeta.loosened.cut)) {
    banner = state.pickMeta.loosened.cut
      ? '<p class="banner">No dish written just for that cut — use yours in these ' + esc(proteinLabel(state.filters.protein)) + ' recipes.</p>'
      : '<p class="banner">We loosened the filters a little so the hat had three names.</p>';
  }
  return (
    '<p class="kicker">The hat pulled three</p>' +
    '<h2 class="screen-title">Pick a name</h2>' +
    '<p class="lead">Names only. Tap the one that sounds like dinner.</p>' +
    banner +
    '<div class="hat-list">' + cards + '</div>' +
    '<button class="btn ghost" data-act="three-more" style="margin-top:16px">Three more names</button>' +
    renderFeelingSpecific()
  );
}

function renderFeelingSpecific() {
  const on = state.filters.cuisine;
  return (
    '<section class="specific-block">' +
      '<p class="kicker">Feeling specific</p>' +
      '<h3 class="block-title">Filter by food type</h3>' +
      '<p class="muted">Tap one and the hat will pull three names in that lane.</p>' +
      '<div class="store-switch">' +
        CUISINES.map((c) =>
          '<button class="chip-btn' + (on === c.id ? ' on' : '') + '" data-act="cuisine" data-id="' + esc(c.id) + '">' +
            esc(c.label) +
          '</button>'
        ).join('') +
      '</div>' +
      (on ? '<button class="linkish" data-act="cuisine-clear">Clear food-type filter</button>' : '') +
    '</section>'
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
        '<p class="lead">No matches for ' + esc(plateLabel()) + '. ' + note + ' Try another protein, or Surprise Me.</p>' +
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
    if (state.pickMeta.loosened.cut) bits.push('cut (use yours in this recipe)');
    if (state.pickMeta.loosened.budget) bits.push('budget');
    if (state.pickMeta.loosened.difficulty) bits.push('difficulty');
    if (bits.length) {
      banner = '<p class="banner">We loosened the ' + bits.join(' and ') + ' to find a match.</p>';
    }
  }

  const chips = browse
    ? ''
    : '<div class="chips">' +
        '<span class="chip">' + esc(plateLabel()) + '</span>' +
        (state.filters.cuisine ? '<span class="chip">' + esc((CUISINES.find((c) => c.id === state.filters.cuisine) || {}).label || state.filters.cuisine) + '</span>' : '') +
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

  if (!browse && (!state.currentSides || state.currentSides.length < 2)) {
    attachSides(recipe);
  }

  const isTonight = state.store.tonight && state.store.tonight.id === recipe.id;
  const actions = browse
    ? '<div class="btn-row">' +
        '<button class="btn gold" data-act="go" data-screen="' + (isTonight ? 'home' : 'folders') + '">' +
          (isTonight ? 'Back home' : 'Back to folders') +
        '</button>' +
      '</div>' +
      (isTonight
        ? '<button class="btn ghost" data-act="cancel-tonight" style="margin-top:10px">Cancel tonight — pick another</button>'
        : renderRateButtons(true))
    : '<div class="btn-row">' +
        '<button class="btn ghost" data-act="skip">Skip — three new names</button>' +
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
      renderSidesBlock(recipe, browse ? 1 : factor) +
      renderGroceryBlock(recipe, browse ? 1 : factor) +
      actions +
    '</article>'
  );
}

function renderSidesBlock(recipe, factor) {
  const sides = state.currentSides || [];
  if (!sides.length) return '';
  const cards = sides.map((side) => {
    const ings = (side.ingredients || []).map((line) =>
      '<li>' + esc(scaleIngredient(line, factor)) + '</li>'
    ).join('');
    const steps = (side.steps || []).map((line) => '<li><span>' + esc(line) + '</span></li>').join('');
    return (
      '<div class="side-card">' +
        '<div class="side-head">' +
          '<div>' +
            '<p class="kicker">' + (side.kind === 'veg' ? 'Veg side' : 'Starch side') + '</p>' +
            '<h3>' + esc(side.title) + '</h3>' +
            '<p class="muted">⏱ ' + esc(String(side.timeMin || 15)) + ' min</p>' +
          '</div>' +
          '<button class="btn ghost" data-act="swap-side" data-id="' + esc(side.id) + '">Swap</button>' +
        '</div>' +
        '<h4 class="block-title">Ingredients</h4>' +
        '<ul class="ingredients">' + ings + '</ul>' +
        '<h4 class="block-title">Steps</h4>' +
        '<ol class="steps">' + steps + '</ol>' +
      '</div>'
    );
  }).join('');
  return (
    '<section class="sides-block">' +
      '<h3 class="block-title">Two sides that pair</h3>' +
      '<p class="muted">A veg and a starch picked for this main. Swap if the house vetoes one.</p>' +
      cards +
    '</section>'
  );
}

function renderGroceryBlock(recipe, factor) {
  if (!window.DWGrocery) return '';
  const storeId = state.filters.store || 'walmart';
  const store = DWGrocery.storeById(storeId);
  const groups = [
    { label: 'Main', lines: DWGrocery.priceLines(recipe.ingredients || [], storeId, factor) }
  ];
  (state.currentSides || []).forEach((side) => {
    groups.push({
      label: side.title,
      lines: DWGrocery.priceLines(side.ingredients || [], storeId, factor)
    });
  });
  const cart = DWGrocery.cart(groups, storeId);
  const storeBtns = groceryStores().map((s) =>
    '<button class="chip-btn' + (s.id === storeId ? ' on' : '') + '" data-act="store-switch" data-id="' + esc(s.id) + '">' +
      esc(s.label) +
    '</button>'
  ).join('');
  const rows = cart.lines.map((l) => {
    const href = l.query && store.search ? store.search + encodeURIComponent(l.query) + (l.sku ? ' ' + l.sku : '') : '';
    const title = href
      ? '<a href="' + esc(href) + '" target="_blank" rel="noopener noreferrer">' + esc(l.product || l.name || l.raw) + '</a>'
      : esc(l.product || l.name || l.raw);
    let buy = '';
    if (l.status === 'hunter') buy = 'From the freezer — $0.00';
    else if (l.status === 'pantry') buy = 'Pantry staple — not added to the cart';
    else {
      buy = 'Buy ' + l.packs + ' × ' + esc(l.packLabel) + ' @ ' + DWGrocery.money(l.packPrice);
    }
    const tag = l.approx ? '<span class="approx-tag">approx</span> ' : '';
    return (
      '<li>' +
        '<div>' +
          '<div class="gname">' + tag + title + '</div>' +
          '<div class="gsku">SKU ' + esc(l.sku || '—') + (l.approx ? ' · estimated pack' : '') + '</div>' +
          '<div class="gbuy">' + buy + '</div>' +
        '</div>' +
        '<div class="gprice">' +
          (l.status === 'hunter' || l.status === 'pantry'
            ? '$0.00'
            : DWGrocery.money(l.checkout)) +
        '</div>' +
      '</li>'
    );
  }).join('');
  return (
    '<section class="grocery-block">' +
      '<h3 class="block-title">Cart at one store</h3>' +
      '<p class="muted">Sold as real packs — not a clove, a splash, or a slice. Unknown items still get an estimated SKU and an approx price in the total.</p>' +
      '<div class="store-switch">' + storeBtns + '</div>' +
      '<div class="total-card">' +
        '<p class="kicker">Pay at ' + esc(store.label) + '</p>' +
        '<p class="total-price">' + DWGrocery.money(cart.checkout) + '</p>' +
        '<p class="muted">what the register rings if you buy every pack for this plate</p>' +
        '<p class="dinner-share">This dinner uses about ' + DWGrocery.money(cart.dinner) +
          '. Extra stays for later.</p>' +
      '</div>' +
      '<ul class="grocery-list">' + rows + '</ul>' +
      (cart.approx ? '<p class="scale-note">' + cart.approx + ' item' + (cart.approx === 1 ? '' : 's') + ' were not an exact catalog match, so we estimated a pack and still added that money to the total.</p>' : '') +
      '<p class="scale-note">Typical U.S. store-brand shelf prices as of Sept 2026 (Walmart baseline, other chains scaled from BLS/USDA and national basket data). Not the live tag in your aisle — sales and zip codes still move the number.</p>' +
    '</section>'
  );
}

function renderRateButtons(compact) {
  return (
    '<div class="rate-grid' + (compact ? ' compact' : '') + '">' +
      '<button class="rate-btn never" data-act="rate" data-kind="never">🚫 Never again</button>' +
      '<button class="rate-btn maybe" data-act="rate" data-kind="maybe">🤔 Maybe</button>' +
      '<button class="rate-btn loved" data-act="rate" data-kind="loved">💛 Loved it</button>' +
      (compact ? '' :
        '<button class="rate-btn skipped" data-act="rate" data-kind="not-cooked">🙅 Didn’t actually cook it</button>') +
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
    '<p class="lead">Loved / Maybe / Never again files it in a folder. Didn’t cook it just cancels tonight and you can pick another.</p>' +
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
    auth: renderAuth,
    account: renderAccount,
    home: renderHome,
    protein: renderProtein,
    cut: renderCut,
    budget: renderBudget,
    people: renderPeople,
    difficulty: renderDifficulty,
    store: renderStore,
    pick: renderPick,
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
  const form = event.target.closest('form[data-act]');
  if (form && (event.target.matches('button[type="submit"]') || event.target.closest('button[type="submit"]'))) {
    event.preventDefault();
    handleAuthForm(form.getAttribute('data-act'));
    return;
  }
  const btn = event.target.closest('[data-act]');
  if (!btn) return;
  const act = btn.dataset.act;
  if (act === 'start') startDinner();
  else if (act === 'auth-mode') {
    state.authMode = btn.dataset.mode || 'login';
    state.authError = '';
    render();
  }
  else if (act === 'do-forgot-email') requestResetEmail();
  else if (act === 'do-recovery') issueRecovery();
  else if (act === 'logout') logoutUser();
  else if (act === 'back') back();
  else if (act === 'go') go(btn.dataset.screen);
  else if (act === 'protein') {
    if (btn.dataset.id === 'surprise' && (state.screen === 'recipe' || state.screen === 'pick')) {
      state.filters.protein = 'surprise';
      state.filters.cut = null;
      state.skippedIds = new Set();
      state.recipeMode = 'pick';
      pickThree();
      go('pick');
    } else {
      chooseProtein(btn.dataset.id);
    }
  }
  else if (act === 'protein-other') chooseOtherProtein();
  else if (act === 'cut') chooseCut(btn.dataset.id);
  else if (act === 'budget') chooseBudget(btn.dataset.n);
  else if (act === 'difficulty') chooseDifficulty(btn.dataset.n);
  else if (act === 'store') chooseStore(btn.dataset.id);
  else if (act === 'store-switch') {
    state.filters.store = btn.dataset.id;
    state.store.preferredStore = btn.dataset.id;
    saveStore();
    render();
  }
  else if (act === 'hat') chooseHatName(btn.dataset.id);
  else if (act === 'three-more') threeMore();
  else if (act === 'cuisine') chooseCuisine(btn.dataset.id);
  else if (act === 'cuisine-clear') {
    state.filters.cuisine = null;
    pickThree();
    render();
  }
  else if (act === 'swap-side') {
    if (window.DWSides && state.currentRecipe) {
      state.currentSides = DWSides.swapOne(state.currentRecipe, state.currentSides, btn.dataset.id, {
        maxDiff: state.filters.difficulty,
        maxBudget: state.filters.budget
      });
      render();
    }
  }
  else if (act === 'nudge') nudge(btn.dataset.field, Number(btn.dataset.delta));
  else if (act === 'skip') skipRecipe();
  else if (act === 'cook') cookThis();
  else if (act === 'cancel-tonight') cancelTonight();
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

function handleAuthForm(act) {
  if (act === 'do-signup') submitAuth('signup');
  else if (act === 'do-login') submitAuth('login');
  else if (act === 'do-reset') submitResetWithRecovery();
  else if (act === 'do-reset-token') submitResetWithToken();
  else if (act === 'do-change-password') changePassword();
  else if (act === 'do-close') closeAccount();
}

async function submitAuth(mode) {
  const emailEl = document.getElementById('auth-email');
  const passEl = document.getElementById('auth-password');
  const email = emailEl && emailEl.value.trim();
  const password = passEl && passEl.value;
  if (!email || !password) {
    state.authError = 'Email and password, please.';
    render();
    return;
  }
  state.authBusy = true;
  state.authError = '';
  render();
  try {
    const res = await fetch(mode === 'signup' ? '/api/signup' : '/api/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password })
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      state.authError = body.error || 'Could not sign in.';
      state.authBusy = false;
      render();
      return;
    }
    state.user = body.user;
    if (body.store && body.store.ratings && Object.keys(body.store.ratings).length) {
      applyStorePayload(body.store);
    } else {
      saveStore();
    }
    state.authBusy = false;
    if (mode === 'signup' && body.recoveryCode) {
      state.recoveryCode = body.recoveryCode;
      state.authMode = 'recovery';
      go('auth');
      return;
    }
    go('home');
  } catch (err) {
    state.authError = 'Network hiccup. Try again.';
    state.authBusy = false;
    render();
  }
}

async function submitResetWithRecovery() {
  const email = (document.getElementById('auth-email') || {}).value || '';
  const recovery = (document.getElementById('auth-recovery') || {}).value || '';
  const password = (document.getElementById('auth-password') || {}).value || '';
  if (!email || !recovery || !password) {
    state.authError = 'Email, recovery code, and a new password.';
    render();
    return;
  }
  state.authBusy = true;
  state.authError = '';
  render();
  try {
    const res = await fetch('/api/reset', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), recoveryCode: recovery.trim(), newPassword: password })
    });
    const body = await res.json().catch(() => ({}));
    state.authBusy = false;
    if (!res.ok) {
      state.authError = body.error || 'Could not reset.';
      render();
      return;
    }
    state.authMode = 'login';
    state.authError = 'Password updated. Sign in.';
    render();
  } catch (err) {
    state.authBusy = false;
    state.authError = 'Network hiccup. Try again.';
    render();
  }
}

async function submitResetWithToken() {
  const password = (document.getElementById('auth-password') || {}).value || '';
  if (!password) {
    state.authError = 'Enter a new password.';
    render();
    return;
  }
  state.authBusy = true;
  state.authError = '';
  render();
  try {
    if (state.sbRecovery && state.sbClient) {
      const { error } = await state.sbClient.auth.updateUser({ password: password });
      state.authBusy = false;
      if (error) {
        state.authError = error.message || 'Link expired. Try again.';
        render();
        return;
      }
      state.authMode = 'login';
      state.sbRecovery = false;
      state.authError = 'Password updated. Sign in.';
      render();
      return;
    }
    const res = await fetch('/api/reset', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: state.resetEmail || '',
        token: state.resetToken || '',
        newPassword: password
      })
    });
    const body = await res.json().catch(() => ({}));
    state.authBusy = false;
    if (!res.ok) {
      state.authError = body.error || 'Link expired. Try again.';
      render();
      return;
    }
    state.authMode = 'login';
    state.resetToken = '';
    state.authError = 'Password updated. Sign in.';
    render();
  } catch (err) {
    state.authBusy = false;
    state.authError = 'Network hiccup. Try again.';
    render();
  }
}

async function requestResetEmail() {
  const email = (document.getElementById('auth-email') || {}).value || '';
  if (!email) {
    state.authError = 'Enter the account email first.';
    render();
    return;
  }
  state.authBusy = true;
  state.authError = '';
  render();
  try {
    const res = await fetch('/api/forgot', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() })
    });
    const body = await res.json().catch(() => ({}));
    state.authBusy = false;
    state.authError = body.message || 'Check that email if an account exists.';
    render();
  } catch (err) {
    state.authBusy = false;
    state.authError = 'Network hiccup. Try again.';
    render();
  }
}

async function changePassword() {
  const oldP = (document.getElementById('acct-old') || {}).value || '';
  const newP = (document.getElementById('acct-new') || {}).value || '';
  state.authBusy = true;
  state.authError = '';
  render();
  try {
    const res = await fetch('/api/me/password', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword: oldP, newPassword: newP })
    });
    const body = await res.json().catch(() => ({}));
    state.authBusy = false;
    state.authError = res.ok ? 'Password updated.' : (body.error || 'Could not update.');
    render();
  } catch (err) {
    state.authBusy = false;
    state.authError = 'Network hiccup. Try again.';
    render();
  }
}

async function issueRecovery() {
  state.authBusy = true;
  state.authError = '';
  render();
  try {
    const res = await fetch('/api/me/recovery', { method: 'POST', credentials: 'include' });
    const body = await res.json().catch(() => ({}));
    state.authBusy = false;
    if (!res.ok) {
      state.authError = body.error || 'Could not make a code.';
    } else {
      state.recoveryCode = body.recoveryCode || '';
    }
    render();
  } catch (err) {
    state.authBusy = false;
    state.authError = 'Network hiccup. Try again.';
    render();
  }
}

async function closeAccount() {
  const confirm = (document.getElementById('acct-close') || {}).value || '';
  const password = (document.getElementById('acct-close-pass') || {}).value || '';
  state.authBusy = true;
  state.authError = '';
  render();
  try {
    const res = await fetch('/api/me/close', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirm: confirm, password: password })
    });
    const body = await res.json().catch(() => ({}));
    state.authBusy = false;
    if (!res.ok) {
      state.authError = body.error || 'Could not close the account.';
      render();
      return;
    }
    state.user = null;
    state.store = { ratings: {}, tonight: null, history: [], preferredStore: 'walmart' };
    try { localStorage.removeItem(STORAGE_KEY); } catch (err) { /* ignore */ }
    state.authMode = 'login';
    state.authError = 'Account closed.';
    go('auth');
  } catch (err) {
    state.authBusy = false;
    state.authError = 'Network hiccup. Try again.';
    render();
  }
}

async function logoutUser() {
  try {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
  } catch (err) { /* still clear locally */ }
  state.user = null;
  go('auth');
}

async function initAuth() {
  try {
    const res = await fetch('/api/me', { credentials: 'include' });
    if (!res.ok) return;
    const body = await res.json();
    state.user = body.user || null;
    if (state.user && body.store && typeof body.store === 'object' && Object.keys(body.store).length) {
      applyStorePayload(body.store);
    }
  } catch (err) {
    state.user = null;
  }
}

function onHash() {
  const hash = (location.hash || '#home').slice(1);
  const screen = SCREENS.includes(hash) ? hash : 'home';
  if (screen === 'pick' && !(state.choices && state.choices.length) && state.filters.protein) {
    pickThree();
  }
  if (screen === 'recipe' && !state.currentRecipe) {
    if (state.choices && state.choices.length) {
      state.screen = 'pick';
      render();
      return;
    }
    if (state.filters.protein) {
      state.recipeMode = 'pick';
      pickThree();
      state.screen = 'pick';
      render();
      return;
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
  const host = location.hostname;
  const local = host === 'localhost' || host === '127.0.0.1';
  if (!local && host !== 'dinner-wizard-app.onrender.com') {
    location.replace(SIGNED_IN_HOST + '/' + location.hash + location.search);
    return;
  }
  try {
    const q = new URLSearchParams(location.search);
    if (q.get('reset_token')) {
      state.resetToken = q.get('reset_token');
      state.resetEmail = q.get('email') || '';
      state.authMode = 'reset';
    }
  } catch (err) { /* ignore */ }
  if (window.supabase && window.supabase.createClient) {
    state.sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
  }
  loadStore();
  document.getElementById('app').addEventListener('click', onClick);
  document.getElementById('app').addEventListener('submit', function (event) {
    const form = event.target.closest('form[data-act]');
    if (!form) return;
    event.preventDefault();
    handleAuthForm(form.getAttribute('data-act'));
  });
  document.getElementById('app').addEventListener('keydown', onKey);
  window.addEventListener('hashchange', onHash);
  window.addEventListener('popstate', onHash);

  initAuth().then(async () => {
    if (state.sbClient) {
      try {
        const { data } = await state.sbClient.auth.getSession();
        const hash = String(location.hash || '');
        if ((data && data.session && hash.indexOf('type=recovery') !== -1) || hash.indexOf('type=recovery') !== -1) {
          state.sbRecovery = true;
          state.authMode = 'reset';
          state.screen = 'auth';
          render();
          refreshLibrary().then(() => {
            if (!state.recipes.length) startLibraryWatch();
          });
          return;
        }
      } catch (err) { /* ignore */ }
    }
    if (state.resetToken) {
      state.authMode = 'reset';
      state.screen = 'auth';
      render();
    } else if (!state.user) {
      state.screen = 'auth';
      render();
    } else {
      const hash = (location.hash || '').slice(1);
      state.screen = SCREENS.includes(hash) && hash !== 'auth' ? hash : 'home';
      render();
    }
    refreshLibrary().then(() => {
      if (!state.recipes.length) startLibraryWatch();
    });
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

boot();
