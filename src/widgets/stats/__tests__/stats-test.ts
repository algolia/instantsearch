/**
 * @jest-environment jsdom
 */

import { render as preactRender } from 'preact';
import stats from '../stats';
import { castToJestMock } from '../../../../test/utils/castToJestMock';
import {
  createInitOptions,
  createRenderOptions,
} from '../../../../test/mock/createWidget';
import { SearchParameters, SearchResults } from 'algoliasearch-helper';
import { createSingleSearchResponse } from '../../../../test/mock/createAPIResponse';

const render = castToJestMock(preactRender);
jest.mock('preact', () => {
  const module = jest.requireActual('preact');
  module.render = jest.fn();
  return module;
});

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
  let container: HTMLElement;
  let widget: ReturnType<typeof stats>;

  beforeEach(() => {
    container = document.createElement('div');
    widget = stats({ container, cssClasses: { text: ['text', 'cx'] } });

    widget.init!(createInitOptions());

    render.mockClear();
  });

  it('calls twice render(<Stats props />, container)', () => {
    const results = new SearchResults(new SearchParameters(), [
      createSingleSearchResponse({
        nbHits: 20,
        page: 0,
        nbPages: 10,
        hitsPerPage: 2,
        processingTimeMS: 42,
        query: 'a query',
      }),
    ]);
    widget.render!(createRenderOptions({ results }));
    widget.render!(createRenderOptions({ results }));

    const [firstRender, secondRender] = render.mock.calls;

    expect(render).toHaveBeenCalledTimes(2);
    // @ts-expect-error
    expect(firstRender[0].props).toMatchInlineSnapshot(`
      {
        "areHitsSorted": false,
        "cssClasses": {
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
        "templateProps": {
          "templates": {
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
          "templatesConfig": {},
          "useCustomCompileOptions": {
            "text": false,
          },
        },
      }
    `);
    expect(firstRender[1]).toEqual(container);
    // @ts-expect-error
    expect(secondRender[0].props).toMatchInlineSnapshot(`
      {
        "areHitsSorted": false,
        "cssClasses": {
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
        "templateProps": {
          "templates": {
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
          "templatesConfig": {},
          "useCustomCompileOptions": {
            "text": false,
          },
        },
      }
    `);
    expect(secondRender[1]).toEqual(container);
  });

  it('renders sorted hits', () => {
    const results = new SearchResults(new SearchParameters(), [
      createSingleSearchResponse({
        nbHits: 20,
        nbSortedHits: 16,
        appliedRelevancyStrictness: 20,
        page: 0,
        nbPages: 10,
        hitsPerPage: 2,
        processingTimeMS: 42,
        query: 'second query',
      }),
    ]);
    widget.render!(createRenderOptions({ results }));

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
