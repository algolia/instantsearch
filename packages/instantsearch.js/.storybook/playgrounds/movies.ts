import { Playground } from '../decorators';

const demoQueryRulesPlayground: Playground = function demoQueryRulesPlayground({
  search,
  instantsearch,
  leftPanel,
  rightPanel,
}) {
  const refinementList = document.createElement('div');
  leftPanel.appendChild(refinementList);

  const brandList = instantsearch.widgets.panel<
    typeof instantsearch.widgets.refinementList
  >({
    templates: {
      header: () => 'Genres',
    },
  })(instantsearch.widgets.refinementList);

  search.addWidgets([
    brandList({
      container: refinementList,
      attribute: 'genre',
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
        item: (hit, { html, components }) => html`
          <div
            class="hits-image"
            style="background-image: url(${hit.image})"
          ></div>
          <article>
            <header>
              <strong
                >${components.Highlight({ attribute: 'title', hit })}</strong
              >
            </header>
          </article>
        `,
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
};

export default demoQueryRulesPlayground;
