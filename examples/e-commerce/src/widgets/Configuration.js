import { configure } from 'instantsearch.js/es/widgets';

const configuration = configure({
  attributesToSnippet: ['name:10', 'description:10'],
  snippetEllipsisText: '…',
});

export default configuration;
