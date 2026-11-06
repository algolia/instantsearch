// Scripted "agent". Reads the conversation (every user query so far) and the
// active filters, works out what the shopper wants, and streams reasoning, an
// answer and the products it picked as an ai-lite UI message stream.
//
// Deterministic: the same body always produces the same stream, so the demo is
// repeatable. The only state is the "flaky" demo below.

import { products } from './products.mjs';
import { normalize, tokenize } from './text.mjs';

const MAX_HITS = 6;
// Candidates beyond the picks, sent as `data-more-hits` for "Show more".
const MAX_MORE_HITS = 18;

const COLORS = ['blue', 'black', 'white', 'red', 'brown', 'green', 'grey'];
const MATERIALS = [
  'leather',
  'suede',
  'canvas',
  'mesh',
  'knit',
  'nubuck',
  'velvet',
  'rubber',
  'wool',
  'cotton',
  'nylon',
];
const CATEGORIES = {
  sneaker: 'Sneakers',
  running: 'Running shoes',
  boot: 'Boots',
  loafer: 'Loafers',
  sandal: 'Sandals',
  bag: 'Bags',
  sock: 'Socks',
  jacket: 'Jackets',
};
const SHOE_CATEGORIES = Object.values(CATEGORIES).slice(0, 5);
const USES = [
  'hiking',
  'rain',
  'waterproof',
  'winter',
  'office',
  'formal',
  'wedding',
  'summer',
  'beach',
  'vacation',
  'travel',
  'commute',
  'city',
];
const BRANDS = [...new Set(products.map((product) => product.brand))];
const CHEAP_WORDS = ['cheap', 'cheaper', 'budget', 'affordable', 'inexpensive'];
const NEGATIONS = ['no', 'not', 'without', 'except', 'avoid'];

const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1);

/** What a single query asks for. Only the dimensions it mentions are set. */
function readQuery(query) {
  const intent = {};
  const words = tokenize(query);

  words.forEach((raw, index) => {
    const word = normalize(raw);
    const negated = index > 0 && NEGATIONS.includes(words[index - 1]);

    if (COLORS.includes(word)) {
      const key = negated ? 'excludeColors' : 'colors';
      intent[key] = [...(intent[key] || []), capitalize(word)];
    } else if (MATERIALS.includes(word)) {
      const key = negated ? 'excludeMaterials' : 'materials';
      intent[key] = [...(intent[key] || []), capitalize(word)];
    } else if (CATEGORIES[word]) {
      intent.category = CATEGORIES[word];
    } else if (word === 'shoes') {
      intent.department = 'Shoes';
    } else if (USES.includes(word)) {
      intent.uses = [...(intent.uses || []), word];
    } else if (CHEAP_WORDS.includes(word)) {
      intent.cheap = true;
    }
  });

  BRANDS.forEach((brand) => {
    if (query.toLowerCase().includes(brand.toLowerCase())) intent.brand = brand;
  });

  const price = query.match(
    /(?:under|below|less than|max|up to|<)\s*\$?\s*(\d+)|\$\s*(\d+)/i
  );
  if (price) intent.maxPrice = Number(price[1] || price[2]);

  if (SHOE_CATEGORIES.includes(intent.category)) intent.department = 'Shoes';

  return intent;
}

/**
 * Merges the intents of every turn. A later turn that mentions a dimension
 * replaces it ("in red instead"), the others carry over.
 */
function readConversation(queries) {
  return queries.reduce((merged, query) => {
    const intent = readQuery(query);
    const next = { ...merged, ...intent };
    // A new category under the same department keeps the department.
    if (intent.category && !intent.department && merged.department) {
      next.department = merged.department;
    }
    return next;
  }, {});
}

function describe(intent) {
  const words = [];
  if (intent.colors) words.push(intent.colors.join(' or ').toLowerCase());
  if (intent.materials) words.push(intent.materials.join(' or ').toLowerCase());
  words.push(
    intent.category
      ? intent.category.toLowerCase()
      : intent.department
        ? intent.department.toLowerCase()
        : 'products'
  );
  if (intent.brand) words.push(`from ${intent.brand}`);
  if (intent.uses) words.push(`for ${intent.uses.join(' and ')}`);
  if (intent.maxPrice) words.push(`under $${intent.maxPrice}`);
  if (intent.excludeColors) {
    words.push(`(no ${intent.excludeColors.join(', ').toLowerCase()})`);
  }
  if (intent.excludeMaterials) {
    words.push(`(no ${intent.excludeMaterials.join(', ').toLowerCase()})`);
  }
  return words.join(' ');
}

function matchesIntent(product, intent) {
  return (
    (!intent.department || product.department === intent.department) &&
    (!intent.category || product.category === intent.category) &&
    (!intent.colors || intent.colors.includes(product.color)) &&
    (!intent.materials || intent.materials.includes(product.material)) &&
    (!intent.brand || product.brand === intent.brand) &&
    (!intent.uses || intent.uses.some((use) => product.tags.includes(use))) &&
    (!intent.maxPrice || product.price <= intent.maxPrice) &&
    (!intent.excludeColors || !intent.excludeColors.includes(product.color)) &&
    (!intent.excludeMaterials ||
      !intent.excludeMaterials.includes(product.material))
  );
}

function matchesFilters(product, filters) {
  return Object.entries(filters).every(
    ([attribute, values]) =>
      !Array.isArray(values) ||
      values.length === 0 ||
      values.includes(String(product[attribute]))
  );
}

/** Soft constraints the agent drops, in order, when nothing matches. */
const RELAXATIONS = [
  { key: 'uses', label: 'the use case' },
  { key: 'materials', label: 'the material' },
  { key: 'brand', label: 'the brand' },
  { key: 'colors', label: 'the color' },
  { key: 'maxPrice', label: 'the budget' },
];

function selectProducts(intent, filters, exclude) {
  const excluded = new Set(exclude);
  const searches = [];
  let current = intent;
  const relaxed = [];

  const run = (candidateIntent) => {
    searches.push(describe(candidateIntent));
    return products.filter(
      (product) =>
        !excluded.has(product.objectID) &&
        matchesIntent(product, candidateIntent) &&
        matchesFilters(product, filters)
    );
  };

  let candidates = run(current);
  for (let i = 0; candidates.length === 0 && i < RELAXATIONS.length; i++) {
    const { key, label } = RELAXATIONS[i];
    if (current[key] !== undefined) {
      current = { ...current, [key]: undefined };
      relaxed.push(label);
      candidates = run(current);
    }
  }

  const ranked = [...candidates].sort((a, b) =>
    intent.cheap
      ? a.price - b.price || b.rating - a.rating
      : b.rating - a.rating || b.reviews - a.reviews
  );

  return {
    searches,
    candidates: candidates.length,
    relaxed,
    relaxedIntent: current,
    hits: ranked.slice(0, MAX_HITS),
    more: ranked.slice(MAX_HITS, MAX_HITS + MAX_MORE_HITS),
  };
}

function describeFilters(filters) {
  return Object.entries(filters)
    .filter(([, values]) => Array.isArray(values) && values.length > 0)
    .map(([attribute, values]) => `${attribute} is ${values.join(' or ')}`)
    .join('; ');
}

/** Builds the scripted turn: a list of events to stream. */
export function script({ queries, filters, exclude = [] }) {
  const intent = readConversation(queries);
  const lastIntent = readQuery(queries[queries.length - 1]);
  const selection = selectProducts(intent, filters, exclude);
  const filterText = describeFilters(filters);

  const reasoning = [
    queries.length > 1
      ? `Reading the conversation: ${queries.map((q) => `“${q}”`).join(' → ')}.`
      : `Reading the request: “${queries[0]}”.`,
    `The shopper wants ${describe(intent)}.`,
    filterText ? `Keeping the active filters: ${filterText}.` : null,
    exclude.length > 0
      ? `Leaving out the ${exclude.length} products already shown.`
      : null,
    `Running ${selection.searches.length} ${
      selection.searches.length === 1 ? 'search' : 'searches'
    }: ${selection.searches.map((s) => `“${s}”`).join(', ')}.`,
    selection.candidates > 0
      ? `${selection.candidates} candidates. Ranking by ${
          intent.cheap ? 'price, then rating' : 'rating and reviews'
        } and keeping the best ${Math.min(MAX_HITS, selection.candidates)}.`
      : 'No candidates, even after relaxing the request.',
  ].filter(Boolean);

  const [top, ...rest] = selection.hits;
  const answer = [];
  if (exclude.length > 0 && top) {
    answer.push('Here are more options.');
  } else if (queries.length > 1 && Object.keys(lastIntent).length > 0) {
    answer.push(`Got it, now looking at ${describe(intent)}.`);
  }
  if (!top) {
    answer.push(
      `I couldn't find any ${describe(intent)}${
        filterText ? ' with the current filters' : ''
      }. Try removing a filter or describing what you need differently.`
    );
  } else {
    if (selection.relaxed.length > 0) {
      answer.push(
        `Nothing matched exactly, so I relaxed ${selection.relaxed.join(
          ' and '
        )} and looked at ${describe(selection.relaxedIntent)} instead.`
      );
    }
    answer.push(
      `My top pick is the ${top.name}: ${top.color.toLowerCase()} ${top.material.toLowerCase()}, rated ${top.rating} by ${top.reviews} shoppers, at $${top.price}.`
    );
    const cheapest = rest.reduce(
      (best, hit) => (!best || hit.price < best.price ? hit : best),
      undefined
    );
    if (cheapest && cheapest.price < top.price) {
      answer.push(
        `If you want to spend less, the ${cheapest.name} is $${cheapest.price}.`
      );
    }
    if (rest.length > 0) {
      answer.push(
        `I picked ${selection.hits.length} options below. Ask me to narrow them down, for example by color, material or budget.`
      );
    }
  }

  return {
    reasoning,
    answer: answer.join(' '),
    hits: selection.hits,
    more: selection.more,
    metadata: {
      intent,
      searches: selection.searches,
      candidates: selection.candidates,
      relaxed: selection.relaxed,
    },
  };
}

// Queries containing "flaky" fail on the first attempt and succeed on retry,
// to demo the error state.
const failedOnce = new Set();
export function shouldFail(body) {
  if (!body.queries.some((query) => /\bflaky\b/i.test(query))) return false;
  const key = JSON.stringify(body);
  if (failedOnce.has(key)) {
    failedOnce.delete(key);
    return false;
  }
  failedOnce.add(key);
  return true;
}

/** Splits text into small groups of words so the stream looks like tokens. */
export function toTokens(text) {
  return (
    text.match(/\S+\s*/g)?.reduce((tokens, word, index) => {
      if (index % 2 === 0) tokens.push(word);
      else tokens[tokens.length - 1] += word;
      return tokens;
    }, []) ?? []
  );
}
