import unescape from './unescape';
import { HighlightedParts } from '../../types';

const getHighlightFromSiblings = (parts: HighlightedParts[], i: number) => {
  const current = parts[i];
  const isAlphanumeric = new RegExp(/\w/gi);
  const isNextHighlighted = parts[i + 1]?.isHighlighted || true;
  const isPreviousHighlighted = parts[i - 1]?.isHighlighted || true;

  if (
    !isAlphanumeric.test(unescape(current.value)) &&
    isPreviousHighlighted === isNextHighlighted
  ) {
    return isPreviousHighlighted;
  }

  return current.isHighlighted;
};

export default getHighlightFromSiblings;
