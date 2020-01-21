import { Hit } from '../types';
import { getPropertyByPath } from '../lib/utils';
import { TAG_REPLACEMENT } from '../lib/escape-highlight';
import { component } from '../lib/suit';

export type SnippetOptions = {
  attribute: string;
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
  const attributeValue =
    (getPropertyByPath(hit, `_snippetResult.${attribute}.value`) as string) ||
    '';

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
