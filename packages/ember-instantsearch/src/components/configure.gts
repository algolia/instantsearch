import Component from '@glimmer/component';
import { connectConfigure } from 'instantsearch.js/es/connectors/index';

import { useConnector } from '../use-connector.ts';

import type { Parent } from '../types.ts';
import type { PlainSearchParameters } from 'algoliasearch-helper';
import type { ConfigureRenderState } from 'instantsearch.js/es/connectors/configure/connectConfigure';

export interface ConfigureSignature {
  Args: {
    parent: Parent;
    /**
     * Search parameters to apply, like `hitsPerPage` or `filters`.
     */
    searchParameters: PlainSearchParameters;
  };
  Blocks: {
    default: [
      {
        refine: ConfigureRenderState['refine'];
        searchParameters: PlainSearchParameters;
      },
    ];
  };
}

/**
 * Applies search parameters that have no UI of their own.
 *
 * It renders nothing, unless it has a block.
 * The block gets the parameters and `refine`, to change them.
 *
 * @example
 * ```gjs
 * <ais.Configure @searchParameters={{hash hitsPerPage=8}} />
 * ```
 */
export default class Configure extends Component<ConfigureSignature> {
  connection = useConnector(
    this,
    () => this.args.parent,
    connectConfigure,
    () => ({ searchParameters: this.args.searchParameters }),
    { $$widgetType: 'ais.configure' }
  );

  get state() {
    const { refine, widgetParams } = this.connection.state;

    return { refine, searchParameters: widgetParams.searchParameters };
  }

  /**
   * Without a block, the template still reads the connection,
   * so that new search parameters apply. It renders nothing.
   */
  get apply() {
    void this.connection.state;

    return undefined;
  }

  <template>
    {{#if (has-block)}}
      {{yield this.state}}
    {{else}}
      {{this.apply}}
    {{/if}}
  </template>
}
