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

export type ReverseSnippetOptions = {
  // @MAJOR string should no longer be allowed to be a path, only array can be a path
  attribute: string | string[];
  highlightedTagName?: string;
  hit: Partial<Hit>;
  cssClasses?: Partial<{
    highlighted: string;
  }>;
};

const suit = component('ReverseSnippet');

/**
 * @deprecated use html tagged templates and the ReverseSnippet component instead
 */
export default function reverseSnippet({
  attribute,
  highlightedTagName = 'mark',
  hit,
  cssClasses = {},
}: ReverseSnippetOptions): string {
  warning(
    false,
    `\`instantsearch.reverseSnippet\` function has been deprecated. It is still supported in 4.x releases, but not further. It is replaced by the \`ReverseSnippet\` component.

For more information, visit https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/js/?client=html+tagged+templates#upgrade-templates`
  );

  const snippetAttributeResult = getPropertyByPath(
    hit._snippetResult,
    attribute
  );

  // @MAJOR fallback to attribute value if snippet is not found
  warning(
    snippetAttributeResult,
    `Could not enable reverse snippet for "${attribute}", will display an empty string.
Please check whether this attribute exists and is specified in \`attributesToSnippet\`.

See: https://alg.li/highlighting
`
  );

  const { value: attributeValue = '' } = snippetAttributeResult || {};

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
