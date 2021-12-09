import snippet from '../snippet';

const NONE = 'none' as const;
const FULL = 'full' as const;

const hit = {
  name: 'Amazon - Fire TV Stick with Alexa Voice Remote - Black',
  description:
    'Enjoy smart access to videos, games and apps with this Amazon Fire TV stick. Its Alexa voice remote lets you deliver hands-free commands when you want to watch television or engage with other applications. With a quad-core processor, 1GB internal memory and 8GB of storage, this portable Amazon Fire TV stick works fast for buffer-free streaming.',
  brand: 'Amazon',
  categories: ['TV & Home Theater', 'Streaming Media Players'],
  hierarchicalCategories: {
    lvl0: 'TV & Home Theater',
    lvl1: 'TV & Home Theater > Streaming Media Players',
  },
  type: 'Streaming media plyr',
  price: 39.99,
  price_range: '1 - 50',
  image: 'https://cdn-demo.algolia.com/bestbuy-0118/5477500_sb.jpg',
  url: 'https://api.bestbuy.com/click/-/5477500/pdp',
  free_shipping: false,
  rating: 4,
  popularity: 21469,
  objectID: '5477500',
  _snippetResult: {
    name: {
      value:
        '<mark>Amazon</mark> - Fire TV Stick with Alexa Voice Remote - Black',
      matchLevel: FULL,
      fullyHighlighted: false,
      matchedWords: ['amazon'],
    },
    description: {
      value:
        'Enjoy smart access to videos, games and apps with this <mark>Amazon</mark> Fire TV stick. Its Alexa voice remote lets you deliver hands-free commands when you want to watch television or engage with other applications. With a quad-core processor, 1GB internal memory and 8GB of storage, this portable <mark>Amazon</mark> Fire TV stick works fast for buffer-free streaming.',
      matchLevel: FULL,
      fullyHighlighted: false,
      matchedWords: ['amazon'],
    },
    brand: {
      value: '<mark>Amazon</mark>',
      matchLevel: FULL,
      fullyHighlighted: true,
      matchedWords: ['amazon'],
    },
    categories: [
      {
        value: 'TV & Home Theater',
        matchLevel: NONE,
      },
      {
        value: 'Streaming Media Players',
        matchLevel: NONE,
      },
    ],
    type: {
      value: 'Streaming media plyr',
      matchLevel: NONE,
    },
    meta: {
      name: {
        value: 'Nested <mark>Amazon</mark> name',
        matchLevel: FULL,
      },
    },
  },
};

describe('snippet', () => {
  test('with default tag name', () => {
    expect(
      snippet({
        attribute: 'name',
        hit,
      })
    ).toMatchInlineSnapshot(
      `"<mark class=\\"ais-Snippet-highlighted\\">Amazon</mark> - Fire TV Stick with Alexa Voice Remote - Black"`
    );
  });

  test('with custom tag name', () => {
    expect(
      snippet({
        attribute: 'description',
        highlightedTagName: 'em',
        hit,
      })
    ).toMatchInlineSnapshot(
      `"Enjoy smart access to videos, games and apps with this <em class=\\"ais-Snippet-highlighted\\">Amazon</em> Fire TV stick. Its Alexa voice remote lets you deliver hands-free commands when you want to watch television or engage with other applications. With a quad-core processor, 1GB internal memory and 8GB of storage, this portable <em class=\\"ais-Snippet-highlighted\\">Amazon</em> Fire TV stick works fast for buffer-free streaming."`
    );
  });

  test('with custom highlighted class name', () => {
    expect(
      snippet({
        attribute: 'description',
        cssClasses: { highlighted: '__highlighted' },
        hit,
      })
    ).toMatchInlineSnapshot(
      `"Enjoy smart access to videos, games and apps with this <mark class=\\"ais-Snippet-highlighted __highlighted\\">Amazon</mark> Fire TV stick. Its Alexa voice remote lets you deliver hands-free commands when you want to watch television or engage with other applications. With a quad-core processor, 1GB internal memory and 8GB of storage, this portable <mark class=\\"ais-Snippet-highlighted __highlighted\\">Amazon</mark> Fire TV stick works fast for buffer-free streaming."`
    );
  });

  test('with unknown attribute returns an empty string', () => {
    expect(
      snippet({
        attribute: 'wrong-attribute',
        hit,
      })
    ).toMatchInlineSnapshot(`""`);
  });

  test('with nested attribute', () => {
    expect(
      snippet({
        attribute: 'meta.name',
        hit,
      })
    ).toMatchInlineSnapshot(
      `"Nested <mark class=\\"ais-Snippet-highlighted\\">Amazon</mark> name"`
    );
  });

  test('with nested attribute as array', () => {
    expect(
      snippet({
        attribute: ['meta', 'name'],
        hit,
      })
    ).toMatchInlineSnapshot(
      `"Nested <mark class=\\"ais-Snippet-highlighted\\">Amazon</mark> name"`
    );
  });

  test('with array attribute', () => {
    expect(
      snippet({
        attribute: 'categories.1',
        hit,
      })
    ).toMatchInlineSnapshot(`"Streaming Media Players"`);
  });

  test('with array attribute as array', () => {
    expect(
      snippet({
        attribute: ['categories', '1'],
        hit,
      })
    ).toMatchInlineSnapshot(`"Streaming Media Players"`);
  });
});
