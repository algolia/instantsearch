import reverseSnippet from '../reverseSnippet';

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
        'Enjoy smart access to videos, games and apps with this <mark>Amazon</mark> Fire TV stick. Its Alexa voice remote lets you deliver hands-free commands when you want to watch television or engage with other applications. With a quad-core <mark>processor</mark>, <mark>1GB</mark> internal memory and 8GB of storage, this portable <mark>Amazon</mark> Fire TV stick works fast for buffer-free streaming.',
      matchLevel: FULL,
      fullyHighlighted: false,
      matchedWords: ['amazon', 'procesor', '1GB'],
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
      value: '<mark>Streaming</mark> - (<mark>media</mark> plyr)',
      matchLevel: FULL,
      fullyHighlighted: false,
      matchedWords: ['streaming', 'media'],
    },
    typeMissingSibling: {
      value: 'Streaming - (<mark>media</mark> plyr)',
      matchLevel: FULL,
      fullyHighlighted: false,
      matchedWords: ['media'],
    },
    typeFullMatch: {
      value: '<mark>Streaming</mark> - (<mark>media</mark> <mark>plyr</mark>)',
      matchLevel: FULL,
      fullyHighlighted: false,
      matchedWords: ['streaming', 'media', 'plyr'],
    },
    meta: {
      name: {
        value: 'Nested <mark>Amazon</mark> name',
        matchLevel: FULL,
      },
    },
  },
};

describe('reverseSnippet', () => {
  test('with default tag name', () => {
    expect(
      reverseSnippet({
        attribute: 'name',
        hit,
      })
    ).toMatchInlineSnapshot(
      `"Amazon<mark class=\\"ais-ReverseSnippet-highlighted\\"> - Fire TV Stick with Alexa Voice Remote - Black</mark>"`
    );
  });

  test('with full match', () => {
    expect(
      reverseSnippet({
        attribute: 'typeFullMatch',
        hit,
      })
    ).toMatchInlineSnapshot(`"Streaming - (media plyr)"`);
  });

  test('with custom tag name', () => {
    expect(
      reverseSnippet({
        attribute: 'description',
        highlightedTagName: 'em',
        hit,
      })
    ).toMatchInlineSnapshot(
      `"<em class=\\"ais-ReverseSnippet-highlighted\\">Enjoy smart access to videos, games and apps with this </em>Amazon<em class=\\"ais-ReverseSnippet-highlighted\\"> Fire TV stick. Its Alexa voice remote lets you deliver hands-free commands when you want to watch television or engage with other applications. With a quad-core </em>processor, 1GB<em class=\\"ais-ReverseSnippet-highlighted\\"> internal memory and 8GB of storage, this portable </em>Amazon<em class=\\"ais-ReverseSnippet-highlighted\\"> Fire TV stick works fast for buffer-free streaming.</em>"`
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
      `"<mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\">Enjoy smart access to videos, games and apps with this </mark>Amazon<mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\"> Fire TV stick. Its Alexa voice remote lets you deliver hands-free commands when you want to watch television or engage with other applications. With a quad-core </mark>processor, 1GB<mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\"> internal memory and 8GB of storage, this portable </mark>Amazon<mark class=\\"ais-ReverseSnippet-highlighted __highlighted\\"> Fire TV stick works fast for buffer-free streaming.</mark>"`
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
      `"<mark class=\\"ais-ReverseSnippet-highlighted\\">Nested </mark>Amazon<mark class=\\"ais-ReverseSnippet-highlighted\\"> name</mark>"`
    );
  });

  test('with nested attribute as array', () => {
    expect(
      reverseSnippet({
        attribute: ['meta', 'name'],
        hit,
      })
    ).toMatchInlineSnapshot(
      `"<mark class=\\"ais-ReverseSnippet-highlighted\\">Nested </mark>Amazon<mark class=\\"ais-ReverseSnippet-highlighted\\"> name</mark>"`
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
        attribute: ['categories', '1'],
        hit,
      })
    ).toMatchInlineSnapshot(`"Streaming Media Players"`);
  });

  test('with non-alphanumeric character with alphanumeric siblings matching highlight', () => {
    expect(
      reverseSnippet({
        attribute: 'type',
        hit,
      })
    ).toMatchInlineSnapshot(
      `"Streaming - (media<mark class=\\"ais-ReverseSnippet-highlighted\\"> plyr)</mark>"`
    );
  });

  test('with non-alphanumeric character with different alphanumeric siblings highlight', () => {
    expect(
      reverseSnippet({
        attribute: 'typeMissingSibling',
        hit,
      })
    ).toMatchInlineSnapshot(
      `"<mark class=\\"ais-ReverseSnippet-highlighted\\">Streaming - (</mark>media<mark class=\\"ais-ReverseSnippet-highlighted\\"> plyr)</mark>"`
    );
  });
});
