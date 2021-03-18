import { render as preactRender } from 'preact';
import stats from '../stats';
import { castToJestMock } from '../../../../test/utils/castToJestMock';

const render = castToJestMock(preactRender);
jest.mock('preact', () => {
  const module = jest.requireActual('preact');
  module.render = jest.fn();
  return module;
});

const instantSearchInstance = { templatesConfig: undefined };

describe('Usage', () => {
  it('throws without container', () => {
    expect(() => {
      // @ts-expect-error
      stats({ container: undefined });
    }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/stats/js/"
`);
  });
});

describe('stats()', () => {
  let container;
  let widget;

  beforeEach(() => {
    container = document.createElement('div');
    widget = stats({ container, cssClasses: { text: ['text', 'cx'] } });

    widget.init({
      helper: { state: {} },
      instantSearchInstance,
    });

    render.mockClear();
  });

  it('calls twice render(<Stats props />, container)', () => {
    const results = {
      hits: [{}, {}],
      nbHits: 20,
      page: 0,
      nbPages: 10,
      hitsPerPage: 2,
      processingTimeMS: 42,
      query: 'a query',
    };
    widget.render({ results, instantSearchInstance });
    widget.render({ results, instantSearchInstance });

    const [firstRender, secondRender] = render.mock.calls;

    expect(render).toHaveBeenCalledTimes(2);
    // @ts-expect-error
    expect(firstRender[0].props).toMatchInlineSnapshot(`
      Object {
        "areHitsSorted": false,
        "cssClasses": Object {
          "root": "ais-Stats",
          "text": "ais-Stats-text text cx",
        },
        "hitsPerPage": 2,
        "nbHits": 20,
        "nbPages": 10,
        "nbSortedHits": undefined,
        "page": 0,
        "processingTimeMS": 42,
        "query": "a query",
        "templateProps": Object {
          "templates": Object {
            "text": "
          {{#areHitsSorted}}
            {{#hasNoSortedResults}}No relevant results{{/hasNoSortedResults}}
            {{#hasOneSortedResults}}1 relevant result{{/hasOneSortedResults}}
            {{#hasManySortedResults}}{{#helpers.formatNumber}}{{nbSortedHits}}{{/helpers.formatNumber}} relevant results{{/hasManySortedResults}}
            sorted out of {{#helpers.formatNumber}}{{nbHits}}{{/helpers.formatNumber}}
          {{/areHitsSorted}}
          {{^areHitsSorted}}
            {{#hasNoResults}}No results{{/hasNoResults}}
            {{#hasOneResult}}1 result{{/hasOneResult}}
            {{#hasManyResults}}{{#helpers.formatNumber}}{{nbHits}}{{/helpers.formatNumber}} results{{/hasManyResults}}
          {{/areHitsSorted}}
          found in {{processingTimeMS}}ms",
          },
          "templatesConfig": undefined,
          "useCustomCompileOptions": Object {
            "text": false,
          },
        },
      }
    `);
    expect(firstRender[1]).toEqual(container);
    // @ts-expect-error
    expect(secondRender[0].props).toMatchInlineSnapshot(`
      Object {
        "areHitsSorted": false,
        "cssClasses": Object {
          "root": "ais-Stats",
          "text": "ais-Stats-text text cx",
        },
        "hitsPerPage": 2,
        "nbHits": 20,
        "nbPages": 10,
        "nbSortedHits": undefined,
        "page": 0,
        "processingTimeMS": 42,
        "query": "a query",
        "templateProps": Object {
          "templates": Object {
            "text": "
          {{#areHitsSorted}}
            {{#hasNoSortedResults}}No relevant results{{/hasNoSortedResults}}
            {{#hasOneSortedResults}}1 relevant result{{/hasOneSortedResults}}
            {{#hasManySortedResults}}{{#helpers.formatNumber}}{{nbSortedHits}}{{/helpers.formatNumber}} relevant results{{/hasManySortedResults}}
            sorted out of {{#helpers.formatNumber}}{{nbHits}}{{/helpers.formatNumber}}
          {{/areHitsSorted}}
          {{^areHitsSorted}}
            {{#hasNoResults}}No results{{/hasNoResults}}
            {{#hasOneResult}}1 result{{/hasOneResult}}
            {{#hasManyResults}}{{#helpers.formatNumber}}{{nbHits}}{{/helpers.formatNumber}} results{{/hasManyResults}}
          {{/areHitsSorted}}
          found in {{processingTimeMS}}ms",
          },
          "templatesConfig": undefined,
          "useCustomCompileOptions": Object {
            "text": false,
          },
        },
      }
    `);
    expect(secondRender[1]).toEqual(container);
  });

  it('renders sorted hits', () => {
    const results = {
      hits: [{}, {}],
      nbHits: 20,
      nbSortedHits: 16,
      appliedRelevancyStrictness: 20,
      page: 0,
      nbPages: 10,
      hitsPerPage: 2,
      processingTimeMS: 42,
      query: 'second query',
    };
    widget.render({ results, instantSearchInstance });

    const [firstRender] = render.mock.calls;
    // @ts-expect-error
    expect(firstRender[0].props).toEqual(
      expect.objectContaining({
        areHitsSorted: true,
        nbSortedHits: 16,
      })
    );
  });
});
