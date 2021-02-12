import jsHelper, {
  AlgoliaSearchHelper,
  SearchParameters,
  SearchResults,
} from 'algoliasearch-helper';
import { render as _originalRender, VNode } from 'preact';
import { createSingleSearchResponse } from '../../../../test/mock/createAPIResponse';
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import {
  createInitOptions,
  createRenderOptions,
} from '../../../../test/mock/createWidget';
import menu from '../menu';

jest.mock('preact', () => {
  const module = jest.requireActual('preact');

  module.render = jest.fn();

  return module;
});
const render = _originalRender as jest.MockedFunction<typeof _originalRender>;

describe('menu', () => {
  it('throws without container', () => {
    expect(() => {
      // @ts-ignore
      menu({ attribute: undefined });
    }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/menu/js/"
`);
  });

  describe('render', () => {
    let results: SearchResults;
    let state: SearchParameters;
    let helper: AlgoliaSearchHelper;

    beforeEach(() => {
      helper = jsHelper(createSearchClient(), '');
      state = helper.state;
      results = new SearchResults(helper.state, [
        createSingleSearchResponse({
          facets: {
            test: {
              foo: 123,
              bar: 456,
            },
          },
        }),
      ]);

      render.mockClear();
    });

    it('snapshot', () => {
      const widget = menu({
        container: document.createElement('div'),
        attribute: 'test',
      });

      widget.init!(
        createInitOptions({
          helper,
          createURL: () => '#',
        })
      );
      widget.render!(createRenderOptions({ results, state }));

      const firstRender = render.mock.calls[0][0] as VNode;

      expect(firstRender.props).toMatchSnapshot();
    });

    it('renders transformed items', () => {
      const widget = menu({
        container: document.createElement('div'),
        attribute: 'test',
        transformItems: items =>
          items.map(item => ({ ...item, transformed: true })),
      });

      widget.init!(
        createInitOptions({
          helper,
          createURL: () => '#',
        })
      );
      widget.render!(createRenderOptions({ results, state }));

      const firstRender = render.mock.calls[0][0] as VNode;

      expect(firstRender.props).toMatchSnapshot();
    });
  });
});
