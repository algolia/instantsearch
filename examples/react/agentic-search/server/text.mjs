// Tiny text utilities shared by the fake search engine and the scripted agent.

const STOPWORDS = new Set(
  'a an and any are as at be best can for from get give good i im in is it looking me my need of on or pair please recommend show some something that the to under want what which with would you'.split(
    ' '
  )
);

// Query words that mean the same as a word in the dataset.
const SYNONYMS = {
  velours: 'suede',
  trainer: 'sneaker',
  trainers: 'sneaker',
  kicks: 'sneaker',
  runner: 'running',
  run: 'running',
  jogging: 'running',
  hike: 'hiking',
  trail: 'hiking',
  rainy: 'rain',
  wet: 'rain',
  shoe: 'shoes',
  footwear: 'shoes',
  gray: 'grey',
  navy: 'blue',
  backpack: 'bag',
};

export function normalize(word) {
  const lower = word.toLowerCase();
  if (SYNONYMS[lower]) return SYNONYMS[lower];
  // Naive singularization, enough for the fixture vocabulary.
  if (lower.length > 3 && lower.endsWith('s') && !lower.endsWith('ss')) {
    const singular = lower.slice(0, -1);
    return SYNONYMS[singular] || singular;
  }
  return lower;
}

export function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/** Meaningful, normalized words of a query (stopwords and numbers dropped). */
export function keywords(text) {
  return tokenize(text)
    .filter((word) => !STOPWORDS.has(word) && !/^\d+$/.test(word))
    .map(normalize);
}

const indexCache = new WeakMap();

/** The normalized words a product can be found by. */
export function productWords(product) {
  let words = indexCache.get(product);
  if (!words) {
    words = new Set(
      tokenize(
        [
          product.name,
          product.brand,
          product.category,
          product.department,
          product.color,
          product.material,
          product.tags.join(' '),
        ].join(' ')
      ).map(normalize)
    );
    indexCache.set(product, words);
  }
  return words;
}

export function matchesWord(product, word) {
  const words = productWords(product);
  if (words.has(word)) return true;
  // Prefix matching for the last, possibly unfinished, word.
  for (const candidate of words) {
    if (candidate.startsWith(word)) return true;
  }
  return false;
}
