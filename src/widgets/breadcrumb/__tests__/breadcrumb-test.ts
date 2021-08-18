import { render as preactRender, VNode } from 'preact';
import breadcrumb from '../breadcrumb';
import { castToJestMock } from '../../../../test/utils/castToJestMock';
import {
  createRenderOptions,
  createInitOptions,
} from '../../../../test/mock/createWidget';
import algoliasearchHelper, {
  AlgoliaSearchHelper,
  SearchParameters,
  SearchResults,
} from 'algoliasearch-helper';
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import { createSingleSearchResponse } from '../../../../test/mock/createAPIResponse';

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
