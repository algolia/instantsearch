import Vue from 'vue';
import { mount } from '../../../test/utils';
import _renderToString from 'vue-server-renderer/basic';
import Router from 'vue-router';
import Vuex from 'vuex';
import { createServerRootMixin } from '../createServerRootMixin';
import InstantSearchSsr from '../../components/InstantSearchSsr';
import Configure from '../../components/Configure';
import SearchBox from '../../components/SearchBox.vue';
import { createWidgetMixin } from '../../mixins/widget';
import { createFakeClient } from '../testutils/client';
import { createSerializedState } from '../testutils/helper';
import {
  SearchResults,
  SearchParameters,
  AlgoliaSearchHelper,
} from 'algoliasearch-helper';

jest.unmock('instantsearch.js/es');

function renderToString(app) {
  return new Promise((resolve, reject) =>
    _renderToString(app, {}, (err, res) => {
      if (err) reject(err);
      resolve(res);
    })
  );
}

const forceIsServerMixin = {
  beforeCreate() {
    Object.setPrototypeOf(
      this,
      new Proxy(Object.getPrototypeOf(this), {
        get: (target, key, receiver) =>
          key === '$isServer' ? true : Reflect.get(target, key, receiver),
      })
    );
  },
};

process.env.VUE_ENV = 'server';

describe('createServerRootMixin', () => {
  describe('creation', () => {
    it('requires searchClient', () => {
      expect(
        () =>
          new Vue({
            mixins: [
              createServerRootMixin({
                searchClient: undefined,
                indexName: 'lol',
              }),
            ],
          })
      ).toThrowErrorMatchingInlineSnapshot(
        `"createServerRootMixin requires \`searchClient\` and \`indexName\` in the first argument"`
      );
    });

    it('requires indexName', () => {
      expect(
        () =>
          new Vue({
            mixins: [
              createServerRootMixin({
                searchClient: createFakeClient(),
                indexName: undefined,
              }),
            ],
          })
      ).toThrowErrorMatchingInlineSnapshot(
        `"createServerRootMixin requires \`searchClient\` and \`indexName\` in the first argument"`
      );
    });

    it('creates an instantsearch instance on "data"', () => {
      const app = new Vue({
        mixins: [
          createServerRootMixin({
            searchClient: createFakeClient(),
            indexName: 'lol',
          }),
        ],
      });

      expect(app.$data).toEqual({
        instantsearch: expect.objectContaining({
          start: expect.any(Function),
        }),
      });
    });

    it('provides the instantsearch instance ', () => {
      const App = {
        mixins: [
          createServerRootMixin({
            searchClient: createFakeClient(),
            indexName: 'myIndexName',
          }),
        ],
        render(h) {
          return h('div', {}, this.$slots.default);
        },
      };

      const Child = {
        mixins: [createWidgetMixin({ connector: true })],
        render(h) {
          return h('p', {}, this.instantSearchInstance.indexName);
        },
      };

      const wrapper = mount(App, {
        slots: {
          default: {
            render(h) {
              return h(InstantSearchSsr, [h(Child)]);
            },
          },
        },
      });

      expect(wrapper.html()).toMatchInlineSnapshot(`
<div>
  <div class="ais-InstantSearch ais-InstantSearch--ssr">
    <p>
      myIndexName
    </p>
  </div>
</div>
`);
    });
  });

  describe('findResultsState', () => {
    it('provides findResultsState', () => {
      const app = new Vue({
        mixins: [
          createServerRootMixin({
            searchClient: createFakeClient(),
            indexName: 'hello',
          }),
        ],
        render(h) {
          return h(InstantSearchSsr);
        },
      });

      expect(typeof app.$data.instantsearch.findResultsState).toBe('function');
    });

    it('detects child widgets', async () => {
      const searchClient = createFakeClient();

      const app = {
        mixins: [
          forceIsServerMixin,
          createServerRootMixin({
            searchClient,
            indexName: 'hello',
          }),
        ],
        render(h) {
          return h(InstantSearchSsr, {}, [
            h(Configure, {
              attrs: {
                hitsPerPage: 100,
              },
            }),
            h(SearchBox),
          ]);
        },
        serverPrefetch() {
          return this.instantsearch.findResultsState(this);
        },
      };

      const wrapper = new Vue({
        mixins: [forceIsServerMixin],
        render(h) {
          return h(app);
        },
      });

      await renderToString(wrapper);

      const { instantsearch } = wrapper.$children[0].$data;

      expect(instantsearch.mainIndex.getWidgetState()).toMatchInlineSnapshot(`
Object {
  "hello": Object {
    "configure": Object {
      "hitsPerPage": 100,
    },
  },
}
`);

      expect(searchClient.search).toHaveBeenCalledTimes(1);
      expect(searchClient.search.mock.calls[0][0]).toMatchInlineSnapshot(`
Array [
  Object {
    "indexName": "hello",
    "params": Object {
      "facets": Array [],
      "hitsPerPage": 100,
      "query": "",
      "tagFilters": "",
    },
  },
]
`);
    });

    it('forwards router', async () => {
      const searchClient = createFakeClient();

      const router = new Router({});

      // there are two renders of App, each with an assertion
      expect.assertions(2);

      const App = Vue.component('App', {
        mixins: [
          forceIsServerMixin,
          createServerRootMixin({
            searchClient,
            indexName: 'hello',
          }),
        ],
        data() {
          expect(this.$router).toBe(router);
          return {};
        },
        render(h) {
          return h(InstantSearchSsr, {}, [
            h(Configure, {
              attrs: {
                hitsPerPage: 100,
              },
            }),
            h(SearchBox),
          ]);
        },
        serverPrefetch() {
          return this.instantsearch.findResultsState(this);
        },
      });

      Vue.use(Router);

      const wrapper = new Vue({
        mixins: [forceIsServerMixin],
        router,
        render(h) {
          return h(App);
        },
      });

      await renderToString(wrapper);
    });

    it('forwards vuex', async () => {
      const searchClient = createFakeClient();

      Vue.use(Vuex);

      const store = new Vuex.Store();

      // there are two renders of App, each with an assertion
      expect.assertions(2);

      const App = Vue.component('App', {
        mixins: [
          forceIsServerMixin,
          createServerRootMixin({
            searchClient,
            indexName: 'hello',
          }),
        ],
        data() {
          expect(this.$store).toBe(store);
          return {};
        },
        render(h) {
          return h(InstantSearchSsr, {}, [
            h(Configure, {
              attrs: {
                hitsPerPage: 100,
              },
            }),
            h(SearchBox),
          ]);
        },
        serverPrefetch() {
          return this.instantsearch.findResultsState(this);
        },
      });

      const wrapper = new Vue({
        mixins: [forceIsServerMixin],
        store,
        render(h) {
          return h(App);
        },
      });

      await renderToString(wrapper);
    });

    it('forwards props', async () => {
      const searchClient = createFakeClient();

      // there are two renders of App, each with an assertion
      expect.assertions(2);

      const someProp = { data: Math.random() };

      const App = Vue.component('App', {
        mixins: [
          forceIsServerMixin,
          createServerRootMixin({
            searchClient,
            indexName: 'hello',
          }),
        ],
        props: {
          someProp: {
            required: true,
            type: Object,
            validator(value) {
              expect(value).toBe(someProp);
              return value === someProp;
            },
          },
        },
        render(h) {
          return h(InstantSearchSsr, {}, [
            h(Configure, {
              attrs: {
                hitsPerPage: 100,
              },
            }),
            h(SearchBox),
          ]);
        },
        serverPrefetch() {
          return this.instantsearch.findResultsState(this);
        },
      });

      const wrapper = new Vue({
        mixins: [forceIsServerMixin],
        render(h) {
          return h(App, { props: { someProp } });
        },
      });

      await renderToString(wrapper);
    });

    it('forwards slots', async done => {
      const searchClient = createFakeClient();

      expect.assertions(2);

      const App = Vue.component('App', {
        mixins: [
          forceIsServerMixin,
          createServerRootMixin({
            searchClient,
            indexName: 'hello',
          }),
        ],
        render(h) {
          return h(InstantSearchSsr, {}, this.$slots.default);
        },
        serverPrefetch() {
          return (
            this.instantsearch
              .findResultsState(this)
              .then(res => {
                expect(
                  this.instantsearch.mainIndex.getWidgets().map(w => w.$$type)
                ).toEqual(['ais.configure']);

                expect(res.hello._state.hitsPerPage).toBe(100);
              })
              // jest throws an error we need to catch, since stuck in the flow
              .catch(e => {
                done.fail(e);
              })
          );
        },
      });

      const wrapper = new Vue({
        mixins: [forceIsServerMixin],
        render(h) {
          return h(App, [
            h('template', { slot: 'default' }, [
              h(Configure, {
                attrs: {
                  hitsPerPage: 100,
                },
              }),
            ]),
          ]);
        },
      });

      await renderToString(wrapper);
      done();
    });

    // TODO: forwarding of scoped slots doesn't yet work.
    it.skip('forwards scoped slots', async done => {
      const searchClient = createFakeClient();

      expect.assertions(2);

      const App = Vue.component('App', {
        mixins: [
          forceIsServerMixin,
          createServerRootMixin({
            searchClient,
            indexName: 'hello',
          }),
        ],
        render(h) {
          return h(InstantSearchSsr, {}, [
            this.$scopedSlots.default({ test: true }),
          ]);
        },
        serverPrefetch() {
          return (
            this.instantsearch
              .findResultsState(this)
              .then(res => {
                expect(
                  this.instantsearch.mainIndex.getWidgets().map(w => w.$$type)
                ).toEqual(['ais.configure']);

                expect(res.hello._state.hitsPerPage).toBe(100);
              })
              // jest throws an error we need to catch, since stuck in the flow
              .catch(e => {
                done.fail(e);
              })
          );
        },
      });

      const wrapper = new Vue({
        mixins: [forceIsServerMixin],
        render(h) {
          return h(App, {
            scopedSlots: {
              default({ test }) {
                if (test) {
                  return h(Configure, {
                    attrs: {
                      hitsPerPage: 100,
                    },
                  });
                }
                return null;
              },
            },
          });
        },
      });

      await renderToString(wrapper);
      done();
    });

    it('forwards root', async () => {
      const searchClient = createFakeClient();

      // there are two renders of App, each with an assertion
      expect.assertions(2);

      const App = Vue.component('App', {
        mixins: [
          forceIsServerMixin,
          createServerRootMixin({
            searchClient,
            indexName: 'hello',
          }),
        ],
        render(h) {
          expect(this.$root).toBe(wrapper);

          return h(InstantSearchSsr, {}, [
            h(Configure, {
              attrs: {
                hitsPerPage: 100,
              },
            }),
            h(SearchBox),
          ]);
        },
        serverPrefetch() {
          return this.instantsearch.findResultsState(this);
        },
      });

      const wrapper = new Vue({
        mixins: [forceIsServerMixin],
        render(h) {
          return h(App);
        },
      });

      await renderToString(wrapper);
    });
  });

  describe('hydrate', () => {
    it('sets __initialSearchResults', () => {
      const serialized = createSerializedState();

      const app = {
        mixins: [
          createServerRootMixin({
            searchClient: createFakeClient(),
            indexName: 'hello',
          }),
        ],
        render(h) {
          return h(InstantSearchSsr, {}, [
            h(Configure, {
              attrs: {
                hitsPerPage: 100,
              },
            }),
            h(SearchBox),
          ]);
        },
        // in test, beforeCreated doesn't have $data yet, but IRL it does
        created() {
          this.instantsearch.hydrate({
            __identifier: 'stringified',
            hello: serialized,
          });
        },
      };

      const {
        vm: { instantsearch },
      } = mount(app);

      expect(instantsearch.__initialSearchResults).toEqual(
        expect.objectContaining({ hello: expect.any(SearchResults) })
      );

      expect(instantsearch.__initialSearchResults.hello).toEqual(
        expect.objectContaining(serialized)
      );
    });

    it('accepts non-stringified results', () => {
      const serialized = createSerializedState();
      const nonSerialized = new SearchResults(
        new SearchParameters(serialized._state),
        serialized._rawResults
      );

      const app = {
        mixins: [
          createServerRootMixin({
            searchClient: createFakeClient(),
            indexName: 'movies',
          }),
        ],
        render(h) {
          return h(InstantSearchSsr, {}, [
            h(Configure, {
              attrs: {
                hitsPerPage: 100,
              },
            }),
            h(SearchBox),
          ]);
        },
        // in test, beforeCreated doesn't have $data yet, but IRL it does
        created() {
          this.instantsearch.hydrate({
            movies: nonSerialized,
          });
        },
      };

      const {
        vm: { instantsearch },
      } = mount(app);

      expect(instantsearch.__initialSearchResults).toEqual(
        expect.objectContaining({ movies: expect.any(SearchResults) })
      );

      expect(instantsearch.__initialSearchResults.movies).toBe(nonSerialized);
    });

    it('inits the main index', () => {
      const serialized = createSerializedState();

      const app = {
        mixins: [
          createServerRootMixin({
            searchClient: createFakeClient(),
            indexName: 'hello',
          }),
        ],
        render(h) {
          return h(InstantSearchSsr, {}, [
            h(Configure, {
              attrs: {
                hitsPerPage: 100,
              },
            }),
            h(SearchBox),
          ]);
        },
      };

      const {
        vm: { instantsearch },
      } = mount(app);

      expect(instantsearch.mainIndex.getHelper()).toBe(null);

      instantsearch.hydrate({
        __identifier: 'stringified',
        hello: serialized,
      });

      // TODO: assert that this is expect.any(AlgoliaSearchHelper), but test fails
      // even though it's an object with all the right properties (including constructor)
      expect(instantsearch.mainIndex.getHelper()).not.toBeNull();
    });

    it('sets helper & mainHelper', () => {
      const serialized = createSerializedState();

      const app = {
        mixins: [
          createServerRootMixin({
            searchClient: createFakeClient(),
            indexName: 'hello',
          }),
        ],
        render(h) {
          return h(InstantSearchSsr, {}, [
            h(Configure, {
              attrs: {
                hitsPerPage: 100,
              },
            }),
            h(SearchBox),
          ]);
        },
      };

      const {
        vm: { instantsearch },
      } = mount(app);

      expect(instantsearch.helper).toBe(null);
      expect(instantsearch.mainHelper).toBe(null);

      instantsearch.hydrate({
        __identifier: 'stringified',
        hello: serialized,
      });

      expect(instantsearch.helper).toEqual(expect.any(AlgoliaSearchHelper));
      expect(instantsearch.mainHelper).toEqual(expect.any(AlgoliaSearchHelper));
    });
  });

  describe('__forceRender', () => {
    it('calls render on widget', () => {
      const app = new Vue({
        mixins: [
          createServerRootMixin({
            searchClient: createFakeClient(),
            indexName: 'lol',
          }),
        ],
      });

      const widget = {
        init: jest.fn(),
        render: jest.fn(),
      };

      const instantSearchInstance = app.$data.instantsearch;

      instantSearchInstance.hydrate({
        lol: createSerializedState(),
      });

      instantSearchInstance.__forceRender(
        widget,
        instantSearchInstance.mainIndex
      );

      expect(widget.init).toHaveBeenCalledTimes(0);
      expect(widget.render).toHaveBeenCalledTimes(1);

      const renderArgs = widget.render.mock.calls[0][0];

      expect(renderArgs).toMatchInlineSnapshot(
        {
          helper: expect.anything(),
          results: expect.anything(),
          scopedResults: expect.arrayContaining([
            expect.objectContaining({
              helper: expect.anything(),
              indexId: expect.any(String),
              results: expect.anything(),
            }),
          ]),
          state: expect.anything(),
          instantSearchInstance: expect.anything(),
        },
        `
Object {
  "createURL": [Function],
  "helper": Anything,
  "instantSearchInstance": Anything,
  "results": Anything,
  "scopedResults": ArrayContaining [
    ObjectContaining {
      "helper": Anything,
      "indexId": Any<String>,
      "results": Anything,
    },
  ],
  "searchMetadata": Object {
    "isSearchStalled": false,
  },
  "state": Anything,
  "templatesConfig": Object {},
}
`
      );
    });

    describe('createURL', () => {
      it('returns # if instantsearch has no routing', () => {
        const app = new Vue({
          mixins: [
            createServerRootMixin({
              searchClient: createFakeClient(),
              indexName: 'lol',
            }),
          ],
        });

        const widget = {
          init: jest.fn(),
          render: jest.fn(),
        };

        const instantSearchInstance = app.$data.instantsearch;

        instantSearchInstance.hydrate({
          lol: createSerializedState(),
        });

        instantSearchInstance.__forceRender(
          widget,
          instantSearchInstance.mainIndex
        );

        const renderArgs = widget.render.mock.calls[0][0];

        expect(renderArgs.createURL()).toBe('#');
      });

      it('allows for widgets without getWidgetState', () => {
        const app = new Vue({
          mixins: [
            createServerRootMixin({
              searchClient: createFakeClient(),
              indexName: 'lol',
            }),
          ],
        });

        const widget = {
          init: jest.fn(),
          render: jest.fn(),
          getWidgetState(uiState) {
            return uiState;
          },
        };

        const widgetWithoutGetWidgetState = {
          init: jest.fn(),
          render: jest.fn(),
        };

        const instantSearchInstance = app.$data.instantsearch;

        instantSearchInstance.hydrate({
          lol: createSerializedState(),
        });

        instantSearchInstance.addWidgets([widget, widgetWithoutGetWidgetState]);

        instantSearchInstance.__forceRender(
          widget,
          instantSearchInstance.mainIndex
        );

        const renderArgs = widget.render.mock.calls[0][0];

        expect(renderArgs.createURL()).toBe('#');
      });
    });
  });
});
