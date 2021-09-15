import { mount, createSSRApp } from '../../../test/utils';
import Router from 'vue-router';
import Vuex from 'vuex';
import { createStore } from 'vuex4';
import { createServerRootMixin } from '../createServerRootMixin';
import InstantSearchSsr from '../../components/InstantSearchSsr';
import Configure from '../../components/Configure';
import SearchBox from '../../components/SearchBox.vue';
import { createWidgetMixin } from '../../mixins/widget';
import { createFakeClient } from '../testutils/client';
import { createSerializedState } from '../testutils/helper';
import { isVue3, isVue2, Vue2, renderCompat } from '../vue-compat';
import {
  SearchResults,
  SearchParameters,
  AlgoliaSearchHelper,
} from 'algoliasearch-helper';

jest.unmock('instantsearch.js/es');

function renderToString(app) {
  if (isVue3) {
    return require('@vue/server-renderer').renderToString(app);
  } else {
    return new Promise((resolve, reject) => {
      require('vue-server-renderer/basic')(app, (err, res) => {
        if (err) reject(err);
        resolve(res);
      });
    });
  }
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
      expect(() =>
        createSSRApp({
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
      expect(() =>
        createSSRApp({
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
      const App = {
        mixins: [
          createServerRootMixin({
            searchClient: createFakeClient(),
            indexName: 'lol',
          }),
        ],
        render: () => null,
      };

      const wrapper = mount(App);
      expect(wrapper.vm.$data).toEqual({
        instantsearch: expect.objectContaining({
          start: expect.any(Function),
        }),
      });
    });

    it('provides the instantsearch instance', done => {
      const App = {
        mixins: [
          createServerRootMixin({
            searchClient: createFakeClient(),
            indexName: 'myIndexName',
          }),
        ],
        template: `<div><slot /></div>`,
      };

      const Child = {
        mixins: [createWidgetMixin({ connector: true })],
        mounted() {
          expect(this.instantSearchInstance).toEqual(
            expect.objectContaining({
              start: expect.any(Function),
              dispose: expect.any(Function),
              mainIndex: expect.any(Object),
              addWidgets: expect.any(Function),
              removeWidgets: expect.any(Function),
            })
          );
          done();
        },
        render() {
          return null;
        },
      };

      mount({
        components: { App, InstantSearchSsr, Child },
        template: `
          <App>
            <InstantSearchSsr>
              <Child />
            </InstantSearchSsr>
          </App>
        `,
      });
    });
  });

  describe('findResultsState', () => {
    it('provides findResultsState', async done => {
      const app = createSSRApp({
        mixins: [
          forceIsServerMixin,
          createServerRootMixin({
            searchClient: createFakeClient(),
            indexName: 'hello',
          }),
        ],
        render: renderCompat(h => h(InstantSearchSsr, {})),
        created() {
          expect(typeof this.instantsearch.findResultsState).toBe('function');
          done();
        },
      });

      await renderToString(app);
    });

    it('requires renderToString', async () => {
      const searchClient = createFakeClient();

      const app = {
        mixins: [
          forceIsServerMixin,
          createServerRootMixin({
            searchClient,
            indexName: 'hello',
          }),
        ],
        render: renderCompat(h =>
          h(InstantSearchSsr, {}, [
            h(Configure, {
              attrs: {
                hitsPerPage: 100,
              },
            }),
            h(SearchBox),
          ])
        ),
        serverPrefetch() {
          expect(() =>
            this.instantsearch.findResultsState({ component: this })
          ).toThrowErrorMatchingInlineSnapshot(
            `"findResultsState requires \`renderToString: (component) => Promise<string>\` in the first argument."`
          );
        },
      };

      const wrapper = createSSRApp({
        mixins: [forceIsServerMixin],
        render: renderCompat(h => h(app)),
      });

      await renderToString(wrapper);
    });

    it('detects child widgets', async () => {
      const searchClient = createFakeClient();
      let mainIndex;

      const app = {
        mixins: [
          forceIsServerMixin,
          createServerRootMixin({
            searchClient,
            indexName: 'hello',
          }),
        ],
        render: renderCompat(h =>
          /**
           * This code triggers this warning in Vue 3:
           * > Non-function value encountered for default slot. Prefer function slots for better performance.
           *
           * To fix it, replace the third argument
           * > [h(...), h(...)]
           * with
           * > { default: () => [h(...), h(...)] }
           *
           * but it's not important (and not compatible in vue2), we're leaving it as-is.
           */
          h(InstantSearchSsr, {}, [
            h(Configure, {
              attrs: {
                hitsPerPage: 100,
              },
            }),
            h(SearchBox),
          ])
        ),
        serverPrefetch() {
          return this.instantsearch.findResultsState({
            component: this,
            renderToString,
          });
        },
        created() {
          mainIndex = this.instantsearch.mainIndex;
        },
      };

      const wrapper = createSSRApp({
        mixins: [forceIsServerMixin],
        render: renderCompat(h => h(app)),
      });

      await renderToString(wrapper);

      expect(mainIndex.getWidgetState()).toMatchInlineSnapshot(`
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

    it('returns correct results state', async done => {
      const searchClient = createFakeClient();

      const app = {
        mixins: [
          forceIsServerMixin,
          createServerRootMixin({
            searchClient,
            indexName: 'hello',
          }),
        ],
        render: renderCompat(h =>
          h(InstantSearchSsr, {}, [
            h(Configure, {
              attrs: {
                hitsPerPage: 100,
              },
            }),
            h(SearchBox),
          ])
        ),
        async serverPrefetch() {
          const state = await this.instantsearch.findResultsState({
            component: this,
            renderToString,
          });
          expect(state).toEqual({
            __identifier: 'stringified',
            hello: {
              _rawResults: [
                {
                  query: '',
                },
              ],
              _state: {
                disjunctiveFacets: [],
                disjunctiveFacetsRefinements: {},
                facets: [],
                facetsExcludes: {},
                facetsRefinements: {},
                hierarchicalFacets: [],
                hierarchicalFacetsRefinements: {},
                hitsPerPage: 100,
                index: 'hello',
                numericRefinements: {},
                query: '',
                tagRefinements: [],
              },
            },
          });
          done();
          return state;
        },
      };

      const wrapper = createSSRApp({
        mixins: [forceIsServerMixin],
        render: renderCompat(h => h(app)),
      });

      await renderToString(wrapper);
    });

    it('forwards router', async () => {
      const searchClient = createFakeClient();
      let router;
      if (isVue3) {
        const Router4 = require('vue-router4');
        router = Router4.createRouter({
          history: Router4.createMemoryHistory(),
          routes: [{ path: '', component: {} }],
        });
      } else {
        router = new Router({});
      }

      // there are two renders of App, each with an assertion
      expect.assertions(2);

      if (isVue2) {
        Vue2.use(Router);
      }

      const App = {
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
        render: renderCompat(h =>
          h(InstantSearchSsr, {}, [
            h(Configure, {
              attrs: {
                hitsPerPage: 100,
              },
            }),
            h(SearchBox),
          ])
        ),
        serverPrefetch() {
          return this.instantsearch.findResultsState({
            component: this,
            renderToString,
          });
        },
      };

      const wrapper = createSSRApp({
        mixins: [forceIsServerMixin],
        render: renderCompat(h => h(App)),
        ...(isVue2 ? { router } : {}),
      });
      if (isVue3) {
        wrapper.use(router);
      }

      await renderToString(wrapper);
    });

    it('forwards vuex', async () => {
      const searchClient = createFakeClient();

      if (isVue2) {
        Vue2.use(Vuex);
      }
      const store = isVue3 ? createStore() : new Vuex.Store();

      // there are two renders of App, each with an assertion
      expect.assertions(2);

      const App = {
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
        render: renderCompat(h =>
          h(InstantSearchSsr, {}, [
            h(Configure, {
              attrs: {
                hitsPerPage: 100,
              },
            }),
            h(SearchBox),
          ])
        ),
        serverPrefetch() {
          return this.instantsearch.findResultsState({
            component: this,
            renderToString,
          });
        },
      };

      const wrapper = createSSRApp({
        mixins: [forceIsServerMixin],
        ...(isVue2 ? { store } : {}),
        render: renderCompat(h => h(App)),
      });

      if (isVue3) {
        wrapper.use(store);
      }

      await renderToString(wrapper);
    });

    if (isVue2) {
      it('forwards props', async () => {
        const searchClient = createFakeClient();

        // there are two renders of App, each with an assertion
        expect.assertions(2);

        const someProp = { data: Math.random() };

        const App = {
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
          render: renderCompat(h =>
            h(InstantSearchSsr, {}, [
              h(Configure, {
                attrs: {
                  hitsPerPage: 100,
                },
              }),
              h(SearchBox),
            ])
          ),
          serverPrefetch() {
            return this.instantsearch.findResultsState({
              component: this,
              renderToString,
            });
          },
        };

        const wrapper = createSSRApp({
          mixins: [forceIsServerMixin],
          render: renderCompat(h => h(App, { props: { someProp } })),
        });

        await renderToString(wrapper);
      });

      it('forwards slots', async done => {
        const searchClient = createFakeClient();

        expect.assertions(2);

        const App = {
          mixins: [
            forceIsServerMixin,
            createServerRootMixin({
              searchClient,
              indexName: 'hello',
            }),
          ],
          components: { InstantSearchSsr },
          template: `
            <InstantSearchSsr>
              <slot />
            </InstantSearchSsr>
          `,
          serverPrefetch() {
            return (
              this.instantsearch
                .findResultsState({ component: this, renderToString })
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
        };

        const wrapper = createSSRApp({
          mixins: [forceIsServerMixin],
          components: { App, Configure },
          template: `
          <App>
            <Configure :hits-per-page.camel="100" />
          </App>
        `,
        });

        await renderToString(wrapper);
        done();
      });

      // TODO: forwarding of scoped slots doesn't yet work.
      it.skip('forwards scoped slots', async done => {
        const searchClient = createFakeClient();

        expect.assertions(2);

        const App = {
          mixins: [
            forceIsServerMixin,
            createServerRootMixin({
              searchClient,
              indexName: 'hello',
            }),
          ],
          render: renderCompat(h =>
            h(InstantSearchSsr, {}, [this.$scopedSlots.default({ test: true })])
          ),
          serverPrefetch() {
            return (
              this.instantsearch
                .findResultsState({ component: this, renderToString })
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
        };

        const wrapper = createSSRApp({
          mixins: [forceIsServerMixin],
          render: renderCompat(h =>
            h(App, {
              scopedSlots: {
                default({ test }) {
                  if (test) {
                    return h(Configure, {
                      hitsPerPage: 100,
                    });
                  }
                  return null;
                },
              },
            })
          ),
        });

        await renderToString(wrapper);
        done();
      });

      it('forwards root', async () => {
        const searchClient = createFakeClient();

        // there are two renders of App, each with an assertion
        expect.assertions(2);

        const App = {
          mixins: [
            forceIsServerMixin,
            createServerRootMixin({
              searchClient,
              indexName: 'hello',
            }),
          ],
          render: renderCompat(function(h) {
            expect(this.$root).toBe(wrapper);
            return h(InstantSearchSsr, {}, [
              h(Configure, {
                attrs: {
                  hitsPerPage: 100,
                },
              }),
              h(SearchBox),
            ]);
          }),
          serverPrefetch() {
            return this.instantsearch.findResultsState({
              component: this,
              renderToString,
            });
          },
        };

        const wrapper = createSSRApp({
          mixins: [forceIsServerMixin],
          render: renderCompat(h => h(App)),
        });

        await renderToString(wrapper);
      });
    }
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
        render: renderCompat(h =>
          h(InstantSearchSsr, {}, [
            h(Configure, {
              attrs: {
                hitsPerPage: 100,
              },
            }),
            h(SearchBox),
          ])
        ),
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
        render: renderCompat(h =>
          h(InstantSearchSsr, {}, [
            h(Configure, {
              attrs: {
                hitsPerPage: 100,
              },
            }),
            h(SearchBox),
          ])
        ),
        created() {
          this.instantsearch.hydrate({
            movies: nonSerialized,
          });

          expect(this.instantsearch.__initialSearchResults).toEqual(
            expect.objectContaining({ movies: expect.any(SearchResults) })
          );

          expect(this.instantsearch.__initialSearchResults.movies).toEqual(
            nonSerialized
          );
        },
      };

      mount(app);
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
        render: renderCompat(h =>
          h(InstantSearchSsr, {}, [
            h(Configure, {
              attrs: {
                hitsPerPage: 100,
              },
            }),
            h(SearchBox),
          ])
        ),
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
        render: renderCompat(h =>
          h(InstantSearchSsr, {}, [
            h(Configure, {
              attrs: {
                hitsPerPage: 100,
              },
            }),
            h(SearchBox),
          ])
        ),
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
      let instantSearchInstance;
      mount({
        mixins: [
          createServerRootMixin({
            searchClient: createFakeClient(),
            indexName: 'lol',
          }),
        ],
        created() {
          instantSearchInstance = this.instantsearch;
        },
      });

      const widget = {
        init: jest.fn(),
        render: jest.fn(),
      };

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
          parent: expect.anything(),
          state: expect.anything(),
          instantSearchInstance: expect.anything(),
        },
        `
Object {
  "createURL": [Function],
  "helper": Anything,
  "instantSearchInstance": Anything,
  "parent": Anything,
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
        let instantSearchInstance;
        mount({
          mixins: [
            createServerRootMixin({
              searchClient: createFakeClient(),
              indexName: 'lol',
            }),
          ],
          created() {
            instantSearchInstance = this.instantsearch;
          },
        });

        const widget = {
          init: jest.fn(),
          render: jest.fn(),
        };

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
        let instantSearchInstance;
        mount({
          mixins: [
            createServerRootMixin({
              searchClient: createFakeClient(),
              indexName: 'lol',
            }),
          ],
          created() {
            instantSearchInstance = this.instantsearch;
          },
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
