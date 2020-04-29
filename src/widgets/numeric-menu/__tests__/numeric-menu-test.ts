import { render as preactRender } from 'preact';
import numericMenu from '../numeric-menu';
import algoliasearchHelper, {
  SearchParameters,
  SearchResults,
  AlgoliaSearchHelper,
} from 'algoliasearch-helper';

import { castToJestMock } from '../../../../test/utils/castToJestMock';
import {
  createRenderOptions,
  createInitOptions,
} from '../../../../test/mock/createWidget';
import { createSingleSearchResponse } from '../../../../test/mock/createAPIResponse';
import { createSearchClient } from '../../../../test/mock/createSearchClient';

const render = castToJestMock(preactRender);

jest.mock('preact', () => {
  const module = require.requireActual('preact');

  module.render = jest.fn();

  return module;
});

describe('Usage', () => {
  it('throws without container', () => {
    expect(() => {
      // @ts-ignore
      numericMenu({ container: undefined });
    }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/numeric-menu/js/"
`);
  });
});

describe('numericMenu()', () => {
  let container: string | HTMLElement;
  let widget: ReturnType<typeof numericMenu>;
  let helper: AlgoliaSearchHelper;

  let items;
  let results;
  let state;

  beforeEach(() => {
    render.mockClear();

    items = [
      { label: 'All' },
      { end: 4, label: 'less than 4' },
      { start: 4, end: 4, label: '4' },
      { start: 5, end: 10, label: 'between 5 and 10' },
      { start: 10, label: 'more than 10' },
    ];

    container = document.createElement('div');
    widget = numericMenu({
      container,
      attribute: 'price',
      items,
      cssClasses: { root: ['root', 'cx'] },
    });

    helper = algoliasearchHelper(
      createSearchClient(),
      '',
      widget.getWidgetSearchParameters!(new SearchParameters(), { uiState: {} })
    );

    jest.spyOn(helper, 'search');

    state = helper.state;
    results = new SearchResults(helper.state, [
      createSingleSearchResponse({ nbHits: 0 }),
    ]);

    widget.init!(createInitOptions({ helper }));
  });

  it('calls twice render(<RefinementList props />, container)', () => {
    widget.render!(createRenderOptions({ state, results }));
    widget.render!(createRenderOptions({ state, results }));

    const [firstRender, secondRender] = render.mock.calls;

    expect(render).toHaveBeenCalledTimes(2);
    expect(firstRender[0].props).toMatchSnapshot();
    expect(firstRender[1]).toEqual(container);
    expect(secondRender[0].props).toMatchSnapshot();
    expect(secondRender[1]).toEqual(container);
  });

  it('renders with transformed items', () => {
    widget = numericMenu({
      container,
      attribute: 'price',
      items,
      transformItems: allItems =>
        allItems.map(item => ({ ...item, transformed: true })),
    });

    widget.init!(createInitOptions({ helper }));
    widget.render!(createRenderOptions({ state, results }));

    const [firstRender] = render.mock.calls;

    expect(firstRender[0].props.facetValues).toEqual([
      {
        isRefined: true,
        label: 'All',
        transformed: true,
        value: '%7B%7D',
      },
      {
        isRefined: false,
        label: 'less than 4',
        transformed: true,
        value: '%7B%22end%22:4%7D',
      },
      {
        isRefined: false,
        label: '4',
        transformed: true,
        value: '%7B%22start%22:4,%22end%22:4%7D',
      },
      {
        isRefined: false,
        label: 'between 5 and 10',
        transformed: true,
        value: '%7B%22start%22:5,%22end%22:10%7D',
      },
      {
        isRefined: false,
        label: 'more than 10',
        transformed: true,
        value: '%7B%22start%22:10%7D',
      },
    ]);
  });

  it('does not alter the initial items when rendering', () => {
    // Note: https://github.com/algolia/instantsearch.js/issues/1010
    // Make sure we work on a copy of the initial facetValues when rendering,
    // not directly editing it

    // Given
    const initialOptions = [{ start: 0, end: 5, label: '1-5' }];
    const initialOptionsClone = [...initialOptions];
    const testWidget = numericMenu({
      container,
      attribute: 'price',
      items: initialOptions,
    });

    // The life cycle impose all the steps
    testWidget.init!(createInitOptions());

    // When
    testWidget.render!(createRenderOptions());

    // Then
    expect(initialOptions).toEqual(initialOptionsClone);
  });
});
