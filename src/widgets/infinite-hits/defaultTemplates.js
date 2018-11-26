export default {
  empty: 'No results',
  showMore: 'Show more results',
  item(data) {
    return JSON.stringify(data, null, 2);
  },
};
