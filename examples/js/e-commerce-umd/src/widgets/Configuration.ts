const { configure } = window.instantsearch.widgets;

export const configuration = configure({
  attributesToSnippet: ['description:10'],
  snippetEllipsisText: '…',
  removeWordsIfNoResults: 'allOptional',
});
