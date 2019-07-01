import instantsearch from 'instantsearch.js';
import { connectInfiniteHits } from 'instantsearch.js/es/connectors';
import { distanceInWords } from 'date-fns';
import { getCurrentDate } from '../utils';

const currentDate = getCurrentDate();

function createHit(hit, { isHighlighted }) {
  return `
<li class="ais-InfiniteHits-item${
    isHighlighted ? ' infinite-hits-item--highlighted' : ''
  }">
  <article class="card">
    <div class="card-image">
      <img src="${hit.image}" alt="${hit.title}">
    </div>

    <div class="card-content">
      <header>
        ${
          hit.topics ? `<span class="card-subject">${hit.topics[0]}</span>` : ''
        }

        <h1 class="card-title">${instantsearch.highlight({
          attribute: 'title',
          hit,
        })}</h1>
      </header>

      <p class="card-description">${instantsearch.snippet({
        attribute: 'description',
        hit,
      })}</p>

      <footer>
        <span class="card-author">${hit.author}</span> – ${distanceInWords(
    currentDate,
    hit.date,
    { addSuffix: true }
  )}
      </footer>
    </div>
  </article>
</li>
`;
}

let globalIsLastPage = false;

const infiniteHits = connectInfiniteHits(
  ({ results, hits, showMore, isLastPage, widgetParams }, isFirstRender) => {
    const { container } = widgetParams;
    const containerNode = document.querySelector(container);

    globalIsLastPage = isLastPage;

    if (isFirstRender) {
      const hitsWrapper = document.createElement('div');
      hitsWrapper.classList.add('ais-InfiniteHits');
      const loadMoreTrigger = document.createElement('div');

      containerNode.appendChild(hitsWrapper);
      containerNode.appendChild(loadMoreTrigger);

      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !globalIsLastPage) {
            showMore();
          }
        });
      });

      observer.observe(loadMoreTrigger);

      return;
    }

    if (results.nbHits === 0) {
      containerNode.querySelector('div').innerHTML = `
<p>No results.</p>
`;
      return;
    }

    containerNode.querySelector('div').innerHTML = `
<ol class="ais-InfiniteHits-list">
  ${hits
    .map((hit, index: number) =>
      createHit(hit, {
        isHighlighted:
          results.nbHits !== 3 && (index === 0 || results.nbHits === 2),
      })
    )
    .join('')}
</ol>

${
  results.nbHits > 0 && isLastPage
    ? `
<div class="infinite-hits-end">
  <p>${results.nbHits} results shown</p>
</div>
`
    : ''
}
`;
  }
);

export const articles = infiniteHits({
  container: '[data-widget="hits"]',
});
