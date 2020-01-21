import { Hit } from '../types';
import { getPropertyByPath } from '../lib/utils';
import { TAG_REPLACEMENT } from '../lib/escape-highlight';
import { component } from '../lib/suit';

export type HighlightOptions = {
  attribute: string;
  highlightedTagName?: string;
  hit: Partial<Hit>;
  cssClasses?: {
    highlighted?: string;
  };
};

const suit = component('Highlight');

export default function highlight({
  attribute,
  highlightedTagName = 'mark',
  hit,
  cssClasses = {},
}: HighlightOptions): string {
  const attributeValue =
    (getPropertyByPath(hit, `_highlightResult.${attribute}.value`) as string) ||
    '';

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
