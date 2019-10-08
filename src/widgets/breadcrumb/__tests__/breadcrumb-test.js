import { render } from 'preact';
import breadcrumb from '../breadcrumb';

jest.mock('preact', () => {
  const module = require.requireActual('preact');

  module.render = jest.fn();

  return module;
});

describe('breadcrumb()', () => {
  let container;
  let attributes;

  beforeEach(() => {
    container = document.createElement('div');
    attributes = ['hierarchicalCategories.lvl0', 'hierarchicalCategories.lvl1'];

    render.mockClear();
  });

  describe('Usage', () => {
    it('throws without `container`', () => {
      expect(() => {
        breadcrumb({
          container: undefined,
        });
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/breadcrumb/js/"
`);
    });
  });

  describe('render', () => {
    let results;
    let helper;
    let state;

    beforeEach(() => {
      const data = [
        {
          name: 'Cameras & Camcorders',
          path: 'Cameras & Camcorders',
          count: 1369,
          isRefined: true,
          data: [
            {
              name: 'Digital Cameras',
              path: 'Cameras & Camcorders > Digital Cameras',
              count: 170,
              isRefined: true,
              data: null,
            },
          ],
        },
      ];

      results = {
        getFacetValues: jest.fn(() => ({ data })),
        hierarchicalFacets: [
          {
            name: 'hierarchicalCategories.lvl0',
            count: null,
            isRefined: true,
            path: null,
            data,
          },
        ],
      };

      helper = {
        search: jest.fn(),
        toggleRefinement: jest.fn().mockReturnThis(),
      };

      state = {
        toggleRefinement: jest.fn().mockReturnThis(),
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
      };
    });

    it('renders transformed items correctly', () => {
      const widget = breadcrumb({
        container,
        attributes,
        transformItems: items =>
          items.map(item => ({ ...item, transformed: true })),
      });
      widget.init({
        helper,
        instantSearchInstance: {},
      });
      widget.render({
        results,
        state,
        instantSearchInstance: {},
      });

      const [firstRender] = render.mock.calls;

      expect(firstRender[0].props).toMatchSnapshot();
    });
  });
});
