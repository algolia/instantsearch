import { render as preactRender, VNode } from 'preact';
import searchBox from '../search-box';
import algoliaSearchHelper, { AlgoliaSearchHelper } from 'algoliasearch-helper';
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import { castToJestMock } from '../../../../test/utils/castToJestMock';
import {
  createInitOptions,
  createRenderOptions,
} from '../../../../test/mock/createWidget';

const render = castToJestMock(preactRender);

jest.mock('preact', () => {
  const module = jest.requireActual('preact');

  module.render = jest.fn();

  return module;
});

describe('searchBox()', () => {
  let helper: AlgoliaSearchHelper;

  beforeEach(() => {
    render.mockClear();

    helper = algoliaSearchHelper(createSearchClient(), '', { query: '' });
  });

  describe('Usage', () => {
    it('throws without container', () => {
      expect(() => {
        searchBox({
          // @ts-expect-error
          container: undefined,
        });
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/search-box/js/"
`);
    });
  });

  describe('Rendering', () => {
    test('renders during init()', () => {
      const widget = searchBox({ container: document.createElement('div') });

      widget.init!(createInitOptions({ helper }));

      expect(render).toHaveBeenCalledTimes(1);

      const firstRender = render.mock.calls[0] as [VNode, Element];

      expect(firstRender[0].props).toMatchSnapshot();
    });

    test('renders during render()', () => {
      const container = document.createElement('div');
      const widget = searchBox({ container });

      widget.init!(createInitOptions({ helper }));
      widget.render!(createRenderOptions({ helper }));

      expect(render).toHaveBeenCalledTimes(2);

      const firstRender = render.mock.calls[0] as [VNode, Element];

      expect(firstRender[0].props).toMatchSnapshot();
      expect(firstRender[1]).toEqual(container);

      const secondRender = render.mock.calls[1] as [VNode, Element];

      expect(secondRender[0].props).toMatchSnapshot();
      expect(secondRender[1]).toEqual(container);
    });

    test('sets the correct CSS classes', () => {
      const widget = searchBox({
        container: document.createElement('div'),
      });

      widget.init!(createInitOptions({ helper }));

      expect(render).toHaveBeenCalledTimes(1);

      const firstRender = render.mock.calls[0] as [
        VNode<{ cssClasses: Record<string, string> }>,
        Element
      ];

      // Cast our props as an object (exluding `string` and `number` from VNode.props)
      const props = firstRender[0].props!;
      const { cssClasses } = firstRender[0].props as Exclude<
        typeof props,
        string | number
      >;

      expect(cssClasses).toMatchSnapshot();
    });

    test('sets isSearchStalled', () => {
      const widget = searchBox({ container: document.createElement('div') });

      widget.init!(createInitOptions({ helper }));
      widget.render!(
        createRenderOptions({
          helper,
          searchMetadata: { isSearchStalled: true },
        })
      );

      expect(render).toHaveBeenCalledTimes(2);

      const secondRender = render.mock.calls[1] as [
        VNode<{ isSearchStalled: boolean }>,
        Element
      ];

      // Cast our props as an object (exluding `string` and `number` from VNode.props)
      const props = secondRender[0].props!;
      const { isSearchStalled } = secondRender[0].props as Exclude<
        typeof props,
        string | number
      >;

      expect(isSearchStalled).toBe(true);
    });
  });
});
