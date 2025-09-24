/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx h */
import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils/wait';
import { h } from 'preact';

import instantsearch from '../../../index.es';
import stats from '../../stats/stats';
import panel from '../panel';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('panel', () => {
  describe('templates', () => {
    test('renders default templates', async () => {
      const container = document.createElement('div');
      const searchClient = createMockedSearchClient();

      const search = instantsearch({
        indexName: 'indexName',
        searchClient,
      });

      search.addWidgets([
        panel({ collapsed: () => true })(stats)({
          container,
          attribute: 'brand',
        }),
      ]);

      // @MAJOR Once Hogan.js and string-based templates are removed,
      // `search.start()` can be moved to the test body and the following
      // assertion can go away.
      expect(async () => {
        search.start();

        await wait(0);
      }).not.toWarnDev();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="ais-Panel ais-Panel--collapsible ais-Panel--collapsed"
          >
            <div
              class="ais-Panel-body"
            >
              <div>
                <div
                  class="ais-Stats"
                >
                  <span
                    class="ais-Stats-text"
                  >
                    10 results found in 0ms
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `);
    });

    test('renders with templates using `html`', async () => {
      const container = document.createElement('div');
      const searchClient = createMockedSearchClient();

      const search = instantsearch({
        indexName: 'indexName',
        searchClient,
      });

      search.addWidgets([
        panel({
          templates: {
            header({ results }, { html }) {
              return html`<span
                >Header ${results && `(${results.nbHits} results)`}</span
              >`;
            },
            footer({ results }, { html }) {
              return html`<a href="#"
                >Footer ${results && `(${results.nbHits} results)`}</a
              >`;
            },
            collapseButtonText({ collapsed }, { html }) {
              return html`<span>${collapsed ? 'More' : 'Less'}</span>`;
            },
          },
          collapsed: () => true,
        })(stats)({ container }),
      ]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="ais-Panel ais-Panel--collapsible ais-Panel--collapsed"
          >
            <div
              class="ais-Panel-header"
            >
              <span>
                <span>
                  Header 
                  (10 results)
                </span>
              </span>
              <button
                aria-expanded="false"
                class="ais-Panel-collapseButton"
              >
                <span>
                  <span>
                    More
                  </span>
                </span>
              </button>
            </div>
            <div
              class="ais-Panel-body"
            >
              <div>
                <div
                  class="ais-Stats"
                >
                  <span
                    class="ais-Stats-text"
                  >
                    10 results found in 0ms
                  </span>
                </div>
              </div>
            </div>
            <div
              class="ais-Panel-footer"
            >
              <a
                href="#"
              >
                Footer 
                (10 results)
              </a>
            </div>
          </div>
        </div>
      `);
    });

    test('renders with templates using JSX', async () => {
      const container = document.createElement('div');
      const searchClient = createMockedSearchClient();

      const search = instantsearch({
        indexName: 'indexName',
        searchClient,
      });

      search.addWidgets([
        panel({
          templates: {
            header({ results }) {
              return (
                <span>Header {results && `(${results.nbHits} results)`}</span>
              );
            },
            footer({ results }) {
              return (
                <a href="#">
                  Footer {results && `(${results.nbHits} results)`}
                </a>
              );
            },
            collapseButtonText({ collapsed }) {
              return <span>{collapsed ? 'More' : 'Less'}</span>;
            },
          },
          collapsed: () => true,
        })(stats)({ container, attribute: 'brand' }),
      ]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="ais-Panel ais-Panel--collapsible ais-Panel--collapsed"
          >
            <div
              class="ais-Panel-header"
            >
              <span>
                <span>
                  Header 
                  (10 results)
                </span>
              </span>
              <button
                aria-expanded="false"
                class="ais-Panel-collapseButton"
              >
                <span>
                  <span>
                    More
                  </span>
                </span>
              </button>
            </div>
            <div
              class="ais-Panel-body"
            >
              <div>
                <div
                  class="ais-Stats"
                >
                  <span
                    class="ais-Stats-text"
                  >
                    10 results found in 0ms
                  </span>
                </div>
              </div>
            </div>
            <div
              class="ais-Panel-footer"
            >
              <a
                href="#"
              >
                Footer 
                (10 results)
              </a>
            </div>
          </div>
        </div>
      `);
    });

    function createMockedSearchClient() {
      return createSearchClient({
        search: jest.fn((requests) =>
          Promise.resolve(
            createMultiSearchResponse(
              ...requests.map((request) =>
                createSingleSearchResponse({
                  index: request.indexName,
                  facets: {
                    brand: {
                      'Insignia™': 746,
                      Samsung: 633,
                      Metra: 591,
                    },
                  },
                  nbHits: 10,
                })
              )
            )
          )
        ),
      });
    }
  });
});
