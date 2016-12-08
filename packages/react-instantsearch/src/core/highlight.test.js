/* eslint-env jest, jasmine */
import parseAlgoliaHit from './highlight.js';

describe('parseAlgoliaHit()', () => {
  it('creates a single element when there is no tag', () => {
    const value = 'foo bar baz';
    const attributeName = 'attr';
    const out = parseAlgoliaHit({attributeName, hit: createHit(attributeName, value)});
    expect(out).toEqual([{isHighlighted: false, value}]);
  });

  it('creates a single element when there is only a tag', () => {
    const textValue = 'foo bar baz';
    const value = `<em>${textValue}</em>`;
    const attributeName = 'attr';
    const out = parseAlgoliaHit({attributeName, hit: createHit(attributeName, value)});
    expect(out).toEqual([{value: textValue, isHighlighted: true}]);
  });

  it('fetches and parses a deep attribute', () => {
    const textValue = 'foo bar baz';
    const value = `<em>${textValue}</em>`;
    const hit = {
      lvl0: {lvl1: {lvl2: value}},
      _highlightResult: {
        lvl0: {lvl1: {lvl2: {value}}},
      },
    };
    const out = parseAlgoliaHit({attributeName: 'lvl0.lvl1.lvl2', hit});
    expect(out).toEqual([{value: textValue, isHighlighted: true}]);
  });

  it('parses the string and returns the part that are highlighted - 1 big highlight', () => {
    const str = 'like <em>al</em>golia does <em>al</em>golia';
    const hit = createHit('attr', str);
    const parsed = parseAlgoliaHit({attributeName: 'attr', hit});
    expect(parsed).toEqual([
      {value: 'like ', isHighlighted: false},
      {value: 'al', isHighlighted: true},
      {value: 'golia does ', isHighlighted: false},
      {value: 'al', isHighlighted: true},
      {value: 'golia', isHighlighted: false},
    ]);
  });

  it('parses the string and returns the part that are highlighted - same pre and post tag', () => {
    const str = 'surpise **lo**l mouhahah roflmao **lo**utre';
    const hit = createHit('attr', str);
    const parsed = parseAlgoliaHit({
      preTag: '**',
      postTag: '**',
      attributeName: 'attr',
      hit,
    });
    expect(parsed).toEqual([
      {value: 'surpise ', isHighlighted: false},
      {value: 'lo', isHighlighted: true},
      {value: 'l mouhahah roflmao ', isHighlighted: false},
      {value: 'lo', isHighlighted: true},
      {value: 'utre', isHighlighted: false},
    ]);
  });

  it('throws when the attribute is not highlighted in the hit', () => {
    expect(parseAlgoliaHit.bind(null, {
      attributeName: 'notHighlightedAttribute',
      hit: {notHighlightedAttribute: 'some value'},
    })).toThrowError(
      '`attributeName`=notHighlightedAttribute must resolve to an highlighted attribute in the record'
    );
  });

  it('throws when hit is `null`', () => {
    expect(parseAlgoliaHit.bind(null, {
      attributeName: 'unknownattribute',
      hit: null,
    })).toThrowError('`hit`, the matching record, must be provided');
  });

  it('throws when hit is `undefined`', () => {
    expect(parseAlgoliaHit.bind(null, {
      attributeName: 'unknownAttribute',
      hit: undefined,
    })).toThrowError('`hit`, the matching record, must be provided');
  });
});

function createHit(attribute, value) {
  return {
    [attribute]: value,
    _highlightResult: {
      [attribute]: {value},
    },
  };
}
