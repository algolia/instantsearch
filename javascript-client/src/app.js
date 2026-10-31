import { algoliasearch } from 'algoliasearch';

const client = algoliasearch('latency', '6be0576ff61c053d5f9a3225e2a90f76');

const $searchBox = document.querySelector('#searchBox input[type=search]');
const $hits = document.querySelector('#hits');

function renderHits(query) {
  client
    .search({
      requests: [
        {
          indexName: 'instant_search',
          query: query,
        },
      ],
    })
    .then(({ results }) => {
      $hits.innerHTML = '';

      results.forEach((result) => {
        const indexTitle = result.index;
        const hits = result.hits;

        const sectionHTML = `
          <section class="search-section">
            <h2>Results from ${indexTitle}</h2>
            <ol class="ais-hits">
              ${hits
                .map((hit) => {
                  const name = hit._highlightResult.name.value;
                  const description = hit._highlightResult.description.value;
                  return `
                    <li class="ais-hits--item">
                      <article>
                        <div>
                          <h3>${name}</h3>
                          <p>${description}</p>
                        </div>
                      </article>
                    </li>
                  `;
                })
                .join('')}
            </ol>
          </section>
        `;

        $hits.insertAdjacentHTML('beforeend', sectionHTML);
      });
    })
    .catch((err) => {
      console.error('Search error:', err);
      $hits.innerHTML = '<p class="error">Failed to load results.</p>';
    });
}

$searchBox.addEventListener('input', (event) => {
  const query = event.target.value;

  renderHits(query);
});

renderHits('');
