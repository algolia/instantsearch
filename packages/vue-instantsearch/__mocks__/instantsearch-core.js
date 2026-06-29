/* eslint-disable import/no-commonjs */
const isPlainObject = require('lodash/isPlainObject');

const actual = jest.requireActual('instantsearch-core');

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
    compositionID,
    searchClient,
    routing,
    stalledSearchDelay,
    searchFunction,
  }) => {
    if (!searchClient && !isPlainObject(searchClient)) {
      throw new Error('need searchClient to be a plain object');
    }
    if (!indexName && !compositionID) {
      throw new Error('need indexName or compositionID to be a string');
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
      dispose: jest.fn(() => {
        instantsearchInstance.started = false;
      }),
      mainIndex: {
        $$type: 'ais.index',
        _widgets: [],
        addWidgets(widgets) {
          this._widgets.push(...widgets);
        },
        getWidgets() {
          return this._widgets;
        },
      },
      addWidgets(widgets) {
        instantsearchInstance.mainIndex.addWidgets(widgets);
      },
      removeWidgets(widgets) {
        widgets.forEach((widget) => {
          const i = instantsearchInstance.mainIndex._widgets.indexOf(widget);
          if (i === -1) {
            return;
          }
          instantsearchInstance.mainIndex._widgets.splice(i, 1);
        });
      },
    };

    return instantsearchInstance;
  }
);

module.exports = {
  ...actual,
  instantsearch: fakeInstantSearch,
};
