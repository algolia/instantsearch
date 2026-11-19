import Component from '@glimmer/component';

import { useWidget } from '../-private/use-widget.ts';

import type { Parent } from '../types.ts';
import type { Widget as InstantSearchWidget } from 'instantsearch.js';

/**
 * Params are `any` here, because `WithBoundArgs` on the yielded component
 * falls back to this constraint, and `never` would reject every param.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WidgetFactory = (params: any) => InstantSearchWidget;

/**
 * The params of a widget factory, without `container`, which `Widget` gives.
 */
export type WidgetParams<TFactory extends WidgetFactory> = Omit<
  Parameters<TFactory>[0],
  'container'
>;

export interface WidgetSignature<TFactory extends WidgetFactory> {
  Args: {
    parent: Parent;
    /**
     * A widget factory of InstantSearch.js, like `searchBox` or `pagination`.
     */
    widget: TFactory;
    /**
     * The params of the widget, without `container`.
     */
    params?: WidgetParams<TFactory>;
  };
}

/**
 * Mounts any widget of InstantSearch.js.
 *
 * The widget renders its own markup into an element that `Widget` makes,
 * so the UI is the one that InstantSearch.js maintains.
 *
 * New params (compared by value) replace the widget with `updateWidget`,
 * which keeps the UI state it owns.
 *
 * @example
 * ```gjs
 * import { pagination } from 'instantsearch.js/es/widgets';
 *
 * <ais.Widget @widget={{pagination}} @params={{hash padding=2}} />
 * ```
 */
export default class Widget<
  TFactory extends WidgetFactory,
> extends Component<WidgetSignature<TFactory>> {
  /**
   * InstantSearch.js renders into this element after `init`,
   * so it can be made here and inserted by the template as a node.
   */
  container = document.createElement('div');

  mounted = useWidget(
    this,
    () => this.args.parent,
    () => this.args.params ?? {},
    {
      initialState: () => ({}),
      create: (params) =>
        this.args.widget(
          Object.assign({}, params, { container: this.container })
        ),
    }
  );

  /**
   * The template reads the widget, so that new params apply.
   */
  get node() {
    void this.mounted.current;

    return this.container;
  }

  <template>{{this.node}}</template>
}
