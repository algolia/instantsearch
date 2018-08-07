import breadcrumb from '../breadcrumb';

describe('breadcrumb()', () => {
  let container;
  let attributes;
  let ReactDOM;

  beforeEach(() => {
    container = document.createElement('div');
    attributes = ['hierarchicalCategories.lvl0', 'hierarchicalCategories.lvl1'];
    ReactDOM = { render: jest.fn() };
    breadcrumb.__Rewire__('render', ReactDOM.render);
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

      expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
    });

    afterEach(() => {
      breadcrumb.__ResetDependency__('render');
    });
  });
});
