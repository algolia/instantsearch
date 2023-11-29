import {
  createMultiSearchResponse,
  createSingleSearchResponse,
  createSearchClient,
} from '@instantsearch/mocks';
import { widgetSnapshotSerializer } from '@instantsearch/testutils';
import { wait } from '@instantsearch/testutils/wait';
import algoliasearchHelper, {
  SearchParameters,
  SearchResults,
} from 'algoliasearch-helper';

import { connectMenu, connectDynamicWidgets } from '../..';
import {
  createDisposeOptions,
  createInitOptions,
  createRenderOptions,
} from '../../../../test/createWidget';
import { index } from '../../../widgets';
import connectHierarchicalMenu from '../../hierarchical-menu/connectHierarchicalMenu';
import connectRefinementList from '../../refinement-list/connectRefinementList';

import type { DynamicWidgetsConnectorParams } from '../connectDynamicWidgets';

expect.addSnapshotSerializer(widgetSnapshotSerializer);

describe('connectDynamicWidgets', () => {
  describe('Usage', () => {
    it('fails when no renderer is given', () => {
      expect(() =>
        // @ts-expect-error
        connectDynamicWidgets({})
      ).toThrowErrorMatchingInlineSnapshot(`
        "The render function is not valid (received type Object).

        See documentation: https://www.algolia.com/doc/api-reference/widgets/dynamic-widgets/js/#connector"
      `);
    });

    it('fails when no widgets are given', () => {
      expect(() =>
        connectDynamicWidgets(() => {})(
          // @ts-expect-error
          {}
        )
      ).toThrowErrorMatchingInlineSnapshot(`
        "The \`widgets\` option expects an array of widgets.

        See documentation: https://www.algolia.com/doc/api-reference/widgets/dynamic-widgets/js/#connector"
      `);
    });

    it('does not fail when empty widgets are given', () => {
      expect(() =>
        connectDynamicWidgets(() => {})({
          widgets: [],
        })
      ).not.toThrow();
    });

    it('fails when widgets is not an array', () => {
      expect(() =>
        connectDynamicWidgets(() => {})({
          // @ts-expect-error
          widgets: {},
        })
      ).toThrowErrorMatchingInlineSnapshot(`
        "The \`widgets\` option expects an array of widgets.

        See documentation: https://www.algolia.com/doc/api-reference/widgets/dynamic-widgets/js/#connector"
      `);
    });

    it('fails when facets is not an array', () => {
      expect(() =>
        connectDynamicWidgets(() => {})({
          widgets: [],
          // @ts-expect-error
          facets: {},
        })
      ).toThrowErrorMatchingInlineSnapshot(`
        "The \`facets\` option only accepts an array of facets, you passed {}

        See documentation: https://www.algolia.com/doc/api-reference/widgets/dynamic-widgets/js/#connector"
      `);
    });

    it('does not fail when only some facets are given', () => {
      expect(() =>
        connectDynamicWidgets(() => {})({
          widgets: [],
          facets: ['a', 'b', 'c'],
        })
      ).not.toThrow();
    });

    it('does not fail when only star facet is given', () => {
      expect(() =>
        connectDynamicWidgets(() => {})({ widgets: [], facets: ['*'] })
      ).not.toThrow();
    });

    it('does not fail when no facet is given', () => {
      expect(() =>
        connectDynamicWidgets(() => {})({ widgets: [], facets: [] })
      ).not.toThrow();
    });
  });

  describe('init', () => {
    describe('rendering', () => {
      it('calls the render function', () => {
        const renderFn = jest.fn();
        const widgetParams = {
          transformItems() {
            return ['test1'];
          },
          widgets: [
            connectMenu(() => {})({ attribute: 'test1' }),
            connectHierarchicalMenu(() => {})({
              attributes: ['test2', 'test3'],
            }),
          ],
        };
        const dynamicWidgets = connectDynamicWidgets(renderFn)(widgetParams);

        const parent = index({ indexName: 'test' }).addWidgets([
          dynamicWidgets,
        ]);

        dynamicWidgets.init!(createInitOptions({ parent }));

        expect(renderFn).toHaveBeenCalledWith(
          {
            attributesToRender: [],
            widgetParams,
            instantSearchInstance: expect.any(Object),
          },
          true
        );
      });
    });

    describe('widgets', () => {
      it('does not add widgets on init', () => {
        const dynamicWidgets = connectDynamicWidgets(() => {})({
          transformItems() {
            return [];
          },
          widgets: [
            connectMenu(() => {})({ attribute: 'test1' }),
            connectHierarchicalMenu(() => {})({
              attributes: ['test2', 'test3'],
            }),
          ],
        });

        const parent = index({ indexName: 'test' }).addWidgets([
          dynamicWidgets,
        ]);

        expect(parent.getWidgets()).toMatchInlineSnapshot(`
          [
            Widget(ais.dynamicWidgets),
          ]
        `);

        dynamicWidgets.init!(createInitOptions({ parent }));

        expect(parent.getWidgets()).toMatchInlineSnapshot(`
          [
            Widget(ais.dynamicWidgets),
          ]
        `);
      });
    });
  });

  describe('render', () => {
    describe('rendering', () => {
      it('calls the render function', () => {
        const renderFn = jest.fn();
        const widgetParams = {
          transformItems() {
            return [];
          },
          widgets: [
            connectMenu(() => {})({ attribute: 'test1' }),
            connectHierarchicalMenu(() => {})({
              attributes: ['test2', 'test3'],
            }),
          ],
        };
        const dynamicWidgets = connectDynamicWidgets(renderFn)(widgetParams);

        dynamicWidgets.render!(createRenderOptions());

        expect(renderFn).toHaveBeenCalledWith(
          {
            attributesToRender: [],
            widgetParams,
            instantSearchInstance: expect.any(Object),
          },
          false
        );
      });

      it('calls the render function with the result of transformItems', () => {
        const renderFn = jest.fn();
        const widgetParams = {
          transformItems() {
            return ['test1'];
          },
          widgets: [
            connectMenu(() => {})({ attribute: 'test1' }),
            connectHierarchicalMenu(() => {})({
              attributes: ['test2', 'test3'],
            }),
          ],
        };
        const dynamicWidgets = connectDynamicWidgets(renderFn)(widgetParams);

        dynamicWidgets.render!(createRenderOptions());

        expect(renderFn).toHaveBeenCalledWith(
          {
            attributesToRender: ['test1'],
            widgetParams,
            instantSearchInstance: expect.any(Object),
          },
          false
        );
      });

      it('throws when transformItems returns anything else than an array', () => {
        const widgetParams = {
          transformItems() {
            return null;
          },
          widgets: [],
        };

        // @ts-expect-error
        const dynamicWidgets = connectDynamicWidgets(() => {})(widgetParams);

        expect(() => {
          dynamicWidgets.render!(createRenderOptions());
        }).toThrowErrorMatchingInlineSnapshot(`
          "The \`transformItems\` option expects a function that returns an Array.

          See documentation: https://www.algolia.com/doc/api-reference/widgets/dynamic-widgets/js/#connector"
        `);
      });
    });

    describe('widgets', () => {
      it('keeps static widgets returned in transformItems', async () => {
        const dynamicWidgets = connectDynamicWidgets(() => {})({
          transformItems() {
            return ['test1'];
          },
          widgets: [
            connectMenu(() => {})({ attribute: 'test1' }),
            connectHierarchicalMenu(() => {})({
              attributes: ['test2', 'test3'],
            }),
          ],
        });

        const parent = index({ indexName: 'test' }).addWidgets([
          dynamicWidgets,
        ]);

        expect(parent.getWidgets()).toMatchInlineSnapshot(`
          [
            Widget(ais.dynamicWidgets),
          ]
        `);

        dynamicWidgets.init!(createInitOptions({ parent }));

        expect(parent.getWidgets()).toMatchInlineSnapshot(`
          [
            Widget(ais.dynamicWidgets),
          ]
        `);

        dynamicWidgets.render!(createRenderOptions({ parent }));

        await wait(0);

        expect(parent.getWidgets()).toMatchInlineSnapshot(`
          [
            Widget(ais.dynamicWidgets),
            Widget(ais.menu) {
              attribute: test1
            },
          ]
        `);
      });

      it('renders widgets returned by transformItems', async () => {
        const dynamicWidgets = connectDynamicWidgets(() => {})({
          transformItems(_items, { results }) {
            return results.userData[0].MOCK_facetOrder;
          },
          fallbackWidget: ({ attribute }) =>
            connectRefinementList(() => {})({ attribute }),
          widgets: [
            connectMenu(() => {})({ attribute: 'test1' }),
            connectHierarchicalMenu(() => {})({
              attributes: ['test2', 'test3'],
            }),
          ],
        });

        const parent = index({ indexName: 'test' }).addWidgets([
          dynamicWidgets,
        ]);

        expect(parent.getWidgets()).toMatchInlineSnapshot(`
          [
            Widget(ais.dynamicWidgets),
          ]
        `);

        dynamicWidgets.init!(createInitOptions({ parent }));

        expect(parent.getWidgets()).toMatchInlineSnapshot(`
          [
            Widget(ais.dynamicWidgets),
          ]
        `);

        dynamicWidgets.render!(
          createRenderOptions({
            parent,
            results: new SearchResults(
              new SearchParameters(),
              createMultiSearchResponse({
                userData: [{ MOCK_facetOrder: ['test1'] }],
              }).results
            ),
          })
        );

        await wait(0);

        expect(parent.getWidgets()).toMatchInlineSnapshot(`
          [
            Widget(ais.dynamicWidgets),
            Widget(ais.menu) {
              attribute: test1
            },
          ]
        `);

        dynamicWidgets.render!(
          createRenderOptions({
            parent,
            results: new SearchResults(
              new SearchParameters(),
              createMultiSearchResponse({
                userData: [{ MOCK_facetOrder: ['test2', 'test1'] }],
              }).results
            ),
          })
        );

        await wait(0);

        expect(parent.getWidgets()).toMatchInlineSnapshot(`
          [
            Widget(ais.dynamicWidgets),
            Widget(ais.menu) {
              attribute: test1
            },
            Widget(ais.hierarchicalMenu) {
              attribute: test2
            },
          ]
        `);

        dynamicWidgets.render!(
          createRenderOptions({
            parent,
            results: new SearchResults(
              new SearchParameters(),
              createMultiSearchResponse({
                userData: [{ MOCK_facetOrder: ['test2'] }],
              }).results
            ),
          })
        );

        await wait(0);

        expect(parent.getWidgets()).toMatchInlineSnapshot(`
          [
            Widget(ais.dynamicWidgets),
            Widget(ais.hierarchicalMenu) {
              attribute: test2
            },
          ]
        `);

        dynamicWidgets.render!(
          createRenderOptions({
            parent,
            results: new SearchResults(
              new SearchParameters(),
              createMultiSearchResponse({
                userData: [{ MOCK_facetOrder: ['test1', 'test4', 'test5'] }],
              }).results
            ),
          })
        );

        await wait(0);

        expect(parent.getWidgets()).toMatchInlineSnapshot(`
          [
            Widget(ais.dynamicWidgets),
            Widget(ais.menu) {
              attribute: test1
            },
            Widget(ais.refinementList) {
              attribute: test4
            },
            Widget(ais.refinementList) {
              attribute: test5
            },
          ]
        `);
      });
    });
  });

  describe('dispose', () => {
    it('calls unmount function', () => {
      const unmountFn = jest.fn();
      const dynamicWidgets = connectDynamicWidgets(() => {}, unmountFn)({
        transformItems() {
          return ['test1', 'test2'];
        },
        widgets: [
          connectMenu(() => {})({ attribute: 'test1' }),
          connectHierarchicalMenu(() => {})({ attributes: ['test2', 'test3'] }),
        ],
      });

      dynamicWidgets.dispose!(createDisposeOptions());

      expect(unmountFn).toHaveBeenCalledTimes(1);
      expect(unmountFn).toHaveBeenCalledWith();
    });

    it('removes all widgets', async () => {
      const dynamicWidgets = connectDynamicWidgets(() => {})({
        transformItems() {
          return ['test1', 'test2'];
        },
        widgets: [
          connectMenu(() => {})({ attribute: 'test1' }),
          connectHierarchicalMenu(() => {})({ attributes: ['test2', 'test3'] }),
        ],
      });

      const parent = index({ indexName: 'test' }).addWidgets([dynamicWidgets]);

      expect(parent.getWidgets()).toMatchInlineSnapshot(`
        [
          Widget(ais.dynamicWidgets),
        ]
      `);

      parent.init(createInitOptions());

      expect(parent.getWidgets()).toMatchInlineSnapshot(`
        [
          Widget(ais.dynamicWidgets),
        ]
      `);

      dynamicWidgets.render!(createRenderOptions({ parent }));

      expect(parent.getWidgets()).toMatchInlineSnapshot(`
        [
          Widget(ais.dynamicWidgets),
          Widget(ais.menu) {
            attribute: test1
          },
          Widget(ais.hierarchicalMenu) {
            attribute: test2
          },
        ]
      `);

      parent.removeWidgets([dynamicWidgets]);

      await wait(0);

      expect(parent.getWidgets()).toMatchInlineSnapshot(`[]`);
    });
  });

  describe('getWidgetRenderState', () => {
    it('returns widgetParams and empty attributes on init', () => {
      const widgetParams = {
        transformItems() {
          return ['test1', 'test2'];
        },
        widgets: [
          connectMenu(() => {})({ attribute: 'test1' }),
          connectHierarchicalMenu(() => {})({ attributes: ['test2', 'test3'] }),
        ],
      };
      const dynamicWidgets = connectDynamicWidgets(() => {})(widgetParams);

      expect(dynamicWidgets.getWidgetRenderState(createInitOptions())).toEqual({
        attributesToRender: [],
        widgetParams,
      });
    });

    it('returns widgetParams and empty attributes on init (transformItems)', () => {
      const widgetParams = {
        transformItems() {
          return ['test1', 'test2'];
        },
        widgets: [
          connectMenu(() => {})({ attribute: 'test1' }),
          connectHierarchicalMenu(() => {})({ attributes: ['test2', 'test3'] }),
        ],
      };
      const dynamicWidgets = connectDynamicWidgets(() => {})(widgetParams);

      expect(dynamicWidgets.getWidgetRenderState(createInitOptions())).toEqual({
        attributesToRender: [],
        widgetParams,
      });
    });

    it('returns widgetParams and the result of transformItems render (empty)', () => {
      const widgetParams = {
        transformItems() {
          return [];
        },
        widgets: [
          connectMenu(() => {})({ attribute: 'test1' }),
          connectHierarchicalMenu(() => {})({ attributes: ['test2', 'test3'] }),
        ],
      };
      const dynamicWidgets = connectDynamicWidgets(() => {})(widgetParams);

      expect(
        dynamicWidgets.getWidgetRenderState(createRenderOptions())
      ).toEqual({
        attributesToRender: [],
        widgetParams,
      });
    });

    it('returns widgetParams and attributesToRender (with results)', () => {
      const widgetParams = {
        widgets: [
          connectMenu(() => {})({ attribute: 'test1' }),
          connectHierarchicalMenu(() => {})({ attributes: ['test2', 'test3'] }),
        ],
      };
      const dynamicWidgets = connectDynamicWidgets(() => {})(widgetParams);

      expect(
        dynamicWidgets.getWidgetRenderState(
          createRenderOptions({
            results: new SearchResults(new SearchParameters(), [
              createSingleSearchResponse({
                renderingContent: {
                  facetOrdering: {
                    facets: { order: ['test1', 'test2'] },
                  },
                },
              }),
            ]),
          })
        )
      ).toEqual({
        attributesToRender: ['test1', 'test2'],
        widgetParams,
      });
    });

    it('returns widgetParams and the result of transformItems render', () => {
      const widgetParams = {
        transformItems() {
          return ['test1', 'test2'];
        },
        widgets: [
          connectMenu(() => {})({ attribute: 'test1' }),
          connectHierarchicalMenu(() => {})({ attributes: ['test2', 'test3'] }),
        ],
      };
      const dynamicWidgets = connectDynamicWidgets(() => {})(widgetParams);

      expect(
        dynamicWidgets.getWidgetRenderState(createRenderOptions())
      ).toEqual({
        attributesToRender: ['test1', 'test2'],
        widgetParams,
      });
    });

    it('returns widgetParams and the result of transformItems render (using result)', () => {
      const widgetParams: DynamicWidgetsConnectorParams = {
        transformItems(items) {
          return items.sort((a, b) => b.localeCompare(a));
        },
        widgets: [
          connectMenu(() => {})({ attribute: 'test1' }),
          connectHierarchicalMenu(() => {})({ attributes: ['test2', 'test3'] }),
        ],
      };
      const dynamicWidgets = connectDynamicWidgets(() => {})(widgetParams);

      expect(
        dynamicWidgets.getWidgetRenderState(
          createRenderOptions(
            createRenderOptions({
              results: new SearchResults(new SearchParameters(), [
                createSingleSearchResponse({
                  renderingContent: {
                    facetOrdering: {
                      facets: { order: ['test1', 'test2'] },
                    },
                  },
                }),
              ]),
            })
          )
        )
      ).toEqual({
        attributesToRender: ['test2', 'test1'],
        widgetParams,
      });
    });

    it('provides search results within transformItems', () => {
      const transformItems = jest.fn((items) => items);
      const dynamicWidgets = connectDynamicWidgets(() => {})({
        transformItems,
        widgets: [],
      });

      const helper = algoliasearchHelper(createSearchClient(), '');
      const results = new SearchResults(helper.state, [
        createSingleSearchResponse(),
      ]);

      dynamicWidgets.getWidgetRenderState(
        createRenderOptions({
          results,
          state: helper.state,
          helper,
        })
      );

      expect(transformItems).toHaveBeenLastCalledWith(
        expect.anything(),
        expect.objectContaining({ results })
      );
    });

    it('warns when facets is unset and more than 20 items are returned from attributesToDisplay', () => {
      const dynamicWidgets = connectDynamicWidgets(() => {})({
        transformItems() {
          return Array.from({ length: 21 }, (_, i) => `test${i}`);
        },
        widgets: [
          connectMenu(() => {})({ attribute: 'test1' }),
          connectHierarchicalMenu(() => {})({
            attributes: ['test2', 'test3'],
          }),
        ],
      });

      expect(() =>
        dynamicWidgets.getWidgetRenderState(createRenderOptions())
      ).toWarnDev(
        '[InstantSearch.js]: More than 20 facets are requested to be displayed without explicitly setting which facets to retrieve. This could have a performance impact. Set "facets" to [] to do two smaller network requests, or explicitly to [\'*\'] to avoid this warning.'
      );
    });

    it('warns when a widget sets a higher limit than dynamic widgets', () => {
      const dynamicWidgets = connectDynamicWidgets(() => {})({
        transformItems() {
          return ['test1'];
        },
        widgets: [
          connectMenu(() => {})({ attribute: 'test1', limit: 100 }),
          connectHierarchicalMenu(() => {})({
            attributes: ['test2', 'test3'],
          }),
        ],
      });

      expect(() =>
        dynamicWidgets.getWidgetRenderState(
          createRenderOptions({
            state: new SearchParameters({ maxValuesPerFacet: 100 }),
          })
        )
      ).toWarnDev(
        '[InstantSearch.js]: The maxValuesPerFacet set by dynamic widgets (20) is smaller than one of the limits set by a widget (100). This causes a mismatch in query parameters and thus an extra network request when that widget is mounted.'
      );
    });
  });

  describe('getRenderState', () => {
    it('returns the render state for init', () => {
      const widgetParams = {
        transformItems() {
          return ['test1'];
        },
        widgets: [
          connectMenu(() => {})({ attribute: 'test1' }),
          connectHierarchicalMenu(() => {})({ attributes: ['test2', 'test3'] }),
        ],
      };
      const dynamicWidgets = connectDynamicWidgets(() => {})(widgetParams);

      const existingRenderState = {};

      expect(
        dynamicWidgets.getRenderState(existingRenderState, createInitOptions())
      ).toEqual({
        dynamicWidgets: {
          attributesToRender: [],
          widgetParams,
        },
      });
    });

    it('returns the render state for render', () => {
      const widgetParams = {
        transformItems() {
          return ['test1'];
        },
        widgets: [
          connectMenu(() => {})({ attribute: 'test1' }),
          connectHierarchicalMenu(() => {})({ attributes: ['test2', 'test3'] }),
        ],
      };
      const dynamicWidgets = connectDynamicWidgets(() => {})(widgetParams);

      const existingRenderState = {};

      expect(
        dynamicWidgets.getRenderState(
          existingRenderState,
          createRenderOptions()
        )
      ).toEqual({
        dynamicWidgets: {
          attributesToRender: ['test1'],
          widgetParams,
        },
      });
    });
  });

  describe('getWidgetSearchParameters', () => {
    test('adds default facets and maxValuesPerFacet', () => {
      const dynamicWidgets = connectDynamicWidgets(() => {})({
        transformItems() {
          return ['test1'];
        },
        widgets: [
          connectMenu(() => {})({ attribute: 'test1' }),
          connectHierarchicalMenu(() => {})({ attributes: ['test2', 'test3'] }),
        ],
      });

      expect(
        dynamicWidgets.getWidgetSearchParameters!(new SearchParameters(), {
          uiState: {},
        })
      ).toEqual(new SearchParameters({ facets: ['*'], maxValuesPerFacet: 20 }));
    });

    test('does not set a lower maxValuesPerFacet as already set', () => {
      const dynamicWidgets = connectDynamicWidgets(() => {})({
        maxValuesPerFacet: 20,
        transformItems() {
          return ['test1'];
        },
        widgets: [
          connectMenu(() => {})({ attribute: 'test1' }),
          connectHierarchicalMenu(() => {})({ attributes: ['test2', 'test3'] }),
        ],
      });

      expect(
        dynamicWidgets.getWidgetSearchParameters!(
          new SearchParameters({ maxValuesPerFacet: 100 }),
          {
            uiState: {},
          }
        )
      ).toEqual(
        new SearchParameters({ facets: ['*'], maxValuesPerFacet: 100 })
      );
    });

    test('allows override of maxValuesPerFacet', () => {
      const dynamicWidgets = connectDynamicWidgets(() => {})({
        maxValuesPerFacet: 1000,
        transformItems() {
          return ['test1'];
        },
        widgets: [
          connectMenu(() => {})({ attribute: 'test1' }),
          connectHierarchicalMenu(() => {})({ attributes: ['test2', 'test3'] }),
        ],
      });

      expect(
        dynamicWidgets.getWidgetSearchParameters!(
          new SearchParameters({ maxValuesPerFacet: 100 }),
          {
            uiState: {},
          }
        )
      ).toEqual(
        new SearchParameters({ facets: ['*'], maxValuesPerFacet: 1000 })
      );
    });

    test('allows override of facets', () => {
      const dynamicWidgets = connectDynamicWidgets(() => {})({
        facets: [],
        transformItems() {
          return ['test1'];
        },
        widgets: [
          connectMenu(() => {})({ attribute: 'test1' }),
          connectHierarchicalMenu(() => {})({ attributes: ['test2', 'test3'] }),
        ],
      });

      expect(
        dynamicWidgets.getWidgetSearchParameters!(new SearchParameters(), {
          uiState: {},
        })
      ).toEqual(new SearchParameters({ maxValuesPerFacet: 20 }));
    });

    test('keeps existing facets', () => {
      const dynamicWidgets = connectDynamicWidgets(() => {})({
        facets: ['*'],
        transformItems() {
          return ['test1'];
        },
        widgets: [
          connectMenu(() => {})({ attribute: 'test1' }),
          connectHierarchicalMenu(() => {})({ attributes: ['test2', 'test3'] }),
        ],
      });

      expect(
        dynamicWidgets.getWidgetSearchParameters!(
          new SearchParameters({
            facets: ['existing'],
          }),
          {
            uiState: {},
          }
        )
      ).toEqual(
        new SearchParameters({
          facets: ['existing', '*'],
          maxValuesPerFacet: 20,
        })
      );
    });

    test('adds to existing facets', () => {
      const dynamicWidgets = connectDynamicWidgets(() => {})({
        facets: ['facet1', 'facet2'],
        transformItems() {
          return ['test1'];
        },
        widgets: [
          connectMenu(() => {})({ attribute: 'test1' }),
          connectHierarchicalMenu(() => {})({ attributes: ['test2', 'test3'] }),
        ],
      });

      expect(
        dynamicWidgets.getWidgetSearchParameters!(
          new SearchParameters({
            facets: ['existing'],
          }),
          {
            uiState: {},
          }
        )
      ).toEqual(
        new SearchParameters({
          facets: ['existing', 'facet1', 'facet2'],
          maxValuesPerFacet: 20,
        })
      );
    });
  });
});
