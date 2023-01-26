/**
 * @jest-environment jsdom
 */

import type { VNode } from 'preact';
import { render as preactRender } from 'preact';
import breadcrumb from '../breadcrumb';
import { castToJestMock } from '@instantsearch/testutils/castToJestMock';
import {
  createRenderOptions,
  createInitOptions,
} from '../../../../test/createWidget';
import type { AlgoliaSearchHelper } from 'algoliasearch-helper';
import algoliasearchHelper, {
  SearchParameters,
  SearchResults,
} from 'algoliasearch-helper';
import {
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';

const render = castToJestMock(preactRender);
jest.mock('preact', () => {
  const module = jest.requireActual('preact');

  module.render = jest.fn();

  return module;
});

describe('breadcrumb()', () => {
  let container: HTMLElement;
  let attributes: string[];

  beforeEach(() => {
    container = document.createElement('div');
    attributes = ['hierarchicalCategories.lvl0', 'hierarchicalCategories.lvl1'];

    render.mockClear();
  });

  describe('Usage', () => {
    it('throws without `container`', () => {
      expect(() => {
        breadcrumb({
          // @ts-expect-error
          container: undefined,
        });
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/breadcrumb/js/"
`);
    });
  });

  describe('render', () => {
    let results: SearchResults;
    let helper: AlgoliaSearchHelper;
    let state: SearchParameters;

    beforeEach(() => {
      helper = algoliasearchHelper(createSearchClient(), '');

      state = new SearchParameters({
        hierarchicalFacets: [
          {
            attributes: [
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
            ],
            name: 'hierarchicalCategories.lvl0',
            separator: ' > ',
            rootPath: null,
          },
        ],
        hierarchicalFacetsRefinements: {
          'hierarchicalCategories.lvl0': [
            'Cameras & Camcorders > Digital Cameras',
          ],
        },
      });

      results = new SearchResults(state, [
        createSingleSearchResponse({
          facets: {
            'hierarchicalCategories.lvl0': {
              'Cameras & Camcorders': 1369,
            },
            'hierarchicalCategories.lvl1': {
              'Cameras & Camcorders > Digital Cameras': 170,
            },
          },
        }),
      ]);
    });

    it('renders transformed items correctly', () => {
      const widget = breadcrumb({
        container,
        attributes,
        transformItems: (items) =>
          items.map((item) => ({ ...item, transformed: true })),
      });
      widget.init!(
        createInitOptions({
          helper,
        })
      );
      widget.render!(
        createRenderOptions({
          results,
          state,
        })
      );

      const firstRender = render.mock.calls[0][0] as VNode;

      expect(firstRender.props).toMatchSnapshot();
    });
  });
});
