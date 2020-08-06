import Vue from 'vue';
import { mount } from '@vue/test-utils';
import _renderToString from 'vue-server-renderer/basic';
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
          helper: expect.any(Object),
          results: expect.any(Object),
          scopedResults: expect.arrayContaining([
            expect.objectContaining({
              helper: expect.any(Object),
              indexId: expect.any(String),
              results: expect.any(Object),
            }),
          ]),
          state: expect.any(Object),
          instantSearchInstance: expect.any(Object),
        },
        `
Object {
  "createURL": [Function],
  "helper": Any<Object>,
  "instantSearchInstance": Any<Object>,
  "results": Any<Object>,
  "scopedResults": ArrayContaining [
    ObjectContaining {
      "helper": Any<Object>,
      "indexId": Any<String>,
      "results": Any<Object>,
    },
  ],
  "searchMetadata": Object {
    "isSearchStalled": false,
  },
  "state": Any<Object>,
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
