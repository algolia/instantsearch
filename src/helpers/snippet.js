import { getPropertyByPath } from '../lib/utils';
import { TAG_REPLACEMENT } from '../lib/escape-highlight';
import { component } from '../lib/suit';

const suit = component('Snippet');

export default function snippet({
  attribute,
  highlightedTagName = 'mark',
  hit,
} = {}) {
  const attributeValue =
    getPropertyByPath(hit, `_snippetResult.${attribute}.value`) || '';

  const className = suit({
    descendantName: 'highlighted',
  });

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
