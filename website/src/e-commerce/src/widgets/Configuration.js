import { configure } from 'instantsearch.js/es/widgets';

const configuration = configure({
  attributesToSnippet: ['description'],
  snippetEllipsisText: '…',
});

export default configuration;
