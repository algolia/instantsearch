import { connectMenu, connectDynamicWidgets } from '../..';
import { index } from '../../../widgets';
import { widgetSnapshotSerializer } from '../../../../test/utils/widgetSnapshotSerializer';
import {
  createDisposeOptions,
  createInitOptions,
  createRenderOptions,
} from '../../../../test/mock/createWidget';
import { wait } from '../../../../test/utils/wait';
import { SearchParameters, SearchResults } from 'algoliasearch-helper';
import {
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '../../../../test/mock/createAPIResponse';
import connectHierarchicalMenu from '../../hierarchical-menu/connectHierarchicalMenu';
import type { DynamicWidgetsConnectorParams } from '../connectDynamicWidgets';
import connectRefinementList from '../../refinement-list/connectRefinementList';

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

      it('fails when transformItems returns anything else than an array', () => {
        const renderFn = jest.fn();
        const widgetParams = {
          transformItems() {
            return null as any;
          },
          widgets: [],
        };
        const dynamicWidgets = connectDynamicWidgets(renderFn)(widgetParams);

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
  });

  describe('getRenderState', () => {
    it('returns the render state for init', () => {
      const renderFn = jest.fn();
      const widgetParams = {
        transformItems() {
          return ['test1'];
        },
        widgets: [
          connectMenu(() => {})({ attribute: 'test1' }),
          connectHierarchicalMenu(() => {})({ attributes: ['test2', 'test3'] }),
        ],
      };
      const dynamicWidgets = connectDynamicWidgets(renderFn)(widgetParams);

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
      const renderFn = jest.fn();
      const widgetParams = {
        transformItems() {
          return ['test1'];
        },
        widgets: [
          connectMenu(() => {})({ attribute: 'test1' }),
          connectHierarchicalMenu(() => {})({ attributes: ['test2', 'test3'] }),
        ],
      };
      const dynamicWidgets = connectDynamicWidgets(renderFn)(widgetParams);

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
});
