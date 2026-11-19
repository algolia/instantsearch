import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { hash } from '@ember/helper';
import index from 'instantsearch.js/es/widgets/index/index';

import { definedOnly, useWidget } from '../-private/use-widget.ts';
import Configure from './configure.gts';
import Connector from './connector.gts';
import Hits from './hits.gts';
import Widget from './widget.gts';

import type { Parent } from '../types.ts';
import type { Yielded } from '../-private/yielded.ts';
import type {
  IndexWidget,
  IndexWidgetParams,
} from 'instantsearch.js/es/widgets/index/index';

export interface IndexSignature {
  Args: {
    parent: Parent;
    indexName?: string;
    indexId?: string;
    isolated?: boolean;
  };
  Blocks: {
    default: [Yielded];
  };
}

/**
 * Searches another index, or the same index with other parameters.
 *
 * It yields the widgets again, bound to this index.
 *
 * @example
 * ```gjs
 * <ais.Index @indexName="instant_search_price_desc" as |priceDesc|>
 *   <priceDesc.Hits />
 * </ais.Index>
 * ```
 */
export default class Index extends Component<IndexSignature> {
  #widget = useWidget(
    this,
    () => this.args.parent,
    () =>
      definedOnly({
        indexName: this.args.indexName,
        indexId: this.args.indexId,
        isolated: this.args.isolated,
      }) as IndexWidgetParams,
    {
      initialState: () => undefined,
      create: (params) => index(params),
    }
  );

  /**
   * A new index widget means new children too,
   * because their widgets belong to the old one.
   */
  @cached
  get parent(): Parent {
    return {
      search: this.args.parent.search,
      index: this.#widget.current.widget as IndexWidget,
    };
  }

  <template>
    {{yield
      (hash
        search=this.parent.search
        index=this.parent.index
        Configure=(component Configure parent=this.parent)
        Connector=(component Connector parent=this.parent)
        Hits=(component Hits parent=this.parent)
        Index=(component Index parent=this.parent)
        Widget=(component Widget parent=this.parent)
      )
    }}
  </template>
}
