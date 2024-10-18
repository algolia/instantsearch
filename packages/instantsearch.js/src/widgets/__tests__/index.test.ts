/**
 * @jest-environment jsdom
 */
/* global google */
import * as widgets from '..';

import type { UnknownWidgetFactory, Widget } from '../../types';
import type { IndexWidget } from '../index/index';

/**
 * Checklist when adding a new widget
 *
 * 1. Include $$type in the returned object from connector
 * 2. Include $$widgetType in widget
 * 3. Update $$type and $$widgetType in src/types/widget.ts
 */

// This is written in the test, since Object.entries is not allowed in the
// source code. Once we use Object.entries without polyfill, we can move this
// helper to the `typedObject` file.
type Entries<TObject> = {
  [TKey in keyof TObject]: [TKey, TObject[TKey]];
}[keyof TObject];
const entries = Object.entries as <TObject extends Record<string, unknown>>(
  yourObject: TObject
) => Array<Entries<TObject>>;

type Widgets = typeof widgets;
type WidgetNames = keyof typeof widgets;

function initiateAllWidgets(): Array<[WidgetNames, Widget | IndexWidget]> {
  return entries(widgets).map(([name, widget]) => {
    return [name, initiateWidget(name, widget)];
  });

  function initiateWidget<TName extends WidgetNames>(
    name: TName,
    widget: Widgets[TName]
  ): Widget | IndexWidget {
    const container = document.createElement('div');

    switch (name) {
      case 'index': {
        const index = widget as Widgets['index'];
        return index({ indexName: 'index' });
      }
      case 'EXPERIMENTAL_configureRelatedItems': {
        const EXPERIMENTAL_configureRelatedItems =
          widget as Widgets['EXPERIMENTAL_configureRelatedItems'];
        return EXPERIMENTAL_configureRelatedItems({
          hit: { objectID: 'x' },
          matchingPatterns: {},
        });
      }
      case 'geoSearch': {
        const geoSearch = widget as Widgets['geoSearch'];
        return geoSearch({
          container,
          googleReference: {
            maps: {
              OverlayView: class OverlayView {},
            } as unknown as typeof google.maps,
          },
        });
      }
      case 'hierarchicalMenu': {
        const hierarchicalMenu = widget as Widgets['hierarchicalMenu'];
        return hierarchicalMenu({
          container,
          attributes: ['attr1', 'attr2'],
        });
      }
      case 'breadcrumb': {
        const breadcrumb = widget as Widgets['breadcrumb'];
        return breadcrumb({
          container,
          attributes: ['attr1', 'attr2'],
        });
      }
      case 'hitsPerPage': {
        const hitsPerPage = widget as Widgets['hitsPerPage'];
        return hitsPerPage({
          container,
          items: [{ default: true, label: 'def', value: 1 }],
        });
      }
      case 'numericMenu': {
        const numericMenu = widget as Widgets['numericMenu'];
        return numericMenu({
          container,
          attribute: 'attr',
          items: [{ label: 'x', start: 1, end: 2 }],
        });
      }
      case 'sortBy': {
        const sortBy = widget as Widgets['sortBy'];
        return sortBy({
          container,
          items: [{ label: 'x', value: 'x' }],
        });
      }
      case 'queryRuleContext': {
        const queryRuleContext = widget as Widgets['queryRuleContext'];
        return queryRuleContext({
          trackedFilters: {
            facet(values) {
              return values;
            },
          },
        });
      }
      case 'panel': {
        const panel = widget as Widgets['panel'];
        return panel()(widgets.hierarchicalMenu)({
          container,
          attributes: ['attr1', 'attr2'],
        });
      }
      case 'dynamicWidgets':
      case 'EXPERIMENTAL_dynamicWidgets': {
        const EXPERIMENTAL_dynamicWidgets = widget as Widgets['dynamicWidgets'];
        return EXPERIMENTAL_dynamicWidgets({
          transformItems(items) {
            return items;
          },
          container,
          widgets: [],
        });
      }
      case 'frequentlyBoughtTogether':
      case 'relatedProducts':
      case 'lookingSimilar': {
        const recommendWidgetWithObjectIDs =
          widget as Widgets['frequentlyBoughtTogether'];
        return recommendWidgetWithObjectIDs({
          container,
          objectIDs: ['objectID'],
        });
      }
      default: {
        const defaultWidget = widget as UnknownWidgetFactory;
        return defaultWidget({ container, attribute: 'attr' });
      }
    }
  }
}

describe('widgets', () => {
  describe('$$type', () => {
    test('present in every widget', () => {
      const widgetInstances = initiateAllWidgets();

      widgetInstances.forEach(([name, widget]) =>
        expect([name, widget.$$type]).toEqual([name, expect.any(String)])
      );
    });

    test('starts with ais.', () => {
      const widgetInstances = initiateAllWidgets();

      widgetInstances.forEach(([name, widget]) =>
        expect([name, widget.$$type.substr(0, 4)]).toEqual([name, 'ais.'])
      );
    });
  });

  describe('$$widgetType', () => {
    test('present in all widgets', () => {
      const widgetInstances = initiateAllWidgets();

      widgetInstances.forEach(([name, widget]) =>
        expect([name, widget.$$widgetType]).toEqual([name, expect.any(String)])
      );
    });

    test('starts with ais.', () => {
      const widgetInstances = initiateAllWidgets();

      widgetInstances.forEach(([name, widget]) =>
        expect([name, widget.$$widgetType!.substr(0, 4)]).toEqual([
          name,
          'ais.',
        ])
      );
    });

    test('is the same as name', () => {
      const widgetInstances = initiateAllWidgets();

      widgetInstances.forEach(([name, widget]) => {
        if (name === 'panel') {
          // the widget type of panel is the wrapped widget
          return;
        }
        expect(widget.$$widgetType).toBe(
          `ais.${name.replace('EXPERIMENTAL_', '')}`
        );
      });
    });
  });
});
