import { configure } from 'instantsearch.js/es/widgets';

export const configuration = configure({
  attributesToSnippet: ['content:20'],
  snippetEllipsisText: '…',
});
