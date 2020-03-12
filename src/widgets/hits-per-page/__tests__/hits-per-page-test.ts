import { render } from 'preact';
import { SearchParameters } from 'algoliasearch-helper';
import hitsPerPage from '../hits-per-page';

jest.mock('preact', () => {
  const module = require.requireActual('preact');

  module.render = jest.fn();

  return module;
});

describe('Usage', () => {
  it('throws without container', () => {
    expect(() => {
      hitsPerPage({ container: undefined });
    }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/hits-per-page/js/"
`);
  });
});

describe('hitsPerPage()', () => {
  let container;
  let items;
  let cssClasses;
  let widget;
  let helper;
  let results;
  let state;

  beforeEach(() => {
    container = document.createElement('div');
    items = [
      { value: 10, label: '10 results', default: true },
      { value: 20, label: '20 results' },
    ];
    cssClasses = {
      root: ['custom-root', 'cx'],
      select: 'custom-select',
      option: 'custom-option',
    };
    widget = hitsPerPage({ container, items, cssClasses });
    helper = {
      state: {
        hitsPerPage: 20,
      },
      setQueryParameter: jest.fn().mockReturnThis(),
      search: jest.fn(),
    };
    state = {
      hitsPerPage: 10,
    };
    results = {
      hits: [],
      nbHits: 0,
    };

    render.mockClear();
  });

  it('configures the default hits per page', () => {
    const widgetWithDefaults = hitsPerPage({
      container: document.createElement('div'),
      items: [
        { value: 10, label: '10 results' },
        { value: 20, label: '20 results', default: true },
      ],
    });

    expect(
      widgetWithDefaults.getWidgetSearchParameters(new SearchParameters({}), {
        uiState: {},
      })
    ).toEqual(
      new SearchParameters({
        hitsPerPage: 20,
      })
    );
  });

  it('calls twice render(<Selector props />, container)', () => {
    widget.init({ helper, state: helper.state });
    widget.render({ results, state });
    widget.render({ results, state });

    const [firstRender] = render.mock.calls;
    const { children, ...rootProps } = firstRender[0].props;

    expect(render).toHaveBeenCalledTimes(2);
    expect(rootProps).toMatchSnapshot();
    expect(firstRender[0].props.children.props).toMatchSnapshot();
  });

  it('renders transformed items', () => {
    widget = hitsPerPage({
      container,
      items: [
        { value: 10, label: '10 results' },
        { value: 20, label: '20 results', default: true },
      ],
      transformItems: widgetItems =>
        widgetItems.map(item => ({ ...item, transformed: true })),
    });

    widget.init({ helper, state: helper.state });
    widget.render({ results, state });

    const [firstRender] = render.mock.calls;

    expect(firstRender[0].props.children.props.options).toEqual([
      {
        isRefined: true,
        label: '10 results',
        transformed: true,
        value: 10,
      },
      {
        default: true,
        isRefined: false,
        label: '20 results',
        transformed: true,
        value: 20,
      },
    ]);
  });

  it('sets the underlying hitsPerPage', () => {
    widget.init({ helper, state: helper.state });
    widget.setHitsPerPage(helper, helper.state, 10);

    expect(helper.setQueryParameter).toHaveBeenCalledTimes(1);
    expect(helper.search).toHaveBeenCalledTimes(1, 'search called once');
  });

  it('should warn without name attribute in a passed item', () => {
    items.length = 0;
    items.push({ label: 'Label without a value' });

    expect(() => {
      widget.init({ state: helper.state, helper });
    }).toWarnDev(
      `[InstantSearch.js]: The \`items\` option of \`hitsPerPage\` does not contain the "hits per page" value coming from the state: 20.

You may want to add another entry to the \`items\` option with this value.`
    );
  });

  it('must include the current hitsPerPage at initialization time', () => {
    helper.state.hitsPerPage = -1;

    expect(() => {
      widget.init({ state: helper.state, helper });
    }).toWarnDev(
      `[InstantSearch.js]: The \`items\` option of \`hitsPerPage\` does not contain the "hits per page" value coming from the state: -1.

You may want to add another entry to the \`items\` option with this value.`
    );
  });

  it('should not throw an error if state does not have a `hitsPerPage`', () => {
    delete helper.state.hitsPerPage;

    expect(() => {
      widget.init({ state: helper.state, helper });
    }).not.toThrow(/No item in `items`/);
  });
});
