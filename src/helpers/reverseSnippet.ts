import { Hit } from '../types';
import { getPropertyByPath, unescape } from '../lib/utils';
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

const getReversedHighlight = (attribute: string) => {
  const regexHasMark = /(<mark>.*?<\/mark>)/gi;
  const parts = unescape(attribute).split(regexHasMark);

  if (parts.length === 1) return attribute;

  return parts
    .reduce((acc: string[], curr) => {
      if (!curr.length) {
        acc.push(curr);
      } else if (regexHasMark.test(curr)) {
        acc.push(curr.replace(/(<\/mark>|<mark>)/g, ''));
      } else {
        const reversed = curr
          .split(/([^a-z0-9])/gi)
          .map(escaped =>
            /(^[a-z0-9]+$)/gi.test(escaped)
              ? `<mark>${escaped}</mark>`
              : escaped
          )
          .join('');

        acc.push(reversed);
      }

      return acc;
    }, [])
    .join('');
};

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
