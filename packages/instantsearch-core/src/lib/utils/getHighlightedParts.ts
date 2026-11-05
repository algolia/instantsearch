import { TAG_PLACEHOLDER } from './escape-highlight';

export function getHighlightedParts(highlightedValue: string) {
  const { highlightPostTag, highlightPreTag } = TAG_PLACEHOLDER;

  const splitByPreTag = highlightedValue.split(highlightPreTag);
  const firstValue = splitByPreTag.shift();
  const elements = !firstValue
    ? []
    : [{ value: firstValue, isHighlighted: false }];

  splitByPreTag.forEach((split) => {
    const splitByPostTag = split.split(highlightPostTag);

    elements.push({
      value: splitByPostTag[0],
      isHighlighted: true,
    });

    if (splitByPostTag[1] !== '') {
      elements.push({
        value: splitByPostTag[1],
        isHighlighted: false,
      });
    }
  });

  return elements;
}
