import { Hit } from '../types';
import { component } from '../lib/suit';
import { TAG_REPLACEMENT, getPropertyByPath } from '../lib/utils';

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

export default function snippet({
  attribute,
  highlightedTagName = 'mark',
  hit,
  cssClasses = {},
}: SnippetOptions): string {
  const { value: attributeValue = '' } =
    getPropertyByPath(hit._snippetResult, attribute) || {};

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
