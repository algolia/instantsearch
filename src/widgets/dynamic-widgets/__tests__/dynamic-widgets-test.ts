import {
  createInitOptions,
  createRenderOptions,
} from '../../../../test/mock/createWidget';
import { index, searchBox, menu, EXPERIMENTAL_dynamicWidgets } from '../..';
import { createInstantSearch } from '../../../../test/mock/createInstantSearch';
import { SearchParameters, SearchResults } from 'algoliasearch-helper';
import { createMultiSearchResponse } from '../../../../test/mock/createAPIResponse';
import { wait } from '../../../../test/utils/wait';
import { widgetSnapshotSerializer } from '../../../../test/utils/widgetSnapshotSerializer';

expect.addSnapshotSerializer(widgetSnapshotSerializer);

describe('dynamicWidgets()', () => {
  describe('usage', () => {
    test('container is required', () => {
      expect(() =>
        // @ts-expect-error testing invalid input
        EXPERIMENTAL_dynamicWidgets({})
      ).toThrowErrorMatchingInlineSnapshot(`
        "The \`container\` option is required.

        See documentation: https://www.algolia.com/doc/api-reference/widgets/dynamic-widgets/js/"
      `);
    });

    test('widgets is required', () => {
      expect(() =>
        // @ts-expect-error testing invalid input
        EXPERIMENTAL_dynamicWidgets({
          container: document.createElement('div'),
        })
      ).toThrowErrorMatchingInlineSnapshot(`
        "The \`widgets\` option expects an array of callbacks.

        See documentation: https://www.algolia.com/doc/api-reference/widgets/dynamic-widgets/js/"
      `);
    });

    test('widgets is required to be callbacks', () => {
      expect(() =>
        EXPERIMENTAL_dynamicWidgets({
          container: document.createElement('div'),
          // @ts-expect-error testing invalid input
          widgets: [searchBox({ container: document.createElement('div') })],
        })
      ).toThrowErrorMatchingInlineSnapshot(`
        "The \`widgets\` option expects an array of callbacks.

        See documentation: https://www.algolia.com/doc/api-reference/widgets/dynamic-widgets/js/"
      `);
    });

    test('transformItems is required', () => {
      expect(() =>
        // @ts-expect-error
        EXPERIMENTAL_dynamicWidgets({
          container: document.createElement('div'),
          widgets: [],
        })
      ).toThrowErrorMatchingInlineSnapshot(`
        "the \`transformItems\` option is required to be a function.

        See documentation: https://www.algolia.com/doc/api-reference/widgets/dynamic-widgets/js/#connector"
      `);
    });

    test('correct usage', () => {
      expect(() =>
        EXPERIMENTAL_dynamicWidgets({
          container: document.createElement('div'),
          transformItems: items => items,
          widgets: [],
        })
      ).not.toThrowError();
    });
  });

  describe('rendering', () => {
    it('creates all containers on init', () => {
      const rootContainer = document.createElement('div');

      const widget = EXPERIMENTAL_dynamicWidgets({
        container: rootContainer,
        transformItems: items => items,
        widgets: [
          container =>
            menu({
              attribute: 'test1',
              container,
              cssClasses: { root: 'test1' },
            }),
          container =>
            menu({
              attribute: 'test2',
              container,
              cssClasses: { root: 'test2' },
            }),
          container =>
            menu({
              attribute: 'test3',
              container,
              cssClasses: { root: 'test3' },
            }),
          container =>
            menu({
              attribute: 'test4',
              container,
              cssClasses: { root: 'test4' },
            }),
        ],
      });

      widget.init!(createInitOptions());

      expect(rootContainer).toMatchInlineSnapshot(`
        <div>
          <div
            class="ais-DynamicWidgets"
          >
            <div
              class="ais-DynamicWidgets-widget"
            />
            <div
              class="ais-DynamicWidgets-widget"
            />
            <div
              class="ais-DynamicWidgets-widget"
            />
            <div
              class="ais-DynamicWidgets-widget"
            />
          </div>
        </div>
      `);
    });

    it('empty containers stay when no widgets get rendered', async () => {
      const instantSearchInstance = createInstantSearch();

      const rootContainer = document.createElement('div');

      const indexWidget = index({ indexName: 'test' }).addWidgets([
        EXPERIMENTAL_dynamicWidgets({
          container: rootContainer,
          transformItems() {
            return [];
          },
          widgets: [
            container =>
              menu({
                attribute: 'test1',
                container,
                cssClasses: { root: 'test1' },
              }),
            container =>
              menu({
                attribute: 'test2',
                container,
                cssClasses: { root: 'test2' },
              }),
            container =>
              menu({
                attribute: 'test3',
                container,
                cssClasses: { root: 'test3' },
              }),
            container =>
              menu({
                attribute: 'test4',
                container,
                cssClasses: { root: 'test4' },
              }),
          ],
        }),
      ]);

      indexWidget.init!(createInitOptions({ instantSearchInstance }));

      // set results to the relevant index, so it renders all children
      instantSearchInstance.mainHelper!.derivedHelpers[0].lastResults = new SearchResults(
        indexWidget.getWidgetSearchParameters(new SearchParameters(), {
          uiState: {},
        }),
        createMultiSearchResponse({}).results
      );

      indexWidget.render!(createRenderOptions({ instantSearchInstance }));

      await wait(0);

      expect(rootContainer).toMatchInlineSnapshot(`
        <div>
          <div
            class="ais-DynamicWidgets"
          >
            <div
              class="ais-DynamicWidgets-widget"
            />
            <div
              class="ais-DynamicWidgets-widget"
            />
            <div
              class="ais-DynamicWidgets-widget"
            />
            <div
              class="ais-DynamicWidgets-widget"
            />
          </div>
        </div>
      `);
    });

    it('renders the widgets returned by transformItems', async () => {
      const instantSearchInstance = createInstantSearch();
      const rootContainer = document.createElement('div');

      const indexWidget = index({ indexName: 'test' }).addWidgets([
        EXPERIMENTAL_dynamicWidgets({
          container: rootContainer,
          transformItems() {
            return ['test1'];
          },
          widgets: [
            container =>
              menu({
                attribute: 'test1',
                container,
                cssClasses: { root: 'test1' },
              }),
            container =>
              menu({
                attribute: 'test2',
                container,
                cssClasses: { root: 'test2' },
              }),
            container =>
              menu({
                attribute: 'test3',
                container,
                cssClasses: { root: 'test3' },
              }),
            container =>
              menu({
                attribute: 'test4',
                container,
                cssClasses: { root: 'test4' },
              }),
          ],
        }),
      ]);

      indexWidget.init!(createInitOptions({ instantSearchInstance }));

      // set results to the relevant index, so it renders all children
      instantSearchInstance.mainHelper!.derivedHelpers[0].lastResults = new SearchResults(
        indexWidget.getWidgetSearchParameters(new SearchParameters(), {
          uiState: {},
        }),
        createMultiSearchResponse({}).results
      );

      indexWidget.render!(createRenderOptions({ instantSearchInstance }));

      await wait(0);

      expect(rootContainer).toMatchInlineSnapshot(`
        <div>
          <div
            class="ais-DynamicWidgets"
          >
            <div
              class="ais-DynamicWidgets-widget"
            />
            <div
              class="ais-DynamicWidgets-widget"
            />
            <div
              class="ais-DynamicWidgets-widget"
            />
            <div
              class="ais-DynamicWidgets-widget"
            >
              <div
                class="ais-Menu test1 ais-Menu--noRefinement"
              />
            </div>
          </div>
        </div>
      `);
    });

    it('updates the position of widgets returned by transformItems', async () => {
      const instantSearchInstance = createInstantSearch();
      const rootContainer = document.createElement('div');

      const indexWidget = index({ indexName: 'test' }).addWidgets([
        EXPERIMENTAL_dynamicWidgets({
          container: rootContainer,
          transformItems(_items, { results }) {
            return results.userData[0].MOCK_facetOrder;
          },
          widgets: [
            container =>
              menu({
                attribute: 'test1',
                container,
                cssClasses: { root: 'test1' },
              }),
            container =>
              menu({
                attribute: 'test2',
                container,
                cssClasses: { root: 'test2' },
              }),
            container =>
              menu({
                attribute: 'test3',
                container,
                cssClasses: { root: 'test3' },
              }),
            container =>
              menu({
                attribute: 'test4',
                container,
                cssClasses: { root: 'test4' },
              }),
          ],
        }),
      ]);

      indexWidget.init!(createInitOptions({ instantSearchInstance }));

      // set results to the relevant index, so it renders all children
      instantSearchInstance.mainHelper!.derivedHelpers[0].lastResults = new SearchResults(
        indexWidget.getWidgetSearchParameters(new SearchParameters(), {
          uiState: {},
        }),
        createMultiSearchResponse({
          userData: [{ MOCK_facetOrder: ['test1', 'test4'] }],
        }).results
      );

      indexWidget.render!(createRenderOptions({ instantSearchInstance }));

      await wait(0);

      expect(rootContainer).toMatchInlineSnapshot(`
        <div>
          <div
            class="ais-DynamicWidgets"
          >
            <div
              class="ais-DynamicWidgets-widget"
            />
            <div
              class="ais-DynamicWidgets-widget"
            />
            <div
              class="ais-DynamicWidgets-widget"
            >
              <div
                class="ais-Menu test1 ais-Menu--noRefinement"
              />
            </div>
            <div
              class="ais-DynamicWidgets-widget"
            >
              <div
                class="ais-Menu test4 ais-Menu--noRefinement"
              />
            </div>
          </div>
        </div>
      `);

      // set results to the relevant index, so it renders all children
      instantSearchInstance.mainHelper!.derivedHelpers[0].lastResults = new SearchResults(
        indexWidget.getWidgetSearchParameters(new SearchParameters(), {
          uiState: {},
        }),
        createMultiSearchResponse({
          userData: [{ MOCK_facetOrder: ['test4', 'test1'] }],
        }).results
      );

      indexWidget.render!(createRenderOptions({ instantSearchInstance }));

      expect(rootContainer).toMatchInlineSnapshot(`
        <div>
          <div
            class="ais-DynamicWidgets"
          >
            <div
              class="ais-DynamicWidgets-widget"
            />
            <div
              class="ais-DynamicWidgets-widget"
            />
            <div
              class="ais-DynamicWidgets-widget"
            >
              <div
                class="ais-Menu test4 ais-Menu--noRefinement"
              />
            </div>
            <div
              class="ais-DynamicWidgets-widget"
            >
              <div
                class="ais-Menu test1 ais-Menu--noRefinement"
              />
            </div>
          </div>
        </div>
      `);
    });

    it('removes widgets on dispose', async () => {
      const instantSearchInstance = createInstantSearch();
      const rootContainer = document.createElement('div');

      const indexWidget = index({ indexName: 'test' }).addWidgets([
        EXPERIMENTAL_dynamicWidgets({
          container: rootContainer,
          transformItems(_items, { results }) {
            return results.userData[0].MOCK_facetOrder;
          },
          widgets: [
            container =>
              menu({
                attribute: 'test1',
                container,
                cssClasses: { root: 'test1' },
              }),
            container =>
              menu({
                attribute: 'test2',
                container,
                cssClasses: { root: 'test2' },
              }),
            container =>
              menu({
                attribute: 'test3',
                container,
                cssClasses: { root: 'test3' },
              }),
            container =>
              menu({
                attribute: 'test4',
                container,
                cssClasses: { root: 'test4' },
              }),
          ],
        }),
      ]);

      indexWidget.init!(createInitOptions({ instantSearchInstance }));

      // set results to the relevant index, so it renders all children
      instantSearchInstance.mainHelper!.derivedHelpers[0].lastResults = new SearchResults(
        indexWidget.getWidgetSearchParameters(new SearchParameters(), {
          uiState: {},
        }),
        createMultiSearchResponse({
          userData: [{ MOCK_facetOrder: ['test1', 'test4'] }],
        }).results
      );

      indexWidget.render!(createRenderOptions({ instantSearchInstance }));

      await wait(0);

      expect(indexWidget.getWidgets()).toMatchInlineSnapshot(`
        Array [
          Widget(ais.dynamicWidgets) {
            $$widgetType: ais.dynamicWidgets
          },
          Widget(ais.menu) {
            $$widgetType: ais.menu
            attribute: test1
          },
          Widget(ais.menu) {
            $$widgetType: ais.menu
            attribute: test4
          },
        ]
      `);

      const dynamicWidget = indexWidget.getWidgets()[0];

      indexWidget.removeWidgets([dynamicWidget]);

      expect(indexWidget.getWidgets()).toMatchInlineSnapshot(`Array []`);
    });

    it('removes dom on dispose', async () => {
      const instantSearchInstance = createInstantSearch();
      const rootContainer = document.createElement('div');

      const indexWidget = index({ indexName: 'test' }).addWidgets([
        EXPERIMENTAL_dynamicWidgets({
          container: rootContainer,
          transformItems(_items, { results }) {
            return results.userData[0].MOCK_facetOrder;
          },
          widgets: [
            container =>
              menu({
                attribute: 'test1',
                container,
                cssClasses: { root: 'test1' },
              }),
            container =>
              menu({
                attribute: 'test2',
                container,
                cssClasses: { root: 'test2' },
              }),
            container =>
              menu({
                attribute: 'test3',
                container,
                cssClasses: { root: 'test3' },
              }),
            container =>
              menu({
                attribute: 'test4',
                container,
                cssClasses: { root: 'test4' },
              }),
          ],
        }),
      ]);

      indexWidget.init!(createInitOptions({ instantSearchInstance }));

      // set results to the relevant index, so it renders all children
      instantSearchInstance.mainHelper!.derivedHelpers[0].lastResults = new SearchResults(
        indexWidget.getWidgetSearchParameters(new SearchParameters(), {
          uiState: {},
        }),
        createMultiSearchResponse({
          userData: [{ MOCK_facetOrder: ['test1', 'test4'] }],
        }).results
      );

      indexWidget.render!(createRenderOptions({ instantSearchInstance }));

      await wait(0);

      expect(rootContainer).toMatchInlineSnapshot(`
        <div>
          <div
            class="ais-DynamicWidgets"
          >
            <div
              class="ais-DynamicWidgets-widget"
            />
            <div
              class="ais-DynamicWidgets-widget"
            />
            <div
              class="ais-DynamicWidgets-widget"
            >
              <div
                class="ais-Menu test1 ais-Menu--noRefinement"
              />
            </div>
            <div
              class="ais-DynamicWidgets-widget"
            >
              <div
                class="ais-Menu test4 ais-Menu--noRefinement"
              />
            </div>
          </div>
        </div>
      `);

      const dynamicWidget = indexWidget.getWidgets()[0];

      indexWidget.removeWidgets([dynamicWidget]);

      expect(rootContainer).toMatchInlineSnapshot(`<div />`);
    });
  });
});
