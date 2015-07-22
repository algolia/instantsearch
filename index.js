'use strict';

module.exports = {
  InstantSearch: require('./lib/InstantSearch'),
  widgets: {
    searchbox: require('./widgets/searchbox'),
    results: require('./widgets/hits')
  }
};
