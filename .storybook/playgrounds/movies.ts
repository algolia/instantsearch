import instantsearch from '../../src/index';

function demoQueryRulesPlayground({
  search,
  leftPanel,
  rightPanel,
}: {
  search: any;
  leftPanel: HTMLElement;
  rightPanel: HTMLElement;
}): void {
  const refinementList = document.createElement('div');
  leftPanel.appendChild(refinementList);

  const brandList = instantsearch.widgets.panel({
    templates: {
      header: 'Genres',
    },
  })(instantsearch.widgets.refinementList);

  search.addWidget(
    brandList({
      container: refinementList,
      attribute: 'genre',
    })
  );

  const searchBox = document.createElement('div');
  searchBox.classList.add('searchbox');
  rightPanel.appendChild(searchBox);

  search.addWidget(
    instantsearch.widgets.searchBox({
      container: searchBox,
      placeholder: 'Search here…',
    })
  );

  const stats = document.createElement('div');
  stats.classList.add('stats');
  rightPanel.appendChild(stats);

  search.addWidget(
    instantsearch.widgets.stats({
      container: stats,
    })
  );

  const hits = document.createElement('div');
  hits.classList.add('hits');
  rightPanel.appendChild(hits);

  search.addWidget(
    instantsearch.widgets.hits({
      container: hits,
      templates: {
        item: `
<div
  class="hits-image"
  style="background-image: url({{image}})"
></div>
<article>
  <header>
    <strong>{{#helpers.highlight}}{ "attribute": "title" }{{/helpers.highlight}}</strong>
  </header>
</article>
          `,
      },
      cssClasses: {
        item: 'hits-item',
      },
    })
  );

  const pagination = document.createElement('div');
  rightPanel.appendChild(pagination);

  search.addWidget(
    instantsearch.widgets.pagination({
      container: pagination,
    })
  );
}

export default demoQueryRulesPlayground;
