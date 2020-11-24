import { Hit } from '../types';
import { getPropertyByPath, unescape } from '../lib/utils';
import { TAG_REPLACEMENT } from '../lib/escape-highlight';
import { component } from '../lib/suit';

export type ReverseHighlightOptions = {
  attribute: string;
  highlightedTagName?: string;
  hit: Partial<Hit>;
  cssClasses?: {
    highlighted?: string;
  };
};

const suit = component('ReverseHighlight');

const getReversedHighlight = (attribute: string) => {
  const regexHasMark = /(<mark>.*?<\/mark>)/gi;

  const parts = unescape(attribute).split(regexHasMark);

  if (parts.length === 1) return attribute;

  return parts
    .filter(Boolean)
    .map(part => {
      if (regexHasMark.test(part)) {
        return part.replace(/(<\/mark>|<mark>)/g, '');
      }

      return part
        .split(/([^a-z0-9])/gi)
        .map(escaped =>
          /(^[a-z0-9]+$)/gi.test(escaped) ? `<mark>${escaped}</mark>` : escaped
        )
        .join('');
    })
    .join('');
};

export default function reverseHighlight({
  attribute,
  highlightedTagName = 'mark',
  hit,
  cssClasses = {},
}: ReverseHighlightOptions): string {
  const attributeValue = getReversedHighlight(
    (getPropertyByPath(hit, `_highlightResult.${attribute}.value`) as string) ||
      ''
  );

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
