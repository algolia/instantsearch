import { configure } from 'instantsearch.js/es/widgets';

const configuration = configure({
  attributesToSnippet: ['description:10'],
  snippetEllipsisText: '…',
  removeWordsIfNoResults: 'allOptional',
});

export default configuration;
