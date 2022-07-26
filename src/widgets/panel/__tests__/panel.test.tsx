/**
 * @jest-environment jsdom
 */
/** @jsx h */
import { h } from 'preact';

import { createSearchClient } from '../../../../test/mock/createSearchClient';
import instantsearch from '../../../index.es';
import { wait } from '../../../../test/utils/wait';
import panel from '../panel';
import {
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '../../../../test/mock/createAPIResponse';
import refinementList from '../../refinement-list/refinement-list';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('panel', () => {
  describe('templates', () => {
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
                >Brand ${results && `(${results.nbHits} results)`}</span
              >`;
            },
            footer({ results }, { html }) {
              return html`<a href="#"
                >More brands ${results && `(${results.nbHits} results)`}</a
              >`;
            },
            collapseButtonText({ collapsed }, { html }) {
              return html`<span>${collapsed ? 'More' : 'Less'}</span>`;
            },
          },
          collapsed: () => true,
        })(refinementList)({ container, attribute: 'brand' }),
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
          Brand 
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
          class="ais-RefinementList"
        >
          <ul
            class="ais-RefinementList-list"
          >
            <li
              class="ais-RefinementList-item"
            >
              <div>
                <label
                  class="ais-RefinementList-label"
                >
                   
                  <input
                    class="ais-RefinementList-checkbox"
                    type="checkbox"
                    value="Insignia™"
                  />
                   
                  <span
                    class="ais-RefinementList-labelText"
                  >
                    Insignia™
                  </span>
                   
                  <span
                    class="ais-RefinementList-count"
                  >
                    746
                  </span>
                   
                </label>
              </div>
            </li>
            <li
              class="ais-RefinementList-item"
            >
              <div>
                <label
                  class="ais-RefinementList-label"
                >
                   
                  <input
                    class="ais-RefinementList-checkbox"
                    type="checkbox"
                    value="Samsung"
                  />
                   
                  <span
                    class="ais-RefinementList-labelText"
                  >
                    Samsung
                  </span>
                   
                  <span
                    class="ais-RefinementList-count"
                  >
                    633
                  </span>
                   
                </label>
              </div>
            </li>
            <li
              class="ais-RefinementList-item"
            >
              <div>
                <label
                  class="ais-RefinementList-label"
                >
                   
                  <input
                    class="ais-RefinementList-checkbox"
                    type="checkbox"
                    value="Metra"
                  />
                   
                  <span
                    class="ais-RefinementList-labelText"
                  >
                    Metra
                  </span>
                   
                  <span
                    class="ais-RefinementList-count"
                  >
                    591
                  </span>
                   
                </label>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div
      class="ais-Panel-footer"
    >
      <a
        href="#"
      >
        More brands 
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
                <span>Brand {results && `(${results.nbHits} results)`}</span>
              );
            },
            footer({ results }) {
              return (
                <a href="#">
                  More brands {results && `(${results.nbHits} results)`}
                </a>
              );
            },
            collapseButtonText({ collapsed }) {
              return <span>{collapsed ? 'More' : 'Less'}</span>;
            },
          },
          collapsed: () => true,
        })(refinementList)({ container, attribute: 'brand' }),
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
          Brand 
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
          class="ais-RefinementList"
        >
          <ul
            class="ais-RefinementList-list"
          >
            <li
              class="ais-RefinementList-item"
            >
              <div>
                <label
                  class="ais-RefinementList-label"
                >
                   
                  <input
                    class="ais-RefinementList-checkbox"
                    type="checkbox"
                    value="Insignia™"
                  />
                   
                  <span
                    class="ais-RefinementList-labelText"
                  >
                    Insignia™
                  </span>
                   
                  <span
                    class="ais-RefinementList-count"
                  >
                    746
                  </span>
                   
                </label>
              </div>
            </li>
            <li
              class="ais-RefinementList-item"
            >
              <div>
                <label
                  class="ais-RefinementList-label"
                >
                   
                  <input
                    class="ais-RefinementList-checkbox"
                    type="checkbox"
                    value="Samsung"
                  />
                   
                  <span
                    class="ais-RefinementList-labelText"
                  >
                    Samsung
                  </span>
                   
                  <span
                    class="ais-RefinementList-count"
                  >
                    633
                  </span>
                   
                </label>
              </div>
            </li>
            <li
              class="ais-RefinementList-item"
            >
              <div>
                <label
                  class="ais-RefinementList-label"
                >
                   
                  <input
                    class="ais-RefinementList-checkbox"
                    type="checkbox"
                    value="Metra"
                  />
                   
                  <span
                    class="ais-RefinementList-labelText"
                  >
                    Metra
                  </span>
                   
                  <span
                    class="ais-RefinementList-count"
                  >
                    591
                  </span>
                   
                </label>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div
      class="ais-Panel-footer"
    >
      <a
        href="#"
      >
        More brands 
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
