// import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { compositionClient } from '@algolia/client-composition';
import instantsearch from 'instantsearch.js';
import {
  configure,
  hits,
  pagination,
  panel,
  refinementList,
  searchBox,
} from 'instantsearch.js/es/widgets';

import 'instantsearch.css/themes/satellite.css';

// const searchClient = algoliasearch(
//   'betaHPHOEH9N8M',
//   '7eab041484d3e9f1deace88d93690b0a'
// );

const searchClient = compositionClient(
  'betaHPHOEH9N8M',
  '7eab041484d3e9f1deace88d93690b0a',
  { authMode: 'WithinHeaders' }
);

searchClient.search = ({ compositionID, requestBody }) =>
  searchClient.customPost({
    path: `1/compositions/${compositionID}/simulate`,
    body: requestBody,
  });

const search = instantsearch({
  // indexName: 'products',
  compositionID: 'composition-2',
  searchClient,
  // insights: true,
});

search.addWidgets([
  searchBox({
    container: '#searchbox',
  }),
  hits({
    container: '#hits',
    templates: {
      item: (hit, { html, components }) => html`
        <article>
          <h1>${components.Highlight({ hit, attribute: 'title' })}</h1>
          <div class="group">${hit._rankingInfo.composed?.inset}</div>
          <img src=${hit.largeImage} />
          <p>${components.Highlight({ hit, attribute: 'title' })}</p>
          <div style="display: flex;justify-content: space-between;">
            <span>$${hit.price}</span>
            <a href="${hit.url}" target="_blank">See product</a>
          </div>
        </article>
      `,
    },
  }),
  configure({
    hitsPerPage: 40,
    getRankingInfo: true,
    // highlightPreTag: '__ais-highlight__',
    // highlightPostTag: '__/ais-highlight__',
    explain: true,
  }),
  panel({
    templates: { header: () => 'brand' },
  })(refinementList)({
    container: '#brand-list',
    attribute: 'brand',
  }),
  pagination({
    container: '#pagination',
  }),
]);

search.start();
