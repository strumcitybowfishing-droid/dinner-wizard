/* Per-store sellable SKUs and pack prices.
   You cannot buy one clove, one tablespoon, or one slice — the cart
   uses the pack that chain actually sells.
   Unknown recipe words still get an estimated SKU + approx price in the total.
   Prices are typical mid-2026 US shelf / club figures, not a live POS feed. */
(function (root) {
  /* Mult is vs typical Walmart store-brand shelf (1.00).
     Sources: BLS/USDA meat & dairy 2026, grocery-tracker mid-2026 baskets,
     Charlotte/TX sample shelves Sept 2026. Regional tags still vary. */
  const STORES = [
    { id: 'walmart', label: 'Walmart', emoji: '⭐', mult: 1.00, family: 'regular', skuStyle: 'upc', prefix: '078742', brand: 'Great Value', search: 'https://www.walmart.com/search?q=' },
    { id: 'aldi', label: 'Aldi', emoji: '🛒', mult: 0.88, family: 'regular', skuStyle: 'upc', prefix: '409910', brand: 'Aldi', search: 'https://www.aldi.us/results?q=' },
    { id: 'sams', label: "Sam's Club", emoji: '🏷️', mult: 0.86, family: 'club', skuStyle: 'sams', prefix: '98', brand: "Member's Mark", search: 'https://www.samsclub.com/s/' },
    { id: 'costco', label: 'Costco', emoji: '📦', mult: 0.84, family: 'club', skuStyle: 'item6', prefix: '', brand: 'Kirkland Signature', search: 'https://www.costco.com/CatalogSearch?keyword=' },
    { id: 'heb', label: 'H-E-B', emoji: '🧡', mult: 0.97, family: 'regular', skuStyle: 'upc', prefix: '412201', brand: 'H-E-B', search: 'https://www.heb.com/search/?q=' },
    { id: 'foodlion', label: 'Food Lion', emoji: '🦁', mult: 0.93, family: 'regular', skuStyle: 'upc', prefix: '035826', brand: 'Food Lion', search: 'https://www.foodlion.com/search?q=' },
    { id: 'meijer', label: 'Meijer', emoji: '🛍️', mult: 0.99, family: 'regular', skuStyle: 'upc', prefix: '708820', brand: 'Meijer', search: 'https://www.meijer.com/shopping/search.html?query=' },
    { id: 'target', label: 'Target', emoji: '🎯', mult: 1.04, family: 'regular', skuStyle: 'upc', prefix: '085239', brand: 'Good & Gather', search: 'https://www.target.com/s?searchTerm=' },
    { id: 'kroger', label: 'Kroger', emoji: '🔵', mult: 1.12, family: 'regular', skuStyle: 'upc', prefix: '011110', brand: 'Kroger', search: 'https://www.kroger.com/search?query=' },
    { id: 'traderjoes', label: "Trader Joe's", emoji: '🌺', mult: 1.07, family: 'tj', skuStyle: 'item5', prefix: '', brand: "Trader Joe's", search: 'https://www.traderjoes.com/home/search?q=' },
    { id: 'safeway', label: 'Safeway', emoji: '🛒', mult: 1.16, family: 'regular', skuStyle: 'upc', prefix: '021130', brand: 'Signature Select', search: 'https://www.safeway.com/shop/search-results.html?q=' },
    { id: 'albertsons', label: 'Albertsons', emoji: '🛒', mult: 1.16, family: 'regular', skuStyle: 'upc', prefix: '021130', brand: 'Signature Select', search: 'https://www.albertsons.com/shop/search-results.html?q=' },
    { id: 'publix', label: 'Publix', emoji: '💚', mult: 1.20, family: 'regular', skuStyle: 'upc', prefix: '041415', brand: 'Publix', search: 'https://www.publix.com/shop/search?searchTerm=' },
    { id: 'sprouts', label: 'Sprouts', emoji: '🌱', mult: 1.26, family: 'regular', skuStyle: 'upc', prefix: '646354', brand: 'Sprouts', search: 'https://shop.sprouts.com/store/sprouts/search?q=' },
    { id: 'wholefoods', label: 'Whole Foods', emoji: '🥬', mult: 1.45, family: 'regular', skuStyle: 'upc', prefix: '099482', brand: '365', search: 'https://www.wholefoodsmarket.com/search?text=' }
  ];

  /* unit = recipe measure. price = typical Walmart store-brand unit (Sept 2026).
     pack = what you actually buy. Club packs are bigger, cheaper per unit. */
  const ITEMS = [
    { id: 'chicken-breast', names: ['chicken breast', 'chicken breasts', 'boneless chicken'], unit: 'lb', price: 3.20, eachLb: 0.5, packs: { regular: [2.5, '2.5 lb tray'], club: [6.5, '6.5 lb bag'], tj: [1, '1 lb pack'] } },
    { id: 'chicken-thigh', names: ['chicken thigh', 'chicken thighs'], unit: 'lb', price: 2.38, eachLb: 0.35, packs: { regular: [2.5, '2.5 lb tray'], club: [6, '6 lb bag'], tj: [1.5, '1.5 lb pack'] } },
    { id: 'chicken-whole', names: ['whole chicken'], unit: 'lb', price: 1.64, eachLb: 4.2, packs: { regular: [4.2, '1 whole bird ~4.2 lb'], club: [2, '2-pack whole birds'], tj: [4, '1 whole bird'] } },
    { id: 'chicken-wing', names: ['chicken wing', 'wings'], unit: 'lb', price: 2.78, packs: { regular: [3, '3 lb bag'], club: [8, '8 lb bag'], tj: [1.5, '1.5 lb pack'] } },
    { id: 'chicken', names: ['chicken'], unit: 'lb', price: 2.98, eachLb: 0.45, packs: { regular: [2.5, '2.5 lb tray'], club: [6.5, '6.5 lb bag'], tj: [1, '1 lb pack'] } },
    { id: 'turkey', names: ['ground turkey', 'turkey breast', 'turkey'], unit: 'lb', price: 3.98, packs: { regular: [1, '1 lb pack'], club: [3, '3 lb pack'], tj: [1, '1 lb pack'] } },
    { id: 'ground-beef', names: ['ground beef', 'minced beef', 'beef mince', 'hamburger meat', 'ground chuck', '80/20'], unit: 'lb', price: 6.49, packs: { regular: [1, '1 lb chub'], club: [5, '5 lb chub'], tj: [1, '1 lb pack'] } },
    { id: 'steak', names: ['steak', 'ribeye', 'sirloin', 'new york strip', 't-bone', 'filet mignon', 'fillet steak'], unit: 'lb', price: 12.48, packs: { regular: [1.25, '~1.25 lb (2 steaks)'], club: [4, '4 lb family pack'], tj: [0.75, '2-pack steaks'] } },
    { id: 'beef-roast', names: ['beef roast', 'chuck roast', 'pot roast', 'brisket', 'stew beef', 'stewing beef'], unit: 'lb', price: 7.48, packs: { regular: [3, '3 lb roast'], club: [6, '6 lb roast'], tj: [2, '2 lb roast'] } },
    { id: 'beef', names: ['beef'], unit: 'lb', price: 6.98, packs: { regular: [1, '1 lb pack'], club: [5, '5 lb pack'], tj: [1, '1 lb pack'] } },
    { id: 'pork-chop', names: ['pork chop', 'pork chops'], unit: 'lb', price: 3.48, eachLb: 0.45, packs: { regular: [1.4, '4-pack chops ~1.4 lb'], club: [4, 'family pack ~4 lb'], tj: [1, '1 lb pack'] } },
    { id: 'pork', names: ['pork loin', 'pork shoulder', 'pork tenderloin', 'pulled pork', 'pork butt', 'pork'], unit: 'lb', price: 3.28, packs: { regular: [2.5, '2.5 lb roast'], club: [6, '6 lb roast'], tj: [1.5, '1.5 lb tenderloin'] } },
    { id: 'bacon', names: ['bacon'], unit: 'lb', price: 5.48, packs: { regular: [1, '16 oz pack'], club: [3, '3 lb pack'], tj: [0.75, '12 oz pack'] } },
    { id: 'ham', names: ['ham'], unit: 'lb', price: 4.28, packs: { regular: [1.5, '1.5 lb sliced ham'], club: [5, '5 lb ham'], tj: [1, '1 lb pack'] } },
    { id: 'sausage', names: ['italian sausage', 'breakfast sausage', 'andouille', 'chorizo', 'kielbasa', 'sausage'], unit: 'lb', price: 3.98, packs: { regular: [1, '1 lb pack'], club: [3, '3 lb pack'], tj: [1, '1 lb pack'] } },
    { id: 'ribs', names: ['baby back', 'spare rib', 'pork rib', 'ribs'], unit: 'lb', price: 4.48, packs: { regular: [2.5, '1 rack ~2.5 lb'], club: [6, '2-rack pack'], tj: [2, '1 rack'] } },
    { id: 'lamb', names: ['lamb chop', 'leg of lamb', 'lamb'], unit: 'lb', price: 9.98, packs: { regular: [1.2, '1.2 lb pack'], club: [4, '4 lb pack'], tj: [1, '1 lb pack'] } },
    { id: 'venison', names: ['venison', 'deer meat', 'elk'], unit: 'lb', price: 0, hunter: true, packs: { regular: [1, 'from the freezer'], club: [1, 'from the freezer'], tj: [1, 'from the freezer'] } },
    { id: 'duck', names: ['duck breast', 'duck'], unit: 'lb', price: 7.48, packs: { regular: [1, '1 lb pack'], club: [3, '3 lb pack'], tj: [1, '1 lb pack'] } },
    { id: 'fish', names: ['white fish', 'tilapia', 'cod fillet', 'haddock', 'halibut', 'fish fillet'], unit: 'lb', price: 5.48, packs: { regular: [1, '1 lb frozen bag'], club: [3, '3 lb bag'], tj: [1, '1 lb pack'] } },
    { id: 'salmon', names: ['salmon'], unit: 'lb', price: 9.98, packs: { regular: [1.2, '2-fillet pack ~1.2 lb'], club: [3, '3 lb bag'], tj: [0.75, '2-pack fillets'] } },
    { id: 'catfish', names: ['catfish'], unit: 'lb', price: 5.48, packs: { regular: [1, '1 lb pack'], club: [3, '3 lb bag'], tj: [1, '1 lb pack'] } },
    { id: 'trout', names: ['trout'], unit: 'lb', price: 7.28, packs: { regular: [1, '1 lb pack'], club: [2.5, '2.5 lb pack'], tj: [1, '1 lb pack'] } },
    { id: 'tuna-fresh', names: ['tuna steak', 'fresh tuna'], unit: 'lb', price: 9.98, packs: { regular: [0.8, '~0.8 lb steak'], club: [2, '2 lb pack'], tj: [0.6, '1 steak'] } },
    { id: 'tuna-can', names: ['canned tuna', 'tuna'], unit: 'each', price: 1.08, packs: { regular: [4, '4-pack 5 oz cans'], club: [8, '8-pack cans'], tj: [1, '1 can'] } },
    { id: 'shrimp', names: ['shrimp', 'prawn'], unit: 'lb', price: 7.48, packs: { regular: [1, '1 lb bag'], club: [2, '2 lb bag'], tj: [1, '1 lb bag'] } },
    { id: 'crawfish', names: ['crawfish', 'crayfish', 'crawdad'], unit: 'lb', price: 5.98, packs: { regular: [2, '2 lb bag'], club: [5, '5 lb bag'], tj: [1, '1 lb bag'] } },
    { id: 'crab', names: ['crabmeat', 'crab meat', 'crab'], unit: 'lb', price: 12.98, packs: { regular: [0.5, '8 oz tub'], club: [1, '1 lb tub'], tj: [0.5, '8 oz tub'] } },
    { id: 'scallops', names: ['scallop'], unit: 'lb', price: 14.98, packs: { regular: [1, '1 lb bag'], club: [2.5, '2.5 lb bag'], tj: [0.75, '12 oz bag'] } },
    { id: 'eggs', names: ['eggs', 'egg'], unit: 'each', price: 0.233, packs: { regular: [12, '1 dozen Grade A'], club: [24, '2 dozen'], tj: [12, '1 dozen'] } },
    { id: 'milk', names: ['whole milk', '2% milk', 'milk'], unit: 'gal', price: 3.28, packs: { regular: [1, '1 gallon'], club: [2, '2-pack gallons'], tj: [0.5, 'half gallon'] } },
    { id: 'butter', names: ['unsalted butter', 'salted butter', 'butter'], unit: 'lb', price: 3.98, packs: { regular: [1, '1 lb (4 sticks)'], club: [4, '4 lb pack'], tj: [1, '1 lb'] } },
    { id: 'cheddar', names: ['cheddar', 'shredded cheese', 'mexican cheese', 'colby jack'], unit: 'lb', price: 4.60, packs: { regular: [0.5, '8 oz block'], club: [2, '2 lb block'], tj: [0.5, '8 oz pack'] } },
    { id: 'parmesan', names: ['parmesan', 'parmigiano'], unit: 'lb', price: 7.96, packs: { regular: [0.5, '8 oz shaker/wedge'], club: [1.5, '24 oz wedge'], tj: [0.44, '7 oz wedge'] } },
    { id: 'mozzarella', names: ['mozzarella'], unit: 'lb', price: 4.38, packs: { regular: [0.5, '8 oz ball/bag'], club: [2, '2 lb bag'], tj: [0.5, '8 oz'] } },
    { id: 'cream', names: ['heavy cream', 'whipping cream', 'heavy whipping cream'], unit: 'oz', price: 0.20, packs: { regular: [16, '1 pint / 16 oz'], club: [32, '32 oz'], tj: [16, '16 oz'] } },
    { id: 'sour-cream', names: ['sour cream'], unit: 'oz', price: 0.14, packs: { regular: [16, '16 oz tub'], club: [48, '48 oz tub'], tj: [16, '16 oz'] } },
    { id: 'yogurt', names: ['greek yogurt', 'yogurt'], unit: 'oz', price: 0.083, packs: { regular: [32, '32 oz tub'], club: [48, '48 oz tub'], tj: [32, '32 oz'] } },
    { id: 'rice', names: ['jasmine rice', 'white rice', 'brown rice', 'rice'], unit: 'lb', price: 0.95, packs: { regular: [2, '2 lb bag'], club: [25, '25 lb bag'], tj: [1.5, '1.5 lb bag'] } },
    { id: 'pasta', names: ['spaghetti', 'penne', 'egg noodles', 'macaroni', 'pasta', 'noodles'], unit: 'lb', price: 1.10, packs: { regular: [1, '16 oz box'], club: [6, '6 lb bag'], tj: [1, '1 lb box'] } },
    { id: 'grits', names: ['grits', 'cornmeal', 'polenta'], unit: 'lb', price: 1.08, packs: { regular: [2, '2 lb bag'], club: [5, '5 lb bag'], tj: [1.5, '24 oz'] } },
    { id: 'bread', names: ['sandwich bread', 'loaf', 'bread'], unit: 'loaf', price: 1.58, packs: { regular: [1, '1 loaf'], club: [2, '2-pack loaves'], tj: [1, '1 loaf'] } },
    { id: 'buns', names: ['hamburger bun', 'hot dog bun', 'dinner roll', 'buns', 'rolls'], unit: 'each', price: 0.31, packs: { regular: [8, '8-count pack'], club: [16, '16-count pack'], tj: [6, '6-count'] } },
    { id: 'tortillas', names: ['flour tortilla', 'corn tortilla', 'tortilla', 'tortillas'], unit: 'each', price: 0.17, packs: { regular: [10, '10-count pack'], club: [24, '24-count pack'], tj: [8, '8-count'] } },
    { id: 'flour', names: ['all-purpose flour', 'plain flour', 'flour'], unit: 'lb', price: 0.52, packs: { regular: [5, '5 lb bag'], club: [25, '25 lb bag'], tj: [2, '2 lb bag'] } },
    { id: 'sugar', names: ['brown sugar', 'white sugar', 'sugar'], unit: 'lb', price: 0.72, packs: { regular: [4, '4 lb bag'], club: [10, '10 lb bag'], tj: [2, '2 lb bag'] } },
    { id: 'oil', names: ['olive oil', 'vegetable oil', 'canola oil', 'cooking oil', 'oil'], unit: 'oz', price: 0.36, packs: { regular: [17, '17 oz bottle'], club: [68, '2 L / 68 oz jug'], tj: [16.9, '500 ml bottle'] } },
    { id: 'sesame-oil', names: ['sesame oil'], unit: 'oz', price: 0.42, packs: { regular: [8, '8 oz bottle'], club: [16, '16 oz'], tj: [8, '8 oz'] } },
    { id: 'potato', names: ['russet potato', 'potato', 'potatoes'], unit: 'lb', price: 0.74, packs: { regular: [5, '5 lb bag'], club: [15, '15 lb bag'], tj: [3, '3 lb bag'] } },
    { id: 'sweet-potato', names: ['sweet potato', 'yam'], unit: 'lb', price: 1.08, packs: { regular: [3, '3 lb bag'], club: [10, '10 lb bag'], tj: [2, '2 lb bag'] } },
    { id: 'onion', names: ['yellow onion', 'red onion', 'white onion', 'onion', 'onions', 'shallot'], unit: 'lb', price: 0.98, eachLb: 0.5, packs: { regular: [3, '3 lb bag'], club: [10, '10 lb bag'], tj: [2, '2 lb bag'] } },
    { id: 'garlic', names: ['garlic clove', 'clove garlic', 'garlic'], unit: 'clove', price: 0.07, packs: { regular: [10, '1 bulb (~10 cloves)'], club: [30, '3-bulb mesh bag'], tj: [10, '1 bulb'] } },
    { id: 'carrot', names: ['carrot', 'carrots'], unit: 'lb', price: 0.92, packs: { regular: [2, '2 lb bag'], club: [5, '5 lb bag'], tj: [1, '1 lb bag'] } },
    { id: 'celery', names: ['celery'], unit: 'each', price: 1.48, packs: { regular: [1, '1 bunch'], club: [2, '2-pack bunches'], tj: [1, '1 bunch'] } },
    { id: 'broccoli', names: ['broccoli'], unit: 'lb', price: 1.98, packs: { regular: [1, '1 crown ~1 lb'], club: [3, '3 lb bag'], tj: [1, '1 crown'] } },
    { id: 'green-beans', names: ['green bean', 'green beans', 'string beans'], unit: 'lb', price: 1.78, packs: { regular: [1, '1 lb bag'], club: [2, '2 lb bag'], tj: [0.75, '12 oz bag'] } },
    { id: 'asparagus', names: ['asparagus'], unit: 'lb', price: 2.98, packs: { regular: [1, '1 lb bunch'], club: [2.5, '2.5 lb pack'], tj: [1, '1 bunch'] } },
    { id: 'spinach', names: ['spinach'], unit: 'oz', price: 0.22, packs: { regular: [8, '8 oz clamshell'], club: [16, '1 lb clamshell'], tj: [6, '6 oz'] } },
    { id: 'lettuce', names: ['romaine', 'salad greens', 'iceberg', 'lettuce', 'cabbage'], unit: 'each', price: 1.98, packs: { regular: [1, '1 head / bag'], club: [3, '3-count romaine'], tj: [1, '1 bag'] } },
    { id: 'tomato', names: ['roma tomato', 'plum tomato', 'tomato', 'tomatoes'], unit: 'lb', price: 1.58, eachLb: 0.4, packs: { regular: [1, '1 lb pack'], club: [5, '5 lb box'], tj: [1, '1 lb pack'] } },
    { id: 'pepper', names: ['bell pepper', 'red pepper', 'green pepper', 'yellow pepper', 'capsicum'], unit: 'each', price: 0.88, packs: { regular: [1, '1 pepper'], club: [6, '6-count bag'], tj: [3, '3-pack'] } },
    { id: 'jalapeno', names: ['jalapeno', 'jalapeño'], unit: 'each', price: 0.20, packs: { regular: [1, '1 pepper'], club: [8, '8 oz bag ~8 peppers'], tj: [1, '1 pepper'] } },
    { id: 'corn', names: ['corn on the cob', 'sweet corn', 'frozen corn', 'corn'], unit: 'each', price: 0.48, packs: { regular: [4, '4-ear pack'], club: [12, '12-ear bag'], tj: [4, '4-ear'] } },
    { id: 'zucchini', names: ['zucchini', 'courgette', 'yellow squash'], unit: 'lb', price: 1.38, packs: { regular: [1, '~1 lb (2 squash)'], club: [3, '3 lb bag'], tj: [1, '1 lb'] } },
    { id: 'mushroom', names: ['mushroom', 'mushrooms'], unit: 'oz', price: 0.27, packs: { regular: [8, '8 oz tray'], club: [24, '24 oz pack'], tj: [8, '8 oz'] } },
    { id: 'avocado', names: ['avocado'], unit: 'each', price: 1.18, packs: { regular: [1, '1 avocado'], club: [6, '6-count bag'], tj: [4, '4-pack'] } },
    { id: 'lemon', names: ['lemon juice', 'lemon'], unit: 'each', price: 0.48, packs: { regular: [1, '1 lemon'], club: [5, '2 lb bag ~5'], tj: [1, '1 lemon'] } },
    { id: 'lime', names: ['lime juice', 'lime'], unit: 'each', price: 0.38, packs: { regular: [1, '1 lime'], club: [8, '2 lb bag ~8'], tj: [1, '1 lime'] } },
    { id: 'apple', names: ['apple', 'apples'], unit: 'lb', price: 1.48, packs: { regular: [3, '3 lb bag'], club: [6, '6 lb bag'], tj: [2, '2 lb bag'] } },
    { id: 'banana', names: ['banana'], unit: 'lb', price: 0.58, packs: { regular: [2, '~2 lb bunch'], club: [4, '3–4 lb bunch'], tj: [2, 'bunch'] } },
    { id: 'berries', names: ['strawberry', 'blueberry', 'raspberry', 'berries'], unit: 'oz', price: 0.28, packs: { regular: [16, '16 oz clamshell'], club: [32, '2 lb clamshell'], tj: [16, '16 oz'] } },
    { id: 'herbs', names: ['fresh cilantro', 'fresh parsley', 'fresh basil', 'cilantro', 'parsley', 'mint', 'dill'], unit: 'each', price: 1.28, packs: { regular: [1, '1 bunch'], club: [2, '2 bunches'], tj: [1, '1 bunch'] } },
    { id: 'beans', names: ['black beans', 'pinto beans', 'kidney beans', 'cannellini', 'chickpeas', 'garbanzo', 'lentils', 'black bean', 'pinto'], unit: 'each', price: 0.98, packs: { regular: [1, '15 oz can'], club: [8, '8-pack cans'], tj: [1, '1 can'] } },
    { id: 'broth', names: ['chicken broth', 'beef broth', 'chicken stock', 'beef stock', 'stock cube', 'bouillon', 'broth'], unit: 'oz', price: 0.06, packs: { regular: [32, '32 oz carton'], club: [96, '3-pack 32 oz'], tj: [32, '32 oz'] } },
    { id: 'tomato-sauce', names: ['crushed tomato', 'diced tomato', 'tomato sauce', 'tomato paste', 'marinara', 'passata'], unit: 'oz', price: 0.079, packs: { regular: [15, '15 oz can'], club: [90, '6-pack 15 oz'], tj: [18, '18 oz jar'] } },
    { id: 'soy', names: ['soy sauce', 'tamari'], unit: 'oz', price: 0.11, packs: { regular: [10, '10 oz bottle'], club: [40, '40 oz bottle'], tj: [10, '10 oz'] } },
    { id: 'hotsauce', names: ['hot sauce', 'buffalo sauce', 'sriracha'], unit: 'oz', price: 0.15, packs: { regular: [12, '12 oz bottle'], club: [28, '28 oz bottle'], tj: [10, '10 oz'] } },
    { id: 'mayo', names: ['mayonnaise', 'mayo'], unit: 'oz', price: 0.12, packs: { regular: [30, '30 oz jar'], club: [64, '64 oz jar'], tj: [16, '16 oz'] } },
    { id: 'mustard', names: ['mustard'], unit: 'oz', price: 0.10, packs: { regular: [14, '14 oz bottle'], club: [30, '30 oz'], tj: [8, '8 oz'] } },
    { id: 'ketchup', names: ['ketchup', 'catsup'], unit: 'oz', price: 0.09, packs: { regular: [20, '20 oz bottle'], club: [64, '64 oz'], tj: [13.5, '13.5 oz'] } },
    { id: 'vinegar', names: ['apple cider vinegar', 'balsamic vinegar', 'white vinegar', 'vinegar'], unit: 'oz', price: 0.09, packs: { regular: [16, '16 oz bottle'], club: [67, '2 L jug'], tj: [16, '16 oz'] } },
    { id: 'honey', names: ['maple syrup', 'honey'], unit: 'oz', price: 0.26, packs: { regular: [12, '12 oz bottle'], club: [40, '40 oz'], tj: [12, '12 oz'] } },
    { id: 'wine', names: ['white wine', 'red wine', 'dry wine', 'cooking wine'], unit: 'each', price: 7.98, packs: { regular: [1, '750 ml bottle'], club: [2, '2-pack 750 ml'], tj: [1, '750 ml'] } },
    { id: 'breadcrumbs', names: ['breadcrumb', 'panko'], unit: 'oz', price: 0.12, packs: { regular: [15, '15 oz canister'], club: [48, '48 oz'], tj: [8, '8 oz'] } },
    { id: 'tofu', names: ['tofu'], unit: 'oz', price: 0.14, packs: { regular: [14, '14 oz pack'], club: [28, '2-pack'], tj: [14, '14 oz'] } },
    { id: 'ginger', names: ['fresh ginger', 'ginger'], unit: 'oz', price: 0.32, packs: { regular: [4, '4 oz hand'], club: [8, '8 oz'], tj: [4, '4 oz'] } },
    { id: 'coconut-milk', names: ['coconut milk'], unit: 'oz', price: 0.13, packs: { regular: [13.5, '13.5 oz can'], club: [81, '6-pack cans'], tj: [13.5, '1 can'] } },
    { id: 'cornstarch', names: ['corn starch', 'cornstarch'], unit: 'oz', price: 0.10, packs: { regular: [16, '16 oz box'], club: [32, '32 oz'], tj: [8, '8 oz'] } },
    { id: 'baking-powder', names: ['baking powder', 'baking soda'], unit: 'oz', price: 0.12, packs: { regular: [8, '8 oz can'], club: [16, '16 oz'], tj: [8, '8 oz'] } },
    { id: 'salt', names: ['kosher salt', 'sea salt', 'table salt', 'salt'], unit: 'oz', price: 0, pantry: true, packs: { regular: [26, '26 oz canister'], club: [48, '48 oz'], tj: [16, '16 oz'] } },
    { id: 'black-pepper', names: ['black pepper', 'ground pepper', 'pepper'], unit: 'oz', price: 0, pantry: true, packs: { regular: [3, '3 oz grinder'], club: [16, '16 oz'], tj: [1.7, '1.7 oz'] } },
    { id: 'spices', names: ['chili powder', 'garlic powder', 'onion powder', 'italian seasoning', 'paprika', 'cumin', 'oregano', 'thyme', 'rosemary', 'cinnamon', 'cayenne', 'curry powder', 'turmeric', 'cajun seasoning', 'blackened'], unit: 'oz', price: 0.48, packs: { regular: [2.5, '2.5 oz spice jar'], club: [18, '18 oz restaurant jar'], tj: [1.8, '1.8 oz jar'] } },
    { id: 'water', names: ['water', 'ice'], unit: 'oz', price: 0, pantry: true, packs: { regular: [1, 'from the tap'], club: [1, 'from the tap'], tj: [1, 'from the tap'] } }
  ];

  const GUESS = [
    { re: /chicken|turkey|ground beef|beef|steak|pork|lamb|duck|sausage|bacon|ham|rib/, unit: 'lb', price: 6.49, pack: [1, '1 lb pack'] },
    { re: /fish|salmon|shrimp|cod|tilapia|tuna|crab|scallop/, unit: 'lb', price: 7.98, pack: [1, '1 lb pack'] },
    { re: /cilantro|parsley|basil|herb|mint|dill/, unit: 'each', price: 1.28, pack: [1, '1 bunch'] },
    { re: /chili powder|garlic powder|onion powder|paprika|cumin|oregano|thyme|curry|season/, unit: 'oz', price: 0.48, pack: [2.5, '2.5 oz spice jar'] },
    { re: /wine/, unit: 'each', price: 7.98, pack: [1, '750 ml bottle'] },
    { re: /oil|sauce|vinegar|syrup|dressing/, unit: 'oz', price: 0.16, pack: [12, '12 oz bottle'] },
    { re: /milk|cream|yogurt|cheese|butter/, unit: 'oz', price: 0.15, pack: [16, '16 oz pack'] },
    { re: /onion|pepper|tomato|lettuce|spinach|broccoli|carrot|potato/, unit: 'lb', price: 1.48, pack: [1, '1 lb produce'] },
    { re: /rice|pasta|noodle|flour|sugar|bean/, unit: 'lb', price: 1.18, pack: [1, '1 lb bag / box'] },
    { re: /can|canned/, unit: 'each', price: 1.18, pack: [1, '15 oz can'] }
  ];
  const GUESS_DEFAULT = { unit: 'each', price: 2.28, pack: [1, '1 pack (est.)'] };

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

  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < String(s).length; i += 1) {
      h ^= String(s).charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h) >>> 0;
  }

  function makeSku(store, itemId) {
    const n = hashStr(store.id + ':' + itemId);
    if (store.skuStyle === 'item6') return String(100000 + (n % 900000));
    if (store.skuStyle === 'item5') return String(10000 + (n % 90000));
    if (store.skuStyle === 'sams') return '98' + String(n % 1000000).padStart(6, '0');
    const body = String(n % 1000000).padStart(6, '0');
    return String(store.prefix || '000000') + body;
  }

  function shelf(n) {
    return Math.round((n || 0) * 100) / 100;
  }

  function money(n) {
    return '$' + shelf(n).toFixed(2);
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

  function aliasHit(hay, alias) {
    const t = String(alias).toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp('(^|[^a-z0-9])' + t + '(?![a-z])', 'i').test(hay);
  }

  function findItem(name) {
    const n = String(name || '').toLowerCase();
    let best = null;
    let bestLen = 0;
    ITEMS.forEach((item) => {
      item.names.forEach((alias) => {
        if (aliasHit(n, alias) && alias.length > bestLen) {
          best = item;
          bestLen = alias.length;
        }
      });
    });
    return best;
  }

  function guessKind(name) {
    const n = String(name || '').toLowerCase();
    for (let i = 0; i < GUESS.length; i += 1) {
      if (GUESS[i].re.test(n)) return GUESS[i];
    }
    return GUESS_DEFAULT;
  }

  function needInItemUnit(parsed, unit, eachLb) {
    const qty = parsed.qty || 1;
    const u = parsed.unit;
    const pieceLb = eachLb || 0.45;
    if (unit === 'each' || unit === 'clove') {
      if (!u || u === 'each' || u === 'clove' || u === 'piece' || u === 'bunch') return qty;
      if (u === 'dozen') return qty * 12;
      if (u === 'lb') return qty / (pieceLb || 0.5);
      if (u === 'tsp' || u === 'tbsp') return Math.max(qty, 1);
      return qty;
    }
    if (unit === 'loaf') return u === 'slice' ? qty / 20 : Math.max(qty, 1);
    if (unit === 'gal') {
      if (u === 'gal') return qty;
      if (u === 'cup') return qty / 16;
      if (u === 'oz') return qty / 128;
      if (u === 'ml') return qty / 3785;
      if (u === 'tbsp') return qty / 256;
      return qty / 16;
    }
    if (unit === 'oz') {
      if (u === 'oz') return qty;
      if (u === 'lb') return qty * 16;
      if (u === 'g') return qty / 28.35;
      if (u === 'cup') return qty * 8;
      if (u === 'tbsp') return qty * 0.5;
      if (u === 'tsp') return qty / 6;
      if (u === 'ml') return qty / 29.57;
      if (u === 'can') return qty * 14;
      if (u === 'pinch' || u === 'dash') return 0.05;
      return qty;
    }
    if (u === 'lb') return qty;
    if (u === 'oz') return qty / 16;
    if (u === 'g') return qty / 453.6;
    if (u === 'kg') return qty * 2.204;
    if (u === 'each' || u === 'clove' || !u) return qty * pieceLb;
    if (u === 'can') return qty * 0.9;
    if (u === 'cup') return qty * 0.5;
    return qty * pieceLb;
  }

  function packFor(item, store) {
    const fam = store.family || 'regular';
    const spec = (item.packs && (item.packs[fam] || item.packs.regular)) || [1, '1 pack'];
    return { qty: spec[0], label: spec[1] };
  }

  function skuRecord(store, item, need) {
    const pack = packFor(item, store);
    const unitPrice = (item.price || 0) * store.mult;
    const packPrice = shelf(pack.qty * unitPrice);
    const packs = item.pantry || item.hunter || packPrice === 0
      ? 0
      : Math.max(1, Math.ceil((need || 0) / pack.qty - 1e-9));
    const checkout = shelf(packs * packPrice);
    const covered = packs * pack.qty;
    const dinner = covered ? shelf(checkout * Math.min(need / covered, 1)) : 0;
    const sku = makeSku(store, item.id);
    return {
      status: item.hunter ? 'hunter' : (item.pantry ? 'pantry' : 'priced'),
      sku: sku,
      product: (store.brand ? store.brand + ' ' : '') + (item.names[0][0].toUpperCase() + item.names[0].slice(1)),
      packLabel: pack.label,
      packQty: pack.qty,
      packPrice: packPrice,
      packs: packs,
      need: need,
      unit: item.unit,
      dinner: dinner,
      checkout: checkout,
      leftover: Math.max(covered - need, 0),
      query: item.names[0],
      approx: false
    };
  }

  function approxRecord(store, parsed, need) {
    const kind = guessKind(parsed.name);
    const packQty = kind.pack[0];
    const packPrice = shelf(packQty * kind.price * store.mult);
    const packs = Math.max(1, Math.ceil(need / packQty - 1e-9));
    const checkout = shelf(packs * packPrice);
    const covered = packs * packQty;
    const dinner = shelf(checkout * Math.min(need / covered, 1));
    const sku = makeSku(store, 'approx-' + parsed.name.toLowerCase().slice(0, 24));
    return {
      status: 'approx',
      sku: sku,
      product: parsed.name + ' (approx SKU)',
      packLabel: kind.pack[1],
      packQty: packQty,
      packPrice: packPrice,
      packs: packs,
      need: need,
      unit: kind.unit,
      dinner: dinner,
      checkout: checkout,
      leftover: Math.max(covered - need, 0),
      query: parsed.name,
      approx: true
    };
  }

  function priceLines(ingredients, storeId, scale) {
    const store = storeById(storeId);
    const factor = scale && isFinite(scale) ? scale : 1;
    return (ingredients || []).map((raw) => {
      const parsed = parseLine(raw);
      if (!parsed) return null;
      const item = findItem(parsed.name);
      if (!item) {
        const kind = guessKind(parsed.name);
        const need = Math.max(needInItemUnit(parsed, kind.unit, 0.45) * factor, 0.02);
        const rec = approxRecord(store, parsed, need);
        rec.raw = raw;
        rec.name = parsed.name;
        rec.groupNeed = need;
        return rec;
      }
      if (item.hunter || item.pantry) {
        const rec = skuRecord(store, item, 0);
        rec.raw = raw;
        rec.name = item.names[0];
        rec.groupNeed = 0;
        rec.dinner = 0;
        rec.checkout = 0;
        rec.packs = 0;
        return rec;
      }
      const need = Math.max(needInItemUnit(parsed, item.unit, item.eachLb) * factor, 0.02);
      const rec = skuRecord(store, item, need);
      rec.raw = raw;
      rec.name = item.names[0];
      rec.groupNeed = need;
      rec.itemId = item.id;
      return rec;
    }).filter(Boolean);
  }

  function cart(groups, storeId) {
    const store = storeById(storeId);
    const merged = {};
    groups.forEach((g) => {
      (g.lines || []).forEach((line) => {
        const key = (line.itemId || line.sku || line.name) + ':' + (line.status || '');
        if (!merged[key]) {
          merged[key] = Object.assign({}, line, { groups: [g.label], need: line.groupNeed || line.need || 0 });
        } else {
          merged[key].need += line.groupNeed || line.need || 0;
          if (merged[key].groups.indexOf(g.label) === -1) merged[key].groups.push(g.label);
        }
      });
    });
    const lines = Object.keys(merged).map((key) => {
      const line = merged[key];
      if (line.status === 'priced' || line.status === 'approx') {
        const packs = Math.max(1, Math.ceil(line.need / line.packQty - 1e-9));
        line.packs = packs;
        line.checkout = shelf(packs * line.packPrice);
        const covered = packs * line.packQty;
        line.dinner = shelf(line.checkout * Math.min(line.need / covered, 1));
        line.leftover = Math.max(covered - line.need, 0);
      }
      return line;
    });
    lines.sort((a, b) => (b.checkout || 0) - (a.checkout || 0));
    const dinner = lines.reduce((s, l) => s + (l.dinner || 0), 0);
    const checkout = lines.reduce((s, l) => s + (l.checkout || 0), 0);
    const approx = lines.filter((l) => l.status === 'approx').length;
    return { store, lines: lines, dinner: shelf(dinner), checkout: shelf(checkout), approx: approx, money: money };
  }

  root.DWGrocery = { STORES, storeById, priceLines, cart, money };
})(window);
