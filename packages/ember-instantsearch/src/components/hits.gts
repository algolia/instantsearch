import Component from '@glimmer/component';
import { createHitsComponent } from 'instantsearch-ui-components';
import { connectHits } from 'instantsearch.js/es/connectors/index';
import { Fragment, h } from 'preact';

import { PreactRoot } from '../-private/preact-root.ts';
import { definedOnly } from '../-private/use-widget.ts';
import { useConnector } from '../use-connector.ts';

import type { Parent } from '../types.ts';
import type { HitsClassNames } from 'instantsearch-ui-components';
import type { BaseHit, Connector, Hit } from 'instantsearch.js';
import type {
  HitsConnectorParams,
  HitsWidgetDescription,
} from 'instantsearch.js/es/connectors/hits/connectHits';
import type { SendEventForHits } from 'instantsearch.js/es/lib/utils/index';

const HitsUi = createHitsComponent({ createElement: h as never, Fragment });

export interface HitsSignature<THit extends BaseHit = BaseHit> {
  Args: HitsConnectorParams<THit> & {
    parent: Parent;
    /**
     * The `id` of the root element.
     */
    id?: string;
    /**
     * More class names, next to the `ais-Hits` ones.
     */
    classNames?: Partial<HitsClassNames>;
  };
  Blocks: {
    /**
     * Renders one hit. `sendEvent` sends an Insights event about it.
     */
    default: [hit: Hit<THit>, sendEvent: SendEventForHits];
  };
}

interface ItemProps {
  hit: { objectID: string };
  className: string;
  onClick: () => void;
  onAuxClick: () => void;
}

/**
 * The list of results.
 *
 * The markup comes from `instantsearch-ui-components`,
 * the same as in the other flavors.
 * Each `<li>` is empty, and the block renders into it with `in-element`.
 *
 * @example
 * ```gjs
 * <ais.Hits as |hit|>
 *   <Highlight @hit={{hit}} @attribute="name" />
 * </ais.Hits>
 * ```
 */
export default class Hits<THit extends BaseHit = BaseHit> extends Component<
  HitsSignature<THit>
> {
  connection = useConnector(
    this,
    () => this.args.parent,
    connectHits as unknown as Connector<
      HitsWidgetDescription<THit>,
      HitsConnectorParams<THit>
    >,
    () =>
      definedOnly({
        escapeHTML: this.args.escapeHTML,
        transformItems: this.args.transformItems,
      }),
    { $$widgetType: 'ais.hits' }
  );

  preact = new PreactRoot(this);

  /**
   * The `<li>` of each hit, by `objectID`.
   *
   * Preact fills it while it renders the root,
   * and the template reads it right after, in the same render.
   */
  items = new Map<string, HTMLElement>();

  get state() {
    return this.connection.state;
  }

  get hits() {
    return (this.state.items ?? []) as Hit<THit>[];
  }

  itemFor = (hit: Hit<THit>): HTMLElement => this.items.get(hit.objectID)!;

  /**
   * The item components keep one identity for the life of `Hits`.
   * A new function on each render would make Preact replace every `<li>`.
   */
  BlockItem = ({ hit, className, onClick, onAuxClick }: ItemProps) =>
    h('li', {
      className,
      onClick,
      onAuxClick,
      ref: (element: HTMLElement | null) => {
        if (element) this.items.set(hit.objectID, element);
      },
    });

  /**
   * Shows that a hit has no custom block, the same as React InstantSearch.
   */
  PreviewItem = ({ hit, className, onClick, onAuxClick }: ItemProps) =>
    h(
      'li',
      { className, onClick, onAuxClick },
      h(
        'div',
        { style: { wordBreak: 'break-all' } },
        `${JSON.stringify(hit).slice(0, 100)}…`
      )
    );

  renderRoot = (hasBlock: boolean) => {
    return this.preact.render(
      h(HitsUi as never, {
        id: this.args.id,
        hits: this.hits,
        sendEvent: this.state.sendEvent,
        banner: this.state.banner,
        classNames: this.args.classNames,
        itemComponent: hasBlock ? this.BlockItem : this.PreviewItem,
      })
    );
  };

  <template>
    {{this.renderRoot (has-block)}}
    {{#if (has-block)}}
      {{#each this.hits key="objectID" as |hit|}}
        {{#in-element (this.itemFor hit) insertBefore=null}}
          {{yield hit this.state.sendEvent}}
        {{/in-element}}
      {{/each}}
    {{/if}}
  </template>
}
