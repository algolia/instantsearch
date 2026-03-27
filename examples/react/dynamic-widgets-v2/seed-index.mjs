#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Seed script for DynamicWidgets v2 PoC.
 *
 * Creates an Algolia index with 1000+ facet attributes, each with diverse
 * values, plus hierarchical categories. Configures attributesForFaceting
 * and facetOrdering so DynamicWidgets can discover them via facets: ['*'].
 *
 * Usage:
 *   ALGOLIA_APP_ID=xxx ALGOLIA_ADMIN_API_KEY=yyy node seed-index.mjs
 *
 * Optional env:
 *   ALGOLIA_INDEX_NAME  (default: dynamic_facets_v2_poc)
 *   NUM_ATTRIBUTES      (default: 1050)
 *   NUM_RECORDS         (default: 5000)
 */

import { algoliasearch } from 'algoliasearch';

const APP_ID = process.env.ALGOLIA_APP_ID;
const ADMIN_KEY = process.env.ALGOLIA_ADMIN_API_KEY;
const INDEX_NAME = process.env.ALGOLIA_INDEX_NAME || 'dynamic_facets_v2_poc';
const NUM_ATTRIBUTES = parseInt(process.env.NUM_ATTRIBUTES || '1050', 10);
const NUM_RECORDS = parseInt(process.env.NUM_RECORDS || '5000', 10);

if (!APP_ID || !ADMIN_KEY) {
  throw new Error(
    'Missing ALGOLIA_APP_ID or ALGOLIA_ADMIN_API_KEY environment variables.'
  );
}

const client = algoliasearch(APP_ID, ADMIN_KEY);

// ---------------------------------------------------------------------------
// Value generators — produce realistic-looking facet values
// ---------------------------------------------------------------------------

const COLORS = [
  'Red',
  'Blue',
  'Green',
  'Yellow',
  'Black',
  'White',
  'Orange',
  'Purple',
  'Pink',
  'Brown',
  'Gray',
  'Navy',
  'Teal',
  'Coral',
  'Ivory',
  'Maroon',
  'Olive',
  'Cyan',
  'Magenta',
  'Turquoise',
  'Salmon',
  'Lavender',
  'Beige',
  'Indigo',
  'Mint',
  'Peach',
  'Charcoal',
  'Gold',
  'Silver',
  'Bronze',
];

const MATERIALS = [
  'Cotton',
  'Polyester',
  'Leather',
  'Silk',
  'Wool',
  'Linen',
  'Denim',
  'Nylon',
  'Rayon',
  'Velvet',
  'Satin',
  'Cashmere',
  'Suede',
  'Canvas',
  'Bamboo',
  'Hemp',
  'Fleece',
  'Gore-Tex',
  'Kevlar',
  'Lycra',
];

const BRANDS = [
  'Acme',
  'Globex',
  'Initech',
  'Umbrella',
  'Stark',
  'Wayne',
  'Aperture',
  'Cyberdyne',
  'Wonka',
  'Hooli',
  'Pied Piper',
  'Dunder Mifflin',
  'Weyland',
  'Oscorp',
  'LexCorp',
  'Tyrell',
  'Soylent',
  'Massive Dynamic',
  'Gekko',
  'Prestige Worldwide',
  'Vandelay',
  'Bluth',
  'Sterling Cooper',
  'Wernham Hogg',
  'Dharma',
  'Oceanic',
  'Hanso',
  'Veridian',
  'Vought',
  'GeneriCo',
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

const ADJECTIVES = [
  'Premium',
  'Classic',
  'Modern',
  'Vintage',
  'Eco',
  'Ultra',
  'Pro',
  'Deluxe',
  'Essential',
  'Original',
  'Advanced',
  'Basic',
  'Elite',
  'Supreme',
  'Natural',
  'Organic',
  'Artisan',
  'Handcrafted',
  'Limited',
  'Custom',
];

const NOUNS = [
  'Widget',
  'Gadget',
  'Device',
  'Tool',
  'Component',
  'Module',
  'Unit',
  'Element',
  'Part',
  'Item',
  'Product',
  'System',
  'Kit',
  'Set',
  'Pack',
  'Bundle',
  'Collection',
  'Series',
  'Edition',
  'Model',
];

const CATEGORIES_L1 = [
  'Electronics',
  'Clothing',
  'Home & Garden',
  'Sports',
  'Books',
  'Toys',
  'Food & Drink',
  'Health',
  'Automotive',
  'Office',
];

const CATEGORIES_L2 = {
  Electronics: ['Phones', 'Laptops', 'Audio', 'Cameras', 'Accessories'],
  Clothing: ['Shirts', 'Pants', 'Shoes', 'Jackets', 'Accessories'],
  'Home & Garden': ['Furniture', 'Kitchen', 'Lighting', 'Decor', 'Tools'],
  Sports: ['Running', 'Cycling', 'Swimming', 'Gym', 'Outdoor'],
  Books: ['Fiction', 'Non-fiction', 'Science', 'History', 'Comics'],
  Toys: ['Board Games', 'Action Figures', 'Puzzles', 'Dolls', 'Building'],
  'Food & Drink': ['Snacks', 'Beverages', 'Organic', 'Gourmet', 'Supplements'],
  Health: ['Fitness', 'Wellness', 'Skincare', 'Vitamins', 'First Aid'],
  Automotive: ['Parts', 'Accessories', 'Tools', 'Cleaning', 'Electronics'],
  Office: ['Stationery', 'Furniture', 'Electronics', 'Supplies', 'Storage'],
};

const CATEGORIES_L3 = {};
for (const [l1, l2s] of Object.entries(CATEGORIES_L2)) {
  for (const l2 of l2s) {
    CATEGORIES_L3[`${l1} > ${l2}`] = [
      `${l2} Type A`,
      `${l2} Type B`,
      `${l2} Type C`,
      `${l2} Premium`,
      `${l2} Budget`,
    ];
  }
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN(arr, min, max) {
  const n = min + Math.floor(Math.random() * (max - min + 1));
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

function randomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

// ---------------------------------------------------------------------------
// Generate attribute names — 1050 unique facet attributes
// ---------------------------------------------------------------------------

// First ~20 are "realistic" named attributes
const NAMED_ATTRIBUTES = [
  'color',
  'material',
  'brand',
  'size',
  'price_range',
  'rating',
  'in_stock',
  'free_shipping',
  'condition',
  'warranty',
  'weight_class',
  'origin_country',
  'season',
  'style',
  'pattern',
  'fit',
  'gender',
  'age_group',
  'eco_certified',
  'bestseller',
];

// Attribute value pools for the named attributes
const NAMED_VALUES = {
  color: COLORS,
  material: MATERIALS,
  brand: BRANDS,
  size: SIZES,
  price_range: [
    'Under $10',
    '$10-$25',
    '$25-$50',
    '$50-$100',
    '$100-$250',
    '$250-$500',
    '$500+',
  ],
  rating: ['1 star', '2 stars', '3 stars', '4 stars', '5 stars'],
  in_stock: ['Yes', 'No'],
  free_shipping: ['Yes', 'No'],
  condition: [
    'New',
    'Refurbished',
    'Used - Like New',
    'Used - Good',
    'Used - Fair',
  ],
  warranty: ['No Warranty', '1 Year', '2 Years', '3 Years', 'Lifetime'],
  weight_class: ['Ultralight', 'Light', 'Medium', 'Heavy', 'Extra Heavy'],
  origin_country: [
    'USA',
    'China',
    'Germany',
    'Japan',
    'UK',
    'France',
    'Italy',
    'Canada',
    'South Korea',
    'India',
    'Brazil',
    'Australia',
    'Mexico',
    'Sweden',
    'Switzerland',
  ],
  season: ['Spring', 'Summer', 'Fall', 'Winter', 'All Season'],
  style: [
    'Casual',
    'Formal',
    'Sporty',
    'Outdoor',
    'Bohemian',
    'Minimalist',
    'Industrial',
  ],
  pattern: [
    'Solid',
    'Striped',
    'Plaid',
    'Floral',
    'Geometric',
    'Abstract',
    'Camo',
    'Polka Dot',
  ],
  fit: ['Slim', 'Regular', 'Relaxed', 'Oversized', 'Tailored'],
  gender: ['Men', 'Women', 'Unisex', 'Kids'],
  age_group: ['Infant', 'Toddler', 'Child', 'Teen', 'Adult', 'Senior'],
  eco_certified: ['Yes', 'No'],
  bestseller: ['Yes', 'No'],
};

// Generate remaining attributes: "attr_0001" through "attr_XXXX"
const generatedAttributes = [];
for (let i = 0; i < NUM_ATTRIBUTES - NAMED_ATTRIBUTES.length; i++) {
  generatedAttributes.push(`attr_${String(i + 1).padStart(4, '0')}`);
}

const ALL_ATTRIBUTES = [...NAMED_ATTRIBUTES, ...generatedAttributes];

// Pre-generate value pools for generated attributes (5-30 values each)
const GENERATED_VALUES = {};
for (const attr of generatedAttributes) {
  const numValues = randomInt(5, 30);
  const values = [];
  for (let i = 0; i < numValues; i++) {
    values.push(`${pick(ADJECTIVES)} ${pick(NOUNS)} ${i + 1}`);
  }
  GENERATED_VALUES[attr] = values;
}

// ---------------------------------------------------------------------------
// Generate records
// ---------------------------------------------------------------------------

console.log(
  `Generating ${NUM_RECORDS} records with ${ALL_ATTRIBUTES.length} facet attributes...`
);

const records = [];

for (let i = 0; i < NUM_RECORDS; i++) {
  const record = {
    objectID: `record_${String(i + 1).padStart(6, '0')}`,
    name: `${pick(ADJECTIVES)} ${pick(NOUNS)} #${i + 1}`,
    description: `A ${pick(ADJECTIVES).toLowerCase()} ${pick(
      NOUNS
    ).toLowerCase()} made of ${pick(MATERIALS).toLowerCase()} by ${pick(
      BRANDS
    )}.`,
    price: parseFloat((Math.random() * 500 + 1).toFixed(2)),
  };

  // Hierarchical categories
  const l1 = pick(CATEGORIES_L1);
  const l2 = pick(CATEGORIES_L2[l1]);
  const l3Candidates = CATEGORIES_L3[`${l1} > ${l2}`] || [];
  const l3 = l3Candidates.length > 0 ? pick(l3Candidates) : null;

  record['hierarchicalCategories.lvl0'] = l1;
  record['hierarchicalCategories.lvl1'] = `${l1} > ${l2}`;
  if (l3) {
    record['hierarchicalCategories.lvl2'] = `${l1} > ${l2} > ${l3}`;
  }

  // Named attributes — each record gets a random subset (~60-80%)
  for (const attr of NAMED_ATTRIBUTES) {
    if (Math.random() < 0.7) {
      const values = NAMED_VALUES[attr];
      if (values.length <= 2) {
        record[attr] = pick(values);
      } else {
        // Sometimes multi-value (for refinementList testing)
        record[attr] = Math.random() < 0.8 ? pick(values) : pickN(values, 1, 3);
      }
    }
  }

  // Generated attributes — each record gets ~15-25% of them (sparse)
  // This creates a realistic scenario where not every record has every attribute
  for (const attr of generatedAttributes) {
    if (Math.random() < 0.2) {
      record[attr] = pick(GENERATED_VALUES[attr]);
    }
  }

  records.push(record);
}

// ---------------------------------------------------------------------------
// Push to Algolia
// ---------------------------------------------------------------------------

console.log(`Pushing ${records.length} records to ${INDEX_NAME}...`);

// Save records in batches of 1000
const BATCH_SIZE = 1000;
for (let i = 0; i < records.length; i += BATCH_SIZE) {
  const batch = records.slice(i, i + BATCH_SIZE);
  await client.saveObjects({
    indexName: INDEX_NAME,
    objects: batch,
  });
  console.log(
    `  Pushed records ${i + 1}–${Math.min(i + BATCH_SIZE, records.length)}`
  );
}

// ---------------------------------------------------------------------------
// Configure index settings
// ---------------------------------------------------------------------------

console.log('Configuring index settings...');

// All attributes should be facetable
const attributesForFaceting = [
  'searchable(color)',
  'searchable(material)',
  'searchable(brand)',
  'size',
  'price_range',
  'rating',
  'in_stock',
  'free_shipping',
  'condition',
  'warranty',
  'weight_class',
  'origin_country',
  'season',
  'style',
  'pattern',
  'fit',
  'gender',
  'age_group',
  'eco_certified',
  'bestseller',
  'hierarchicalCategories.lvl0',
  'hierarchicalCategories.lvl1',
  'hierarchicalCategories.lvl2',
  ...generatedAttributes,
];

// facetOrdering: show named attributes first, then generated ones
const facetOrder = [
  'hierarchicalCategories.lvl0',
  'brand',
  'color',
  'material',
  'size',
  'price_range',
  'rating',
  'condition',
  'origin_country',
  'season',
  'style',
  'pattern',
  'fit',
  'gender',
  'age_group',
  'weight_class',
  'warranty',
  'in_stock',
  'free_shipping',
  'eco_certified',
  'bestseller',
  ...generatedAttributes,
];

await client.setSettings({
  indexName: INDEX_NAME,
  indexSettings: {
    searchableAttributes: ['name', 'description', 'brand', 'color', 'material'],
    attributesForFaceting,
    renderingContent: {
      facetOrdering: {
        facets: {
          order: facetOrder,
        },
        values: {
          brand: { sortRemainingBy: 'count' },
          color: { sortRemainingBy: 'count' },
          material: { sortRemainingBy: 'count' },
          size: { sortRemainingBy: 'count' },
          price_range: { sortRemainingBy: 'count' },
          rating: { sortRemainingBy: 'count' },
        },
      },
    },
  },
});

// Retrieve the search-only API key
const apiKeys = await client.listApiKeys();
const searchKey = apiKeys.keys.find(
  (k) => k.acl.includes('search') && !k.acl.includes('addObject')
);

console.log('\n✅ Done!\n');
console.log(`Index: ${INDEX_NAME}`);
console.log(`App ID: ${APP_ID}`);
console.log(`Records: ${NUM_RECORDS}`);
console.log(`Facet attributes: ${ALL_ATTRIBUTES.length}`);
console.log(`  Named: ${NAMED_ATTRIBUTES.length}`);
console.log(`  Generated: ${generatedAttributes.length}`);
console.log(`  Hierarchical: 3 levels (hierarchicalCategories.lvl0/1/2)`);
if (searchKey) {
  console.log(`\nSearch-only API key: ${searchKey.value}`);
}
console.log(`\nUpdate your App.tsx with:`);
console.log(
  `  const searchClient = algoliasearch('${APP_ID}', '<SEARCH_API_KEY>');`
);
console.log(`  const INDEX_NAME = '${INDEX_NAME}';`);
