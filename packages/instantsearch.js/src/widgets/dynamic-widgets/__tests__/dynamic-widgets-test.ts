/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import {
  createMultiSearchResponse,
  createSearchClient,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils/wait';
import { widgetSnapshotSerializer } from '@instantsearch/testutils/widgetSnapshotSerializer';
import { SearchParameters, SearchResults } from 'algoliasearch-helper';
import { createInstantSearch } from 'instantsearch-core/test/createInstantSearch';
import {
  createInitOptions,
  createRenderOptions,
} from 'instantsearch-core/test/createWidget';

import { index, searchBox, menu, dynamicWidgets } from '../..';
import instantsearch from '../../..';
import refinementList from '../../refinement-list/refinement-list';

import type { SearchResponse } from 'instantsearch-core';

expect.addSnapshotSerializer(widgetSnapshotSerializer);

describe('dynamicWidgets()', () => {
  describe('usage', () => {
    test('container is required', () => {
      expect(() =>
        // @ts-expect-error testing invalid input
        dynamicWidgets({})
      ).toThrowErrorMatchingInlineSnapshot(`
        "The \`container\` option is required.

        See documentation: https://www.algolia.com/doc/api-reference/widgets/dynamic-widgets/js/"
      `);
    });

    test('widgets is required', () => {
      expect(() =>
        // @ts-expect-error testing invalid input
        dynamicWidgets({
          container: document.createElement('div'),
        })
      ).toThrowErrorMatchingInlineSnapshot(`
        "The \`widgets\` option expects an array of callbacks.

        See documentation: https://www.algolia.com/doc/api-reference/widgets/dynamic-widgets/js/"
      `);
    });

    test('widgets can be empty', () => {
      expect(() =>
        dynamicWidgets({
          container: document.createElement('div'),
          widgets: [],
        })
      ).not.toThrow();
    });

    test('widgets is required to be callbacks', () => {
      expect(() =>
        dynamicWidgets({
          container: document.createElement('div'),
          // @ts-expect-error testing invalid input
          widgets: [searchBox({ container: document.createElement('div') })],
        })
      ).toThrowErrorMatchingInlineSnapshot(`
        "The \`widgets\` option expects an array of callbacks.

        See documentation: https://www.algolia.com/doc/api-reference/widgets/dynamic-widgets/js/"
      `);
    });

    test('all options', () => {
      expect(() =>
        dynamicWidgets({
          container: document.createElement('div'),
          transformItems: (items) => items,
          widgets: [],
        })
      ).not.toThrow();
    });
  });

  describe('rendering', () => {
    it('creates all containers on init', () => {
      const rootContainer = document.createElement('div');

      const widget = dynamicWidgets({
        container: rootContainer,
        transformItems: (items) => items,
        widgets: [
          (container) =>
            menu({
              attribute: 'test1',
              container,
              cssClasses: { root: 'test1' },
            }),
          (container) =>
            menu({
              attribute: 'test2',
              container,
              cssClasses: { root: 'test2' },
            }),
          (container) =>
            menu({
              attribute: 'test3',
              container,
              cssClasses: { root: 'test3' },
            }),
          (container) =>
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
        dynamicWidgets({
          container: rootContainer,
          transformItems() {
            return [];
          },
          widgets: [
            (container) =>
              menu({
                attribute: 'test1',
                container,
                cssClasses: { root: 'test1' },
              }),
            (container) =>
              menu({
                attribute: 'test2',
                container,
                cssClasses: { root: 'test2' },
              }),
            (container) =>
              menu({
                attribute: 'test3',
                container,
                cssClasses: { root: 'test3' },
              }),
            (container) =>
              menu({
                attribute: 'test4',
                container,
                cssClasses: { root: 'test4' },
              }),
          ],
        }),
      ]);

      indexWidget.init(createInitOptions({ instantSearchInstance }));

      // set results to the relevant index, so it renders all children
      instantSearchInstance.helper!.derivedHelpers[0].lastResults =
        new SearchResults(
          indexWidget.getWidgetSearchParameters(new SearchParameters(), {
            uiState: {},
          }),
          createMultiSearchResponse({}).results as Array<SearchResponse<any>>
        );

      indexWidget.render(createRenderOptions({ instantSearchInstance }));

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
      const instantSearchInstance = instantsearch({
        indexName: 'indexName',
        searchClient: createSearchClient(),
      });
      const rootContainer = document.createElement('div');

      instantSearchInstance.addWidgets([
        dynamicWidgets({
          container: rootContainer,
          transformItems() {
            return ['test1'];
          },
          widgets: [
            (container) =>
              menu({
                attribute: 'test1',
                container,
                cssClasses: { root: 'test1' },
              }),
            (container) =>
              menu({
                attribute: 'test2',
                container,
                cssClasses: { root: 'test2' },
              }),
            (container) =>
              menu({
                attribute: 'test3',
                container,
                cssClasses: { root: 'test3' },
              }),
            (container) =>
              menu({
                attribute: 'test4',
                container,
                cssClasses: { root: 'test4' },
              }),
          ],
        }),
      ]);

      instantSearchInstance.start();

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
      const instantSearchInstance = instantsearch({
        indexName: 'indexName',
        searchClient: createSearchClient(),
      });
      instantSearchInstance.start();
      const rootContainer = document.createElement('div');

      let ordering = ['test1', 'test4'];

      instantSearchInstance.addWidgets([
        dynamicWidgets({
          container: rootContainer,
          transformItems() {
            return ordering;
          },
          widgets: [
            (container) =>
              menu({
                attribute: 'test1',
                container,
                cssClasses: { root: 'test1' },
              }),
            (container) =>
              menu({
                attribute: 'test2',
                container,
                cssClasses: { root: 'test2' },
              }),
            (container) =>
              menu({
                attribute: 'test3',
                container,
                cssClasses: { root: 'test3' },
              }),
            (container) =>
              menu({
                attribute: 'test4',
                container,
                cssClasses: { root: 'test4' },
              }),
          ],
        }),
      ]);

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

      ordering = ['test4', 'test1'];

      instantSearchInstance.scheduleRender();
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
        dynamicWidgets({
          container: rootContainer,
          transformItems(_items, { results }) {
            return results.userData[0].MOCK_facetOrder;
          },
          fallbackWidget: ({ container, attribute }) =>
            refinementList({
              attribute,
              container,
              cssClasses: { root: attribute },
            }),
          widgets: [
            (container) =>
              menu({
                attribute: 'test1',
                container,
                cssClasses: { root: 'test1' },
              }),
            (container) =>
              menu({
                attribute: 'test2',
                container,
                cssClasses: { root: 'test2' },
              }),
            (container) =>
              menu({
                attribute: 'test3',
                container,
                cssClasses: { root: 'test3' },
              }),
            (container) =>
              menu({
                attribute: 'test4',
                container,
                cssClasses: { root: 'test4' },
              }),
          ],
        }),
      ]);

      indexWidget.init(createInitOptions({ instantSearchInstance }));

      // set results to the relevant index, so it renders all children
      instantSearchInstance.helper!.derivedHelpers[0].lastResults =
        new SearchResults(
          indexWidget.getWidgetSearchParameters(new SearchParameters(), {
            uiState: {},
          }),
          createMultiSearchResponse({
            userData: [{ MOCK_facetOrder: ['test1', 'test4', 'test5'] }],
          }).results as Array<SearchResponse<any>>
        );

      indexWidget.render(createRenderOptions({ instantSearchInstance }));

      await wait(0);

      expect(indexWidget.getWidgets()).toMatchInlineSnapshot(`
        [
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
          Widget(ais.refinementList) {
            $$widgetType: ais.refinementList
            attribute: test5
          },
        ]
      `);

      const dynamicWidget = indexWidget.getWidgets()[0];

      indexWidget.removeWidgets([dynamicWidget]);

      expect(indexWidget.getWidgets()).toMatchInlineSnapshot(`[]`);
    });

    it('removes dom on dispose', async () => {
      const instantSearchInstance = instantsearch({
        indexName: 'indexName',
        searchClient: createSearchClient(),
      });
      instantSearchInstance.start();
      const rootContainer = document.createElement('div');

      const dynamicWidget = dynamicWidgets({
        container: rootContainer,
        transformItems() {
          return ['test1', 'test5', 'test4'];
        },
        fallbackWidget: ({ container, attribute }) =>
          refinementList({
            attribute,
            container,
            cssClasses: { root: attribute },
          }),
        widgets: [
          (container) =>
            menu({
              attribute: 'test1',
              container,
              cssClasses: { root: 'test1' },
            }),
          (container) =>
            menu({
              attribute: 'test2',
              container,
              cssClasses: { root: 'test2' },
            }),
          (container) =>
            menu({
              attribute: 'test3',
              container,
              cssClasses: { root: 'test3' },
            }),
          (container) =>
            menu({
              attribute: 'test4',
              container,
              cssClasses: { root: 'test4' },
            }),
        ],
      });

      instantSearchInstance.addWidgets([dynamicWidget]);

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
                class="ais-RefinementList test5 ais-RefinementList--noRefinement"
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

      instantSearchInstance.removeWidgets([dynamicWidget]);

      expect(rootContainer).toMatchInlineSnapshot(`<div />`);
    });
  });
});
