import Component from '@glimmer/component';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { connectHits } from 'instantsearch.js/es/connectors/index';

import { definedOnly } from '../-private/use-widget.ts';
import { useConnector } from '../use-connector.ts';

import type { Parent } from '../types.ts';
import type { BaseHit, Connector, Hit } from 'instantsearch.js';
import type {
  HitsConnectorParams,
  HitsWidgetDescription,
} from 'instantsearch.js/es/connectors/hits/connectHits';
import type { SendEventForHits } from 'instantsearch.js/es/lib/utils/index';

export interface HitsSignature<THit extends BaseHit = BaseHit> {
  Element: HTMLDivElement;
  Args: HitsConnectorParams<THit> & {
    parent: Parent;
  };
  Blocks: {
    /**
     * Renders one hit. `sendEvent` sends an Insights event about it.
     */
    default: [hit: Hit<THit>, sendEvent: SendEventForHits];
  };
}

/**
 * Shows that a hit has no custom block, the same as React InstantSearch.
 */
function preview(hit: unknown) {
  return `${JSON.stringify(hit).slice(0, 100)}…`;
}

/**
 * The list of results.
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

  get state() {
    return this.connection.state;
  }

  get hits() {
    return (this.state.items ?? []) as Hit<THit>[];
  }

  get className() {
    return this.hits.length === 0 ? 'ais-Hits ais-Hits--empty' : 'ais-Hits';
  }

  get banner() {
    const banner = this.state.banner;

    return banner && banner.image.urls[0]?.url ? banner : undefined;
  }

  get bannerImageUrl() {
    return this.banner?.image.urls[0]?.url;
  }

  /**
   * The other flavors send a click event for any click inside a hit.
   */
  handleClick = (hit: Hit<THit>) => {
    this.state.sendEvent('click:internal', hit, 'Hit Clicked');
  };

  <template>
    <div class={{this.className}} ...attributes>
      {{#if this.banner}}
        <aside class="ais-Hits-banner">
          {{#if this.banner.link}}
            <a
              class="ais-Hits-banner-link"
              href={{this.banner.link.url}}
              target={{this.banner.link.target}}
            >
              <img
                class="ais-Hits-banner-image"
                src={{this.bannerImageUrl}}
                alt={{this.banner.image.title}}
              />
            </a>
          {{else}}
            <img
              class="ais-Hits-banner-image"
              src={{this.bannerImageUrl}}
              alt={{this.banner.image.title}}
            />
          {{/if}}
        </aside>
      {{/if}}
      <ol class="ais-Hits-list">
        {{#each this.hits key="objectID" as |hit|}}
          <li
            class="ais-Hits-item"
            {{on "click" (fn this.handleClick hit)}}
            {{on "auxclick" (fn this.handleClick hit)}}
          >
            {{#if (has-block)}}
              {{yield hit this.state.sendEvent}}
            {{else}}
              <div style="word-break: break-all;">{{preview hit}}</div>
            {{/if}}
          </li>
        {{/each}}
      </ol>
    </div>
  </template>
}
