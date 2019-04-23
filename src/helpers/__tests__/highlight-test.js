import highlight from '../highlight';

/* eslint-disable @typescript-eslint/camelcase */
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
  _highlightResult: {
    name: {
      value:
        '<mark>Amazon</mark> - Fire TV Stick with Alexa Voice Remote - Black',
      matchLevel: 'full',
      fullyHighlighted: false,
      matchedWords: ['amazon'],
    },
    description: {
      value:
        'Enjoy smart access to videos, games and apps with this <mark>Amazon</mark> Fire TV stick. Its Alexa voice remote lets you deliver hands-free commands when you want to watch television or engage with other applications. With a quad-core processor, 1GB internal memory and 8GB of storage, this portable <mark>Amazon</mark> Fire TV stick works fast for buffer-free streaming.',
      matchLevel: 'full',
      fullyHighlighted: false,
      matchedWords: ['amazon'],
    },
    brand: {
      value: '<mark>Amazon</mark>',
      matchLevel: 'full',
      fullyHighlighted: true,
      matchedWords: ['amazon'],
    },
    categories: [
      {
        value: 'TV & Home Theater',
        matchLevel: 'none',
        matchedWords: [],
      },
      {
        value: 'Streaming Media Players',
        matchLevel: 'none',
        matchedWords: [],
      },
    ],
    type: {
      value: 'Streaming media plyr',
      matchLevel: 'none',
      matchedWords: [],
    },
    meta: {
      name: {
        value: 'Nested <mark>Amazon</mark> name',
      },
    },
  },
};
/* eslint-enable @typescript-eslint/camelcase */

describe('highlight', () => {
  test('with default tag name', () => {
    expect(
      highlight({
        attribute: 'name',
        hit,
      })
    ).toMatchInlineSnapshot(
      `"<mark class=\\"ais-Highlight-highlighted\\">Amazon</mark> - Fire TV Stick with Alexa Voice Remote - Black"`
    );
  });

  test('with custom tag name', () => {
    expect(
      highlight({
        attribute: 'description',
        highlightedTagName: 'em',
        hit,
      })
    ).toMatchInlineSnapshot(
      `"Enjoy smart access to videos, games and apps with this <em class=\\"ais-Highlight-highlighted\\">Amazon</em> Fire TV stick. Its Alexa voice remote lets you deliver hands-free commands when you want to watch television or engage with other applications. With a quad-core processor, 1GB internal memory and 8GB of storage, this portable <em class=\\"ais-Highlight-highlighted\\">Amazon</em> Fire TV stick works fast for buffer-free streaming."`
    );
  });

  test('with unknown attribute returns an empty string', () => {
    expect(
      highlight({
        attribute: 'wrong-attribute',
        hit,
      })
    ).toMatchInlineSnapshot(`""`);
  });

  test('with nested attribute', () => {
    expect(
      highlight({
        attribute: 'meta.name',
        hit,
      })
    ).toMatchInlineSnapshot(
      `"Nested <mark class=\\"ais-Highlight-highlighted\\">Amazon</mark> name"`
    );
  });
});
