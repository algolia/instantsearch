import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';
import moviesPlayground from '../.storybook/playgrounds/movies';
import queryRuleCustomData from '../src/widgets/query-rule-custom-data/query-rule-custom-data';
import { configure } from '../src/widgets';
import { isEqual } from '../src/lib/utils';
import { memo } from '../src/helpers/memo';

type CustomDataItem = {
  title: string;
  banner: string;
  link: string;
};

const searchOptions = {
  appId: 'latency',
  apiKey: 'af044fb0788d6bb15f807e4420592bc5',
  indexName: 'instant_search_movies',
  playground: moviesPlayground,
};

storiesOf('Metadata|QueryRuleCustomData', module)
  .add(
    'default',
    withHits(({ search, container }) => {
      const widgetContainer = document.createElement('div');
      const description = document.createElement('p');
      description.innerHTML = 'Type <q>music</q> and a banner will appear.';

      container.appendChild(description);
      container.appendChild(widgetContainer);

      search.addWidgets([
        queryRuleCustomData({
          container: widgetContainer,
          templates: {
            default: ({ items }: { items: CustomDataItem[] }) =>
              items
                .map(item => {
                  const { title, banner, link } = item;

                  if (!banner) {
                    return '';
                  }

                  return `
                  <section>
                    <h2>${title}</h2>

                    <a href="${link}">
                      <img src="${banner}" alt="${title}">
                    </a>
                  </section>
                `;
                })
                .join(''),
          },
        }),
      ]);
    }, searchOptions)
  )
  .add(
    'with Hogan',
    withHits(({ search, container, instantsearch }) => {
      const widgetContainer = document.createElement('div');
      const description = document.createElement('p');
      description.innerHTML = 'Type <q>music</q> and a banner will appear.';

      container.appendChild(description);
      container.appendChild(widgetContainer);

      search.addWidgets([
        instantsearch.widgets.queryRuleCustomData({
          container: widgetContainer,
          templates: {
            default: `
            {{#items}}
              {{#banner}}
                <section>
                  <h2>{{title}}</h2>

                  <a href="{{link}}">
                    <img src="{{banner}}" alt="{{title}}">
                  </a>
                </section>
              {{/banner}}
            {{/items}}`,
          },
        }),
      ]);
    }, searchOptions)
  )
  .add(
    'with default and single banner',
    withHits(({ search, container }) => {
      const widgetContainer = document.createElement('div');
      const description = document.createElement('p');
      description.innerHTML =
        'Kill Bill appears whenever no other results are promoted. Type <q>music</q> to see another movie promoted.';

      container.appendChild(description);
      container.appendChild(widgetContainer);

      search.addWidgets([
        queryRuleCustomData({
          container: widgetContainer,
          transformItems: (items: CustomDataItem[]) => {
            if (items.length > 0) {
              return items.filter(item => typeof item.banner !== 'undefined');
            }

            return [
              {
                title: 'Kill Bill',
                banner:
                  'http://static.bobatv.net/IMovie/mv_2352/poster_2352.jpg',
                link: 'https://www.netflix.com/title/60031236',
              },
            ];
          },
          templates: {
            default({ items }: { items: CustomDataItem[] }) {
              if (items.length === 0) {
                return '';
              }

              const { title, banner, link } = items[0];

              return `
              <h2>${title}</h2>

              <a href="${link}">
                <img src="${banner}" alt="${title}">
              </a>
            `;
            },
          },
        }),
      ]);
    }, searchOptions)
  )
  .add(
    'without template',
    withHits(({ search, container, instantsearch }) => {
      const widgetContainer = document.createElement('div');
      const description = document.createElement('p');
      description.innerHTML = 'Type <q>music</q> and a banner will appear.';

      container.appendChild(description);
      container.appendChild(widgetContainer);

      search.addWidgets([
        instantsearch.widgets.queryRuleCustomData({
          container: widgetContainer,
        }),
      ]);
    }, searchOptions)
  )
  .add(
    'without memo',
    withHits(
      ({ search, container, instantsearch }) => {
        const state = {
          lastLanesReceived: null,
          lanesIndices: [],
        };

        const queryRulesLanes = instantsearch.connectors.connectQueryRules(
          ({ items, widgetParams, instantSearchInstance }) => {
            // We don't display anything if we don't receive any lanes from the
            // Query Rules.
            if (items.length === 0 || !items[0].lanes) {
              return;
            }

            const lanes = items[0].lanes;
            lanes.sort(function(a, b) {
              return a.position - b.position;
            });

            // If the lanes haven't changed after a refinement, we don't need to update
            // the DOM.
            if (state.lastLanesReceived === JSON.stringify(lanes)) {
              return;
            }

            state.lastLanesReceived = JSON.stringify(lanes);
            const { container } = widgetParams;

            // We unmount all previous lanes indices to have an updated InstantSearch
            // tree.
            state.lanesIndices.forEach(contentShelvesIndex => {
              contentShelvesIndex.dispose();
            });

            const lanesIndices = lanes.map(lane => {
              const laneContainer = document.createElement('div');
              const laneTitle = document.createElement('h2');
              laneTitle.innerText = lane.label;
              const laneRow = document.createElement('div');

              laneContainer.append(laneTitle, laneRow);

              const laneIndex = instantsearch.widgets
                .index({ indexName: instantSearchInstance.indexName })
                .addWidgets([
                  instantsearch.widgets.configure({
                    hitsPerPage: lane.nbProducts,
                    ruleContexts: [lane.ruleContext],
                  }),
                  instantsearch.widgets.hits({
                    container: laneRow,
                    templates: {
                      item: widgetParams.template,
                    },
                  }),
                ]);

              return [laneIndex, laneContainer];
            });

            state.lanesIndices = lanesIndices.map(lanesIndex => lanesIndex[0]);
            const lanesContainers = lanesIndices.map(
              lanesIndex => lanesIndex[1]
            );

            instantSearchInstance.mainIndex.addWidgets(state.lanesIndices);
            container.append(...lanesContainers);
          }
        );

        search.addWidgets([
          configure({
            hitsPerPage: 8,
            ruleContexts: ['get_lanes'],
          }),
          queryRulesLanes({
            container,
            template: `
<div class="item">
  <div class="centered">
    <img src="{{image_link}}" alt="" />
  </div>
  <div class="centered">
    <div class="add-to-cart">
      <i class="fas fa-cart-plus"></i> Add
      <span class="hide-mobile hide-tablet">to Cart</span>
    </div>
  </div>
  <div class="item-content">
    <p class="brand">{{brand}}</p>
    <p class="name">{{item_title}}</p>
  </div>
</div>
<p class="price">Price: {{price}}</p>
`,
          }),
        ]);
      },
      {
        indexName: 'solution_retail_dataset',
        appId: 'RSBCBF0EG8',
        apiKey: 'fac0c6dc5e242a210d0047f51cec2b77',
      }
    )
  )
  .add(
    'with memo',
    withHits(
      ({ search, container, instantsearch }) => {
        const queryRulesLanes = instantsearch.connectors.connectQueryRules(
          memo(
            ({ items, widgetParams, instantSearchInstance }) => {
              const lanes = items && items[0].lanes;

              if (!lanes) {
                return;
              }

              lanes.sort(function(a, b) {
                return a.position - b.position;
              });

              const { container } = widgetParams;

              const lanesIndices = lanes.map(lane => {
                const laneContainer = document.createElement('div');
                const laneTitle = document.createElement('h2');
                laneTitle.innerText = lane.label;
                const laneRow = document.createElement('div');

                laneContainer.append(laneTitle, laneRow);

                const laneIndex = instantsearch.widgets
                  .index({ indexName: instantSearchInstance.indexName })
                  .addWidgets([
                    instantsearch.widgets.configure({
                      hitsPerPage: 4 || lane.nbProducts,
                      ruleContexts: [lane.ruleContext],
                    }),
                    instantsearch.widgets.hits({
                      container: laneRow,
                      templates: {
                        item: widgetParams.template,
                      },
                    }),
                  ]);

                return [laneIndex, laneContainer];
              });

              const nextLanesIndices = lanesIndices.map(
                lanesIndex => lanesIndex[0]
              );
              const lanesContainers = lanesIndices.map(
                lanesIndex => lanesIndex[1]
              );

              instantSearchInstance.mainIndex.addWidgets(nextLanesIndices);
              container.innerHTML = '';
              container.append(...lanesContainers);
            },
            (prevParams, nextParams) => {
              const prevLanes = prevParams.items[0].lanes;
              const nextLanes = nextParams.items[0].lanes;

              if (!prevLanes || !nextLanes) {
                return true;
              }

              prevLanes.sort(function(a, b) {
                return a.position - b.position;
              });
              nextLanes.sort(function(a, b) {
                return a.position - b.position;
              });

              return isEqual(prevLanes, nextLanes);
            }
          )
        );

        search.addWidgets([
          configure({
            hitsPerPage: 8,
            ruleContexts: ['get_lanes'],
          }),
          queryRulesLanes({
            container,
            template: `
<div class="item">
  <div class="centered">
    <img src="{{image_link}}" alt="" />
  </div>
  <div class="centered">
    <div class="add-to-cart">
      <i class="fas fa-cart-plus"></i> Add
      <span class="hide-mobile hide-tablet">to Cart</span>
    </div>
  </div>
  <div class="item-content">
    <p class="brand">{{brand}}</p>
    <p class="name">{{item_title}}</p>
  </div>
</div>
<p class="price">Price: {{price}}</p>
`,
          }),
        ]);
      },

      {
        indexName: 'solution_retail_dataset',
        appId: 'RSBCBF0EG8',
        apiKey: 'fac0c6dc5e242a210d0047f51cec2b77',
      }
    )
  );
