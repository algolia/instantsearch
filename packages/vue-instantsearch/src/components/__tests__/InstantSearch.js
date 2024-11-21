/**
 * @jest-environment jsdom
 */

import {
  createAlgoliaSearchClient,
  createSearchClient,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import {
  historyRouter,
  instantsearch,
  simpleStateMapping,
} from 'instantsearch-core';

import { version } from '../../../package.json';
import { mount, nextTick } from '../../../test/utils';
import {
  isVue3,
  renderCompat,
  version as vueVersion,
} from '../../util/vue-compat';
import { warn } from '../../util/warn';
import { AisSearchBox } from '../../widgets';
import InstantSearch from '../InstantSearch';
import '../../../test/utils/sortedHtmlSerializer';

jest.mock('../../util/warn');

jest.mock('instantsearch-core', () => {
  const actual = jest.requireActual('instantsearch-core');

  return {
    ...actual,
    instantsearch: jest.fn(actual.instantsearch),
  };
});

beforeEach(() => {
  jest.clearAllMocks();
});

it('passes props to InstantSearch.js', () => {
  const searchClient = createSearchClient();
  const insightsClient = jest.fn();
  const searchFunction = (helper) => helper.search();
  const routing = {
    router: historyRouter(),
    stateMapping: simpleStateMapping(),
  };

  mount(InstantSearch, {
    propsData: {
      searchClient,
      insightsClient,
      indexName: 'something',
      routing,
      stalledSearchDelay: 250,
      searchFunction,
    },
  });

  expect(instantsearch).toHaveBeenCalledWith({
    indexName: 'something',
    routing,
    searchClient,
    insightsClient,
    searchFunction,
    stalledSearchDelay: 250,
  });
});

it('throws on usage of appId or apiKey', () => {
  global.console.error = jest.fn();
  global.console.warn = jest.fn();

  mount(InstantSearch, {
    propsData: {
      searchClient: createSearchClient(),
      apiKey: 'bla',
      appId: 'blabla',
      indexName: 'something',
    },
  });

  expect(warn)
    .toHaveBeenCalledWith(`Vue InstantSearch: You used the prop api-key or app-id.
These have been replaced by search-client.

See more info here: https://www.algolia.com/doc/api-reference/widgets/instantsearch/vue/#widget-param-search-client`);

  if (isVue3) {
    // eslint-disable-next-line jest/no-conditional-expect
    expect(global.console.warn.mock.calls[0][0]).toMatchInlineSnapshot(
      `"[Vue warn]: Invalid prop: custom validator check failed for prop \\"apiKey\\"."`
    );

    // eslint-disable-next-line jest/no-conditional-expect
    expect(global.console.warn.mock.calls[1][0]).toMatchInlineSnapshot(
      `"[Vue warn]: Invalid prop: custom validator check failed for prop \\"appId\\"."`
    );
  } else {
    // eslint-disable-next-line jest/no-conditional-expect
    expect(global.console.error.mock.calls[0][0]).toMatchInlineSnapshot(`
"[Vue warn]: Invalid prop: custom validator check failed for prop \\"apiKey\\".

found in

---> <AisInstantSearch>
       <Root>"
`);

    // eslint-disable-next-line jest/no-conditional-expect
    expect(global.console.error.mock.calls[1][0]).toMatchInlineSnapshot(`
"[Vue warn]: Invalid prop: custom validator check failed for prop \\"appId\\".

found in

---> <AisInstantSearch>
       <Root>"
`);
  }
});

it('calls `start` on the next tick', async () => {
  const wrapper = mount(InstantSearch, {
    propsData: {
      searchClient: createSearchClient(),
      indexName: 'something',
    },
  });

  jest.spyOn(wrapper.vm.instantSearchInstance, 'start');

  await nextTick();
  expect(wrapper.vm.instantSearchInstance.start).toHaveBeenCalledTimes(1);
});

it('renders correctly (empty)', () => {
  const wrapper = mount(InstantSearch, {
    propsData: {
      searchClient: createSearchClient(),
      indexName: 'bla',
    },
  });

  expect(wrapper.html()).toMatchSnapshot();
});

it('renders correctly (with slot used)', () => {
  const wrapper = mount(InstantSearch, {
    propsData: {
      searchClient: createSearchClient(),
      indexName: 'bla',
    },
    slots: {
      default: '<div>Hi there, this is the main slot</div>',
    },
  });

  expect(wrapper.html()).toMatchSnapshot();
});

it('Allows a change in `index-name`', async () => {
  const searchClient = createSearchClient();
  const wrapper = mount(InstantSearch, {
    propsData: {
      searchClient,
      indexName: 'before',
    },
    slots: {
      default: renderCompat((h) => h(AisSearchBox)),
    },
    components: {
      AisSearchBox,
    },
  });

  await wait(0);

  expect(searchClient.search).toHaveBeenCalledTimes(1);
  expect(searchClient.search).toHaveBeenCalledWith([
    { indexName: 'before', params: { query: '' } },
  ]);

  await wrapper.setProps({
    indexName: 'after',
  });

  expect(searchClient.search).toHaveBeenCalledTimes(2);
  expect(searchClient.search).toHaveBeenCalledWith([
    { indexName: 'after', params: { query: '' } },
  ]);
});

it('Allows a change in `search-client`', async () => {
  const searchClient = createSearchClient();
  const wrapper = mount(InstantSearch, {
    propsData: {
      searchClient,
      indexName: 'indexName',
    },
    components: { AisSearchBox },
    slots: {
      default: renderCompat((h) => h(AisSearchBox)),
    },
  });

  await wait(0);

  expect(searchClient.search).toHaveBeenCalledTimes(1);

  const newClient = createSearchClient();
  await wrapper.setProps({
    searchClient: newClient,
  });

  expect(newClient.search).toHaveBeenCalledTimes(1);
  expect(searchClient.search).toHaveBeenCalledTimes(1);
});

it('warns when the `search-client` changes', async () => {
  const wrapper = mount(InstantSearch, {
    propsData: {
      searchClient: createAlgoliaSearchClient({}),
      indexName: 'indexName',
    },
  });

  const newClient = createAlgoliaSearchClient({});

  await wrapper.setProps({ searchClient: newClient });

  expect(warn).toHaveBeenCalledWith(
    false,
    'The `search-client` prop of `<ais-instant-search>` changed between renders, which may cause more search requests than necessary. If this is an unwanted behavior, please provide a stable reference: https://www.algolia.com/doc/api-reference/widgets/instantsearch/vue/#widget-param-search-client'
  );
});

it('does not warn when the `search-client` does not change', async () => {
  const wrapper = mount(InstantSearch, {
    propsData: {
      searchClient: createAlgoliaSearchClient({}),
      indexName: 'indexName',
    },
  });

  await wrapper.setProps({ indexName: 'indexName2' });

  expect(warn).not.toHaveBeenCalled();
});

it('Allows a change in `search-function`', async () => {
  const oldValue = () => {};
  const newValue = () => {};

  const wrapper = mount(InstantSearch, {
    propsData: {
      searchClient: createSearchClient(),
      indexName: 'bla',
      searchFunction: oldValue,
    },
  });

  expect(wrapper.vm.instantSearchInstance._searchFunction).toEqual(oldValue);

  await wrapper.setProps({
    searchFunction: newValue,
  });

  expect(wrapper.vm.instantSearchInstance._searchFunction).toEqual(newValue);
});

it('Allows a change in `stalled-search-delay`', async () => {
  const wrapper = mount(InstantSearch, {
    propsData: {
      searchClient: createSearchClient(),
      indexName: 'bla',
      searchFunction: () => {},
      stalledSearchDelay: 200,
    },
  });

  expect(wrapper.vm.instantSearchInstance._stalledSearchDelay).toEqual(200);

  await wrapper.setProps({
    stalledSearchDelay: 50,
  });

  expect(wrapper.vm.instantSearchInstance._stalledSearchDelay).toEqual(50);
});

it('does not allow `routing` to be a boolean', () => {
  global.console.error = jest.fn();
  global.console.warn = jest.fn();
  mount(InstantSearch, {
    propsData: {
      searchClient: createSearchClient(),
      indexName: 'bla',
      routing: true,
    },
  });

  if (isVue3) {
    // eslint-disable-next-line jest/no-conditional-expect
    expect(global.console.warn.mock.calls[0][0]).toMatchInlineSnapshot(
      `"[Vue warn]: Invalid prop: custom validator check failed for prop \\"routing\\"."`
    );
  } else {
    // eslint-disable-next-line jest/no-conditional-expect
    expect(global.console.error.mock.calls[0][0]).toMatchInlineSnapshot(`
"[Vue warn]: Invalid prop: custom validator check failed for prop \\"routing\\".

found in

---> <AisInstantSearch>
       <Root>"
`);
  }

  expect(warn)
    .toHaveBeenCalledWith(`The \`routing\` option expects an object with \`router\` and/or \`stateMapping\`.

See https://www.algolia.com/doc/api-reference/widgets/instantsearch/vue/#widget-param-routing`);
});

it('warns when `routing` does not have `router` or `stateMapping`', () => {
  mount(InstantSearch, {
    propsData: {
      searchClient: createSearchClient(),
      indexName: 'indexName',
      routing: {},
    },
  });

  expect(warn)
    .toHaveBeenCalledWith(`The \`routing\` option expects an object with \`router\` and/or \`stateMapping\`.

See https://www.algolia.com/doc/api-reference/widgets/instantsearch/vue/#widget-param-routing`);
});

it('does not warn when `routing` have either `router` or `stateMapping`', () => {
  mount(InstantSearch, {
    propsData: {
      searchClient: createSearchClient(),
      indexName: 'indexName',
      routing: { router: historyRouter() },
    },
  });
  mount(InstantSearch, {
    propsData: {
      searchClient: createSearchClient(),
      indexName: 'indexName',
      routing: { stateMapping: simpleStateMapping() },
    },
  });

  expect(warn).toHaveBeenCalledTimes(0);
});

// TODO: this test does not pass with latest vue-test-utils
it.skip('Does not allow a change in `routing`', async () => {
  const wrapper = mount(InstantSearch, {
    propsData: {
      searchClient: createSearchClient(),
      indexName: 'bla',
    },
  });

  await expect(
    wrapper.setProps({
      routing: false,
    })
  ).rejects.toMatchInlineSnapshot(`
[Error: routing configuration can not be changed dynamically at this point.

Please open a new issue: https://github.com/algolia/instantsearch/discussions/new?category=ideas&labels=triage%2cLibrary%3A+Vue+InstantSearch&title=Feature%20request%3A%20dynamic%20props]
`);
});

it('will call client.addAlgoliaAgent if present', () => {
  const client = createAlgoliaSearchClient({});

  mount(InstantSearch, {
    propsData: {
      searchClient: client,
      indexName: 'bla',
    },
  });

  expect(client.addAlgoliaAgent).toHaveBeenCalledTimes(3);
  expect(client.addAlgoliaAgent).toHaveBeenCalledWith(
    expect.stringMatching(/instantsearch-core \(.*\)/)
  );
  expect(client.addAlgoliaAgent).toHaveBeenCalledWith(`Vue (${vueVersion})`);
  expect(client.addAlgoliaAgent).toHaveBeenCalledWith(
    `Vue InstantSearch (${version})`
  );
});

it('will not call client.addAlgoliaAgent if not function (so nothing to assert)', () => {
  expect(() =>
    mount(InstantSearch, {
      propsData: {
        searchClient: createSearchClient({
          addAlgoliaAgent: false,
        }),
        indexName: 'bla',
      },
    })
  ).not.toThrow();
});

it('disposes the instantsearch instance on unmount', async () => {
  const wrapper = mount(InstantSearch, {
    propsData: {
      searchClient: createSearchClient(),
      indexName: 'something',
    },
  });

  jest.spyOn(wrapper.vm.instantSearchInstance, 'dispose');

  await nextTick();

  expect(wrapper.vm.instantSearchInstance.started).toBe(true);

  wrapper.destroy();

  expect(wrapper.vm.instantSearchInstance.started).toBe(false);
  expect(wrapper.vm.instantSearchInstance.dispose).toHaveBeenCalledTimes(1);
});

// eslint-disable-next-line jest/no-done-callback
it('provides the instantsearch instance', (done) => {
  let instantSearchInstance;

  const ParentComponent = {
    ...InstantSearch,
    created() {
      instantSearchInstance = this.instantSearchInstance;
    },
  };

  const ChildComponent = {
    inject: ['$_ais_instantSearchInstance'],
    mounted() {
      this.$nextTick(() => {
        expect(typeof this.$_ais_instantSearchInstance).toBe('object');
        expect(this.$_ais_instantSearchInstance).toBe(instantSearchInstance);
        done();
      });
    },
    render() {
      return null;
    },
  };

  mount({
    components: { ParentComponent, ChildComponent },
    data() {
      return {
        props: {
          searchClient: createSearchClient(),
          indexName: 'something',
        },
      };
    },
    template: `
      <ParentComponent v-bind="props">
        <ChildComponent />
      </ParentComponent>
    `,
  });
});
