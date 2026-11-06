// Fixture dataset shared by the fake search endpoint and the scripted agent.
// Generated deterministically (no randomness), so every run of the demo
// returns the same products in the same order.

const COLORS = ['Blue', 'Black', 'White', 'Red', 'Brown', 'Green', 'Grey'];

const LINES = [
  {
    category: 'Sneakers',
    department: 'Shoes',
    models: ['Court Classic', 'Daybreak Low', 'Metro Lace', 'Drift Slip-On'],
    materials: ['Leather', 'Canvas', 'Suede'],
    basePrice: 89,
    tags: ['casual', 'everyday', 'city'],
  },
  {
    category: 'Running shoes',
    department: 'Shoes',
    models: ['Glide Runner', 'Tempo 3', 'Cloudline', 'Stride Pro'],
    materials: ['Mesh', 'Knit'],
    basePrice: 119,
    tags: ['running', 'sport', 'training', 'lightweight'],
  },
  {
    category: 'Boots',
    department: 'Shoes',
    models: ['Ridge Hiker', 'Harbor Chelsea', 'Summit Mid', 'Foundry Work'],
    materials: ['Leather', 'Suede', 'Nubuck'],
    basePrice: 149,
    tags: ['hiking', 'outdoor', 'waterproof', 'winter', 'rain'],
  },
  {
    category: 'Loafers',
    department: 'Shoes',
    models: ['Penny Loafer', 'Atelier Moc', 'Velvet Slipper'],
    materials: ['Leather', 'Suede', 'Velvet'],
    basePrice: 129,
    tags: ['office', 'formal', 'wedding', 'smart'],
  },
  {
    category: 'Sandals',
    department: 'Shoes',
    models: ['Coast Slide', 'Trail Sandal', 'Lido Strap'],
    materials: ['Leather', 'Rubber'],
    basePrice: 59,
    tags: ['summer', 'beach', 'vacation'],
  },
  {
    category: 'Bags',
    department: 'Accessories',
    models: ['Daypack 20L', 'Weekender', 'Sling Bag'],
    materials: ['Canvas', 'Leather', 'Nylon'],
    basePrice: 79,
    tags: ['travel', 'backpack', 'commute'],
  },
  {
    category: 'Socks',
    department: 'Accessories',
    models: ['Merino Crew', 'Ankle Runner'],
    materials: ['Wool', 'Cotton'],
    basePrice: 14,
    tags: ['running', 'hiking', 'everyday'],
  },
  {
    category: 'Jackets',
    department: 'Apparel',
    models: ['Storm Shell', 'Field Jacket', 'Packable Down'],
    materials: ['Nylon', 'Cotton'],
    basePrice: 169,
    tags: ['rain', 'waterproof', 'outdoor', 'winter'],
  },
];

const BRANDS = ['Northwind', 'Pacer', 'Fieldstep', 'Atelier Mono', 'Lumen'];

function buildProducts() {
  const products = [];
  let n = 0;

  LINES.forEach((line, lineIndex) => {
    line.models.forEach((model, modelIndex) => {
      // Each model comes in three colorways, each in one material.
      [0, 1, 2].forEach((variant) => {
        const color =
          COLORS[
            (lineIndex * 3 + modelIndex * 2 + variant * 3) % COLORS.length
          ];
        const material =
          line.materials[(modelIndex + variant) % line.materials.length];
        const brand =
          BRANDS[(lineIndex + modelIndex + variant) % BRANDS.length];
        const price =
          line.basePrice + ((modelIndex * 17 + variant * 11) % 50) - 10;
        const rating =
          Math.round(
            (3.6 + ((lineIndex * 7 + modelIndex * 5 + variant * 3) % 14) / 10) *
              10
          ) / 10;

        n += 1;
        products.push({
          objectID: `p${String(n).padStart(3, '0')}`,
          name: `${brand} ${model}`,
          brand,
          category: line.category,
          department: line.department,
          color,
          material,
          price,
          rating: Math.min(rating, 4.9),
          reviews: 12 + ((n * 37) % 480),
          tags: line.tags,
          description: `${color} ${material.toLowerCase()} ${line.category
            .toLowerCase()
            .replace(/s$/, '')} by ${brand}. Good for ${line.tags
            .slice(0, 2)
            .join(' and ')}.`,
        });
      });
    });
  });

  // Hand-picked products so the headline demo ("give me blue shoes" → "in
  // velours") has exact matches.
  HEROES.forEach((hero) => {
    n += 1;
    const line = LINES.find((entry) => entry.category === hero.category);
    products.push({
      objectID: `p${String(n).padStart(3, '0')}`,
      department: line.department,
      tags: line.tags,
      description: `${hero.color} ${hero.material.toLowerCase()} ${hero.category
        .toLowerCase()
        .replace(/s$/, '')} by ${hero.brand}. Good for ${line.tags
        .slice(0, 2)
        .join(' and ')}.`,
      ...hero,
    });
  });

  return products;
}

const HEROES = [
  {
    name: 'Lumen Velours Court',
    brand: 'Lumen',
    category: 'Sneakers',
    color: 'Blue',
    material: 'Suede',
    price: 109,
    rating: 4.8,
    reviews: 342,
  },
  {
    name: 'Atelier Mono Riviera Loafer',
    brand: 'Atelier Mono',
    category: 'Loafers',
    color: 'Blue',
    material: 'Suede',
    price: 159,
    rating: 4.7,
    reviews: 128,
  },
  {
    name: 'Fieldstep Harbor Chelsea Suede',
    brand: 'Fieldstep',
    category: 'Boots',
    color: 'Blue',
    material: 'Suede',
    price: 179,
    rating: 4.5,
    reviews: 87,
  },
  {
    name: 'Pacer Drift Suede',
    brand: 'Pacer',
    category: 'Sneakers',
    color: 'Blue',
    material: 'Suede',
    price: 84,
    rating: 4.3,
    reviews: 211,
  },
];

export const products = buildProducts();

export const FACET_ATTRIBUTES = [
  'department',
  'category',
  'color',
  'material',
  'brand',
];
