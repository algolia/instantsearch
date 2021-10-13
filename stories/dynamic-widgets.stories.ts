import { storiesOf } from '@storybook/html';
import type { Playground } from '../.storybook/decorators';
import { withHits } from '../.storybook/decorators';
import { hitsItemTemplate } from '../.storybook/playgrounds/default';

const dynamicWidgetsPlayground: Playground = function ({
  search,
  instantsearch,
  rightPanel,
}) {
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

  const hitsElement = document.createElement('div');
  hitsElement.classList.add('hits');
  rightPanel.appendChild(hitsElement);

  search.addWidgets([
    instantsearch.widgets.hits({
      container: hitsElement,
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
};

storiesOf('Basics/DynamicWidgets', module).add(
  'default',
  withHits(
    ({ search, container: rootContainer, instantsearch }) => {
      const dynamicWidgetsContainer = document.createElement('div');
      const disclaimer = document.createTextNode(
        'try the queries: "dog" or "lego"'
      );
      rootContainer.appendChild(disclaimer);
      rootContainer.appendChild(dynamicWidgetsContainer);

      search.addWidgets([
        instantsearch.widgets.dynamicWidgets({
          container: dynamicWidgetsContainer,
          fallbackWidget: ({ attribute, container }) =>
            instantsearch.widgets.panel<
              typeof instantsearch.widgets.refinementList
            >({
              templates: {
                header(stuff) {
                  return stuff.widgetParams.attribute;
                },
              },
            })(instantsearch.widgets.refinementList)({ attribute, container }),
          widgets: [
            (container) =>
              instantsearch.widgets.menu({
                container,
                attribute: 'categories',
              }),
            (container) =>
              instantsearch.widgets.panel({
                templates: { header: 'hierarchy' },
              })(instantsearch.widgets.hierarchicalMenu)({
                container,
                attributes: [
                  'hierarchicalCategories.lvl0',
                  'hierarchicalCategories.lvl1',
                  'hierarchicalCategories.lvl2',
                ],
              }),
          ],
        }),
      ]);
    },
    { playground: dynamicWidgetsPlayground }
  )
);
