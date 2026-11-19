import Component from '@glimmer/component';
import {
  getHighlightedParts,
  getPropertyByPath,
  unescape,
} from 'instantsearch.js/es/lib/utils/index';

import HighlightParts from '../-private/highlight-parts.gts';

import type { HighlightedPart } from '../-private/highlight-parts.gts';

interface HighlightResultValue {
  value?: string;
}

export interface HighlightSignature {
  Element: HTMLSpanElement;
  Args: {
    /**
     * A hit from `connectHits`, with its `_highlightResult`.
     */
    hit: { _highlightResult?: unknown };
    /**
     * The attribute to highlight. Use a dot or an array for a nested attribute.
     */
    attribute: string | string[];
    /**
     * Shows between the values of an array attribute.
     * @default ", "
     */
    separator?: string;
  };
}

/**
 * Shows an attribute of a hit, with the parts that match the query in `<mark>`.
 *
 * @example
 * ```gjs
 * <ais.Connector @connector={{connectHits}} as |state|>
 *   {{#each state.items as |hit|}}
 *     <Highlight @hit={{hit}} @attribute="name" />
 *   {{/each}}
 * </ais.Connector>
 * ```
 */
export default class Highlight extends Component<HighlightSignature> {
  get parts(): HighlightedPart[][] {
    const property =
      (getPropertyByPath(
        this.args.hit._highlightResult as Record<string, unknown> | undefined,
        this.args.attribute as string
      ) as HighlightResultValue | HighlightResultValue[] | undefined) || [];
    const values = Array.isArray(property) ? property : [property];
    const parts: HighlightedPart[][] = [];

    for (let i = 0; i < values.length; i++) {
      parts.push(getHighlightedParts(unescape(values[i]!.value || '')));
    }

    return parts;
  }

  <template>
    <HighlightParts
      @parts={{this.parts}}
      @separator={{@separator}}
      ...attributes
    />
  </template>
}
