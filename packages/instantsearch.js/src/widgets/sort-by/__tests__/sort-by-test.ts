/**
 * @jest-environment jsdom
 */

import {
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { castToJestMock } from '@instantsearch/testutils/castToJestMock';
import algoliasearchHelper, { SearchResults } from 'algoliasearch-helper';
import { render as preactRender } from 'preact';

import { createInstantSearch } from '../../../../test/createInstantSearch';
import {
  createInitOptions,
  createRenderOptions,
} from '../../../../test/createWidget';
import sortBy from '../sort-by';

import type { SortByIndexDefinition } from '../sort-by';
import type { AlgoliaSearchHelper } from 'algoliasearch-helper';

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
      sortBy({ container: undefined });
    }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/sort-by/js/"
`);
  });
});

describe('sortBy()', () => {
  let container: HTMLElement;
  let items: SortByIndexDefinition[];
  let cssClasses;
  let widget: ReturnType<typeof sortBy>;
  let helper: AlgoliaSearchHelper;
  let results: SearchResults;

  beforeEach(() => {
    render.mockClear();

    const instantSearchInstance = createInstantSearch({
      indexName: 'indexName',
    });

    container = document.createElement('div');
    items = [
      { value: 'index-a', label: 'Index A' },
      { value: 'index-b', label: 'Index B' },
    ];
    cssClasses = {
      root: ['custom-root', 'cx'],
      select: 'custom-select',
      option: 'custom-option',
    };
    widget = sortBy({ container, items, cssClasses });

    helper = algoliasearchHelper(createSearchClient(), 'index-a');
    helper.setIndex = jest.fn().mockReturnThis();
    helper.search = jest.fn();

    results = new SearchResults(helper.state, [
      createSingleSearchResponse({
        hits: [],
        nbHits: 0,
      }),
    ]);
    widget.init!(createInitOptions({ helper, instantSearchInstance }));
  });

  it('calls twice render(<Selector props />, container)', () => {
    widget.render!(createRenderOptions({ helper, results }));
    widget.render!(createRenderOptions({ helper, results }));

    const [firstRender, secondRender] = render.mock.calls;
    // @ts-expect-error
    const { children, ...rootProps } = firstRender[0].props;

    expect(render).toHaveBeenCalledTimes(2);
    expect(rootProps).toMatchInlineSnapshot(`
      {
        "className": "ais-SortBy custom-root cx",
      }
    `);
    expect(children.props).toMatchInlineSnapshot(`
      {
        "cssClasses": {
          "option": "ais-SortBy-option custom-option",
          "root": "ais-SortBy custom-root cx",
          "select": "ais-SortBy-select custom-select",
        },
        "currentValue": "index-a",
        "options": [
          {
            "label": "Index A",
            "value": "index-a",
          },
          {
            "label": "Index B",
            "value": "index-b",
          },
        ],
        "setValue": [Function],
      }
    `);
    expect(firstRender[1]).toEqual(container);
    expect(secondRender[1]).toEqual(container);
  });

  it('renders transformed items', () => {
    widget = sortBy({
      container,
      items,
      transformItems: (allItems) =>
        allItems.map((item) => ({ ...item, transformed: true })),
    });

    widget.init!(createInitOptions({ helper }));
    widget.render!(createRenderOptions({ helper, results }));

    const [firstRender] = render.mock.calls;

    // @ts-expect-error
    expect(firstRender[0].props.children.props.options).toEqual([
      {
        label: 'Index A',
        transformed: true,
        value: 'index-a',
      },
      {
        label: 'Index B',
        transformed: true,
        value: 'index-b',
      },
    ]);
  });
});
