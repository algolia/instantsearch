import { component } from '../lib/suit';
import {
  TAG_REPLACEMENT,
  getPropertyByPath,
  getHighlightedParts,
  reverseHighlightedParts,
  concatHighlightedParts,
  warning,
} from '../lib/utils';

import type { Hit } from '../types';

export type ReverseHighlightOptions = {
  // @MAJOR string should no longer be allowed to be a path, only array can be a path
  attribute: string | string[];
  highlightedTagName?: string;
  hit: Partial<Hit>;
  cssClasses?: Partial<{
    highlighted: string;
  }>;
};

const suit = component('ReverseHighlight');

/**
 * @deprecated use html tagged templates and the ReverseHighlight component instead
 */
export default function reverseHighlight({
  attribute,
  highlightedTagName = 'mark',
  hit,
  cssClasses = {},
}: ReverseHighlightOptions): string {
  warning(
    false,
    `\`instantsearch.reverseHighlight\` function has been deprecated. It is still supported in 4.x releases, but not further. It is replaced by the \`ReverseHighlight\` component.

For more information, visit https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/js/?client=html+tagged+templates#upgrade-templates`
  );

  const highlightAttributeResult = getPropertyByPath(
    hit._highlightResult,
    attribute
  );

  // @MAJOR fallback to attribute value if highlight is not found
  warning(
    highlightAttributeResult,
    `Could not enable reverse highlight for "${attribute}", will display an empty string.
Please check whether this attribute exists and is either searchable or specified in \`attributesToHighlight\`.

See: https://alg.li/highlighting
`
  );

  const { value: attributeValue = '' } = highlightAttributeResult || {};

  // cx is not used, since it would be bundled as a dependency for Vue & Angular
  const className =
    suit({
      descendantName: 'highlighted',
    }) + (cssClasses.highlighted ? ` ${cssClasses.highlighted}` : '');

  const reverseHighlightedValue = concatHighlightedParts(
    reverseHighlightedParts(getHighlightedParts(attributeValue))
  );

  return reverseHighlightedValue
    .replace(
      new RegExp(TAG_REPLACEMENT.highlightPreTag, 'g'),
      `<${highlightedTagName} class="${className}">`
    )
    .replace(
      new RegExp(TAG_REPLACEMENT.highlightPostTag, 'g'),
      `</${highlightedTagName}>`
    );
}
