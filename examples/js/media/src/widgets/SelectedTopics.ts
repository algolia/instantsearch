import { currentRefinements } from 'instantsearch.js';
export const createSelectedTopics = ({ container }: { container: string }) =>
  currentRefinements({
    container,
    includedAttributes: ['categories'],
  });
