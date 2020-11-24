import { Hit } from '../types';
import { getPropertyByPath, getReversedHighlight } from '../lib/utils';
import { TAG_REPLACEMENT } from '../lib/escape-highlight';
import { component } from '../lib/suit';

export type ReverseSnippetOptions = {
  attribute: string | Array<string | number>;
  highlightedTagName?: string;
  hit: Partial<Hit>;
  cssClasses?: {
    highlighted?: string;
  };
};

const suit = component('ReverseSnippet');

export default function reverseSnippet({
  attribute,
  highlightedTagName = 'mark',
  hit,
  cssClasses = {},
}: ReverseSnippetOptions): string {
  const { value: attributeValue = '' } =
    getPropertyByPath(hit._snippetResult, attribute) || {};

  // cx is not used, since it would be bundled as a dependency for Vue & Angular
  const className =
    suit({
      descendantName: 'highlighted',
    }) + (cssClasses.highlighted ? ` ${cssClasses.highlighted}` : '');

  return getReversedHighlight(attributeValue)
    .replace(
      new RegExp(TAG_REPLACEMENT.highlightPreTag, 'g'),
      `<${highlightedTagName} class="${className}">`
    )
    .replace(
      new RegExp(TAG_REPLACEMENT.highlightPostTag, 'g'),
      `</${highlightedTagName}>`
    );
}
