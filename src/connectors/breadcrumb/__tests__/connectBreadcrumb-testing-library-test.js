import { wait } from '@testing-library/dom';

import instantsearch from '../../../index';

import apiResults from '../../../widgets/breadcrumb/__tests__/__fixtures__/results.json';

const searchClient = {
  search: jest.fn(() => Promise.resolve(apiResults)),
};

describe('connectBreadcrumb', () => {
  let search;

  beforeEach(() => {
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

  it('must throw if `attributes` option is missing', () => {
    const renderBreadcrumb = jest.fn();

    const customBreadcrumb = instantsearch.connectors.connectBreadcrumb(
      renderBreadcrumb
    );

    expect(() => {
      search.addWidget(customBreadcrumb());
    }).toThrowErrorMatchingInlineSnapshot(`
"The \`attributes\` option expects an array of strings.

See documentation: https://www.algolia.com/doc/api-reference/widgets/breadcrumb/js/#connector"
`);
  });

  it('must throw if `attributes` option is empty', () => {
    const renderBreadcrumb = jest.fn();

    const customBreadcrumb = instantsearch.connectors.connectBreadcrumb(
      renderBreadcrumb
    );

    expect(() => {
      search.addWidget(
        customBreadcrumb({
          attributes: [],
        })
      );
    }).toThrowErrorMatchingInlineSnapshot(`
"The \`attributes\` option expects an array of strings.

See documentation: https://www.algolia.com/doc/api-reference/widgets/breadcrumb/js/#connector"
`);
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

    describe('`isFirstRender`', () => {
      it('must equal to `true` on first render', async () => {
        const renderBreadcrumb = jest.fn();

        const customBreadcrumb = instantsearch.connectors.connectBreadcrumb(
          renderBreadcrumb
        );

        search.addWidget(
          customBreadcrumb({
            attributes: [
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
              'hierarchicalCategories.lvl2',
            ],
          })
        );

        search.start();

        await wait();

        const [, isFirstRender] = renderBreadcrumb.mock.calls[0];

        expect(isFirstRender).toEqual(true);
      });

      it('must equal to `false` on second render', async () => {
        const renderBreadcrumb = jest.fn();

        const customBreadcrumb = instantsearch.connectors.connectBreadcrumb(
          renderBreadcrumb
        );

        search.addWidget(
          customBreadcrumb({
            attributes: [
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
              'hierarchicalCategories.lvl2',
            ],
          })
        );

        search.start();

        await wait();

        const [, isFirstRender] = renderBreadcrumb.mock.calls[1];

        expect(isFirstRender).toEqual(false);
      });
    });
    describe('`renderOptions`', () => {
      it('must contains expected object', async () => {
        const renderBreadcrumb = jest.fn();

        const customBreadcrumb = instantsearch.connectors.connectBreadcrumb(
          renderBreadcrumb
        );

        search.addWidget(
          customBreadcrumb({
            attributes: [
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
              'hierarchicalCategories.lvl2',
            ],
          })
        );

        search.start();

        await wait();

        const [renderOptions] = renderBreadcrumb.mock.calls[0];

        expect(renderOptions).toEqual({
          canRefine: false, // Undocumented
          createURL: expect.any(Function),
          instantSearchInstance: search, // Undocumented
          items: [],
          refine: expect.any(Function),
          widgetParams: {
            attributes: [
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
              'hierarchicalCategories.lvl2',
            ],
          },
        });
      });

      it('must contains items to render', async () => {
        const renderBreadcrumb = jest.fn();

        const customBreadcrumb = instantsearch.connectors.connectBreadcrumb(
          renderBreadcrumb
        );

        search.addWidget(
          customBreadcrumb({
            attributes: [
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
              'hierarchicalCategories.lvl2',
            ],
          })
        );

        search.start();

        await wait();

        const [{ items }] = renderBreadcrumb.mock.calls[1];

        expect(items).toEqual([
          {
            label: 'Cameras & Camcorders',
            value: 'Cameras & Camcorders > Digital Cameras',
          },
          { label: 'Digital Cameras', value: null },
        ]);
      });

      describe('`refine` function', () => {
        it('must update items to render', async () => {
          const renderBreadcrumb = jest.fn();

          const customBreadcrumb = instantsearch.connectors.connectBreadcrumb(
            renderBreadcrumb
          );

          search.addWidget(
            customBreadcrumb({
              attributes: [
                'hierarchicalCategories.lvl0',
                'hierarchicalCategories.lvl1',
                'hierarchicalCategories.lvl2',
              ],
            })
          );

          search.start();

          await wait();

          const [
            { items: secondRenderItems, refine },
          ] = renderBreadcrumb.mock.calls[1];

          refine(secondRenderItems[0].value);

          await wait();

          const [{ items: thirdRenderItems }] = renderBreadcrumb.mock.calls[2];

          expect(thirdRenderItems).toEqual([
            {
              label: 'Cameras & Camcorders',
              value: null,
            },
          ]);
        });
      });
    });
  });
});
