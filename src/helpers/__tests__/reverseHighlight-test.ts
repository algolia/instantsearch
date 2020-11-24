import reverseHighlight from '../reverseHighlight';

const NONE = 'none' as const;
const FULL = 'full' as const;

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
        matchedWords: [],
      },
      {
        value: 'Streaming Media Players',
        matchLevel: NONE,
        matchedWords: [],
      },
    ],
    type: {
      value: 'Streaming media plyr',
      matchLevel: NONE,
      matchedWords: [],
    },
    meta: {
      name: {
        value: 'Nested <mark>Amazon</mark> name',
        matchLevel: NONE,
        matchedWords: ['Amazon'],
      },
    },
  },
};
/* eslint-enable @typescript-eslint/camelcase */

describe('reverseHighlight', () => {
  test('with default tag name', () => {
    expect(
      reverseHighlight({
        attribute: 'name',
        hit,
      })
    ).toMatchInlineSnapshot(
      `"Amazon - <mark class=\\"ais-ReverseHighlight-highlighted\\">Fire</mark> <mark class=\\"ais-ReverseHighlight-highlighted\\">TV</mark> <mark class=\\"ais-ReverseHighlight-highlighted\\">Stick</mark> <mark class=\\"ais-ReverseHighlight-highlighted\\">with</mark> <mark class=\\"ais-ReverseHighlight-highlighted\\">Alexa</mark> <mark class=\\"ais-ReverseHighlight-highlighted\\">Voice</mark> <mark class=\\"ais-ReverseHighlight-highlighted\\">Remote</mark> - <mark class=\\"ais-ReverseHighlight-highlighted\\">Black</mark>"`
    );
  });

  test('with default tag name and full match', () => {
    expect(
      reverseHighlight({
        attribute: 'type',
        hit,
      })
    ).toMatchInlineSnapshot(`"Streaming media plyr"`);
  });

  test('with custom tag name', () => {
    expect(
      reverseHighlight({
        attribute: 'description',
        highlightedTagName: 'em',
        hit,
      })
    ).toMatchInlineSnapshot(
      `"<em class=\\"ais-ReverseHighlight-highlighted\\">Enjoy</em> <em class=\\"ais-ReverseHighlight-highlighted\\">smart</em> <em class=\\"ais-ReverseHighlight-highlighted\\">access</em> <em class=\\"ais-ReverseHighlight-highlighted\\">to</em> <em class=\\"ais-ReverseHighlight-highlighted\\">videos</em>, <em class=\\"ais-ReverseHighlight-highlighted\\">games</em> <em class=\\"ais-ReverseHighlight-highlighted\\">and</em> <em class=\\"ais-ReverseHighlight-highlighted\\">apps</em> <em class=\\"ais-ReverseHighlight-highlighted\\">with</em> <em class=\\"ais-ReverseHighlight-highlighted\\">this</em> Amazon <em class=\\"ais-ReverseHighlight-highlighted\\">Fire</em> <em class=\\"ais-ReverseHighlight-highlighted\\">TV</em> <em class=\\"ais-ReverseHighlight-highlighted\\">stick</em>. <em class=\\"ais-ReverseHighlight-highlighted\\">Its</em> <em class=\\"ais-ReverseHighlight-highlighted\\">Alexa</em> <em class=\\"ais-ReverseHighlight-highlighted\\">voice</em> <em class=\\"ais-ReverseHighlight-highlighted\\">remote</em> <em class=\\"ais-ReverseHighlight-highlighted\\">lets</em> <em class=\\"ais-ReverseHighlight-highlighted\\">you</em> <em class=\\"ais-ReverseHighlight-highlighted\\">deliver</em> <em class=\\"ais-ReverseHighlight-highlighted\\">hands</em>-<em class=\\"ais-ReverseHighlight-highlighted\\">free</em> <em class=\\"ais-ReverseHighlight-highlighted\\">commands</em> <em class=\\"ais-ReverseHighlight-highlighted\\">when</em> <em class=\\"ais-ReverseHighlight-highlighted\\">you</em> <em class=\\"ais-ReverseHighlight-highlighted\\">want</em> <em class=\\"ais-ReverseHighlight-highlighted\\">to</em> <em class=\\"ais-ReverseHighlight-highlighted\\">watch</em> <em class=\\"ais-ReverseHighlight-highlighted\\">television</em> <em class=\\"ais-ReverseHighlight-highlighted\\">or</em> <em class=\\"ais-ReverseHighlight-highlighted\\">engage</em> <em class=\\"ais-ReverseHighlight-highlighted\\">with</em> <em class=\\"ais-ReverseHighlight-highlighted\\">other</em> <em class=\\"ais-ReverseHighlight-highlighted\\">applications</em>. <em class=\\"ais-ReverseHighlight-highlighted\\">With</em> <em class=\\"ais-ReverseHighlight-highlighted\\">a</em> <em class=\\"ais-ReverseHighlight-highlighted\\">quad</em>-<em class=\\"ais-ReverseHighlight-highlighted\\">core</em> <em class=\\"ais-ReverseHighlight-highlighted\\">processor</em>, <em class=\\"ais-ReverseHighlight-highlighted\\">1GB</em> <em class=\\"ais-ReverseHighlight-highlighted\\">internal</em> <em class=\\"ais-ReverseHighlight-highlighted\\">memory</em> <em class=\\"ais-ReverseHighlight-highlighted\\">and</em> <em class=\\"ais-ReverseHighlight-highlighted\\">8GB</em> <em class=\\"ais-ReverseHighlight-highlighted\\">of</em> <em class=\\"ais-ReverseHighlight-highlighted\\">storage</em>, <em class=\\"ais-ReverseHighlight-highlighted\\">this</em> <em class=\\"ais-ReverseHighlight-highlighted\\">portable</em> Amazon <em class=\\"ais-ReverseHighlight-highlighted\\">Fire</em> <em class=\\"ais-ReverseHighlight-highlighted\\">TV</em> <em class=\\"ais-ReverseHighlight-highlighted\\">stick</em> <em class=\\"ais-ReverseHighlight-highlighted\\">works</em> <em class=\\"ais-ReverseHighlight-highlighted\\">fast</em> <em class=\\"ais-ReverseHighlight-highlighted\\">for</em> <em class=\\"ais-ReverseHighlight-highlighted\\">buffer</em>-<em class=\\"ais-ReverseHighlight-highlighted\\">free</em> <em class=\\"ais-ReverseHighlight-highlighted\\">streaming</em>."`
    );
  });

  test('with custom highlighted class name', () => {
    expect(
      reverseHighlight({
        attribute: 'description',
        cssClasses: { highlighted: '__highlighted class' },
        hit,
      })
    ).toMatchInlineSnapshot(
      `"<mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">Enjoy</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">smart</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">access</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">to</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">videos</mark>, <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">games</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">and</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">apps</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">with</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">this</mark> Amazon <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">Fire</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">TV</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">stick</mark>. <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">Its</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">Alexa</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">voice</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">remote</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">lets</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">you</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">deliver</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">hands</mark>-<mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">free</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">commands</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">when</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">you</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">want</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">to</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">watch</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">television</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">or</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">engage</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">with</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">other</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">applications</mark>. <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">With</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">a</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">quad</mark>-<mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">core</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">processor</mark>, <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">1GB</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">internal</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">memory</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">and</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">8GB</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">of</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">storage</mark>, <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">this</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">portable</mark> Amazon <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">Fire</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">TV</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">stick</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">works</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">fast</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">for</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">buffer</mark>-<mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">free</mark> <mark class=\\"ais-ReverseHighlight-highlighted __highlighted class\\">streaming</mark>."`
    );
  });

  test('with unknown attribute returns an empty string', () => {
    expect(
      reverseHighlight({
        attribute: 'wrong-attribute',
        hit,
      })
    ).toMatchInlineSnapshot(`""`);
  });

  test('with nested attribute', () => {
    expect(
      reverseHighlight({
        attribute: 'meta.name',
        hit,
      })
    ).toMatchInlineSnapshot(
      `"<mark class=\\"ais-ReverseHighlight-highlighted\\">Nested</mark> Amazon <mark class=\\"ais-ReverseHighlight-highlighted\\">name</mark>"`
    );
  });

  test('with nested attribute as array', () => {
    expect(
      reverseHighlight({
        attribute: ['meta', 'name'],
        hit,
      })
    ).toMatchInlineSnapshot(
      `"<mark class=\\"ais-ReverseHighlight-highlighted\\">Nested</mark> Amazon <mark class=\\"ais-ReverseHighlight-highlighted\\">name</mark>"`
    );
  });

  test('with array attribute as array', () => {
    expect(
      reverseHighlight({
        attribute: ['categories', 1],
        hit,
      })
    ).toMatchInlineSnapshot(`"Streaming Media Players"`);
  });
});
