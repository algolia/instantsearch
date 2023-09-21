import { component } from '../lib/suit';
import { TAG_REPLACEMENT, getPropertyByPath, warning } from '../lib/utils';

import type { Hit } from '../types';

export type SnippetOptions = {
  // @MAJOR string should no longer be allowed to be a path, only array can be a path
  attribute: string | string[];
  highlightedTagName?: string;
  hit: Partial<Hit>;
  cssClasses?: {
    highlighted?: string;
  };
};

const suit = component('Snippet');

/**
 * @deprecated use html tagged templates and the Snippet component instead
 */
export default function snippet({
  attribute,
  highlightedTagName = 'mark',
  hit,
  cssClasses = {},
}: SnippetOptions): string {
  warning(
    false,
    `\`instantsearch.snippet\` function has been deprecated. It is still supported in 4.x releases, but not further. It is replaced by the \`Snippet\` component.

For more information, visit https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/js/?client=html+tagged+templates#upgrade-templates`
  );

  const snippetAttributeResult = getPropertyByPath(
    hit._snippetResult,
    attribute
  );

  // @MAJOR fallback to attribute value if snippet is not found
  warning(
    snippetAttributeResult,
    `Could not enable snippet for "${attribute}", will display an empty string.
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
