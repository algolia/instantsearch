/**
 * @jest-environment jsdom
 */

import { createSearchClient } from '@instantsearch/mocks';
import { castToJestMock } from '@instantsearch/testutils/castToJestMock';
import algoliaSearchHelper from 'algoliasearch-helper';
import { render as preactRender } from 'preact';

import {
  createInitOptions,
  createRenderOptions,
} from '../../../../test/createWidget';
import searchBox from '../search-box';

import type { AlgoliaSearchHelper } from 'algoliasearch-helper';
import type { VNode } from 'preact';

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

      const { cssClasses } = firstRender[0].props;

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

      const { isSearchStalled } = secondRender[0].props;

      expect(isSearchStalled).toBe(true);
    });
  });
});
