/* eslint-disable import/no-commonjs */
const isPlainObject = require('lodash/isPlainObject');

class RoutingManager {
  constructor(routing) {
    this._routing = routing;
  }
}

class Helper {
  constructor() {
    this.search = jest.fn();
    this.setClient = jest.fn(() => this);
    this.setIndex = jest.fn(() => this);
  }
}

const fakeInstantSearch = jest.fn(
  ({
    indexName,
    searchClient,
    routing,
    stalledSearchDelay,
    searchFunction,
  }) => {
    if (!searchClient && !isPlainObject(searchClient)) {
      throw new Error('need searchClient to be a plain object');
    }
    if (!indexName) {
      throw new Error('need indexName to be a string');
    }

    const instantsearchInstance = {
      _stalledSearchDelay: stalledSearchDelay || 200,
      _searchFunction: searchFunction,
      routing: new RoutingManager(routing),
      helper: new Helper(),
      client: searchClient,
      start: jest.fn(() => {
        instantsearchInstance.started = true;
      }),
      dispose: jest.fn(),
    };

    return instantsearchInstance;
  }
);

module.exports = fakeInstantSearch;
