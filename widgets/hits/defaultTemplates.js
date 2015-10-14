module.exports = {
  empty: 'No results',
  hit: function(data) {
    return JSON.stringify(data, null, 2);
  }
};
