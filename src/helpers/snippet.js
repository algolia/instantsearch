import { getPropertyByPath } from '../lib/utils';
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
    .replace(/<em>/g, `<${highlightedTagName} class="${className}">`)
    .replace(/<\/em>/g, `</${highlightedTagName}>`);
}
