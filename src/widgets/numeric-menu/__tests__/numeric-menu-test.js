import { render } from 'preact';
import numericMenu from '../numeric-menu';
import algoliasearchHelper, {
  SearchParameters,
  SearchResults,
} from 'algoliasearch-helper';

jest.mock('preact', () => {
  const module = require.requireActual('preact');

  module.render = jest.fn();

  return module;
});

describe('Usage', () => {
  it('throws without container', () => {
    expect(() => {
      numericMenu({ container: undefined });
    }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/numeric-menu/js/"
`);
  });
});

describe('numericMenu()', () => {
  let container;
  let widget;
  let helper;

  let items;
  let results;
  let createURL;
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
      {},
      '',
      widget.getWidgetSearchParameters(new SearchParameters(), { uiState: {} })
    );

    jest.spyOn(helper, 'search');

    state = helper.state;
    results = new SearchResults(helper.state, [{ nbHits: 0 }]);

    createURL = () => '#';
    widget.init({ helper, instantSearchInstance: {} });
  });

  it('calls twice render(<RefinementList props />, container)', () => {
    widget.render({ state, results, createURL });
    widget.render({ state, results, createURL });

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

    widget.init({ helper, instantSearchInstance: {} });
    widget.render({ state, results, createURL });

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
    testWidget.init({ helper, createURL: () => '', instantSearchInstance: {} });

    // When
    testWidget.render({ state, results, createURL });

    // Then
    expect(initialOptions).toEqual(initialOptionsClone);
  });
});
