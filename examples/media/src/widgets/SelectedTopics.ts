import { currentRefinements } from 'instantsearch.js/es/widgets';

export const selectedTopics = currentRefinements({
  container: '[data-widget="selected-topics"]',
  includedAttributes: ['topics'],
});
