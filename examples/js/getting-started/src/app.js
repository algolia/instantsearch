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
//   'DIYPADIATS',
//   'c96176e1b36590680fb3d36bc480d592'
// );

// const searchClient = compositionClient(
//   'DIYPADIATS',
//   'c96176e1b36590680fb3d36bc480d592'
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
  // compositionID: 'asos_FR',
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
      item: (hit, { html }) => html`
        <article>
          <h1>${hit.label}</h1>
          <div class="group">${hit._rankingInfo.composed?.inset}</div>
          <img src=${hit.largeImage} />
          <p>${hit.title}</p>
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
