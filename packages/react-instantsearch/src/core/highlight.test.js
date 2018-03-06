import parseAlgoliaHit from './highlight.js';

describe('parseAlgoliaHit()', () => {
  it('it does not break when there is a missing attribute', () => {
    const attribute = 'attr';
    const out = parseAlgoliaHit({
      attribute,
      hit: {},
      highlightProperty: '_highlightResult',
    });
    expect(out).toEqual([]);
  });

  it('creates a single element when there is no tag', () => {
    const value = 'foo bar baz';
    const attribute = 'attr';
    const out = parseAlgoliaHit({
      attribute,
      hit: createHit(attribute, value),
      highlightProperty: '_highlightResult',
    });
    expect(out).toEqual([{ isHighlighted: false, value }]);
  });

  it('creates a single element when there is only a tag', () => {
    const textValue = 'foo bar baz';
    const value = `<em>${textValue}</em>`;
    const attribute = 'attr';
    const out = parseAlgoliaHit({
      attribute,
      hit: createHit(attribute, value),
      highlightProperty: '_highlightResult',
    });
    expect(out).toEqual([{ value: textValue, isHighlighted: true }]);
  });

  it('fetches and parses a deep attribute', () => {
    const textValue = 'foo bar baz';
    const value = `<em>${textValue}</em>`;
    const hit = {
      lvl0: { lvl1: { lvl2: value } },
      _highlightResult: {
        lvl0: { lvl1: { lvl2: { value } } },
      },
    };
    const out = parseAlgoliaHit({
      attribute: 'lvl0.lvl1.lvl2',
      hit,
      highlightProperty: '_highlightResult',
    });
    expect(out).toEqual([{ value: textValue, isHighlighted: true }]);
  });

  it('parses the string and returns the part that are highlighted - 1 big highlight', () => {
    const str = 'like <em>al</em>golia does <em>al</em>golia';
    const hit = createHit('attr', str);
    const parsed = parseAlgoliaHit({
      attribute: 'attr',
      hit,
      highlightProperty: '_highlightResult',
    });
    expect(parsed).toEqual([
      { value: 'like ', isHighlighted: false },
      { value: 'al', isHighlighted: true },
      { value: 'golia does ', isHighlighted: false },
      { value: 'al', isHighlighted: true },
      { value: 'golia', isHighlighted: false },
    ]);
  });

  it('supports the array format, parses it and returns the part that is highlighted', () => {
    const hit = {
      tags: ['litterature', 'biology', 'photography'],
      _highlightResult: {
        tags: [
          { value: 'litterature' },
          { value: 'biology' },
          { value: '<em>photo</em>graphy' },
        ],
      },
    };

    const actual = parseAlgoliaHit({
      attribute: 'tags',
      hit,
      highlightProperty: '_highlightResult',
    });

    const exepectation = [
      [{ value: 'litterature', isHighlighted: false }],
      [{ value: 'biology', isHighlighted: false }],
      [
        { value: 'photo', isHighlighted: true },
        { value: 'graphy', isHighlighted: false },
      ],
    ];

    expect(actual).toEqual(exepectation);
  });

  it('parses the string and returns the part that are highlighted - same pre and post tag', () => {
    const str = 'surpise **lo**l mouhahah roflmao **lo**utre';
    const hit = createHit('attr', str);
    const parsed = parseAlgoliaHit({
      preTag: '**',
      postTag: '**',
      attribute: 'attr',
      hit,
      highlightProperty: '_highlightResult',
    });
    expect(parsed).toEqual([
      { value: 'surpise ', isHighlighted: false },
      { value: 'lo', isHighlighted: true },
      { value: 'l mouhahah roflmao ', isHighlighted: false },
      { value: 'lo', isHighlighted: true },
      { value: 'utre', isHighlighted: false },
    ]);
  });

  it('throws when hit is `null`', () => {
    expect(
      parseAlgoliaHit.bind(null, {
        attribute: 'unknownattribute',
        hit: null,
        highlightProperty: '_highlightResult',
      })
    ).toThrowError('`hit`, the matching record, must be provided');
  });

  it('throws when hit is `undefined`', () => {
    expect(
      parseAlgoliaHit.bind(null, {
        attribute: 'unknownAttribute',
        hit: undefined,
        highlightProperty: '_highlightResult',
      })
    ).toThrowError('`hit`, the matching record, must be provided');
  });
});

function createHit(attribute, value) {
  return {
    [attribute]: value,
    _highlightResult: {
      [attribute]: { value },
    },
  };
}
