import { HighlightedParts } from '../../types';
import getHighlightFromSiblings from './getHighlightFromSiblings';

const reverseHighlightedParts = (parts: HighlightedParts[]) => {
  if (!parts.some(part => part.isHighlighted)) {
    return parts.map(part => ({ ...part, isHighlighted: false }));
  }

  // #1 // Actual behavior, same as Autocomplete
  //   return parts.map(part => ({ ...part, isHighlighted: !part.isHighlighted }));

  // #2 // Sibiling matching behavior, match the highlight of the siblings
  return parts.map((part, i) => ({
    ...part,
    isHighlighted: !getHighlightFromSiblings(parts, i),
  }));

  // #3 // Highlight behavior, avoid highlighting any character non numeric
  //   const isAlphanumeric = new RegExp(/\w/gi);
  //   return parts.reduce<HighlightedParts[]>((acc, curr) => {
  //     if (curr.isHighlighted) {
  //       acc.push({ ...curr, isHighlighted: false });
  //     } else {
  //       unescape(curr.value)
  //         .split(isAlphanumeric)
  //         .forEach(value => {
  //           acc.push({
  //             value: escape(value),
  //             // we reproduce `Highlight` behavior which doesn't highlight non alphanumeric characters
  //             isHighlighted: /(\w)/gi.test(value),
  //           });
  //         });
  //     }

  //     return acc;
  //   }, []);
};

export default reverseHighlightedParts;
