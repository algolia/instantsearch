import algoliasearch from 'algoliasearch';

const client = algoliasearch('latency', '6be0576ff61c053d5f9a3225e2a90f76');
const index = client.initIndex('instant_search');

const $searchBox = document.querySelector('#searchBox input[type=search]');
const $hits = document.querySelector('#hits');

function renderHits(query) {
  index.search(query).then(result => {
    // Please sanitize user-provided data when using `innerHTML` to avoid XSS
    $hits.innerHTML = `
      <ol class="ais-hits">
        ${result.hits
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
}

$searchBox.addEventListener('input', event => {
  const query = event.target.value;

  renderHits(query);
});

renderHits('');
