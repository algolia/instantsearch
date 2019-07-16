import { queryByText, getAllByText, wait } from '@testing-library/dom';

// eslint-disable-next-line import/extensions, import/no-unresolved
import instantsearch from 'instantsearch.js';

import apiResults from '../../../../__fixtures__/empty-query.json';

const searchClient = {
  search: jest.fn(() => Promise.resolve(apiResults)),
};

describe('Breadcrumb', () => {
  let container;
  let search;

  beforeEach(() => {
    container = document.createElement('div');

    search = instantsearch({
      indexName: 'instant_search',
      searchClient,
    });
  });

  afterEach(() => {
    try {
      search.dispose();
    } catch (e) {
      // Fail if the search was never started, ignoring
    }
  });

  it('must throw if `container` option is missing', () => {
    expect(() => {
      search.addWidget(instantsearch.widgets.breadcrumb());
    }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/breadcrumb/js/"
`);
  });

  it('must be added to the DOM on `search.start`', async () => {
    const widget = instantsearch.widgets.breadcrumb({
      container,
      attributes: [
        'hierarchicalCategories.lvl0',
        'hierarchicalCategories.lvl1',
        'hierarchicalCategories.lvl2',
      ],
    });

    search.addWidget(widget);

    search.start();

    await wait();

    expect(container).not.toBeEmpty();
  });

  it('must be removed from the DOM on `search.removeWidget`', async () => {
    const widget = instantsearch.widgets.breadcrumb({
      container,
      attributes: [
        'hierarchicalCategories.lvl0',
        'hierarchicalCategories.lvl1',
        'hierarchicalCategories.lvl2',
      ],
    });

    search.addWidget(widget);

    search.start();

    await wait();

    search.removeWidget(widget);

    await wait();

    expect(container).toBeEmpty();
  });

  describe('without initial refinements', () => {
    it('must reflect navigation within a hierarchical menu', async () => {
      const hierarchicalMenuContainer = document.createElement('div');

      search.addWidget(
        instantsearch.widgets.breadcrumb({
          container,
          attributes: [
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
          ],
        })
      );

      search.addWidget(
        instantsearch.widgets.hierarchicalMenu({
          showParentLevel: false,
          container: hierarchicalMenuContainer,
          attributes: [
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
          ],
          rootPath: 'Cameras & Camcorders',
        })
      );

      search.start();

      await wait();

      queryByText(hierarchicalMenuContainer, 'Digital Cameras').click();

      await wait();

      expect(queryByText(container, 'Home')).toBeTruthy();
      expect(queryByText(container, 'Digital Cameras')).toBeTruthy();
    });
  });

  describe('with initial refinements', () => {
    beforeEach(() => {
      search.addWidget(
        instantsearch.widgets.configure({
          hierarchicalFacetsRefinements: {
            'hierarchicalCategories.lvl0': [
              'Cameras & Camcorders > Digital Cameras',
            ],
          },
        })
      );
    });

    it('must render the categories', async () => {
      search.addWidget(
        instantsearch.widgets.breadcrumb({
          container,
          attributes: [
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
          ],
        })
      );

      search.start();

      await wait();

      expect(queryByText(container, 'Home')).toBeTruthy();
      expect(queryByText(container, 'Cameras & Camcorders')).toBeTruthy();
      expect(queryByText(container, 'Digital Cameras')).toBeTruthy();
    });

    it('must go one level up on click on a category', async () => {
      search.addWidget(
        instantsearch.widgets.breadcrumb({
          container,
          attributes: [
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
          ],
        })
      );

      search.start();

      await wait();

      queryByText(container, 'Cameras & Camcorders').click();

      await wait();

      expect(queryByText(container, 'Home')).toBeTruthy();
      expect(queryByText(container, 'Cameras & Camcorders')).toBeTruthy();
      expect(queryByText(container, 'Digital Cameras')).toBeNull();
    });

    it('must go to the root on click on the first level', async () => {
      search.addWidget(
        instantsearch.widgets.breadcrumb({
          container,
          attributes: [
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
          ],
        })
      );

      search.start();

      await wait();

      queryByText(container, 'Home').click();

      await wait();

      expect(queryByText(container, 'Home')).toBeTruthy();
      expect(queryByText(container, 'Cameras & Camcorders')).toBeNull();
      expect(queryByText(container, 'Digital Cameras')).toBeNull();
    });

    it('must set a custom separator between levels', async () => {
      const CUSTOM_SEPARATOR = '+';

      search.addWidget(
        instantsearch.widgets.breadcrumb({
          container,
          attributes: [
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
          ],
          templates: {
            separator: CUSTOM_SEPARATOR,
          },
        })
      );

      search.start();

      await wait();

      expect(getAllByText(container, CUSTOM_SEPARATOR)).toBeTruthy();
    });

    it('must set a custom home label', async () => {
      const CUSTOM_HOME_LABEL = 'Home Page';

      search.addWidget(
        instantsearch.widgets.breadcrumb({
          container,
          attributes: [
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
          ],
          templates: {
            home: CUSTOM_HOME_LABEL,
          },
        })
      );

      search.start();

      await wait();

      expect(getAllByText(container, CUSTOM_HOME_LABEL)).toBeTruthy();
    });

    it('must transform items label', async () => {
      search.addWidget(
        instantsearch.widgets.breadcrumb({
          container,
          attributes: [
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
          ],
          transformItems: items =>
            items.map(item => ({
              ...item,
              label: `${item.label} (transformed)`,
            })),
        })
      );

      search.start();

      await wait();

      expect(
        queryByText(container, 'Cameras & Camcorders (transformed)')
      ).toBeTruthy();
      expect(
        queryByText(container, 'Digital Cameras (transformed)')
      ).toBeTruthy();
    });
  });
});
