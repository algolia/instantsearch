import type { Hit } from '../types';
import { component } from '../lib/suit';
import { getPropertyByPath, TAG_REPLACEMENT, warning } from '../lib/utils';

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

export default function highlight({
  attribute,
  highlightedTagName = 'mark',
  hit,
  cssClasses = {},
}: HighlightOptions): string {
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
