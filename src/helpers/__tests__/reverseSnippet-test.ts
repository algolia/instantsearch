import reverseSnippet from '../reverseSnippet';

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
/* eslint-enable @typescript-eslint/camelcase */

describe('reverseSnippet', () => {
  test('with default tag name', () => {
    expect(
      reverseSnippet({
        attribute: 'name',
        hit,
      })
    ).toMatchInlineSnapshot(
      `"Amazon - <mark class=\\"ais-ReverseSnippet-highlighted\\">Fire</mark> <mark class=\\"ais-ReverseSnippet-highlighted\\">TV</mark> <mark class=\\"ais-ReverseSnippet-highlighted\\">Stick</mark> <mark class=\\"ais-ReverseSnippet-highlighted\\">with</mark> <mark class=\\"ais-ReverseSnippet-highlighted\\">Alexa</mark> <mark class=\\"ais-ReverseSnippet-highlighted\\">Voice</mark> <mark class=\\"ais-ReverseSnippet-highlighted\\">Remote</mark> - <mark class=\\"ais-ReverseSnippet-highlighted\\">Black</mark>"`
    );
  });

  test('with default tag name and full match', () => {
    expect(
      reverseSnippet({
        attribute: 'type',
        hit,
      })
    ).toMatchInlineSnapshot(`"Streaming media plyr"`);
  });

  test('with custom tag name', () => {
    expect(
      reverseSnippet({
        attribute: 'description',
        highlightedTagName: 'em',
        hit,
      })
    ).toMatchInlineSnapshot(
      `"<em class=\\"ais-ReverseSnippet-highlighted\\">Enjoy</em> <em class=\\"ais-ReverseSnippet-highlighted\\">smart</em> <em class=\\"ais-ReverseSnippet-highlighted\\">access</em> <em class=\\"ais-ReverseSnippet-highlighted\\">to</em> <em class=\\"ais-ReverseSnippet-highlighted\\">videos</em>, <em class=\\"ais-ReverseSnippet-highlighted\\">games</em> <em class=\\"ais-ReverseSnippet-highlighted\\">and</em> <em class=\\"ais-ReverseSnippet-highlighted\\">apps</em> <em class=\\"ais-ReverseSnippet-highlighted\\">with</em> <em class=\\"ais-ReverseSnippet-highlighted\\">this</em> Amazon <em class=\\"ais-ReverseSnippet-highlighted\\">Fire</em> <em class=\\"ais-ReverseSnippet-highlighted\\">TV</em> <em class=\\"ais-ReverseSnippet-highlighted\\">stick</em>. <em class=\\"ais-ReverseSnippet-highlighted\\">Its</em> <em class=\\"ais-ReverseSnippet-highlighted\\">Alexa</em> <em class=\\"ais-ReverseSnippet-highlighted\\">voice</em> <em class=\\"ais-ReverseSnippet-highlighted\\">remote</em> <em class=\\"ais-ReverseSnippet-highlighted\\">lets</em> <em class=\\"ais-ReverseSnippet-highlighted\\">you</em> <em class=\\"ais-ReverseSnippet-highlighted\\">deliver</em> <em class=\\"ais-ReverseSnippet-highlighted\\">hands</em>-<em class=\\"ais-ReverseSnippet-highlighted\\">free</em> <em class=\\"ais-ReverseSnippet-highlighted\\">commands</em> <em class=\\"ais-ReverseSnippet-highlighted\\">when</em> <em class=\\"ais-ReverseSnippet-highlighted\\">you</em> <em class=\\"ais-ReverseSnippet-highlighted\\">want</em> <em class=\\"ais-ReverseSnippet-highlighted\\">to</em> <em class=\\"ais-ReverseSnippet-highlighted\\">watch</em> <em class=\\"ais-ReverseSnippet-highlighted\\">television</em> <em class=\\"ais-ReverseSnippet-highlighted\\">or</em> <em class=\\"ais-ReverseSnippet-highlighted\\">engage</em> <em class=\\"ais-ReverseSnippet-highlighted\\">with</em> <em class=\\"ais-ReverseSnippet-highlighted\\">other</em> <em class=\\"ais-ReverseSnippet-highlighted\\">applications</em>. <em class=\\"ais-ReverseSnippet-highlighted\\">With</em> <em class=\\"ais-ReverseSnippet-highlighted\\">a</em> <em class=\\"ais-ReverseSnippet-highlighted\\">quad</em>-<em class=\\"ais-ReverseSnippet-highlighted\\">core</em> <em class=\\"ais-ReverseSnippet-highlighted\\">processor</em>, <em class=\\"ais-ReverseSnippet-highlighted\\">1GB</em> <em class=\\"ais-ReverseSnippet-highlighted\\">internal</em> <em class=\\"ais-ReverseSnippet-highlighted\\">memory</em> <em class=\\"ais-ReverseSnippet-highlighted\\">and</em> <em class=\\"ais-ReverseSnippet-highlighted\\">8GB</em> <em class=\\"ais-ReverseSnippet-highlighted\\">of</em> <em class=\\"ais-ReverseSnippet-highlighted\\">storage</em>, <em class=\\"ais-ReverseSnippet-highlighted\\">this</em> <em class=\\"ais-ReverseSnippet-highlighted\\">portable</em> Amazon <em class=\\"ais-ReverseSnippet-highlighted\\">Fire</em> <em class=\\"ais-ReverseSnippet-highlighted\\">TV</em> <em class=\\"ais-ReverseSnippet-highlighted\\">stick</em> <em class=\\"ais-ReverseSnippet-highlighted\\">works</em> <em class=\\"ais-ReverseSnippet-highlighted\\">fast</em> <em class=\\"ais-ReverseSnippet-highlighted\\">for</em> <em class=\\"ais-ReverseSnippet-highlighted\\">buffer</em>-<em class=\\"ais-ReverseSnippet-highlighted\\">free</em> <em class=\\"ais-ReverseSnippet-highlighted\\">streaming</em>."`
    );
  });

  test('with custom highlighted class name', () => {
    expect(
      reverseSnippet({
        attribute: 'description',
        cssClasses: { highlighted: '__highlighted' },
        hit,
      })
    ).toMatchInlineSnapshot(
      `"<mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">Enjoy</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">smart</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">access</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">to</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">videos</mark>, <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">games</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">and</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">apps</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">with</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">this</mark> Amazon <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">Fire</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">TV</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">stick</mark>. <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">Its</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">Alexa</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">voice</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">remote</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">lets</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">you</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">deliver</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">hands</mark>-<mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">free</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">commands</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">when</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">you</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">want</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">to</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">watch</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">television</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">or</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">engage</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">with</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">other</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">applications</mark>. <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">With</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">a</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">quad</mark>-<mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">core</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">processor</mark>, <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">1GB</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">internal</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">memory</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">and</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">8GB</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">of</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">storage</mark>, <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">this</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">portable</mark> Amazon <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">Fire</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">TV</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">stick</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">works</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">fast</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">for</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">buffer</mark>-<mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">free</mark> <mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">streaming</mark>."`
    );
  });

  test('with unknown attribute returns an empty string', () => {
    expect(
      reverseSnippet({
        attribute: 'wrong-attribute',
        hit,
      })
    ).toMatchInlineSnapshot(`""`);
  });

  test('with nested attribute', () => {
    expect(
      reverseSnippet({
        attribute: 'meta.name',
        hit,
      })
    ).toMatchInlineSnapshot(
      `"<mark class=\\"ais-ReverseSnippet-highlighted\\">Nested</mark> Amazon <mark class=\\"ais-ReverseSnippet-highlighted\\">name</mark>"`
    );
  });

  test('with nested attribute as array', () => {
    expect(
      reverseSnippet({
        attribute: ['meta', 'name'],
        hit,
      })
    ).toMatchInlineSnapshot(
      `"<mark class=\\"ais-ReverseSnippet-highlighted\\">Nested</mark> Amazon <mark class=\\"ais-ReverseSnippet-highlighted\\">name</mark>"`
    );
  });

  test('with array attribute', () => {
    expect(
      reverseSnippet({
        attribute: 'categories.1',
        hit,
      })
    ).toMatchInlineSnapshot(`"Streaming Media Players"`);
  });

  test('with array attribute as array', () => {
    expect(
      reverseSnippet({
        attribute: ['categories', 1],
        hit,
      })
    ).toMatchInlineSnapshot(`"Streaming Media Players"`);
  });
});
