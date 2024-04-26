/**
 * @jest-environment node
 */

import { getAllInstantSearchWidgets } from './__utils__/all-widgets';

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
      [
        {
          "$$type": "ais.breadcrumb",
          "$$widgetType": "ais.breadcrumb",
          "name": "Breadcrumb",
        },
        {
          "$$type": "ais.clearRefinements",
          "$$widgetType": "ais.clearRefinements",
          "name": "ClearRefinements",
        },
        {
          "$$type": "ais.currentRefinements",
          "$$widgetType": "ais.currentRefinements",
          "name": "CurrentRefinements",
        },
        {
          "$$type": "ais.hierarchicalMenu",
          "$$widgetType": "ais.hierarchicalMenu",
          "name": "HierarchicalMenu",
        },
        {
          "$$type": "ais.hits",
          "$$widgetType": "ais.hits",
          "name": "Hits",
        },
        {
          "$$type": "ais.hitsPerPage",
          "$$widgetType": "ais.hitsPerPage",
          "name": "HitsPerPage",
        },
        {
          "$$type": "ais.infiniteHits",
          "$$widgetType": "ais.infiniteHits",
          "name": "InfiniteHits",
        },
        {
          "$$type": "ais.menu",
          "$$widgetType": "ais.menu",
          "name": "Menu",
        },
        {
          "$$type": "ais.pagination",
          "$$widgetType": "ais.pagination",
          "name": "Pagination",
        },
        {
          "$$type": "ais.range",
          "$$widgetType": "ais.rangeInput",
          "name": "RangeInput",
        },
        {
          "$$type": "ais.refinementList",
          "$$widgetType": "ais.refinementList",
          "name": "RefinementList",
        },
        {
          "$$type": "ais.relatedProducts",
          "$$widgetType": "ais.relatedProducts",
          "name": "RelatedProducts",
        },
        {
          "$$type": "ais.searchBox",
          "$$widgetType": "ais.searchBox",
          "name": "SearchBox",
        },
        {
          "$$type": "ais.sortBy",
          "$$widgetType": "ais.sortBy",
          "name": "SortBy",
        },
        {
          "$$type": "ais.stats",
          "$$widgetType": "ais.stats",
          "name": "Stats",
        },
        {
          "$$type": "ais.toggleRefinement",
          "$$widgetType": "ais.toggleRefinement",
          "name": "ToggleRefinement",
        },
      ]
    `);
  });
});
