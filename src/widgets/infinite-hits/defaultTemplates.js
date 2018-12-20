export default {
  empty: 'No results',
  showMoreText: 'Show more results',
  item(data) {
    return JSON.stringify(data, null, 2);
  },
};
