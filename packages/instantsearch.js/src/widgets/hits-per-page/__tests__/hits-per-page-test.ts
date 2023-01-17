/**
 * @jest-environment jsdom
 */

import type { VNode, ComponentChildren } from 'preact';
import { render as preactRender } from 'preact';
import type { AlgoliaSearchHelper } from 'algoliasearch-helper';
import algoliasearchHelper, {
  SearchParameters,
  SearchResults,
} from 'algoliasearch-helper';
import type { HitsPerPageCSSClasses } from '../hits-per-page';
import hitsPerPage from '../hits-per-page';
import { castToJestMock } from '@instantsearch/testutils/castToJestMock';
import type { SelectorProps } from '../../../components/Selector/Selector';
import type { HitsPerPageConnectorParamsItem } from '../../../connectors/hits-per-page/connectHitsPerPage';
import {
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import {
  createInitOptions,
  createRenderOptions,
} from '../../../../test/createWidget';

const render = castToJestMock(preactRender);
jest.mock('preact', () => {
  const module = jest.requireActual('preact');

  module.render = jest.fn();

  return module;
});

describe('Usage', () => {
  it('throws without container', () => {
    expect(() => {
      hitsPerPage({ container: '', items: [] });
    }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/hits-per-page/js/"
`);
  });
});

describe('hitsPerPage()', () => {
  let container: HTMLElement;
  let items: HitsPerPageConnectorParamsItem[];
  let cssClasses: HitsPerPageCSSClasses;
  let widget: ReturnType<typeof hitsPerPage>;
  let helper: AlgoliaSearchHelper;
  let results: SearchResults;
  let state: SearchParameters;

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
    helper = algoliasearchHelper(createSearchClient(), '', {
      hitsPerPage: 20,
    });
    state = new SearchParameters({ hitsPerPage: 10 });
    results = new SearchResults(helper.state, [
      createSingleSearchResponse({
        hits: [],
        nbHits: 0,
      }),
    ]);

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
    widget.init!(createInitOptions({ helper, state: helper.state }));
    widget.render!(createRenderOptions({ results, state }));
    widget.render!(createRenderOptions({ results, state }));

    const firstRender = render.mock.calls[0][0] as VNode<SelectorProps>;
    const { children, ...rootProps } = firstRender.props;

    expect(render).toHaveBeenCalledTimes(2);
    expect(rootProps).toMatchSnapshot();
    expect((children! as VNode).props).toMatchSnapshot();
  });

  it('renders transformed items', () => {
    widget = hitsPerPage({
      container,
      items: [
        { value: 10, label: '10 results' },
        { value: 20, label: '20 results', default: true },
      ],
      transformItems: (widgetItems) =>
        widgetItems.map((item) => ({ ...item, transformed: true })),
    });

    widget.init!(createInitOptions({ helper, state: helper.state }));
    widget.render!(createRenderOptions({ results, state }));

    const selectorRender = (
      (render.mock.calls[0][0] as VNode).props as {
        children: ComponentChildren;
      }
    ).children as VNode<SelectorProps>;
    const props = selectorRender.props as SelectorProps;

    expect(props.options).toEqual([
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

  it('should warn without name attribute in a passed item', () => {
    items.length = 0;
    // @ts-expect-error wrong item
    items.push({ label: 'Label without a value' });

    expect(() => {
      widget.init!(createInitOptions({ state: helper.state, helper }));
    }).toWarnDev(
      `[InstantSearch.js]: The \`items\` option of \`hitsPerPage\` does not contain the "hits per page" value coming from the state: 20.

You may want to add another entry to the \`items\` option with this value.`
    );
  });

  it('must include the current hitsPerPage at initialization time', () => {
    helper.state.hitsPerPage = -1;

    expect(() => {
      widget.init!(createInitOptions({ state: helper.state, helper }));
    }).toWarnDev(
      `[InstantSearch.js]: The \`items\` option of \`hitsPerPage\` does not contain the "hits per page" value coming from the state: -1.

You may want to add another entry to the \`items\` option with this value.`
    );
  });

  it('should not throw an error if state does not have a `hitsPerPage`', () => {
    delete helper.state.hitsPerPage;

    expect(() => {
      widget.init!(createInitOptions({ state: helper.state, helper }));
    }).not.toThrow(/No item in `items`/);
  });
});
