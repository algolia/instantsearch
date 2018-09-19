import { getPropertyByPath } from './utils';
import { component } from './suit';

const suit = component('HighLight');

export default function highlight({
  attribute,
  highlightedTagName = 'mark',
  hit,
} = {}) {
  const attributeValue =
    getPropertyByPath(hit, `_highlightResult.${attribute}.value`) || '';

  return attributeValue
    .replace(
      new RegExp('<em>', 'g'),
      `<${highlightedTagName} class="${suit({
        descendantName: 'highlighted',
      })}">`
    )
    .replace(new RegExp('</em>', 'g'), `</${highlightedTagName}>`);
}
