import Vue from 'vue';
import { mount } from '@vue/test-utils';
import instantsearch from 'instantsearch.js/es';
import InstantSearch from '../InstantSearch.vue';

jest.mock('instantsearch.js/es', () => {
  const isPlainObject = require('lodash/isPlainObject');
  const start = jest.fn();

  class RoutingManager {
    constructor(routing) {
      this._routing = routing;
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
      return {
        _stalledSearchDelay: stalledSearchDelay,
        _searchFunction: searchFunction,
        routing: new RoutingManager(routing),
        helper: fakeInstantSearch.__helper,
        start,
      };
    }
  );
  fakeInstantSearch.__startMock = start;
  fakeInstantSearch._stalledSearchDelay = 200;
  // note for the future: these tests would be better with a real helper instance
  fakeInstantSearch.__helper = {
    search: jest.fn(),
    setClient: jest.fn(() => fakeInstantSearch.__helper),
    setIndex: jest.fn(() => fakeInstantSearch.__helper),
  };
  return fakeInstantSearch;
});

beforeEach(() => jest.clearAllMocks());

it('passes props to InstantSearch.js', () => {
  const searchClient = {};
  const searchFunction = helper => helper.search();
  mount(InstantSearch, {
    propsData: {
      searchClient,
      indexName: 'something',
      routing: {
        router: {},
        stateMapping: {},
      },
      stalledSearchDelay: 250,
      searchFunction,
    },
  });

  expect(instantsearch).toHaveBeenCalledWith({
    indexName: 'something',
    routing: {
      router: {},
      stateMapping: {},
    },
    searchClient,
    searchFunction,
    stalledSearchDelay: 250,
  });
});

it('throws on usage of appId or apiKey', () => {
  global.console.warn = jest.fn();
  global.console.error = jest.fn();

  mount(InstantSearch, {
    propsData: {
      searchClient: {},
      apiKey: 'bla',
      appId: 'blabla',
      indexName: 'something',
    },
  });

  expect(global.console.warn.mock.calls[0][0]).toMatchInlineSnapshot(`
"Vue InstantSearch: You used the prop api-key or api-key.
These have been replaced by search-client.

See more info here: https://community.algolia.com/vue-instantsearch/components/InstantSearch.html#usage"
`);

  expect(global.console.error.mock.calls[0][0]).toMatchInlineSnapshot(`
"[Vue warn]: Invalid prop: custom validator check failed for prop \\"apiKey\\".

found in

---> <AisInstantSearch>
       <Root>"
`);

  expect(global.console.error.mock.calls[1][0]).toMatchInlineSnapshot(`
"[Vue warn]: Invalid prop: custom validator check failed for prop \\"appId\\".

found in

---> <AisInstantSearch>
       <Root>"
`);
});

it('calls `start` on the next tick', done => {
  mount(InstantSearch, {
    propsData: {
      searchClient: {},
      indexName: 'something',
    },
  });

  Vue.nextTick(() => {
    expect(instantsearch.__startMock).toHaveBeenCalledTimes(1);
    done();
  });
});

it('provides an InstantSearch instance', () => {
  const wrapper = mount(InstantSearch, {
    propsData: {
      searchClient: {},
      indexName: 'bla',
    },
  });

  expect(wrapper.vm._provided).toEqual({
    instantSearchInstance: expect.objectContaining({
      // it's really InstantSearch, since it has the same spy as our custom mock
      start: instantsearch.__startMock,
    }),
  });
});

it('renders correctly (empty)', () => {
  const wrapper = mount(InstantSearch, {
    propsData: {
      searchClient: {},
      indexName: 'bla',
    },
  });

  expect(wrapper.html()).toMatchSnapshot();
});

it('renders correctly (with slot used)', () => {
  const wrapper = mount(InstantSearch, {
    propsData: {
      searchClient: {},
      indexName: 'bla',
    },
    slots: {
      default: '<div>Hi there, this is the main slot</div>',
    },
  });

  expect(wrapper.html()).toMatchSnapshot();
});

it('Allows a change in `index-name`', () => {
  const wrapper = mount(InstantSearch, {
    propsData: {
      searchClient: {},
      indexName: 'bla',
    },
  });

  wrapper.setProps({
    indexName: 'doggie_bowl',
  });

  expect(instantsearch.__helper.setIndex).toHaveBeenCalledTimes(1);
  expect(instantsearch.__helper.setIndex).toHaveBeenCalledWith('doggie_bowl');
  expect(instantsearch.__helper.search).toHaveBeenCalledTimes(1);
});

it('Allows a change in `search-client`', () => {
  const wrapper = mount(InstantSearch, {
    propsData: {
      searchClient: {},
      indexName: 'bla',
    },
  });

  const newClient = { cats: 'rule', dogs: 'drool' };

  wrapper.setProps({
    searchClient: newClient,
  });

  expect(instantsearch.__helper.setClient).toHaveBeenCalledTimes(1);
  expect(instantsearch.__helper.setClient).toHaveBeenCalledWith(newClient);
  expect(instantsearch.__helper.search).toHaveBeenCalledTimes(1);
});

it('Allows a change in `search-function`', () => {
  const oldValue = () => {};
  const newValue = () => {};

  const wrapper = mount(InstantSearch, {
    propsData: {
      searchClient: {},
      indexName: 'bla',
      searchFunction: oldValue,
    },
  });

  expect(wrapper.vm.instantSearchInstance._searchFunction).toEqual(oldValue);

  wrapper.setProps({
    searchFunction: newValue,
  });

  expect(wrapper.vm.instantSearchInstance._searchFunction).toEqual(newValue);
});

it('Allows a change in `stalled-search-delay`', () => {
  const wrapper = mount(InstantSearch, {
    propsData: {
      searchClient: {},
      indexName: 'bla',
      searchFunction: () => {},
      stalledSearchDelay: 200,
    },
  });

  expect(wrapper.vm.instantSearchInstance._stalledSearchDelay).toEqual(200);

  wrapper.setProps({
    stalledSearchDelay: 50,
  });

  expect(wrapper.vm.instantSearchInstance._stalledSearchDelay).toEqual(50);
});

it('Does not allow a change in `routing`', () => {
  global.console.error = jest.fn();
  const wrapper = mount(InstantSearch, {
    propsData: {
      searchClient: {},
      indexName: 'bla',
    },
  });

  wrapper.setProps({
    routing: false,
  });

  // Vue catches this error and throws it to the console
  expect(global.console.error.mock.calls[0][0]).toMatchInlineSnapshot(`
[Error: routing configuration can not be changed dynamically at this point.

Please open a new issue: https://github.com/algolia/vue-instantsearch/issues/new?template=feature.md]
`);
});

it('will call client.addAlgoliaAgent if present', () => {
  const client = { addAlgoliaAgent: jest.fn() };

  mount(InstantSearch, {
    propsData: {
      searchClient: client,
      indexName: 'bla',
    },
  });

  expect(client.addAlgoliaAgent).toHaveBeenCalledTimes(1);
  expect(client.addAlgoliaAgent.mock.calls[0][0]).toMatch(
    /Vue InstantSearch \([a-z0-9.-]+\)/
  );
});

it('will not call client.addAlgoliaAgent if not function (so nothing to assert)', () => {
  expect(() =>
    mount(InstantSearch, {
      propsData: {
        searchClient: { addAlgoliaAgent: true },
        indexName: 'bla',
      },
    })
  ).not.toThrow();
});
