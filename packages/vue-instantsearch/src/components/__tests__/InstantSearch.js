import Vue from 'vue';
import { mount } from '@vue/test-utils';
import instantsearch from 'instantsearch.js/es';
import InstantSearch from '../InstantSearch';
import { version } from '../../../package.json';

beforeEach(() => jest.clearAllMocks());

it('passes props to InstantSearch.js', () => {
  const searchClient = {};
  const insightsClient = jest.fn();
  const searchFunction = helper => helper.search();
  mount(InstantSearch, {
    propsData: {
      searchClient,
      insightsClient,
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
    insightsClient,
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
"Vue InstantSearch: You used the prop api-key or app-id.
These have been replaced by search-client.

See more info here: https://www.algolia.com/doc/api-reference/widgets/instantsearch/vue/#widget-param-search-client"
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

it('calls `start` on the next tick', async () => {
  const wrapper = mount(InstantSearch, {
    propsData: {
      searchClient: {},
      indexName: 'something',
    },
  });

  await Vue.nextTick();
  expect(wrapper.vm.instantSearchInstance.start).toHaveBeenCalledTimes(1);
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

  const helper = wrapper.vm.instantSearchInstance.helper;

  expect(helper.setIndex).toHaveBeenCalledTimes(1);
  expect(helper.setIndex).toHaveBeenCalledWith('doggie_bowl');
  expect(helper.search).toHaveBeenCalledTimes(1);
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

  const helper = wrapper.vm.instantSearchInstance.helper;

  expect(helper.setClient).toHaveBeenCalledTimes(1);
  expect(helper.setClient).toHaveBeenCalledWith(newClient);
  expect(helper.search).toHaveBeenCalledTimes(1);
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

it('does not allow `routing` to be a boolean', () => {
  global.console.error = jest.fn();
  global.console.warn = jest.fn();
  mount(InstantSearch, {
    propsData: {
      searchClient: {},
      indexName: 'bla',
      routing: true,
    },
  });

  expect(global.console.error.mock.calls[0][0]).toMatchInlineSnapshot(`
"[Vue warn]: Invalid prop: custom validator check failed for prop \\"routing\\".

found in

---> <AisInstantSearch>
       <Root>"
`);

  expect(global.console.warn.mock.calls[0][0]).toMatchInlineSnapshot(
    `"routing should be an object, with \`router\` and \`stateMapping\`. See https://www.algolia.com/doc/api-reference/widgets/instantsearch/vue/#widget-param-routing"`
  );
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

  expect(client.addAlgoliaAgent).toHaveBeenCalledTimes(2);
  expect(client.addAlgoliaAgent).toHaveBeenCalledWith(`Vue (${Vue.version})`);
  expect(client.addAlgoliaAgent).toHaveBeenCalledWith(
    `Vue InstantSearch (${version})`
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

it('disposes the instantsearch instance on unmount', async () => {
  const wrapper = mount(InstantSearch, {
    propsData: {
      searchClient: {},
      indexName: 'something',
    },
  });

  await Vue.nextTick();

  expect(wrapper.vm.instantSearchInstance.started).toBe(true);

  wrapper.destroy();

  expect(wrapper.vm.instantSearchInstance.started).toBe(false);
  expect(wrapper.vm.instantSearchInstance.dispose).toHaveBeenCalledTimes(1);
});
