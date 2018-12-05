import { getPropertyByPath } from '../lib/utils';
import { component } from '../lib/suit';

const suit = component('Highlight');

export default function highlight({
  attribute,
  highlightedTagName = 'mark',
  hit,
} = {}) {
  const attributeValue =
    getPropertyByPath(hit, `_highlightResult.${attribute}.value`) || '';

  return attributeValue
    .replace(
      /<em>/g,
      `<${highlightedTagName} class="${suit({
        descendantName: 'highlighted',
      })}">`
    )
    .replace(/<\/em>/g, `</${highlightedTagName}>`);
}
