(function (root) {
  const SIDES = [
    {
      id: 'side-butter-rice',
      title: 'Buttered Rice',
      kind: 'starch',
      timeMin: 20,
      servings: 4,
      budget: 1,
      difficulty: 1,
      pairs: ['chicken', 'beef', 'shrimp', 'fish', 'pork', 'beans', 'lamb', 'turkey'],
      styles: ['american', 'mexican', 'asian', 'southern', 'united states'],
      ingredients: ['1 cup rice', '2 cups water', '1 tbsp butter', '1/2 tsp salt'],
      steps: [
        'Rinse the rice until the water runs clearer.',
        'Bring water and salt to a boil. Stir in rice, cover, and drop to low.',
        'Cook 15–18 minutes until tender. Rest 5 minutes, then fluff with butter.'
      ]
    },
    {
      id: 'side-mashed-potatoes',
      title: 'Creamy Mashed Potatoes',
      kind: 'starch',
      timeMin: 30,
      servings: 4,
      budget: 2,
      difficulty: 1,
      pairs: ['steak', 'beef roast', 'chicken', 'pork chops', 'turkey', 'venison', 'lamb'],
      styles: ['american', 'southern', 'united states', 'british'],
      ingredients: ['2 lb potatoes', '4 tbsp butter', '1/2 cup milk', '1 tsp salt', 'black pepper'],
      steps: [
        'Peel and chunk the potatoes. Cover with cold salted water.',
        'Boil until a fork slides through, 15–20 minutes. Drain well.',
        'Mash with butter and warm milk. Season with salt and pepper.'
      ]
    },
    {
      id: 'side-roasted-potatoes',
      title: 'Crispy Roasted Potatoes',
      kind: 'starch',
      timeMin: 40,
      servings: 4,
      budget: 1,
      difficulty: 1,
      pairs: ['chicken', 'steak', 'pork', 'fish', 'sausage', 'lamb', 'venison'],
      styles: ['american', 'italian', 'united states'],
      ingredients: ['2 lb potatoes', '2 tbsp olive oil', '1 tsp salt', '1 tsp garlic powder', '1 tsp paprika'],
      steps: [
        'Heat oven to 425°F. Cut potatoes into 1-inch chunks.',
        'Toss with oil, salt, garlic powder, and paprika.',
        'Roast 30–35 minutes, flipping once, until browned and crisp.'
      ]
    },
    {
      id: 'side-garlic-bread',
      title: 'Garlic Bread',
      kind: 'starch',
      timeMin: 15,
      servings: 4,
      budget: 2,
      difficulty: 1,
      pairs: ['chicken', 'beef', 'shrimp', 'vegetarian', 'sausage', 'pork'],
      styles: ['italian', 'american', 'united states'],
      ingredients: ['1 loaf bread', '4 tbsp butter', '2 cloves garlic', '1 tsp Italian seasoning'],
      steps: [
        'Heat oven to 400°F. Mix softened butter with minced garlic and seasoning.',
        'Split the loaf, spread the butter, and bake 8–10 minutes until edges brown.'
      ]
    },
    {
      id: 'side-cornbread',
      title: 'Skillet Cornbread',
      kind: 'starch',
      timeMin: 30,
      servings: 6,
      budget: 1,
      difficulty: 2,
      pairs: ['chicken', 'chili', 'beans', 'pork', 'ribs', 'sausage', 'catfish', 'wild hog'],
      styles: ['southern', 'united states', 'american', 'mexican'],
      ingredients: ['1 cup flour', '1 cup cornmeal', '1 tbsp sugar', '1 tbsp baking powder', '1 tsp salt', '1 cup milk', '1 egg', '4 tbsp butter'],
      steps: [
        'Heat oven to 400°F with a buttered skillet inside.',
        'Stir dry ingredients. Whisk in milk, egg, and melted butter.',
        'Pour into the hot skillet. Bake 18–22 minutes until golden.'
      ]
    },
    {
      id: 'side-mac-cheese',
      title: 'Stovetop Mac and Cheese',
      kind: 'starch',
      timeMin: 20,
      servings: 4,
      budget: 2,
      difficulty: 1,
      pairs: ['chicken', 'ribs', 'pork', 'sausage', 'turkey', 'ham'],
      styles: ['american', 'southern', 'united states'],
      ingredients: ['8 oz pasta', '2 tbsp butter', '2 tbsp flour', '1 1/2 cups milk', '2 cups cheddar', '1/2 tsp salt'],
      steps: [
        'Boil pasta in salted water until just tender. Drain.',
        'Melt butter, whisk in flour 1 minute, then milk until thick.',
        'Kill the heat, stir in cheese and salt, then fold in pasta.'
      ]
    },
    {
      id: 'side-egg-noodles',
      title: 'Buttered Egg Noodles',
      kind: 'starch',
      timeMin: 15,
      servings: 4,
      budget: 1,
      difficulty: 1,
      pairs: ['beef', 'chicken', 'pork', 'venison', 'turkey'],
      styles: ['american', 'united states'],
      ingredients: ['12 oz egg noodles', '2 tbsp butter', '1 tsp salt', 'black pepper'],
      steps: [
        'Boil noodles in salted water per the bag, usually 7–8 minutes.',
        'Drain, toss with butter, salt, and pepper.'
      ]
    },
    {
      id: 'side-sweet-potato',
      title: 'Baked Sweet Potatoes',
      kind: 'starch',
      timeMin: 45,
      servings: 4,
      budget: 1,
      difficulty: 1,
      pairs: ['chicken', 'pork', 'turkey', 'sausage', 'beans'],
      styles: ['american', 'southern', 'united states'],
      ingredients: ['4 sweet potatoes', '1 tbsp oil', '1 tsp salt', '2 tbsp butter'],
      steps: [
        'Heat oven to 400°F. Rub potatoes with oil and salt.',
        'Bake 40–50 minutes until soft. Split and add butter.'
      ]
    },
    {
      id: 'side-tortillas',
      title: 'Warm Tortillas',
      kind: 'starch',
      timeMin: 5,
      servings: 4,
      budget: 1,
      difficulty: 1,
      pairs: ['chicken', 'beef', 'shrimp', 'fish', 'pork', 'beans', 'venison'],
      styles: ['mexican', 'united states', 'american'],
      ingredients: ['8 tortillas'],
      steps: [
        'Warm tortillas in a dry skillet 20–30 seconds a side, or wrap in foil in a 300°F oven for 8 minutes.',
        'Keep wrapped in a towel so they stay soft.'
      ]
    },
    {
      id: 'side-cheddar-grits',
      title: 'Cheddar Grits',
      kind: 'starch',
      timeMin: 20,
      servings: 4,
      budget: 1,
      difficulty: 1,
      pairs: ['shrimp', 'sausage', 'chicken', 'catfish', 'eggs', 'ham'],
      styles: ['southern', 'united states', 'american'],
      ingredients: ['1 cup grits', '4 cups water', '1 tsp salt', '2 tbsp butter', '1 cup cheddar'],
      steps: [
        'Bring salted water to a boil. Whisk in grits.',
        'Simmer, stirring, 12–15 minutes until creamy.',
        'Stir in butter and cheddar off the heat.'
      ]
    },
    {
      id: 'side-green-beans',
      title: 'Garlic Green Beans',
      kind: 'veg',
      timeMin: 15,
      servings: 4,
      budget: 2,
      difficulty: 1,
      pairs: ['chicken', 'steak', 'pork chops', 'fish', 'salmon', 'turkey', 'lamb'],
      styles: ['american', 'asian', 'united states', 'southern'],
      ingredients: ['1 lb green beans', '1 tbsp olive oil', '2 cloves garlic', '1/2 tsp salt'],
      steps: [
        'Trim beans. Heat oil in a wide skillet over medium-high.',
        'Add beans and a splash of water. Cover 4 minutes.',
        'Uncover, add garlic and salt, and sauté until blistered and tender-crisp.'
      ]
    },
    {
      id: 'side-roasted-broccoli',
      title: 'Roasted Broccoli',
      kind: 'veg',
      timeMin: 25,
      servings: 4,
      budget: 2,
      difficulty: 1,
      pairs: ['chicken', 'beef', 'pork', 'fish', 'salmon', 'shrimp', 'tofu'],
      styles: ['american', 'asian', 'italian', 'united states'],
      ingredients: ['1 1/2 lb broccoli', '2 tbsp olive oil', '1 tsp salt', '1/2 lemon'],
      steps: [
        'Heat oven to 425°F. Cut broccoli into florets.',
        'Toss with oil and salt. Roast 18–22 minutes until browned at the edges.',
        'Squeeze lemon over the pan and serve.'
      ]
    },
    {
      id: 'side-salad',
      title: 'Simple Green Salad',
      kind: 'veg',
      timeMin: 10,
      servings: 4,
      budget: 2,
      difficulty: 1,
      pairs: ['chicken', 'steak', 'pasta', 'fish', 'vegetarian', 'pork', 'shrimp'],
      styles: ['american', 'italian', 'french', 'united states'],
      ingredients: ['1 head lettuce', '1 tomato', '1/2 cucumber', '2 tbsp olive oil', '1 tbsp vinegar', '1/2 tsp salt'],
      steps: [
        'Wash and tear the lettuce. Slice tomato and cucumber.',
        'Toss with oil, vinegar, and salt just before serving.'
      ]
    },
    {
      id: 'side-coleslaw',
      title: 'Creamy Coleslaw',
      kind: 'veg',
      timeMin: 10,
      servings: 4,
      budget: 1,
      difficulty: 1,
      pairs: ['pork', 'chicken', 'fish', 'catfish', 'ribs', 'sausage', 'shrimp'],
      styles: ['southern', 'american', 'united states'],
      ingredients: ['1/2 cabbage', '1 carrot', '1/2 cup mayonnaise', '1 tbsp vinegar', '1 tsp sugar', '1/2 tsp salt'],
      steps: [
        'Shred cabbage and carrot.',
        'Stir mayo, vinegar, sugar, and salt. Toss with the vegetables.',
        'Chill 10 minutes if you can.'
      ]
    },
    {
      id: 'side-honey-carrots',
      title: 'Honey Glazed Carrots',
      kind: 'veg',
      timeMin: 20,
      servings: 4,
      budget: 1,
      difficulty: 1,
      pairs: ['chicken', 'pork', 'turkey', 'beef roast', 'ham', 'lamb'],
      styles: ['american', 'united states', 'southern'],
      ingredients: ['1 lb carrots', '2 tbsp butter', '1 tbsp honey', '1/2 tsp salt'],
      steps: [
        'Peel and slice carrots. Cover with water, simmer until tender, 8–10 minutes. Drain.',
        'Add butter, honey, and salt. Toss over medium heat until glossy.'
      ]
    },
    {
      id: 'side-asparagus',
      title: 'Roasted Asparagus',
      kind: 'veg',
      timeMin: 15,
      servings: 4,
      budget: 3,
      difficulty: 1,
      pairs: ['salmon', 'steak', 'chicken', 'fish', 'shrimp', 'lamb'],
      styles: ['american', 'italian', 'united states'],
      ingredients: ['1 lb asparagus', '1 tbsp olive oil', '1/2 tsp salt', '1/2 lemon'],
      steps: [
        'Heat oven to 425°F. Snap off the woody ends.',
        'Toss with oil and salt. Roast 10–12 minutes.',
        'Finish with lemon.'
      ]
    },
    {
      id: 'side-spinach',
      title: 'Garlicky Sautéed Spinach',
      kind: 'veg',
      timeMin: 10,
      servings: 4,
      budget: 2,
      difficulty: 1,
      pairs: ['steak', 'chicken', 'fish', 'salmon', 'pork', 'eggs'],
      styles: ['american', 'italian', 'united states'],
      ingredients: ['10 oz spinach', '1 tbsp olive oil', '2 cloves garlic', '1/2 tsp salt'],
      steps: [
        'Heat oil, add garlic 30 seconds.',
        'Pile in spinach and salt. Toss until just wilted, 2–3 minutes.'
      ]
    },
    {
      id: 'side-corn',
      title: 'Buttered Corn',
      kind: 'veg',
      timeMin: 12,
      servings: 4,
      budget: 1,
      difficulty: 1,
      pairs: ['chicken', 'ribs', 'pork', 'sausage', 'fish', 'steak'],
      styles: ['american', 'southern', 'mexican', 'united states'],
      ingredients: ['4 ears corn', '2 tbsp butter', '1/2 tsp salt'],
      steps: [
        'Boil shucked corn 6–8 minutes, or microwave in the husk 4 minutes then husk.',
        'Roll in butter and salt.'
      ]
    },
    {
      id: 'side-brussels',
      title: 'Roasted Brussels Sprouts',
      kind: 'veg',
      timeMin: 30,
      servings: 4,
      budget: 2,
      difficulty: 1,
      pairs: ['pork', 'chicken', 'sausage', 'steak', 'turkey'],
      styles: ['american', 'united states'],
      ingredients: ['1 1/2 lb brussels sprouts', '2 tbsp olive oil', '1 tsp salt', 'black pepper'],
      steps: [
        'Heat oven to 425°F. Halve the sprouts.',
        'Toss with oil, salt, and pepper. Roast cut-side down 22–28 minutes until browned.'
      ]
    },
    {
      id: 'side-cucumber',
      title: 'Cucumber Vinegar Salad',
      kind: 'veg',
      timeMin: 10,
      servings: 4,
      budget: 1,
      difficulty: 1,
      pairs: ['fish', 'chicken', 'pork', 'shrimp', 'salmon', 'tofu'],
      styles: ['asian', 'american', 'united states', 'japanese'],
      ingredients: ['2 cucumbers', '1/4 cup vinegar', '1 tsp sugar', '1/2 tsp salt', '1 tsp sesame oil'],
      steps: [
        'Slice cucumbers thin.',
        'Toss with vinegar, sugar, salt, and sesame oil. Serve cold.'
      ]
    },
    {
      id: 'side-pico',
      title: 'Pico de Gallo',
      kind: 'veg',
      timeMin: 10,
      servings: 4,
      budget: 2,
      difficulty: 1,
      pairs: ['chicken', 'beef', 'shrimp', 'fish', 'pork', 'beans', 'eggs'],
      styles: ['mexican', 'united states', 'american'],
      ingredients: ['3 tomatoes', '1/2 onion', '1 jalapeno', '1 lime', '1/2 tsp salt', '2 tbsp cilantro'],
      steps: [
        'Dice tomato, onion, and jalapeño. Chop cilantro.',
        'Toss with lime juice and salt.'
      ]
    },
    {
      id: 'side-black-beans',
      title: 'Quick Seasoned Black Beans',
      kind: 'starch',
      timeMin: 12,
      servings: 4,
      budget: 1,
      difficulty: 1,
      pairs: ['chicken', 'pork', 'shrimp', 'fish', 'beef', 'eggs', 'rice'],
      styles: ['mexican', 'united states', 'american'],
      ingredients: ['2 cans black beans', '1/2 onion', '1 tsp cumin', '1/2 tsp salt', '1 tbsp oil'],
      steps: [
        'Sauté onion in oil 3 minutes. Add drained beans, cumin, and salt.',
        'Simmer 8 minutes, mash a few beans for body.'
      ]
    },
    {
      id: 'side-collards',
      title: 'Braised Greens',
      kind: 'veg',
      timeMin: 35,
      servings: 4,
      budget: 1,
      difficulty: 2,
      pairs: ['pork', 'chicken', 'ham', 'turkey', 'catfish', 'sausage'],
      styles: ['southern', 'united states', 'american'],
      ingredients: ['1 bunch collard greens', '2 slices bacon', '1/2 onion', '1 cup chicken broth', '1/2 tsp salt'],
      steps: [
        'Strip stems and chop the greens. Cook bacon, then onion in the fat.',
        'Add greens, broth, and salt. Cover and simmer 25 minutes until tender.'
      ]
    },
    {
      id: 'side-applesauce',
      title: 'Warm Cinnamon Apples',
      kind: 'veg',
      timeMin: 15,
      servings: 4,
      budget: 1,
      difficulty: 1,
      pairs: ['pork chops', 'pork', 'ham', 'chicken', 'sausage'],
      styles: ['american', 'united states', 'southern'],
      ingredients: ['4 apples', '2 tbsp butter', '1 tbsp brown sugar', '1/2 tsp cinnamon'],
      steps: [
        'Peel and slice apples.',
        'Cook with butter, sugar, and cinnamon over medium heat 10 minutes until soft.'
      ]
    }
  ];

  function byId(id) {
    return SIDES.find((s) => s.id === id) || null;
  }

  function styleHay(recipe) {
    return [recipe.style, recipe.source, ...(recipe.tags || [])].join(' ').toLowerCase();
  }

  function scoreSide(side, recipe, maxDiff, maxBudget) {
    if ((side.difficulty || 1) > maxDiff) return -1;
    if ((side.budget || 1) > maxBudget + 1) return -1;
    let score = 1;
    const proteins = (recipe.proteins || []).concat(recipe.protein || []).map((p) => String(p).toLowerCase().replace(/-/g, ' '));
    if (side.pairs.some((p) => proteins.some((r) => r.includes(p) || p.includes(r)))) score += 6;
    const hay = styleHay(recipe);
    if (side.styles.some((st) => hay.includes(st))) score += 4;
    if (side.kind === 'veg') score += 1;
    return score;
  }

  function pickTwo(recipe, opts) {
    opts = opts || {};
    const maxDiff = opts.maxDiff || 3;
    const maxBudget = opts.maxBudget || 5;
    const skip = opts.skip || new Set();
    const scored = SIDES
      .filter((s) => !skip.has(s.id))
      .map((s) => ({ s, n: scoreSide(s, recipe, maxDiff, maxBudget) }))
      .filter((x) => x.n >= 0)
      .sort((a, b) => b.n - a.n || Math.random() - 0.5);

    const veg = scored.filter((x) => x.s.kind === 'veg');
    const starch = scored.filter((x) => x.s.kind === 'starch');
    const picked = [];
    if (veg.length) picked.push(veg[0].s);
    if (starch.length) picked.push(starch[0].s);
    scored.forEach((x) => {
      if (picked.length >= 2) return;
      if (!picked.some((p) => p.id === x.s.id)) picked.push(x.s);
    });
    return picked.slice(0, 2);
  }

  function swapOne(recipe, current, replaceId, opts) {
    const skip = new Set((opts && opts.skip) || []);
    (current || []).forEach((s) => skip.add(s.id));
    skip.delete(replaceId);
    const next = pickTwo(recipe, Object.assign({}, opts, { skip }));
    const keep = (current || []).filter((s) => s.id !== replaceId);
    const fill = next.find((s) => s.id !== replaceId && !keep.some((k) => k.id === s.id));
    if (fill) keep.push(fill);
    while (keep.length < 2) {
      const extra = SIDES.find((s) => !keep.some((k) => k.id === s.id) && !skip.has(s.id));
      if (!extra) break;
      keep.push(extra);
    }
    return keep.slice(0, 2);
  }

  root.DWSides = { SIDES, byId, pickTwo, swapOne };
})(window);
