/* eslint-disable new-cap */
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { html, render } from 'htm/preact';
import instantsearch from 'instantsearch.js';
import {
  connectSearchBox,
  connectAutocomplete,
} from 'instantsearch.js/es/connectors';
import { Highlight } from 'instantsearch.js/es/helpers/components';
import { history } from 'instantsearch.js/es/lib/routers';
import {
  index,
  configure,
  hits,
  refinementList,
  panel,
} from 'instantsearch.js/es/widgets';

import 'instantsearch.css/themes/satellite.css';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

const search = instantsearch({
  searchClient,
  indexName: 'instant_search',
  routing: {
    router: history({ cleanUrlOnDispose: false }),
  },
  future: {
    persistHierarchicalRootCount: true,
    preserveSharedStateOnUnmount: true,
  },
  insights: true,
});

const attributePanel = (widget) =>
  panel({
    templates: {
      header: ({ widgetParams: { attribute } }) => attribute,
    },
  })(widget);

function QueryID({ hit }) {
  return html`<code
    data-query-id=${hit.__queryID}
    style=${{ '--color': `#${hit.__queryID?.slice(0, 6)}` }}
  >
    ${hit.__queryID?.slice(0, 4)}
  </code>`;
}

const virtualSearchBox = connectSearchBox(({ query, widgetParams }) => {
  render(
    html`<strong> current main query: <q>${query}</q> </strong>`,
    widgetParams.container
  );
});

const autocomplete = connectAutocomplete(
  ({
    widgetParams,
    indices,
    refine,
    currentRefinement,
    instantSearchInstance,
  }) => {
    render(
      html`<div style=${{ border: '1px solid #ccc', padding: '10px' }}>
        <form
          class="ais-SearchBox-form"
          type="search"
          onSubmit=${(e) => {
            e.preventDefault();
            instantSearchInstance.renderState.instant_search.searchBox.refine(
              currentRefinement
            );
          }}
        >
          <input
            class="ais-SearchBox-input"
            type="search"
            placeholder="Search for products"
            value=${currentRefinement}
            onFocus=${(event) => {
              refine(event.currentTarget.value);
            }}
            onInput=${(event) => {
              refine(event.currentTarget.value);
            }}
          />
          <button
            class="ais-SearchBox-btn ais-RefinementList-showMore"
            type="button"
            onClick=${() => {
              refine('');
            }}
            title="reset"
          >
            ⊗
          </button>
          <button
            class="ais-SearchBox-btn ais-RefinementList-showMore"
            type="submit"
            title="apply current query"
          >
            ⎆
          </button>
        </form>
        <table style=${{ width: '100%', marginTop: '10px' }}>
          ${Boolean(indices.length) &&
          html`<thead>
            <tr>
              <th>Query</th>
              <th>Index</th>
              <th>ID</th>
              <th>Refine</th>
            </tr>
          </thead>`}
          <tbody>
            ${indices
              .filter((i) => i.indexId)
              .flatMap((i) =>
                i.hits.map((hit) => {
                  const query = hit.query || hit.name;
                  return html`<tr>
                    <td>${query}</td>
                    <td style=${{ textAlign: 'center' }}>${i.indexId}</td>
                    <td style=${{ textAlign: 'center' }}>
                      ${QueryID({ hit })}
                    </td>
                    <td style=${{ textAlign: 'center' }}>
                      <button
                        class="ais-SearchBox-btn ais-RefinementList-showMore"
                        onClick=${() => refine(query)}
                      >
                        ↖
                      </button>
                    </td>
                  </tr>`;
                })
              )}
          </tbody>
        </table>
      </div>`,
      widgetParams.container
    );
  }
);

search.addWidgets([
  // Autocomplete widget
  index({ isolated: true }).addWidgets([
    configure({ hitsPerPage: 2 }),
    index({
      indexName: 'instant_search',
      indexId: 'repeated',
    }),
    index({
      indexName: 'instantsearch_query_suggestions',
      indexId: 'suggestions',
    }),
    index({
      indexName: 'instant_search_price_desc',
      indexId: 'different',
    }).addWidgets([
      index({
        indexName: 'instantsearch_query_suggestions',
        indexId: 'nested',
      }),
    ]),
    autocomplete({
      container: document.querySelector('#autocomplete-results'),
    }),
  ]),
  virtualSearchBox({
    container: document.querySelector('#current-main-query'),
  }),

  // rest of search
  hits({
    container: '#hits',
    templates: {
      item: (hit) =>
        html`<div
          style=${{ display: 'flex', gap: '.5em', alignItems: 'center' }}
        >
          ${Highlight({
            attribute: 'name',
            hit,
          })}
          ${QueryID({ hit })}
        </div>`,
    },
  }),
  attributePanel(refinementList)({
    container: '#brand-list',
    attribute: 'brand',
  }),
]);

search.start();
