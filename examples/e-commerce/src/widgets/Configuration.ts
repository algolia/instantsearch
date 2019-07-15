import { configure } from 'instantsearch.js/es/widgets';

export const configuration = configure({
  attributesToSnippet: ['description:10'],
  snippetEllipsisText: '…',
  removeWordsIfNoResults: 'allOptional',
});
