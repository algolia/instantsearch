'use strict';

module.exports = {
  InstantSearch: require('./lib/InstantSearch'),
  widgets: {
    searchBox: require('./widgets/search-box/'),
    results: require('./widgets/hits/')
  }
};
