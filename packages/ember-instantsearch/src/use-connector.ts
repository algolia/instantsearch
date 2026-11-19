import { useWidget } from './-private/use-widget.ts';

import type { Parent } from './types.ts';
import type { Connector, Widget, WidgetDescription } from 'instantsearch.js';

/**
 * What a connector passes to its render function,
 * without the InstantSearch instance, which `Parent` has already.
 */
export type RenderState<
  TDescription extends WidgetDescription,
  TParams = unknown,
> = TDescription['renderState'] & { widgetParams: TParams };

/**
 * Extra properties for the widget, like `$$widgetType`.
 */
export type AdditionalWidgetProperties = Partial<Widget>;

export interface Connection<
  TDescription extends WidgetDescription,
  TParams = unknown,
> {
  /**
   * The latest render state of the widget.
   *
   * It is autotracked: a template that reads it renders again
   * each time InstantSearch renders the widget.
   */
  readonly state: RenderState<TDescription, TParams>;
}

/**
 * Connects any InstantSearch.js connector to Ember's autotracking.
 *
 * The widget joins the index of `parent` at once,
 * and leaves it when `owner` is destroyed.
 *
 * `parent` and `params` are functions, so that they can read arguments.
 * When the params change by value, a new widget takes the place
 * of the old one and keeps the UI state that it owns.
 *
 * @example
 * ```gts
 * import Component from '@glimmer/component';
 * import { connectStats } from 'instantsearch.js/es/connectors';
 * import { useConnector, type Parent } from 'ember-instantsearch';
 *
 * class Stats extends Component<{ Args: { parent: Parent } }> {
 *   stats = useConnector(this, () => this.args.parent, connectStats, () => ({}));
 *
 *   <template>{{this.stats.state.nbHits}} results</template>
 * }
 * ```
 */
export function useConnector<
  TDescription extends WidgetDescription,
  TParams extends Record<string, unknown>,
>(
  owner: object,
  parent: () => Parent,
  connector: Connector<TDescription, TParams>,
  params: () => TParams,
  additionalWidgetProperties: AdditionalWidgetProperties = {}
): Connection<TDescription, TParams> {
  const widget = useWidget(owner, parent, params, {
    initialState: () => ({}) as RenderState<TDescription, TParams>,

    create(nextParams, mounted) {
      const createWidget = connector((renderState) => {
        /**
         * The first call comes from `init`, inside `addWidgets`
         * or `updateWidget`, while Ember renders.
         * That write is safe: no template has read this widget's state yet.
         *
         * The later calls come after a search, outside of a render.
         */
        mounted.state = withoutInstance(renderState) as RenderState<
          TDescription,
          TParams
        >;
      });

      return Object.assign(
        createWidget(nextParams),
        additionalWidgetProperties
      ) as Widget;
    },
  });

  return {
    get state() {
      return widget.current.state;
    },
  };
}

function withoutInstance(renderState: object) {
  const result: Record<string, unknown> = {};
  const keys = Object.keys(renderState);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]!;

    if (key === 'instantSearchInstance') continue;

    result[key] = (renderState as Record<string, unknown>)[key];
  }

  return result;
}
