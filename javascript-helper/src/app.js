import algoliasearch from 'algoliasearch';
import algoliasearchHelper from 'algoliasearch-helper';

const client = algoliasearch('latency', '6be0576ff61c053d5f9a3225e2a90f76');
const helper = algoliasearchHelper(client, 'instant_search');

const $searchBox = document.querySelector('#searchBox input[type=search]');
const $hits = document.querySelector('#hits');

$searchBox.addEventListener('input', event => {
  const query = event.target.value;

  helper.setQuery(query).search();
});

helper.on('result', ({ results }) => {
  // Please sanitize user-provided data when using `innerHTML` to avoid XSS
  $hits.innerHTML = `
    <ol class="ais-hits">
      ${results.hits
        .map(
          hit =>
            `<li class="ais-hits--item">
              <article>
                <div>
                  <h1>${hit._highlightResult.name.value}</h1>
                  <p>${hit._highlightResult.description.value}</p>
                </div>
              </article>
            </li>`
        )
        .join('')}
    </ol>`;
});

helper.search();
