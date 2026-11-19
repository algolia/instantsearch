import {
  associateDestroyableChild,
  destroy,
  registerDestructor,
} from '@ember/destroyable';
import { tracked } from '@glimmer/tracking';
import { createCache, getValue } from '@glimmer/tracking/primitives/cache';
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
  declare scope: object;

  /**
   * True after a newer widget took the place of this one.
   * The index disposed of this widget already, so it must not be removed.
   */
  isReplaced = false;

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
 * `parent` and `params` are read with autotracking, now and each time
 * `current` is read.
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
    const scope = {};

    mounted.widget = factory.create(nextParams, mounted);
    mounted.params = nextParams;
    mounted.parent = nextParent;
    mounted.scope = scope;

    if (previous) {
      previous.isReplaced = previous.parent === nextParent;
      destroy(previous.scope);
    }

    if (previous && previous.isReplaced) {
      nextParent.index.updateWidget(previous.widget, mounted.widget);
    } else {
      nextParent.index.addWidgets([mounted.widget]);
    }

    associateDestroyableChild(owner, scope);
    registerDestructor(scope, () => {
      if (mounted.isReplaced) return;

      nextParent.index.removeWidgets([mounted.widget]);
    });

    current = mounted;

    return mounted;
  }

  const cache = createCache(() => {
    const nextParent = parent();
    const nextParams = params();

    if (
      current &&
      current.parent === nextParent &&
      isEqual(current.params, nextParams)
    ) {
      return current;
    }

    return mount(nextParent, nextParams);
  });

  /**
   * The widget joins now, during the render of its component,
   * so it takes part in the first search even if its template
   * reads no state (like `Configure` without a block).
   * Later reads apply new params.
   */
  getValue(cache);

  return {
    get current() {
      return getValue(cache)!;
    },
  };
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
