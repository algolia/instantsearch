import Component from '@glimmer/component';

import { useConnector } from '../use-connector.ts';

import type { Parent } from '../types.ts';
import type { RenderState } from '../use-connector.ts';
import type { Connector as ConnectorFunction } from 'instantsearch.js';

type AnyConnector = ConnectorFunction<any, any>;

type DescriptionOf<TConnector> =
  TConnector extends ConnectorFunction<infer TDescription, any>
    ? TDescription
    : never;

type ParamsOf<TConnector> =
  TConnector extends ConnectorFunction<any, infer TParams> ? TParams : never;

export interface ConnectorSignature<TConnector extends AnyConnector> {
  Args: {
    parent: Parent;
    /**
     * Any connector from `instantsearch.js/es/connectors`, or one of your own.
     * It is read once, when the component renders first.
     */
    connector: TConnector;
    /**
     * The params of the connector. New params by value replace the widget.
     */
    params?: ParamsOf<TConnector>;
    /**
     * Names the widget in the Algolia dashboard, like `ais.searchBox`.
     */
    widgetType?: string;
  };
  Blocks: {
    default: [RenderState<DescriptionOf<TConnector>>];
  };
}

/**
 * Yields the render state of any connector, for a custom UI.
 *
 * @example
 * ```gjs
 * import { connectStats } from 'instantsearch.js/es/connectors';
 *
 * <ais.Connector @connector={{connectStats}} as |stats|>
 *   {{stats.nbHits}} results
 * </ais.Connector>
 * ```
 */
export default class Connector<
  TConnector extends AnyConnector,
> extends Component<ConnectorSignature<TConnector>> {
  connection = useConnector(
    this,
    () => this.args.parent,
    this.args.connector,
    () => this.args.params ?? {},
    this.args.widgetType ? { $$widgetType: this.args.widgetType } : {}
  );

  get state() {
    return this.connection.state as RenderState<DescriptionOf<TConnector>>;
  }

  <template>{{yield this.state}}</template>
}
