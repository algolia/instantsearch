import { connectMenu, EXPERIMENTAL_connectDynamicWidgets } from '../..';
import { index } from '../../../widgets';
import { widgetSnapshotSerializer } from '../../../../test/utils/widgetSnapshotSerializer';
import {
  createDisposeOptions,
  createInitOptions,
  createRenderOptions,
} from '../../../../test/mock/createWidget';
import { wait } from '../../../../test/utils/wait';
import { SearchParameters, SearchResults } from 'algoliasearch-helper';
import { createMultiSearchResponse } from '../../../../test/mock/createAPIResponse';
import connectHierarchicalMenu from '../../hierarchical-menu/connectHierarchicalMenu';

expect.addSnapshotSerializer(widgetSnapshotSerializer);

describe('connectDynamicWidgets', () => {
  describe('Usage', () => {
    it('fails when no renderer is given', () => {
      expect(() =>
        // @ts-expect-error
        EXPERIMENTAL_connectDynamicWidgets({})
      ).toThrowErrorMatchingInlineSnapshot(`
        "The render function is not valid (received type Object).

        See documentation: https://www.algolia.com/doc/api-reference/widgets/dynamic-widgets/js/#connector"
      `);
    });

    it('fails when no widgets are given', () => {
      expect(() =>
        EXPERIMENTAL_connectDynamicWidgets(() => {})(
          // @ts-expect-error
          {}
        )
      ).toThrowErrorMatchingInlineSnapshot(`
        "The \`widgets\` option expects an array of widgets.

        See documentation: https://www.algolia.com/doc/api-reference/widgets/dynamic-widgets/js/#connector"
      `);
    });

    it('correct usage', () => {
      expect(() =>
        // @ts-expect-error
        EXPERIMENTAL_connectDynamicWidgets(() => {})({
          widgets: [],
        })
      ).toThrowErrorMatchingInlineSnapshot(`
        "the \`transformItems\` option is required to be a function.

        See documentation: https://www.algolia.com/doc/api-reference/widgets/dynamic-widgets/js/#connector"
      `);
    });

    it('transformItems', () => {
      expect(() =>
        EXPERIMENTAL_connectDynamicWidgets(() => {})({
          widgets: [],
          transformItems(items, { results }) {
            return items.map(item => item + results.nbHits);
          },
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
        const dynamicWidgets = EXPERIMENTAL_connectDynamicWidgets(renderFn)(
          widgetParams
        );

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
      it('adds all widgets to the parent', () => {
        const dynamicWidgets = EXPERIMENTAL_connectDynamicWidgets(() => {})({
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
          Array [
            Widget(ais.dynamicWidgets),
          ]
        `);

        dynamicWidgets.init!(createInitOptions({ parent }));

        expect(parent.getWidgets()).toMatchInlineSnapshot(`
          Array [
            Widget(ais.dynamicWidgets),
            Widget(ais.menu) {
              attribute: test1
            },
            Widget(ais.hierarchicalMenu) {
              attribute: test2
            },
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
        const dynamicWidgets = EXPERIMENTAL_connectDynamicWidgets(renderFn)(
          widgetParams
        );

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
        const dynamicWidgets = EXPERIMENTAL_connectDynamicWidgets(renderFn)(
          widgetParams
        );

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
    });

    describe('widgets', () => {
      it('removes all widgets if transformItems says so', async () => {
        const dynamicWidgets = EXPERIMENTAL_connectDynamicWidgets(() => {})({
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
          Array [
            Widget(ais.dynamicWidgets),
          ]
        `);

        dynamicWidgets.init!(createInitOptions({ parent }));

        expect(parent.getWidgets()).toMatchInlineSnapshot(`
          Array [
            Widget(ais.dynamicWidgets),
            Widget(ais.menu) {
              attribute: test1
            },
            Widget(ais.hierarchicalMenu) {
              attribute: test2
            },
          ]
        `);

        dynamicWidgets.render!(createRenderOptions({ parent }));

        await wait(0);

        expect(parent.getWidgets()).toMatchInlineSnapshot(`
          Array [
            Widget(ais.dynamicWidgets),
          ]
        `);
      });

      it('keeps static widgets returned in transformItems', async () => {
        const dynamicWidgets = EXPERIMENTAL_connectDynamicWidgets(() => {})({
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
          Array [
            Widget(ais.dynamicWidgets),
          ]
        `);

        dynamicWidgets.init!(createInitOptions({ parent }));

        expect(parent.getWidgets()).toMatchInlineSnapshot(`
          Array [
            Widget(ais.dynamicWidgets),
            Widget(ais.menu) {
              attribute: test1
            },
            Widget(ais.hierarchicalMenu) {
              attribute: test2
            },
          ]
        `);

        dynamicWidgets.render!(createRenderOptions({ parent }));

        await wait(0);

        expect(parent.getWidgets()).toMatchInlineSnapshot(`
          Array [
            Widget(ais.dynamicWidgets),
            Widget(ais.menu) {
              attribute: test1
            },
          ]
        `);
      });

      it('renders widgets returned by transformItems', async () => {
        const dynamicWidgets = EXPERIMENTAL_connectDynamicWidgets(() => {})({
          transformItems(_items, { results }) {
            return results.userData[0].MOCK_facetOrder;
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
          Array [
            Widget(ais.dynamicWidgets),
          ]
        `);

        dynamicWidgets.init!(createInitOptions({ parent }));

        expect(parent.getWidgets()).toMatchInlineSnapshot(`
          Array [
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
                userData: [{ MOCK_facetOrder: ['test1'] }],
              }).results
            ),
          })
        );

        await wait(0);

        expect(parent.getWidgets()).toMatchInlineSnapshot(`
          Array [
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
          Array [
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
          Array [
            Widget(ais.dynamicWidgets),
            Widget(ais.hierarchicalMenu) {
              attribute: test2
            },
          ]
        `);
      });
    });
  });

  describe('dispose', () => {
    it('calls unmount function', () => {
      const unmountFn = jest.fn();
      const dynamicWidgets = EXPERIMENTAL_connectDynamicWidgets(() => {},
      unmountFn)({
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
      const dynamicWidgets = EXPERIMENTAL_connectDynamicWidgets(() => {})({
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
        Array [
          Widget(ais.dynamicWidgets),
        ]
      `);

      parent.init(createInitOptions());

      expect(parent.getWidgets()).toMatchInlineSnapshot(`
        Array [
          Widget(ais.dynamicWidgets),
          Widget(ais.menu) {
            attribute: test1
          },
          Widget(ais.hierarchicalMenu) {
            attribute: test2
          },
        ]
      `);

      dynamicWidgets.render!(createRenderOptions({ parent }));

      expect(parent.getWidgets()).toMatchInlineSnapshot(`
        Array [
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

      expect(parent.getWidgets()).toMatchInlineSnapshot(`Array []`);
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
      const dynamicWidgets = EXPERIMENTAL_connectDynamicWidgets(() => {})(
        widgetParams
      );

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
      const dynamicWidgets = EXPERIMENTAL_connectDynamicWidgets(() => {})(
        widgetParams
      );

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
      const dynamicWidgets = EXPERIMENTAL_connectDynamicWidgets(() => {})(
        widgetParams
      );

      expect(
        dynamicWidgets.getWidgetRenderState(createRenderOptions())
      ).toEqual({
        attributesToRender: [],
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
      const dynamicWidgets = EXPERIMENTAL_connectDynamicWidgets(() => {})(
        widgetParams
      );

      expect(
        dynamicWidgets.getWidgetRenderState(createRenderOptions())
      ).toEqual({
        attributesToRender: ['test1', 'test2'],
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
      const dynamicWidgets = EXPERIMENTAL_connectDynamicWidgets(renderFn)(
        widgetParams
      );

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
      const dynamicWidgets = EXPERIMENTAL_connectDynamicWidgets(renderFn)(
        widgetParams
      );

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
