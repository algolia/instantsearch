import type { Hit } from '../types';
import { component } from '../lib/suit';
import { TAG_REPLACEMENT, getPropertyByPath, warning } from '../lib/utils';
import { html } from 'htm/preact';

export type SnippetOptions = {
  // @MAJOR string should no longer be allowed to be a path, only array can be a path
  attribute: string | string[];
  highlightedTagName?: string;
  hit: Partial<Hit>;
  cssClasses?: {
    highlighted?: string;
  };
  jsx?: boolean;
};

const suit = component('Snippet');

export default function snippet({
  attribute,
  highlightedTagName = 'mark',
  hit,
  cssClasses = {},
  jsx = false,
}: SnippetOptions): string {
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

  const patched = attributeValue
    .replace(
      new RegExp(TAG_REPLACEMENT.highlightPreTag, 'g'),
      `<${highlightedTagName} class="${className}">`
    )
    .replace(
      new RegExp(TAG_REPLACEMENT.highlightPostTag, 'g'),
      `</${highlightedTagName}>`
    );

  if (jsx) {
    // @ts-ignore
    return html([patched]);
  }

  return patched;
}
