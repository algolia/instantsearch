import Component from '@glimmer/component';
import {
  createHighlightComponent,
  cx,
} from 'instantsearch-ui-components';
import {
  getHighlightedParts,
  getPropertyByPath,
  unescape,
} from 'instantsearch.js/es/lib/utils/index';
import { Fragment, h } from 'preact';

import { PreactRoot } from '../-private/preact-root.ts';

import type { HighlightClassNames } from 'instantsearch-ui-components';

const HighlightUi = createHighlightComponent({
  createElement: h as never,
  Fragment,
});

interface HighlightResultValue {
  value?: string;
}

export interface HighlightSignature {
  Args: {
    /**
     * A hit from `Hits`, with its `_highlightResult`.
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
    /**
     * More class names, next to the `ais-Highlight` ones.
     */
    classNames?: Partial<HighlightClassNames>;
  };
}

/**
 * Shows an attribute of a hit, with the parts that match the query in `<mark>`.
 *
 * The markup comes from `instantsearch-ui-components`,
 * the same as in the other flavors.
 *
 * @example
 * ```gjs
 * <ais.Hits as |hit|>
 *   <Highlight @hit={{hit}} @attribute="name" />
 * </ais.Hits>
 * ```
 */
export default class Highlight extends Component<HighlightSignature> {
  preact = new PreactRoot(this);

  get parts() {
    const property =
      (getPropertyByPath(
        this.args.hit._highlightResult as Record<string, unknown> | undefined,
        this.args.attribute as string
      ) as HighlightResultValue | HighlightResultValue[] | undefined) || [];
    const values = Array.isArray(property) ? property : [property];
    const parts = [];

    for (let i = 0; i < values.length; i++) {
      parts.push(getHighlightedParts(unescape(values[i]!.value || '')));
    }

    return parts;
  }

  get root() {
    const classNames = this.args.classNames ?? {};

    return this.preact.render(
      h(HighlightUi as never, {
        parts: this.parts,
        separator: this.args.separator,
        classNames: {
          root: cx('ais-Highlight', classNames.root),
          highlighted: cx('ais-Highlight-highlighted', classNames.highlighted),
          nonHighlighted: cx(
            'ais-Highlight-nonHighlighted',
            classNames.nonHighlighted
          ),
          separator: cx('ais-Highlight-separator', classNames.separator),
        },
      })
    );
  }

  <template>{{this.root}}</template>
}
