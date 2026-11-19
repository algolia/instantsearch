import { configure } from 'instantsearch.js';
export const configuration = configure({
  attributesToSnippet: ['description:10'],
  snippetEllipsisText: '…',
  removeWordsIfNoResults: 'allOptional',
});
