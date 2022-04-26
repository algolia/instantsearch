/**
 * @jest-environment node
 */

import { getAllInstantSearchWidgets } from '../__testutils__/all-widgets';

describe('widgets', () => {
  const widgets = getAllInstantSearchWidgets();

  test('renders one widget', () => {
    widgets.forEach(({ name, renderedWidgets }) => {
      expect({ name, renderedWidgets }).toEqual({
        name,
        renderedWidgets: expect.objectContaining({
          length: 1,
        }),
      });
    });
  });

  describe('$$type', () => {
    test('is present in every widget', () => {
      widgets.forEach(({ name, renderedWidgets }) => {
        renderedWidgets.forEach((widget) =>
          expect([name, widget.$$type]).toEqual([name, expect.any(String)])
        );
      });
    });

    test('starts with "ais."', () => {
      widgets.forEach(({ name, widget }) =>
        expect([name, widget.$$type.substr(0, 4)]).toEqual([name, 'ais.'])
      );
    });
  });

  describe('$$widgetType', () => {
    test('is present in every widget', () => {
      widgets.forEach(({ name, widget }) =>
        expect([name, widget.$$widgetType]).toEqual([name, expect.any(String)])
      );
    });

    test('starts with "ais."', () => {
      widgets.forEach(({ name, widget }) =>
        expect([name, widget.$$widgetType!.substr(0, 4)]).toEqual([
          name,
          'ais.',
        ])
      );
    });
  });

  test('name, $$type and $$widgetType are equivalent', () => {
    expect(
      widgets.map(({ name, widget: { $$type, $$widgetType } }) => ({
        name,
        $$type,
        $$widgetType,
      }))
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "$$type": "ais.breadcrumb",
          "$$widgetType": "ais.breadcrumb",
          "name": "Breadcrumb",
        },
        Object {
          "$$type": "ais.clearRefinements",
          "$$widgetType": "ais.clearRefinements",
          "name": "ClearRefinements",
        },
        Object {
          "$$type": "ais.currentRefinements",
          "$$widgetType": "ais.currentRefinements",
          "name": "CurrentRefinements",
        },
        Object {
          "$$type": "ais.hierarchicalMenu",
          "$$widgetType": "ais.hierarchicalMenu",
          "name": "HierarchicalMenu",
        },
        Object {
          "$$type": "ais.hits",
          "$$widgetType": "ais.hits",
          "name": "Hits",
        },
        Object {
          "$$type": "ais.hitsPerPage",
          "$$widgetType": "ais.hitsPerPage",
          "name": "HitsPerPage",
        },
        Object {
          "$$type": "ais.infiniteHits",
          "$$widgetType": "ais.infiniteHits",
          "name": "InfiniteHits",
        },
        Object {
          "$$type": "ais.menu",
          "$$widgetType": "ais.menu",
          "name": "Menu",
        },
        Object {
          "$$type": "ais.pagination",
          "$$widgetType": "ais.pagination",
          "name": "Pagination",
        },
        Object {
          "$$type": "ais.range",
          "$$widgetType": "ais.rangeInput",
          "name": "RangeInput",
        },
        Object {
          "$$type": "ais.refinementList",
          "$$widgetType": "ais.refinementList",
          "name": "RefinementList",
        },
        Object {
          "$$type": "ais.searchBox",
          "$$widgetType": "ais.searchBox",
          "name": "SearchBox",
        },
        Object {
          "$$type": "ais.sortBy",
          "$$widgetType": "ais.sortBy",
          "name": "SortBy",
        },
        Object {
          "$$type": "ais.toggleRefinement",
          "$$widgetType": "ais.toggleRefinement",
          "name": "ToggleRefinement",
        },
      ]
    `);
  });
});
