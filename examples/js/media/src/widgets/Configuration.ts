import { configure } from 'instantsearch.js';
export const configuration = configure({
  attributesToSnippet: ['content:20'],
  snippetEllipsisText: '…',
});
