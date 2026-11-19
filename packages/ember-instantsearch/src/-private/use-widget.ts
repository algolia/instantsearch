import { isDestroying } from '@ember/destroyable';
import { tracked } from '@glimmer/tracking';
import { resource, use } from 'ember-resources';
import { isEqual } from 'instantsearch.js/es/lib/utils/isEqual';

import type { Parent } from '../types.ts';
import type { Widget } from 'instantsearch.js';
import type { IndexWidget } from 'instantsearch.js/es/widgets/index/index';

/**
 * One widget that is added to an index.
 *
 * New params create a new `Mounted`,
 * so the render state of the old widget never shows with the new params.
 */
export class Mounted<TState, TWidget extends Widget | IndexWidget> {
  @tracked state: TState;

  declare widget: TWidget;
  declare params: unknown;
  declare parent: Parent;

  constructor(initialState: TState) {
    this.state = initialState;
  }
}

export interface WidgetFactory<
  TParams,
  TState,
  TWidget extends Widget | IndexWidget,
> {
  initialState: () => TState;
  create: (params: TParams, mounted: Mounted<TState, TWidget>) => TWidget;
}

/**
 * Keeps one widget on the index of `parent`, for as long as `owner` lives.
 *
 * `parent` and `params` are read with autotracking inside a resource.
 * New params (compared by value) create a new widget,
 * which takes the place of the old one with `updateWidget`.
 * That keeps the UI state that the widget owns, as in the other flavors.
 */
export function useWidget<
  TParams,
  TState,
  TWidget extends Widget | IndexWidget,
>(
  owner: object,
  parent: () => Parent,
  params: () => TParams,
  factory: WidgetFactory<TParams, TState, TWidget>
): { readonly current: Mounted<TState, TWidget> } {
  let current: Mounted<TState, TWidget> | undefined;

  function mount(nextParent: Parent, nextParams: TParams) {
    const previous = current;
    const mounted = new Mounted<TState, TWidget>(factory.initialState());

    mounted.widget = factory.create(nextParams, mounted);
    mounted.params = nextParams;
    mounted.parent = nextParent;

    if (previous && previous.parent === nextParent) {
      nextParent.index.updateWidget(previous.widget, mounted.widget);
    } else {
      previous?.parent.index.removeWidgets([previous.widget]);
      nextParent.index.addWidgets([mounted.widget]);
    }

    current = mounted;

    return mounted;
  }

  const widget = use(
    owner,
    resource(({ on }) => {
      const nextParent = parent();
      const nextParams = params();

      /**
       * A rerun with equal params keeps the widget it has.
       */
      const mounted =
        current &&
        current.parent === nextParent &&
        isEqual(current.params, nextParams)
          ? current
          : mount(nextParent, nextParams);

      /**
       * A rerun also runs this cleanup, and `mount` already
       * took care of the old widget then.
       *
       * Only the end of `owner` removes the widget from its index.
       */
      on.cleanup(() => {
        if (!isDestroying(owner) || !current) return;

        current.parent.index.removeWidgets([current.widget]);
        current = undefined;
      });

      return mounted;
    })
  );

  /**
   * The widget joins now, during the render of its component,
   * so it takes part in the first search even if its template
   * reads no state (like a `Connector` without a block).
   * Later reads apply new params.
   */
  void widget.current;

  return widget;
}

/**
 * Copies an object without its `undefined` values.
 *
 * Ember passes every named argument that a template lists,
 * set or not, and connectors treat a present `undefined`
 * differently from a missing key in a few places.
 */
export function definedOnly<T extends object>(source: T): Partial<T> {
  const result: Record<string, unknown> = {};
  const keys = Object.keys(source);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]!;
    const value = (source as Record<string, unknown>)[key];

    if (value !== undefined) result[key] = value;
  }

  return result as Partial<T>;
}
