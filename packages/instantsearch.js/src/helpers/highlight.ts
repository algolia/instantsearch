import { component } from '../lib/suit';
import { getPropertyByPath, TAG_REPLACEMENT, warning } from '../lib/utils';

import type { Hit } from '../types';

export type HighlightOptions = {
  // @MAJOR string should no longer be allowed to be a path, only array can be a path
  attribute: string | string[];
  highlightedTagName?: string;
  hit: Partial<Hit>;
  cssClasses?: Partial<{
    highlighted: string;
  }>;
};

const suit = component('Highlight');

/**
 * @deprecated use html tagged templates and the Highlight component instead
 */
export default function highlight({
  attribute,
  highlightedTagName = 'mark',
  hit,
  cssClasses = {},
}: HighlightOptions): string {
  warning(
    false,
    `\`instantsearch.highlight\` function has been deprecated. It is still supported in 4.x releases, but not further. It is replaced by the \`Highlight\` component.

For more information, visit https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/js/?client=html+tagged+templates#upgrade-templates`
  );

  const highlightAttributeResult = getPropertyByPath(
    hit._highlightResult,
    attribute
  );

  // @MAJOR fallback to attribute value if highlight is not found
  warning(
    highlightAttributeResult,
    `Could not enable highlight for "${attribute}", will display an empty string.
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

  return attributeValue
    .replace(
      new RegExp(TAG_REPLACEMENT.highlightPreTag, 'g'),
      `<${highlightedTagName} class="${className}">`
    )
    .replace(
      new RegExp(TAG_REPLACEMENT.highlightPostTag, 'g'),
      `</${highlightedTagName}>`
    );
}
