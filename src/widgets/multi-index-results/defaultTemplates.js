export default {
  empty: 'No results',
  item(data) {
    return JSON.stringify(data, null, 2);
  },
};
