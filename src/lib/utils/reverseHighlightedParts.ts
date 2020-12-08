import { HighlightedParts } from '../../types';
import getHighlightFromSiblings from './getHighlightFromSiblings';

const reverseHighlightedParts = (parts: HighlightedParts[]) => {
  if (!parts.some(part => part.isHighlighted)) {
    return parts.map(part => ({ ...part, isHighlighted: false }));
  }

  return parts.map((part, i) => ({
    ...part,
    isHighlighted: !getHighlightFromSiblings(parts, i),
  }));
};

export default reverseHighlightedParts;
