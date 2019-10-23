import instantsearch from '../../src/index';

export const hitsItemTemplate = `
<div
  class="hits-image"
  style="background-image: url({{image}})"
></div>
<article>
  <header>
    <strong>{{#helpers.highlight}}{ "attribute": "name" }{{/helpers.highlight}}</strong>
  </header>
  <p>
    {{#helpers.snippet}}{ "attribute": "description" }{{/helpers.snippet}}
  </p>
  <footer>
    <p>
      <strong>{{price}}$</strong>
    </p>
  </footer>
</article>
`;

function instantSearchPlayground({
  search,
  leftPanel,
  rightPanel,
}: {
  search: any;
  leftPanel: HTMLElement;
  rightPanel: HTMLElement;
}) {
  const refinementList = document.createElement('div');
  leftPanel.appendChild(refinementList);

  const brandList = instantsearch.widgets.panel({
    templates: {
      header: 'Brands',
    },
  })(instantsearch.widgets.refinementList);

  search.addWidgets([
    brandList({
      container: refinementList,
      attribute: 'brand',
    }),
  ]);

  const numericMenu = document.createElement('div');
  leftPanel.appendChild(numericMenu);

  const priceMenu = instantsearch.widgets.panel({
    templates: {
      header: 'Price',
    },
  })(instantsearch.widgets.numericMenu);

  search.addWidgets([
    priceMenu({
      container: numericMenu,
      attribute: 'price',
      items: [
        { label: 'All' },
        { label: '≤ 10$', end: 10 },
        { label: '10–100$', start: 10, end: 100 },
        { label: '100–500$', start: 100, end: 500 },
        { label: '≥ 500$', start: 500 },
      ],
    }),
  ]);

  const ratingMenu = document.createElement('div');
  leftPanel.appendChild(ratingMenu);

  const ratingList = instantsearch.widgets.panel({
    templates: {
      header: 'Rating',
    },
  })(instantsearch.widgets.ratingMenu);

  search.addWidgets([
    ratingList({
      container: ratingMenu,
      attribute: 'rating',
    }),
  ]);

  const searchBox = document.createElement('div');
  searchBox.classList.add('searchbox');
  rightPanel.appendChild(searchBox);

  search.addWidgets([
    instantsearch.widgets.searchBox({
      container: searchBox,
      placeholder: 'Search here…',
    }),
  ]);

  const stats = document.createElement('div');
  stats.classList.add('stats');
  rightPanel.appendChild(stats);

  search.addWidgets([
    instantsearch.widgets.stats({
      container: stats,
    }),
  ]);

  const hits = document.createElement('div');
  hits.classList.add('hits');
  rightPanel.appendChild(hits);

  search.addWidgets([
    instantsearch.widgets.hits({
      container: hits,
      templates: {
        item: hitsItemTemplate,
      },
      cssClasses: {
        item: 'hits-item',
      },
    }),
  ]);

  const pagination = document.createElement('div');
  rightPanel.appendChild(pagination);

  search.addWidgets([
    instantsearch.widgets.pagination({
      container: pagination,
    }),
  ]);
}

export default instantSearchPlayground;
